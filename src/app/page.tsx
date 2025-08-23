'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  Zap,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  MessageSquare,
  Mail,
  Smartphone,
  Monitor,
  BarChart3
} from 'lucide-react'
import FOMOTicker from '@/components/FOMOTicker'
import HeroDonationsWidget from '@/components/HeroDonationsWidget'
import VeteranPitchCard from '@/components/VeteranPitchCard'
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
      setUser(null)
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      } else {
        console.log('Sign out successful')
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('xainik-auth-token')
          sessionStorage.clear()
        }
        
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Sign out error:', error)
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* FOMO Ticker - Subtle, well-placed below nav */}
      <section className="py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FOMOTicker />
        </div>
      </section>

      {/* Hero Section - Strong entry point with left text, right visuals */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left Content - Text */}
            <div className="text-center lg:text-left mb-12 lg:mb-0">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                👉 Your Referral Dashboard.
              </h1>

              <h2 className="text-xl lg:text-2xl font-semibold text-gray-700 mb-8 leading-relaxed">
                Not another job board. A personalized, trackable referral dashboard <strong>for job leads</strong> — activated only when you need it most.
              </h2>

              <div className="space-y-4 text-lg text-gray-600 mb-10">
                <p>Job boards don't work. Resumes vanish into black holes.</p>
                <p>The best jobs come through referrals — but there's never been a way to manage them clearly.</p>
                <p className="font-semibold text-gray-800">
                  <strong>Xainik changes that.</strong> Every referral, endorsement, and recruiter call is visible, trackable, and working for you — <strong>even when you're not.</strong>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                {!isLoading && !user ? (
                  <Link href="/waitlist" className="btn-primary text-lg inline-flex items-center gap-2 justify-center py-4 px-8">
                    Join the Waitlist — First 50 get 30 days full access
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                ) : !isLoading && user ? (
                  <>
                    <Link href="/dashboard" className="btn-primary text-lg inline-flex items-center gap-2 px-8 py-4">
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="btn-secondary text-lg inline-flex items-center gap-2 border-red-200 hover:border-red-300 hover:bg-red-50 px-8 py-4"
                    >
                      Sign Out
                      <LogOut className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <Link href="/waitlist" className="btn-primary text-lg inline-flex items-center gap-2 px-8 py-4">
                    Join the Waitlist — First 50 get 30 days full access
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Right Content - Hero Visual + Donations Widget */}
            <div className="space-y-6">
              <VeteranPitchCard />
              <HeroDonationsWidget />
            </div>
          </div>
        </div>
      </section>

      {/* The Pain Section - Clean, structured layout */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                Job boards don't get veterans hired. Referrals do.
              </h2>
              
              <ul className="space-y-5 mb-8">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-lg text-gray-700">Portals swallow resumes with no reply.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-lg text-gray-700">Referrals get buried in chats and emails.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-lg text-gray-700">Veterans are left guessing, with no visibility.</span>
                </li>
              </ul>
              
              <div className="text-xl font-semibold text-blue-600">
                👉 Veterans deserve better.
              </div>
            </div>

            {/* Right Visual - Before/After Contrast */}
            <div className="mt-12 lg:mt-0">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                <div className="grid grid-cols-2 gap-6">
                  {/* Before */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Before</h3>
                    <p className="text-sm text-gray-600">Buried in chats</p>
                  </div>
                  {/* After */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Monitor className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">After</h3>
                    <p className="text-sm text-gray-600">One dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Everyday Struggle Section - Centered layout */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              What veterans do today to stay visible.
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <ul className="space-y-5 mb-10">
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-lg text-gray-700">Pay for Naukri subscriptions that don't deliver.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-lg text-gray-700">Post endlessly on LinkedIn, hoping someone notices.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-lg text-gray-700">Send referral requests on WhatsApp and email, again and again.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-lg text-gray-700">Keep tweaking resumes and writing custom notes.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-lg text-gray-700">Follow up awkwardly, never knowing what happened.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-lg text-gray-700">Unsure who can actually connect you to the right role.</span>
              </li>
            </ul>
            
            <div className="text-center">
              <div className="text-xl font-semibold text-blue-600">
                👉 A lot of effort. Very little clarity.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Breakthrough Section - Side by side layout */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                A Referral Dashboard built for veterans.
              </h2>
              
              <ul className="space-y-5 mb-8">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-lg text-gray-700"><strong>AI turns your details into a powerful, shareable pitch.</strong></span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-lg text-gray-700">Supporters share in one click.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-lg text-gray-700">Every share, click, and recruiter call shows up in your dashboard.</span>
                </li>
              </ul>
            </div>

            {/* Right Visual - Pitch Preview Card */}
            <div className="mt-12 lg:mt-0">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 border border-blue-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-3">AI-Generated Pitch</h3>
                  <div className="bg-white rounded-lg p-4 text-left text-sm">
                    <p className="font-medium text-gray-900 mb-2">Capt. Arjun Singh</p>
                    <p className="text-gray-600 mb-2">Operations & Security Specialist</p>
                    <p className="text-gray-500 text-xs">Bengaluru • 2 endorsements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* No More Chasing Section - Centered with visual contrast */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              No more chasing.
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto mb-12">
            <div className="space-y-6 text-lg text-gray-700 text-center">
              <p>As a veteran, you don't need to keep writing referral requests, custom messages, or follow-up emails.</p>
              <p>Xainik automates it all — sending, tracking, and feedback.</p>
              <p className="text-xl font-semibold text-blue-600">👉 Less effort. More results.</p>
            </div>
          </div>

          {/* Visual Contrast */}
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Messy Screen */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Before: Messy</h3>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
              
              {/* Right: Clean Automated */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">After: Automated</h3>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-800">Referral Sent & Tracked</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All in One Place Section - Dashboard snapshot */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                All your referrals. In one place.
              </h2>
              
              <ul className="space-y-5 mb-8">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-lg text-gray-700">Who referred you</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-lg text-gray-700">Who opened, read, or clicked</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-lg text-gray-700">Who endorsed or called</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-lg text-gray-700">Which channels delivered results</span>
                </li>
              </ul>
            </div>

            {/* Right Visual - Dashboard Snapshot */}
            <div className="mt-12 lg:mt-0">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Dashboard Stats</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">120</div>
                    <div className="text-sm text-gray-600">Opens</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">45</div>
                    <div className="text-sm text-gray-600">Clicks</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">12</div>
                    <div className="text-sm text-gray-600">Referrals</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">3</div>
                    <div className="text-sm text-gray-600">Calls</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Referrals Matter Section - Flow chart */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              80% of high-quality veteran jobs come through referrals.
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto mb-12">
            <div className="space-y-6 text-lg text-gray-700 text-center">
              <p>Veterans already have strong networks. Supporters want to help.</p>
              <p>Until now, there's been no simple way to put that to work.</p>
              <p className="text-xl font-semibold text-blue-600">👉 Xainik makes referrals organized, measurable, and actionable.</p>
            </div>
          </div>

          {/* Flow Chart Visual */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="font-medium text-gray-900">Veteran</p>
                </div>
                <ArrowRight className="w-8 h-8 text-gray-400 hidden md:block" />
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="font-medium text-gray-900">Supporters</p>
                </div>
                <ArrowRight className="w-8 h-8 text-gray-400 hidden md:block" />
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="font-medium text-gray-900">Recruiters</p>
                </div>
                <ArrowRight className="w-8 h-8 text-gray-400 hidden md:block" />
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-8 h-8 text-indigo-600" />
                  </div>
                  <p className="font-medium text-gray-900">Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Mode vs Standby Section - Toggle cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              Pay only when you're searching.
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto mb-12">
            <div className="space-y-6 text-lg text-gray-700 text-center">
              <p>Starter Mission: 7 days, ₹99</p>
              <p>Plan 30, 60, 90: Active search</p>
              <p>After that: Standby — your pitch saved but hidden, ready anytime.</p>
              <p className="text-xl font-semibold text-blue-600">👉 Fair. Focused. Veteran-first.</p>
            </div>
          </div>

          {/* Toggle Cards Visual */}
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">Mission: Live</h3>
                <p className="text-green-700">Active search mode</p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Standby: Hidden</h3>
                <p className="text-gray-700">Ready anytime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supporters & Recruiters Section - Two columns */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Supporters */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                👉 Help faster. With minimal effort.
              </h2>
              
              <div className="space-y-6 mb-8">
                <p className="text-lg text-gray-700">Endorse in one click. Share anywhere, unlimited times, with ready referral messages.</p>
                <p className="text-lg text-gray-700">No manual work — no writing custom notes, no chasing, no updates.</p>
                <p className="text-lg text-gray-700">Messaging, tracking, and feedback are fully automated — visible to you, the veteran, and everyone in the loop.</p>
              </div>

              {/* Supporters Visual */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-3">Endorsement</h3>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="font-medium text-gray-900 mb-1">Meera Nair endorsed</p>
                    <p className="text-sm text-gray-600">Capt. Arjun Singh</p>
                    <p className="text-xs text-green-600 font-medium">Shared to 120 contacts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recruiters */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                👉 Skip the noise. Hire faster — faster than LinkedIn or Naukri.
              </h2>
              
              <div className="space-y-6 mb-8">
                <p className="text-lg text-gray-700">Only verified veterans in active search. The most current profiles, available immediately.</p>
                <p className="text-lg text-gray-700">Instant connect by call, email, or resume request — no stale profiles, no wasted time.</p>
              </div>

              {/* Recruiters Visual */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-3">Recruiter Panel</h3>
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700">
                      Request Resume
                    </button>
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700">
                      Call Now
                    </button>
                    <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700">
                      Send Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Proof Section - Activity feed */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              See the community in action.
            </h2>
          </div>
          
          <FOMOTicker />
        </div>
      </section>

      {/* Closing CTA Section - Strong finish */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
            Stop chasing. Start getting results.
          </h2>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed">
            Job boards vanish into black holes. High-quality referrals open doors.
            <br />
            Xainik makes them visible.
          </p>
          
          <Link href="/waitlist" className="btn-primary text-xl inline-flex items-center gap-3 px-10 py-5">
            👉 Join the Waitlist
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </section>
    </div>
  )
}
