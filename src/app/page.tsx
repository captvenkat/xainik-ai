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
  Zap,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* FOMO Ticker - above Hero, below nav */}
      <section className="py-4 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FOMOTicker />
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-hero-overlay"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="heading-hero mb-6">
                👉 Your Referral Dashboard.
              </h1>

              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700 max-w-4xl mx-auto lg:mx-0 leading-relaxed mb-6">
                Not another job board.
                <br />
                A personalized, trackable referral dashboard <strong>for job leads</strong> — activated only when you need it most.
              </h2>

              <p className="text-xl text-gray-600 max-w-3xl mx-auto lg:mx-0 leading-relaxed mb-8">
                Job boards don't work. Resumes vanish into black holes.
                <br /><br />
                The best jobs come through referrals — but there's never been a way to manage them clearly.
                <br /><br />
                <strong>Xainik changes that.</strong>
                <br />
                Every referral, endorsement, and recruiter call is visible, trackable, and working for you — <strong>even when you're not.</strong>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                {!isLoading && !user ? (
                  <Link href="/waitlist" className="btn-primary text-lg inline-flex items-center gap-2 justify-center py-4">
                    Join the Waitlist — First 50 get 30 days full access
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                ) : !isLoading && user ? (
                  <>
                    <Link href="/dashboard" className="btn-primary text-lg inline-flex items-center gap-2">
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5" />
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
                  <Link href="/waitlist" className="btn-primary text-lg inline-flex items-center gap-2">
                    Join the Waitlist — First 50 get 30 days full access
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Right Content - Hero Visual + Donations Widget */}
            <div className="mt-12 lg:mt-0 space-y-6">
              <VeteranPitchCard />
              <HeroDonationsWidget />
            </div>
          </div>
        </div>
      </section>

      {/* The Pain Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Job boards don't get veterans hired. Referrals do.
              </h2>
              
              <ul className="space-y-4 mb-6">
                <li className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-gray-700">Portals swallow resumes with no reply.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-gray-700">Referrals get buried in chats and emails.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-gray-700">Veterans are left guessing, with no visibility.</span>
                </li>
              </ul>
              
              <div className="text-xl font-semibold text-blue-600">
                👉 Veterans deserve better.
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <div className="text-gray-500 mb-4">Visual: Before/After Contrast</div>
                <div className="text-sm text-gray-400">
                  OG route: /api/og/contrast?mode=before-after
                  <br />
                  Alt: "Before: buried in chats. After: one dashboard."
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Everyday Struggle Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              What veterans do today to stay visible.
            </h2>
          </div>
          
          <ul className="space-y-4 max-w-4xl mx-auto">
            <li className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-lg text-gray-700">Pay for Naukri subscriptions that don't deliver.</span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-lg text-gray-700">Post endlessly on LinkedIn, hoping someone notices.</span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-lg text-gray-700">Send referral requests on WhatsApp and email, again and again.</span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-lg text-gray-700">Keep tweaking resumes and writing custom notes.</span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-lg text-gray-700">Follow up awkwardly, never knowing what happened.</span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-lg text-gray-700">Unsure who can actually connect you to the right role.</span>
            </li>
          </ul>
          
          <div className="text-center mt-8">
            <div className="text-xl font-semibold text-blue-600">
              👉 A lot of effort. Very little clarity.
            </div>
          </div>
        </div>
      </section>

      {/* The Breakthrough Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                A Referral Dashboard built for veterans.
              </h2>
              
              <ul className="space-y-4 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-gray-700"><strong>AI turns your details into a powerful, shareable pitch.</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-gray-700">Supporters share in one click.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-gray-700">Every share, click, and recruiter call shows up in your dashboard.</span>
                </li>
              </ul>
              
              <div className="text-xl font-semibold text-blue-600">
                👉 Finally, you know what's working.
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <div className="text-gray-500 mb-4">Visual: AI Drafted Pitch</div>
                <div className="text-sm text-gray-400">
                  OG route: /api/og/step/pitch
                  <br />
                  Alt: "AI‑drafted pitch and one‑click share."
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All in One Place Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                All your referrals. In one place.
              </h2>
              
              <ul className="space-y-4 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-gray-700">Who referred you</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-gray-700">Who opened, read, or clicked</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-gray-700">Who endorsed or called</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-gray-700">Which channels delivered results</span>
                </li>
              </ul>
              
              <div className="text-xl font-semibold text-blue-600">
                👉 Like Google Analytics — but for your job search.
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <div className="text-gray-500 mb-4">Visual: Dashboard Snapshot</div>
                <div className="text-sm text-gray-400">
                  OG route: /api/og/dashboard?id=pitch_0
                  <br />
                  Alt: "Veteran dashboard snapshot."
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Referrals Matter Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                80% of high-quality veteran jobs come through referrals.
              </h2>
              
              <p className="text-lg text-gray-700 mb-6">
                Veterans already have strong networks. Supporters want to help.
                <br /><br />
                Until now, there's been no simple way to put that to work.
              </p>
              
              <div className="text-xl font-semibold text-blue-600">
                👉 Xainik makes referrals organized, measurable, and actionable.
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <div className="text-gray-500 mb-4">Visual: Referral Flow</div>
                <div className="text-sm text-gray-400">
                  OG route: /api/og/flow/referrals
                  <br />
                  Alt: "How referrals flow through Xainik."
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Mode vs Standby Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Pay only when you're searching.
              </h2>
              
              <ul className="space-y-4 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-gray-700">Starter Mission: 7 days, ₹99</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-gray-700">Plan 30, 60, 90: Active search</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-gray-700">After that: Standby — your pitch saved but hidden, ready anytime.</span>
                </li>
              </ul>
              
              <div className="text-xl font-semibold text-blue-600">
                👉 Fair. Focused. Veteran-first.
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <div className="text-gray-500 mb-4">Visual: Mission vs Standby Toggle</div>
                <div className="text-sm text-gray-400">
                  OG route: /api/og/mode/mission-vs-standby
                  <br />
                  Alt: "Mission vs Standby."
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supporters & Recruiters Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Supporters */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                👉 Help faster. With minimal effort.
              </h2>
              
              <p className="text-lg text-gray-700 mb-6">
                Endorse in one click. Share anywhere, unlimited times, with ready referral messages.
                <br /><br />
                No manual work — no writing custom notes, no chasing, no updates. Messaging, tracking, and feedback are fully automated — visible to you, the veteran, and everyone in the loop.
              </p>
              
              <Link href="/support" className="btn-primary text-lg inline-flex items-center gap-2">
                Learn More → Supporters
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <div className="mt-6 bg-gray-100 rounded-lg p-6 text-center">
                <div className="text-gray-500 mb-2">Visual: Supporter Endorsement</div>
                <div className="text-sm text-gray-400">
                  OG route: /api/og/supporter/endorsement?id=pitch_0
                  <br />
                  Alt: "Supporter endorsement and share."
                </div>
              </div>
            </div>

            {/* Recruiters */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                👉 Skip the noise. Hire faster — faster than LinkedIn or Naukri.
              </h2>
              
              <p className="text-lg text-gray-700 mb-6">
                Only verified veterans in active search. The most current profiles, available immediately.
                <br /><br />
                Instant connect by call, email, or resume request — no stale profiles, no wasted time.
              </p>
              
              <Link href="/dashboard/recruiter" className="btn-primary text-lg inline-flex items-center gap-2">
                Learn More → Recruiters
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <div className="mt-6 bg-gray-100 rounded-lg p-6 text-center">
                <div className="text-gray-500 mb-2">Visual: Recruiter Connect Panel</div>
                <div className="text-sm text-gray-400">
                  OG route: /api/og/recruiter/action?id=pitch_0
                  <br />
                  Alt: "Recruiter connect panel."
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Proof Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              See the community in action.
            </h2>
          </div>
          
          <FOMOTicker />
        </div>
      </section>

      {/* Closing CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Stop chasing. Start getting results.
          </h2>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Job boards vanish into black holes. High-quality referrals open doors.
            <br />
            Xainik makes them visible.
          </p>
          
          <Link href="/waitlist" className="btn-primary text-lg inline-flex items-center gap-2">
            👉 Join the Waitlist
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

    </div>
  )
}
