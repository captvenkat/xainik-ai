'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    async function checkAuthAndRedirect() {
      try {
        const supabase = createSupabaseBrowser()
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
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
          router.push('/role-selection')
          return
        }

        // Redirect to role-specific dashboard
        router.push(`/dashboard/${profile.role}`)
      } catch (error) {
        console.error('DashboardRedirect: Error:', error)
        router.push('/auth?redirect=/dashboard')
      }
    }
    
    checkAuthAndRedirect()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Redirecting to Dashboard...</h2>
        <p className="text-gray-600">Please wait while we redirect you to your dashboard.</p>
      </div>
    </div>
  )
}
