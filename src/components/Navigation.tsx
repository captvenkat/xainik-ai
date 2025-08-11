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

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<{ role: string; full_name: string } | null>(null)
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
          .select('role, name')
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
          .select('role, name')
          .eq('id', session.user.id)
          .single()
          .then(({ data }: { data: any }) => setProfile(data))
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

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
          <div className="hidden md:flex items-center space-x-4">
            {!isLoading && (
              <>
                {user ? (
                  <>
                    {/* Notification Bell */}
                    <NotificationBell />
                    
                    <div className="relative group">
                      <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium">{profile?.full_name || user.email}</span>
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <div className="py-2">
                          <Link 
                            href={getDashboardLink()}
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <BarChart3 className="h-4 w-4 mr-3" />
                            {getDashboardLabel()}
                          </Link>
                          <Link 
                            href="/settings/notifications"
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            Notification Settings
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
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
              
              {user ? (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center px-4 py-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="ml-3 font-medium text-gray-900">{profile?.full_name || user.email}</span>
                    </div>
                    <Link 
                      href={getDashboardLink()}
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BarChart3 className="h-4 w-4 mr-3" />
                      {getDashboardLabel()}
                    </Link>
                    <Link 
                      href="/settings/notifications"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Notification Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
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
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
