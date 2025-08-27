import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role,status,onboarding_complete')
    .eq('id', user.id)
    .single()

  const payload = Buffer.from(JSON.stringify(profile ?? {})).toString('base64url')
  cookieStore.set('x-prof', payload, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60,
    path: '/',
  })

  redirect(params.redirect ?? '/dashboard')
}
