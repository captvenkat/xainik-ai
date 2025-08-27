import React from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import AuthPageContent from './AuthPageContent'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ redirect?: string, role?: string }> }) {
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

  const params = await searchParams
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect(`/auth/warmup?redirect=${encodeURIComponent(params.redirect ?? '/dashboard')}`)
  }

  // Optional: role hint
  if (params.role === 'veteran' || params.role === 'supporter' || params.role === 'recruiter') {
    cookies().set('x-role-hint', params.role, { httpOnly: false, maxAge: 300, path: '/' })
  }

  // Fetch current veteran count for banner
  let cap = 50
  let count = 0
  try {
    const { data, error } = await supabase.rpc('veteran_count')
    if (!error && typeof data === 'number') count = data
  } catch {}
  const full = count >= cap

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Xainik
          </h1>
          <p className="text-xl text-gray-600">
            Choose your path to support military veterans
          </p>
        </div>

        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 text-amber-900 p-3 text-sm">
          <strong>Privileged access:</strong> first {cap} veterans only.
          {' '}Currently {Math.max(0, cap - count)} slot{Math.max(0, cap - count) === 1 ? '' : 's'} left.
          {full && <> {' '}Registrations are closed. <Link href="/contact" className="underline">Contact us</Link>.</>}
        </div>

        <AuthPageContent roleHint={params.role} />
      </div>
    </div>
  )
}
