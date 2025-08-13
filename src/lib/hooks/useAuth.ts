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
    async function checkAuth() {
      try {
        const supabase = createSupabaseBrowser()
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          if (requireAuth) {
            const redirectPath = redirectTo || '/auth'
            router.push(redirectPath)
            return
          } else {
            setUser(null)
            setProfile(null)
            setIsLoading(false)
            return
          }
        }
        
        setUser(user)
        
        // Get user profile from database
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role, name')
          .eq('id', user.id)
          .single()
        
        if (profileError) {
          console.warn('Failed to fetch user profile:', profileError)
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
        
      } catch (error) {
        console.error('Auth check error:', error)
        setError('Authentication failed')
        if (requireAuth) {
          router.push('/auth')
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
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
