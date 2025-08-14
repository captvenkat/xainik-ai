'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

interface User {
  id: string
  email?: string
  role?: string
  name?: string
}

interface UseAuthOptions {
  requiredRole?: string
  redirectTo?: string
  requireAuth?: boolean
}

export function useAuth(options: UseAuthOptions = {}) {
  const { requiredRole, redirectTo, requireAuth = true } = options
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasChecked, setHasChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let authSubscription: any

    function checkAuth() {
      // Prevent multiple simultaneous auth checks
      if (hasChecked) return
      setHasChecked(true)
      
      const supabase = createSupabaseBrowser()
      let isMounted = true
      
      // Enterprise pattern: Use AbortController for clean cancellation
      const controller = new AbortController()
      
      // Set a timeout to prevent infinite loading with hard refresh
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('useAuth: Auth check timeout, forcing hard refresh')
          setIsLoading(false)
          setError('Authentication timeout - refreshing page')
          // Force hard refresh immediately
          window.location.href = window.location.href
        }
      }, 3000) // 3 second timeout - reasonable for production
      
      // Enterprise pattern: Promise with proper error handling
      supabase.auth.getUser()
        .then(({ data: { user }, error: authError }) => {
          if (!isMounted) return
          clearTimeout(timeoutId)
          
          if (authError) {
            console.error('useAuth: Auth error:', authError)
            setError(authError.message)
            if (requireAuth) {
              const redirectPath = redirectTo || '/auth'
              router.push(redirectPath)
            } else {
              setUser(null)
              setProfile(null)
            }
            setIsLoading(false)
            return
          }
          
          if (!user) {
            if (requireAuth) {
              const redirectPath = redirectTo || '/auth'
              router.push(redirectPath)
            } else {
              setUser(null)
              setProfile(null)
            }
            setIsLoading(false)
            return
          }
          
          setUser(user)
          
          // Get user profile with timeout
          const profileTimeoutId = setTimeout(() => {
            if (isMounted) {
              setProfile(null)
              setIsLoading(false)
            }
          }, 1500) // 1.5 second timeout for profile
          
          // Use async/await in a separate function to avoid Promise chain issues
          const fetchProfile = async () => {
            try {
              const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('role, name')
                .eq('id', user.id)
                .single()
              
              if (!isMounted) return
              clearTimeout(profileTimeoutId)
              
              if (profileError) {
                setProfile(null)
              } else {
                setProfile(profile)
              }
              
              // Check role requirement
              if (requiredRole && profile?.role !== requiredRole) {
                const redirectPath = redirectTo || '/dashboard'
                router.push(redirectPath)
                return
              }
              
              setIsLoading(false)
            } catch (error) {
              if (!isMounted) return
              clearTimeout(profileTimeoutId)
              setProfile(null)
              setIsLoading(false)
            }
          }
          
          fetchProfile()
        })
        .catch((error) => {
          if (!isMounted) return
          clearTimeout(timeoutId)
          setError('Authentication failed')
          if (requireAuth) {
            router.push('/auth')
          }
          setIsLoading(false)
        })
      
      // Cleanup function
      return () => {
        isMounted = false
        controller.abort()
      }
    }
    
    // Set up auth state change listener (simplified to prevent spinning)
    const supabase = createSupabaseBrowser()
    authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        // Don't set loading to true here to prevent spinning
        // Profile will be fetched in the main checkAuth function
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setIsLoading(false)
        setError(null)
      }
    })
    
    checkAuth()
    
    return () => {
      clearTimeout(timeoutId)
      if (authSubscription?.data?.subscription) {
        authSubscription.data.subscription.unsubscribe()
      }
    }
  }, [router, requiredRole, redirectTo, requireAuth])

  const signOut = async () => {
    try {
      const supabase = createSupabaseBrowser()
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return {
    user,
    profile,
    isLoading,
    error,
    signOut,
    isAuthenticated: !!user,
    hasRole: (role: string) => profile?.role === role
  }
}
