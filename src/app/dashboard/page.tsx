'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    async function checkAuthAndRedirect() {
      try {
        // Set timeout for auth check
        timeoutId = setTimeout(() => {
          console.warn('DashboardRedirect: Auth timeout, forcing refresh')
          // Force hard refresh after 2 seconds
          setTimeout(() => {
            window.location.href = window.location.href
          }, 2000)
        }, 8000) // 8 second timeout
        
        const supabase = createSupabaseBrowser()
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          clearTimeout(timeoutId)
          router.push('/auth?redirect=/dashboard')
          return
        }

        // Get user role and redirect to appropriate dashboard
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!profile?.role) {
          // User has no role, redirect to role selection
          clearTimeout(timeoutId)
          router.push('/role-selection')
          return
        }

        // Redirect to role-specific dashboard
        clearTimeout(timeoutId)
        router.push(`/dashboard/${profile.role}`)
      } catch (error) {
        console.error('DashboardRedirect: Error:', error)
        clearTimeout(timeoutId)
        router.push('/auth?redirect=/dashboard')
      }
    }
    
    checkAuthAndRedirect()
    
    return () => {
      clearTimeout(timeoutId)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Redirecting to Dashboard...</h2>
        <p className="text-gray-600 mb-6">Please wait while we redirect you to your dashboard.</p>
        <button 
          onClick={() => window.location.href = window.location.href}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}
