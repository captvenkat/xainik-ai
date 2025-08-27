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

  // Get existing profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role,onboarding_complete')
    .eq('id', user.id)
    .single()

  // If user doesn't have a role yet, we'll need to set it
  let finalProfile = profile

  if (!profile?.role) {
    // Check if we have a role hint from the auth flow
    // Note: In server components, we can't access sessionStorage directly
    // The role hint will be handled in the role selection page
    // For now, we'll create a basic profile without role
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('role,onboarding_complete')
      .single()

    if (createError) {
      console.error('Error creating profile:', createError)
    } else {
      finalProfile = newProfile
    }
  }

  const payload = Buffer.from(JSON.stringify(finalProfile ?? {})).toString('base64url')
  cookieStore.set('x-prof', payload, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60,
    path: '/',
  })

  // If user has no role, send them to role selection
  if (!finalProfile?.role) {
    redirect('/role-selection')
  }

  // If user has role but needs onboarding (veterans only)
  if (finalProfile.role === 'veteran' && !finalProfile.onboarding_complete) {
    redirect('/pitch/new')
  }

  // Otherwise, redirect to their intended destination
  redirect(params.redirect ?? '/dashboard')
}
