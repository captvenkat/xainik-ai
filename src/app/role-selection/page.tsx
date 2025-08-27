'use client'
import React, { Suspense, useEffect, useMemo, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

const CAP = 50

function RoleSelectionInner() {
  const supabase = createSupabaseBrowser()
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get('redirect') ?? '/dashboard'

  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingRole, setPendingRole] = useState<'veteran'|'supporter'|'recruiter'|null>(null)
  const firedRef = useRef(false)
  const slotsLeft = useMemo(() => count == null ? null : Math.max(0, CAP - count), [count])
  const veteranFull = useMemo(() => (count != null && count >= CAP), [count])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true); setError(null)
      
      const { data, error } = await supabase.rpc('veteran_count')
      if (!mounted) return
      if (error) setError('Capacity check failed. You may proceed; the system will enforce limits.')
      else setCount(typeof data === 'number' ? data : null)
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [supabase])

  async function choose(role: 'veteran'|'supporter'|'recruiter', e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault()
    e?.stopPropagation()
    if (firedRef.current || pendingRole) return
    firedRef.current = true
    setPendingRole(role)
    setError(null)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/auth?redirect=${encodeURIComponent('/role-selection')}`)
      return
    }
    const { error } = await supabase
      .from('profiles')
      .update({ role, onboarding_complete: role === 'veteran' ? false : true })
      .eq('id', user.id)
    if (error) {
      const msg = error.message || 'Unknown error'
      if (/cap reached|closed/i.test(msg)) {
        setError('Veteran registrations are closed. The first 50 slots have been filled.')
        // Send overflow to contact form
        setTimeout(() => router.replace('/contact'), 800)
        return
      }
      setError(msg)
      // Reset state on error
      firedRef.current = false
      setPendingRole(null)
      return
    }
    // Redirect directly to final destination based on role
    if (role === 'veteran') {
      router.replace('/pitch/new') // Veterans need onboarding
    } else {
      router.replace(redirectTo) // Supporters/recruiters go to dashboard
    }
  }

  return (
    <div className="max-w-md mx-auto py-16">
      <h1 className="text-2xl font-semibold mb-6">Choose your role</h1>

      <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 text-amber-900 p-3 text-sm">
        <strong>Heads up:</strong> Privileged access for the first {CAP} veterans only{slotsLeft != null ? ` — ${slotsLeft} slot${slotsLeft === 1 ? '' : 's'} left` : ''}.
        {veteranFull && <> {' '}Registrations are closed. <Link href="/contact" className="underline">Contact us</Link>.</>}
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-900 p-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-3" onClickCapture={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="btn disabled:opacity-50"
          onClick={(e) => choose('veteran', e)}
          disabled={loading || veteranFull || (!!pendingRole && pendingRole !== 'veteran')}
          title={veteranFull ? 'Registrations closed (cap reached)' : undefined}
        >
          {pendingRole === 'veteran' ? 'Redirecting…' : `Veteran ${loading ? '…' : veteranFull ? '(Full)' : ''}`}
        </button>
        <button 
          type="button"
          className="btn" 
          onClick={(e) => choose('supporter', e)}
          disabled={!!pendingRole && pendingRole !== 'supporter'}
        >
          {pendingRole === 'supporter' ? 'Redirecting…' : 'Supporter'}
        </button>
        <button 
          type="button"
          className="btn" 
          onClick={(e) => choose('recruiter', e)}
          disabled={!!pendingRole && pendingRole !== 'recruiter'}
        >
          {pendingRole === 'recruiter' ? 'Redirecting…' : 'Recruiter'}
        </button>
      </div>
    </div>
  )
}

export default function RoleSelection() {
  return (
    <Suspense fallback={<div className="p-8">Loading…</div>}>
      <RoleSelectionInner />
    </Suspense>
  )
}
