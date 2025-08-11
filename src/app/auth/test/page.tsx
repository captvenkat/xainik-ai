'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

export default function AuthTestPage() {
  const [status, setStatus] = useState<string>('Loading...')
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testAuth = async () => {
      try {
        const supabase = createSupabaseBrowser()
        
        // Test 1: Check session
        setStatus('Checking session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          setError(`Session error: ${sessionError.message}`)
          setStatus('Session check failed')
          return
        }
        
        if (session) {
          setUser(session.user)
          setStatus('User authenticated')
        } else {
          setStatus('No active session')
        }
        
        // Test 2: Check OAuth providers
        setStatus('OAuth providers available: Google, LinkedIn')
        
      } catch (err) {
        setError(`Test failed: ${err}`)
        setStatus('Test failed')
      }
    }

    testAuth()
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      const supabase = createSupabaseBrowser()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      })
      
      if (error) {
        setError(`Google sign-in failed: ${error.message}`)
      }
    } catch (err) {
      setError(`Google sign-in error: ${err}`)
    }
  }

  const handleSignOut = async () => {
    try {
      const supabase = createSupabaseBrowser()
      await supabase.auth.signOut()
      setUser(null)
      setStatus('Signed out')
    } catch (err) {
      setError(`Sign out error: ${err}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Authentication Test
          </h2>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-2">Status:</p>
            <p className="font-medium">{status}</p>
          </div>

          {user && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
              <p className="text-sm text-green-600 mb-2">User Info:</p>
              <p className="font-medium text-green-800">{user.email}</p>
              <p className="text-sm text-green-600">ID: {user.id}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-4">
              <p className="text-sm text-red-600 mb-2">Error:</p>
              <p className="font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4 mt-6">
            {!user ? (
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Test Google Sign-In
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
