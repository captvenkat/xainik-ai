'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import Link from 'next/link'

interface RoleAwareLinkProps {
  href: string
  children: React.ReactNode
  requiredRole?: 'veteran' | 'recruiter' | 'supporter'
  className?: string
  onClick?: () => void
}

export default function RoleAwareLink({ 
  href, 
  children, 
  requiredRole, 
  className = '',
  onClick 
}: RoleAwareLinkProps) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<{ role: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
      
      setIsLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data))
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick()
      return
    }

    // If no role required, proceed normally
    if (!requiredRole) {
      return
    }

    // If not logged in, redirect to auth
    if (!user) {
      e.preventDefault()
      router.push(`/auth?redirectTo=${encodeURIComponent(href)}`)
      return
    }

    // If role doesn't match, show appropriate message
    if (profile?.role !== requiredRole) {
      e.preventDefault()
      
      const roleMessages = {
        veteran: 'This action requires a Veteran account. Please sign in as a Veteran.',
        recruiter: 'This action requires a Recruiter account. Please sign in as a Recruiter.',
        supporter: 'This action requires a Supporter account. Please sign in as a Supporter.'
      }
      
      alert(roleMessages[requiredRole])
      return
    }
  }

  if (isLoading) {
    return (
      <span className={`${className} opacity-50 cursor-not-allowed`}>
        {children}
      </span>
    )
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
