import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import AuthPageContent from './AuthPageContent';

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ redirect?: string, role?: string }> }) {
  const cookieStore = await cookies()
  const params = await searchParams
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
  if (user) {
    redirect(`/auth/warmup?redirect=${encodeURIComponent(params.redirect ?? '/dashboard')}`)
  }

  return <AuthPageContent roleHint={params.role} />
}
