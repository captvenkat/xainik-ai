'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

export default function AuthDebug() {
  const [authState, setAuthState] = useState<{
    isLoading: boolean
    user: any
    session: any
    error: string | null
  }>({
    isLoading: true,
    user: null,
    session: null,
    error: null
  })

  useEffect(() => {
    const checkAuth = async () => {
      // Add a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('AuthDebug: Timeout, setting loading to false')
        setAuthState(prev => ({ ...prev, isLoading: false }))
      }, 3000) // 3 second timeout
      
      try {
        const supabase = createSupabaseBrowser()
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        clearTimeout(timeoutId)
        setAuthState({
          isLoading: false,
          user: user,
          session: session,
          error: sessionError?.message || userError?.message || null
        })
      } catch (error) {
        clearTimeout(timeoutId)
        setAuthState({
          isLoading: false,
          user: null,
          session: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    checkAuth()
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h4 className="font-bold mb-2">Auth Debug</h4>
      <div className="space-y-1">
        <div>Loading: {authState.isLoading ? 'Yes' : 'No'}</div>
        <div>User: {authState.user ? 'Yes' : 'No'}</div>
        <div>Session: {authState.session ? 'Yes' : 'No'}</div>
        {authState.error && <div className="text-red-400">Error: {authState.error}</div>}
        {authState.user && (
          <div className="text-green-400">
            Email: {authState.user.email}
          </div>
        )}
      </div>
    </div>
  )
}
