'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser, clearSupabaseBrowserInstance } from '@/lib/supabaseBrowser'
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

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<{ role: string; full_name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasChecked, setHasChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createSupabaseBrowser()
    let timeoutId: NodeJS.Timeout
    let isMounted = true
    
    const getUser = () => {
      // Prevent multiple simultaneous auth checks
      if (hasChecked) return
      setHasChecked(true)
      
      // Enterprise pattern: Use AbortController for clean cancellation
      const controller = new AbortController()
      
      // Set timeout with cleanup
      // More aggressive timeout for desktop browsers
      const isDesktop = typeof window !== 'undefined' && window.innerWidth > 768
      const timeoutDuration = isDesktop ? 800 : 2000 // 800ms for desktop, 2s for mobile
      
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn(`Navigation: Auth timeout (${timeoutDuration}ms), forcing refresh`)
          setIsLoading(false)
          // Force immediate hard refresh for desktop
          if (isDesktop) {
            window.location.reload()
          } else {
            window.location.href = window.location.href
          }
        }
      }, timeoutDuration)
      
      // Enterprise pattern: Promise with proper error handling
      const authPromise = supabase.auth.getSession()
        .then(({ data: { session }, error: sessionError }) => {
          if (!isMounted) return
          clearTimeout(timeoutId)
          
          if (session?.user) {
            setUser(session.user)
            
            // Get profile with separate timeout
            const profileTimeoutId = setTimeout(() => {
              if (isMounted) {
                setProfile(null)
              }
            }, 1000)
            
            // Use async/await in a separate function to avoid Promise chain issues
            const fetchProfile = async () => {
              try {
                const { data: profile, error } = await supabase
                  .from('users')
                  .select('role, name')
                  .eq('id', session.user.id)
                  .single()
                
                if (!isMounted) return
                clearTimeout(profileTimeoutId)
                
                if (!error && profile) {
                  setProfile({ role: profile.role as string, full_name: profile.name as string })
                } else {
                  setProfile(null)
                }
              } catch (error) {
                if (!isMounted) return
                clearTimeout(profileTimeoutId)
                setProfile(null)
              }
            }
            
            fetchProfile()
          } else {
            setUser(null)
            setProfile(null)
          }
          setIsLoading(false)
        })
        .catch((error) => {
          if (!isMounted) return
          clearTimeout(timeoutId)
          setUser(null)
          setProfile(null)
          setIsLoading(false)
        })
      
      // Cleanup function
      return () => {
        controller.abort()
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      try {
        // Only handle basic user state, don't fetch profile here
        setUser(session?.user ?? null)
        
        if (!session?.user) {
          setProfile(null)
        }
        // Profile will be fetched in the main getUser function
      } catch (error) {
        // Silently handle any auth state change errors
      }
    })

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowser()
    
    try {
      // Clear user state immediately for better UX
      setUser(null)
      setProfile(null)
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Navigation: Sign out error:', error)
      } else {
        // Clear any local storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('xainik-auth-token')
          sessionStorage.clear()
        }
        
        // Clear the singleton instance
        clearSupabaseBrowserInstance()
        
        // Force page reload to clear all state
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Navigation: Sign out error:', error)
      // Force page reload anyway
      window.location.href = '/'
    }
  }

  const getDashboardLink = () => {
    if (!profile?.role) {
      return '/dashboard'
    }
    const link = `/dashboard/${profile.role}`
    return link
  }

  const getDashboardLabel = () => {
    if (!profile?.role) return 'Dashboard'
    const labels: Record<string, string> = {
      veteran: 'Veteran Dashboard',
      recruiter: 'Recruiter Dashboard', 
      supporter: 'Supporter Dashboard',
      admin: 'Admin Dashboard'
    }
    const label = labels[profile.role] || 'Dashboard'
    return label
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
            {process.env.NEXT_PUBLIC_FEATURE_IMPACT === 'true' && profile?.role === 'veteran' && (
              <Link href="/dashboard/veteran/impact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Impact
              </Link>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {!isLoading && !user ? (
              <>
                <Link href="/auth" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Sign In
                </Link>
                <Link href="/auth" className="btn-primary">
                  Get Started
                </Link>
              </>
            ) : !isLoading && user ? (
              <>
                <Link href={getDashboardLink()} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  {getDashboardLabel()}
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-red-600 transition-colors font-medium border border-gray-300 hover:border-red-300 px-3 py-1 rounded"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Sign In
                </Link>
                <Link href="/auth" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
            

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
              {process.env.NEXT_PUBLIC_FEATURE_IMPACT === 'true' && profile?.role === 'veteran' && (
                <Link 
                  href="/dashboard/veteran/impact" 
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Impact
                </Link>
              )}
              
              {/* Auth buttons in mobile menu */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {!isLoading && !user ? (
                  <>
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
                  </>
                ) : !isLoading && user ? (
                  <>
                    <Link 
                      href={getDashboardLink()} 
                      className="block text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {getDashboardLabel()}
                    </Link>
                    <button 
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 mt-2"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
              

            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
