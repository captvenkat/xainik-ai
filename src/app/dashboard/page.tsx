'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

export default function DashboardRedirect() {
  console.log('DashboardRedirect: Component loading!')
  const router = useRouter()

  useEffect(() => {
    async function checkAuthAndRedirect() {
      console.log('DashboardRedirect: Starting auth check...')
      try {
        const supabase = createSupabaseBrowser()
        
        // Check authentication
        console.log('DashboardRedirect: Checking authentication...')
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        console.log('DashboardRedirect: Auth result:', { user: !!user, error: authError })
        
        if (authError || !user) {
          console.log('DashboardRedirect: Auth failed, redirecting to auth...')
          router.push('/auth?redirect=/dashboard')
          return
        }

        console.log('DashboardRedirect: User authenticated:', user.email)
        
        // Get user role and redirect to appropriate dashboard
        console.log('DashboardRedirect: Checking user role...')
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        console.log('DashboardRedirect: Profile result:', profile)

        if (!profile?.role) {
          console.log('DashboardRedirect: No role, redirecting to role selection...')
          // User has no role, redirect to role selection
          router.push('/role-selection')
          return
        }

        console.log('DashboardRedirect: Redirecting to role dashboard:', profile.role)
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
