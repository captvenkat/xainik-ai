'use client'
import React, { useCallback, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

type Role = 'veteran' | 'supporter' | 'recruiter'

export default function AuthPageContent({ roleHint }: { roleHint?: string }) {
  const params = useSearchParams()
  const supabase = createSupabaseBrowser()
  const [pendingRole, setPendingRole] = useState<Role | null>(null)

  const redirectTo = params.get('redirect') ?? '/dashboard'
  const site =
    (typeof window !== 'undefined' ? window.location.origin : '') ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    ''

  const joinWithRole = useCallback(
    async (role: Role, e?: React.MouseEvent<HTMLButtonElement>) => {
      // Absolutely avoid form submits and bubbling into parents
      e?.preventDefault()
      e?.stopPropagation()
      if (pendingRole) return
      setPendingRole(role)
      try {
        // one-shot role hint for server-side warmup
        document.cookie = `x-role-hint=${role}; Max-Age=300; Path=/; SameSite=Lax`
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${site}/auth/warmup?redirect=${encodeURIComponent(redirectTo)}`,
          },
        })
        // navigation happens; no reset needed
      } catch (err) {
        console.error('OAuth start failed:', err)
        // allow retry
        setPendingRole(null)
      }
    },
    [pendingRole, redirectTo, site, supabase]
  )

  return (
    <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {/* Veterans */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
          <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-blue-900 mb-3">
          Military Veterans
        </h2>
        <p className="text-blue-700 mb-4">
          Join our exclusive platform for personalized job referrals and career support.
        </p>
        <button
          type="button"
          className="w-full inline-flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          aria-disabled={!!pendingRole}
          disabled={!!pendingRole}
          onClick={(e) => joinWithRole('veteran', e)}
        >
          {pendingRole === 'veteran' ? 'Redirecting…' : 'Join as Veteran'}
          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>

      {/* Supporters */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-green-900 mb-3">
          Supporters
        </h2>
        <p className="text-green-700 mb-4">
          Support veterans by connecting, endorsing, and providing opportunities.
        </p>
        <button
          type="button"
          className="w-full inline-flex justify-center items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          aria-disabled={!!pendingRole}
          disabled={!!pendingRole}
          onClick={(e) => joinWithRole('supporter', e)}
        >
          {pendingRole === 'supporter' ? 'Redirecting…' : 'Join as Supporter'}
          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m4-4H3" />
          </svg>
        </button>
      </div>

      {/* Recruiters */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
          <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-purple-900 mb-3">
          Recruiters
        </h2>
        <p className="text-purple-700 mb-4">
          Find talented veterans and post job opportunities on our platform.
        </p>
        <button
          type="button"
          className="w-full inline-flex justify-center items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          aria-disabled={!!pendingRole}
          disabled={!!pendingRole}
          onClick={(e) => joinWithRole('recruiter', e)}
        >
          {pendingRole === 'recruiter' ? 'Redirecting…' : 'Join as Recruiter'}
          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  )
}
