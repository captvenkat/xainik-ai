'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { 
  Shield,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  BarChart3
} from 'lucide-react'
import NotificationBell from './NotificationBell'

// Create supabase instance once outside component
const supabase = createSupabaseBrowser()

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<{ role: string; full_name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      console.log('Navigation: Starting auth check...')
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        console.log('Navigation: Auth result:', { user: user?.email, error })
        setUser(user)
        
        if (user) {
          console.log('User authenticated:', user.email)
          // Try to get user profile
          try {
            const { data: profile, error } = await supabase
              .from('users')
              .select('role, name')
              .eq('id', user.id)
              .single()
            
            if (error) {
              console.warn('Failed to fetch user profile:', error)
              // Don't set a default profile - let the auth flow handle role selection
              setProfile(null)
            } else {
              console.log('Profile fetched:', profile)
              setProfile(profile ? { role: profile.role as string, full_name: profile.name as string } : null)
            }
          } catch (profileError) {
            console.warn('Profile fetch error:', profileError)
            setProfile(null)
          }
        } else {
          console.log('No user found')
        }
      } catch (error) {
        console.error('Auth error:', error)
      } finally {
        console.log('Navigation: Setting isLoading to false')
        setIsLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('role, name')
            .eq('id', session.user.id)
            .single()
          
          if (error) {
            console.warn('Profile fetch error in auth change:', error)
            setProfile(null)
          } else {
            setProfile(data ? { role: data.role, full_name: data.name } : null)
          }
        } catch (profileError) {
          console.warn('Profile fetch error in auth change:', profileError)
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getDashboardLink = () => {
    if (!profile?.role) return '/auth'
    return `/dashboard/${profile.role}`
  }

  const getDashboardLabel = () => {
    if (!profile?.role) return 'Dashboard'
    const labels: Record<string, string> = {
      veteran: 'Veteran Dashboard',
      recruiter: 'Recruiter Dashboard', 
      supporter: 'Supporter Dashboard',
      admin: 'Admin Dashboard'
    }
    return labels[profile.role] || 'Dashboard'
  }

  return (
    <nav className="relative bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold text-gradient-primary">XAINIK</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/browse" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Browse
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Pricing
            </Link>
            <Link href="/support-the-mission" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Support
            </Link>
            <Link href="/donations" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Donations
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Contact
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {/* Temporary: Force show sign-in buttons for testing */}
            <Link href="/auth" className="text-gray-700 hover:text-blue-600 transition-colors font-medium border-2 border-red-500 px-2 py-1 rounded">
              Sign In
            </Link>
            <Link href="/auth" className="btn-primary border-2 border-red-500">
              Get Started
            </Link>
            

          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-gray-200/50 bg-white/95 backdrop-blur-xl">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/browse" 
                className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/support-the-mission" 
                className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Support
              </Link>
              <Link 
                href="/donations" 
                className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Donations
              </Link>
              <Link 
                href="/about" 
                className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {/* Temporary: Force show sign-in buttons in mobile menu */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <Link 
                  href="/auth" 
                  className="block text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth" 
                  className="block btn-primary mt-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
              

            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
