'use client'
import React, { useCallback, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Role = 'veteran' | 'supporter' | 'recruiter'

export default function AuthPageContent({ roleHint }: { roleHint?: string }) {
  const params = useSearchParams()
  const supabase = createClientComponentClient()
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
    <div className="space-y-3">
      <button
        type="button"
        className="btn w-full"
        aria-disabled={!!pendingRole}
        disabled={!!pendingRole}
        onClick={(e) => joinWithRole('veteran', e)}
      >
        {pendingRole === 'veteran' ? 'Redirecting…' : 'Join as Veteran'}
      </button>
      <button
        type="button"
        className="btn w-full"
        aria-disabled={!!pendingRole}
        disabled={!!pendingRole}
        onClick={(e) => joinWithRole('supporter', e)}
      >
        {pendingRole === 'supporter' ? 'Redirecting…' : 'Join as Supporter'}
      </button>
      <button
        type="button"
        className="btn w-full"
        aria-disabled={!!pendingRole}
        disabled={!!pendingRole}
        onClick={(e) => joinWithRole('recruiter', e)}
      >
        {pendingRole === 'recruiter' ? 'Redirecting…' : 'Join as Recruiter'}
      </button>
    </div>
  )
}
