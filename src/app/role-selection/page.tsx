'use client'
import React, { Suspense, useEffect, useMemo, useState } from 'react'
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

  async function choose(role: 'veteran'|'supporter'|'recruiter') {
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
      setError(msg); return
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

      <div className="grid gap-3">
        <button
          className="btn disabled:opacity-50"
          onClick={() => choose('veteran')}
          disabled={loading || veteranFull}
          title={veteranFull ? 'Registrations closed (cap reached)' : undefined}
        >
          Veteran {loading ? '…' : veteranFull ? '(Full)' : ''}
        </button>
        <button className="btn" onClick={() => choose('supporter')}>Supporter</button>
        <button className="btn" onClick={() => choose('recruiter')}>Recruiter</button>
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
