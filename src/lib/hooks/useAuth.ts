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
  const router = useRouter()

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let authSubscription: any

    async function checkAuth() {
      try {
        const supabase = createSupabaseBrowser()
        
        // Set a timeout to prevent infinite loading with hard refresh
        timeoutId = setTimeout(() => {
          console.warn('useAuth: Auth check timeout, forcing hard refresh')
          setIsLoading(false)
          setError('Authentication timeout - refreshing page')
          // Force hard refresh after 3 seconds
          setTimeout(() => {
            window.location.href = window.location.href
          }, 3000)
        }, 8000) // 8 second timeout
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
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
          return
        }
        
        setUser(user)
        
        // Get user profile from database
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role, name')
          .eq('id', user.id)
          .single()
        
        if (profileError) {
          console.warn('useAuth: Failed to fetch user profile:', profileError)
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
        
        clearTimeout(timeoutId)
        
      } catch (error) {
        console.error('useAuth: Auth check error:', error)
        setError('Authentication failed')
        if (requireAuth) {
          router.push('/auth')
        }
      } finally {
        clearTimeout(timeoutId)
        setIsLoading(false)
      }
    }
    
    // Set up auth state change listener
    const supabase = createSupabaseBrowser()
    authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('useAuth: Auth state change:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        setIsLoading(true)
        
        // Fetch profile for new session
        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role, name')
            .eq('id', session.user.id)
            .single()
          
          if (profileError) {
            console.warn('useAuth: Failed to fetch profile on auth change:', profileError)
            setProfile(null)
          } else {
            setProfile(profile)
          }
        } catch (error) {
          console.error('useAuth: Profile fetch error on auth change:', error)
          setProfile(null)
        } finally {
          setIsLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('useAuth: User signed out')
        setUser(null)
        setProfile(null)
        setIsLoading(false)
        setError(null)
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('useAuth: Token refreshed')
        // Re-fetch user data if needed
        if (session?.user) {
          setUser(session.user)
        }
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
