'use client'
import React, { Suspense } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

function RoleSelectionContent() {
  const supabase = createSupabaseBrowser()
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get('redirect') ?? '/dashboard'

  useEffect(() => {
    // auto-apply a one-time hint if present
    const hint = window.document.cookie.match(/(?:^|; )x-role-hint=([^;]+)/)?.[1]
    if (hint === 'veteran' || hint === 'supporter' || hint === 'recruiter') {
      choose(hint as any)
      // expire hint
      document.cookie = 'x-role-hint=; Max-Age=0; path=/'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function choose(role: 'veteran' | 'supporter' | 'recruiter') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/auth?redirect=${encodeURIComponent('/role-selection')}`)
      return
    }
    await supabase.from('profiles').update({ role, onboarding_complete: false }).eq('id', user.id)
    router.replace(`/auth/warmup?redirect=${encodeURIComponent(redirectTo)}`)
  }

  return (
    <div className="max-w-md mx-auto py-16">
      <h1 className="text-2xl font-semibold mb-6">Choose your role</h1>
      <div className="grid gap-3">
        <button 
          className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors" 
          onClick={() => choose('veteran')}
        >
          Veteran
        </button>
        <button 
          className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors" 
          onClick={() => choose('supporter')}
        >
          Supporter
        </button>
        <button 
          className="w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors" 
          onClick={() => choose('recruiter')}
        >
          Recruiter
        </button>
      </div>
    </div>
  )
}

export default function RoleSelection() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto py-16">Loading...</div>}>
      <RoleSelectionContent />
    </Suspense>
  )
}


