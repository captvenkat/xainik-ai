'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Shield,
  Users,
  ArrowRight,
  ChevronRight,
  Sparkles,
  LogOut,
  Star,
  Heart,
  Phone,
  Zap
} from 'lucide-react'
import LiveActivityTicker from '@/components/LiveActivityTicker'
import DonationSnapshot from '@/components/DonationSnapshot'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createSupabaseBrowser()
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowser()
    console.log('Homepage: Signing out...')
    
    try {
      // Clear user state immediately for better UX
      setUser(null)
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      } else {
        console.log('Sign out successful')
        
        // Clear any local storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('xainik-auth-token')
          sessionStorage.clear()
        }
        
        // Force page reload to clear all state
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Sign out error:', error)
      // Force page reload anyway
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-hero-overlay"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 text-gray-800 rounded-full text-sm font-semibold mb-8 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Built for the Best
            </div>

            <h1 className="heading-hero mb-6">
              Fastest Way to Hire
              <span className="block text-gradient-primary">Trusted Veterans</span>
            </h1>

            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700 max-w-4xl mx-auto leading-relaxed mb-6">
              World's Only AI-First, Community-Supported Hiring Platform for Military Veterans
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
              Post a pitch, get direct calls from recruiters.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {!isLoading && !user ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-2xl mx-auto">
                    {/* Veterans - Join Waitlist */}
                    <div className="flex flex-col items-center">
                      <Link href="/waitlist" className="btn-primary text-lg inline-flex flex-col items-center gap-2 w-full justify-center py-4">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          <span>Veterans</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Join Waitlist</span>
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </Link>
                      <p className="text-sm text-gray-500 mt-2 text-center">New veterans join our waitlist</p>
                    </div>
                    
                    {/* Recruiters & Supporters - Sign In */}
                    <div className="flex flex-col items-center">
                      <Link href="/auth" className="btn-secondary text-lg inline-flex flex-col items-center gap-2 w-full justify-center py-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          <span>Recruiters & Supporters</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Sign In</span>
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </Link>
                      <p className="text-sm text-gray-500 mt-2 text-center">Existing users access platform</p>
                    </div>
                  </div>
                </>
              ) : !isLoading && user ? (
                <>
                  <Link href="/dashboard" className="btn-primary text-lg inline-flex items-center gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link href="/browse" className="btn-secondary text-lg inline-flex items-center gap-2">
                    Browse Veterans
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="btn-secondary text-lg inline-flex items-center gap-2 border-red-200 hover:border-red-300 hover:bg-red-50"
                  >
                    Sign Out
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/pitch/new" className="btn-primary text-lg inline-flex items-center gap-2">
                    Post My Pitch
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link href="/browse" className="btn-secondary text-lg inline-flex items-center gap-2">
                    Browse Veterans
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                  <Link href="/support" className="btn-secondary text-lg inline-flex items-center gap-2">
                    Refer a Pitch
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Activity Ticker */}
      <section className="py-8 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LiveActivityTicker />
        </div>
      </section>

      {/* Donation Snapshot */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DonationSnapshot />
        </div>
      </section>

      {/* Supporter Encouragement Section */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 text-gray-800 rounded-full text-sm font-semibold mb-6 shadow-sm">
              <Heart className="h-4 w-4" />
              Support Our Mission
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Help Veterans Get Hired Faster
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your support directly connects veterans with opportunities. Every referral, endorsement, and donation makes a difference.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Direct Connections</h3>
                <p className="text-sm text-gray-600">Connect veterans with recruiters</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Fast Results</h3>
                <p className="text-sm text-gray-600">See impact in real-time</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Community Impact</h3>
                <p className="text-sm text-gray-600">Build lasting relationships</p>
              </div>
            </div>
            <div className="text-center">
              <Link href="/support-the-mission" className="btn-primary text-lg inline-flex items-center gap-2">
                Support Veterans
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 text-gray-800 rounded-full text-sm font-semibold mb-6 shadow-sm">
              <Shield className="h-4 w-4" />
              Exclusive Early Access
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join the First 50 Veterans
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get privileged access to the complete platform. First 50 veterans get FREE access with unlimited features.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Complete Platform</h3>
                <p className="text-sm text-gray-600">All features unlocked</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Priority Support</h3>
                <p className="text-sm text-gray-600">Dedicated assistance</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Founding Member</h3>
                <p className="text-sm text-gray-600">Exclusive community</p>
              </div>
            </div>
            <div className="text-center">
              <Link href="/waitlist" className="btn-primary text-lg inline-flex items-center gap-2">
                Join Waitlist Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Audience cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center p-8 card-glass">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="heading-medium mb-2">Veterans</h3>
              <p className="text-gray-600">Create a concise pitch. Get contacted directly by recruiters.</p>
              <div className="mt-6">
                <Link href="/pitch/new" className="btn-primary inline-flex items-center gap-2">
                  Post My Pitch
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="text-center p-8 card-glass">
              <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="heading-medium mb-2">Recruiters</h3>
              <p className="text-gray-600">Browse ready-to-join veterans with verified details.</p>
              <div className="mt-6">
                <Link href="/browse" className="btn-secondary inline-flex items-center gap-2">
                  Browse Veterans
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
