'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

export default function SimpleCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'processing' | 'creating-profile' | 'success' | 'error'>('processing')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    async function handleCallback() {
      try {
        console.log('SimpleCallback: Starting OAuth callback...')
        
        const supabase = createSupabaseBrowser()
        
        // Wait for session to be established
        let attempts = 0
        const maxAttempts = 10
        
        while (attempts < maxAttempts) {
          attempts++
          console.log(`SimpleCallback: Session check attempt ${attempts}/${maxAttempts}`)
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (session) {
            console.log('SimpleCallback: Session found for:', session.user.email)
            break
          }
          
          if (sessionError) {
            console.error('SimpleCallback: Session error:', sessionError)
            throw new Error(`Session error: ${sessionError.message}`)
          }
          
          // Wait before next attempt
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        // Final session check
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`)
        }
        
        if (!session) {
          throw new Error('No session found after OAuth')
        }
        
        setStatus('creating-profile')
        console.log('SimpleCallback: Creating user profile...')
        
        // Create user profile directly in users table (simpler approach)
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            role: 'veteran', // Default to veteran for now
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })
        
        if (profileError) {
          console.error('SimpleCallback: Profile creation failed:', profileError)
          throw new Error(`Failed to create profile: ${profileError.message}`)
        }
        
        console.log('SimpleCallback: Profile created successfully')
        setStatus('success')
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard/veteran')
        }, 1000)
        
      } catch (error) {
        console.error('SimpleCallback: Error:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
        setStatus('error')
      }
    }
    
    handleCallback()
  }, [router])

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold mb-2">Processing Authentication...</h1>
          <p className="text-gray-600">Please wait while we complete your sign-in.</p>
        </div>
      </div>
    )
  }

  if (status === 'creating-profile') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold mb-2">Setting Up Your Account...</h1>
          <p className="text-gray-600">Creating your profile and preparing your dashboard.</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-xl font-semibold mb-2 text-green-700">Welcome to Xainik!</h1>
          <p className="text-green-600 mb-6">Your account has been created successfully.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-4">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-xl font-semibold mb-2 text-red-700">Authentication Failed</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth/simple')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return null
}
