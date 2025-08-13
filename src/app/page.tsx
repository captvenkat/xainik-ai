'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Shield,
  Users,
  ArrowRight,
  ChevronRight,
  Sparkles,
  LogOut
} from 'lucide-react'
import LiveActivityTicker from '@/components/LiveActivityTicker'
import DonationSnapshot from '@/components/DonationSnapshot'
import FeaturedPitches from '@/components/FeaturedPitches'
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
              Built for Veterans and Recruiters
            </div>

            <h1 className="heading-hero mb-6">
              Ultra-Fast Hiring Platform
              <span className="block text-gradient-primary">for Military Veterans</span>
            </h1>

            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700 max-w-4xl mx-auto leading-relaxed mb-6">
              AI‑First · Resume‑Free · Community‑Supported
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
              Post a pitch, get calls. Browse verified veterans with direct contact details.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {!isLoading && !user ? (
                <>
                  <Link href="/auth" className="btn-primary text-lg inline-flex items-center gap-2">
                    Sign In
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link href="/auth" className="btn-secondary text-lg inline-flex items-center gap-2">
                    Get Started
                    <ChevronRight className="h-5 w-5" />
                  </Link>
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

      {/* Featured Pitches */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Veterans
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover talented veterans ready for new opportunities
            </p>
          </div>
          <FeaturedPitches />
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

      {/* Featured Pitches (empty state, no dummy data) */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="heading-large mb-3">Featured Veterans</h2>
            <p className="text-gray-600">No featured pitches yet.</p>
          </div>
          <div className="flex items-center justify-center">
            <Link href="/pitch/new" className="btn-primary inline-flex items-center gap-2">
              Be the first to post
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>


    </div>
  )
}
