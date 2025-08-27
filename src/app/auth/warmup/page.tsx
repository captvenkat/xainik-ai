import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Warmup({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const params = await searchParams
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/auth?redirect=${encodeURIComponent(params.redirect ?? '/')}`)
  }

  // Get current profile
  let { data: profile, error: selErr } = await supabase
    .from('profiles')
    .select('role,onboarding_complete')
    .eq('id', user.id)
    .single()

  // If profile doesn't exist, create it
  if (selErr && selErr.code === 'PGRST116') {
    // Profile doesn't exist, create it
    const hint = cookieStore.get('x-role-hint')?.value as 'veteran'|'supporter'|'recruiter'|undefined
    if (hint && ['veteran','supporter','recruiter'].includes(hint)) {
      const { data: newProfile, error: createErr } = await supabase
        .from('profiles')
        .insert({ 
          id: user.id,
          role: hint, 
          onboarding_complete: hint === 'veteran' ? false : true 
        })
        .select('role,onboarding_complete')
        .single()
      
      if (createErr) {
        // If DB trigger says cap reached, send gently to /contact
        if (/cap reached|closed/i.test(createErr.message)) {
          // clear hint so we don't keep looping
          cookieStore.set('x-role-hint', '', { path: '/', maxAge: 0 })
          redirect('/contact')
        }
        // Otherwise, fall through; role will remain unset and middleware will send to /role-selection
      } else {
        profile = newProfile
      }
    }
  } else if (!profile?.role) {
    // Profile exists but no role set, try to assign it
    const hint = cookieStore.get('x-role-hint')?.value as 'veteran'|'supporter'|'recruiter'|undefined
    if (hint && ['veteran','supporter','recruiter'].includes(hint)) {
      const { error: updErr } = await supabase
        .from('profiles')
        .update({ role: hint, onboarding_complete: hint === 'veteran' ? false : true })
        .eq('id', user.id)
      if (updErr) {
        // If DB trigger says cap reached, send gently to /contact
        if (/cap reached|closed/i.test(updErr.message)) {
          // clear hint so we don't keep looping
          cookieStore.set('x-role-hint', '', { path: '/', maxAge: 0 })
          redirect('/contact')
        }
        // Otherwise, fall through; role will remain unset and middleware will send to /role-selection
      } else {
        // Re-read profile after update
        const r = await supabase
          .from('profiles')
          .select('role,onboarding_complete')
          .eq('id', user.id)
          .single()
        profile = r.data ?? profile
      }
    }
  }

  // Clear the hint (one-shot)
  cookieStore.set('x-role-hint', '', { path: '/', maxAge: 0 })

  const payload = Buffer.from(JSON.stringify(profile ?? {})).toString('base64url')
  cookieStore.set('x-prof', payload, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60,
    path: '/',
  })

  // If user has no role, send them to role selection
  if (!profile?.role) {
    redirect('/role-selection')
  }

  // If user has role but needs onboarding (veterans only)
  if (profile.role === 'veteran' && !profile.onboarding_complete) {
    redirect('/pitch/new')
  }

  // Redirect to /dashboard and let middleware handle role-based routing
  redirect('/dashboard')
}
