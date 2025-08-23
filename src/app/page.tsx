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
  XCircle,
  MessageSquare,
  Mail,
  Smartphone,
  Monitor,
  BarChart3,
  MapPin,
  Eye,
  MousePointer,
  Share2,
  UserPlus,
  FileText,
  Lock,
  Unlock
} from 'lucide-react'
import FOMOTicker from '@/components/FOMOTicker'
import VeteranPitchCard from '@/components/VeteranPitchCard'
import { SmartImage } from '@/components/SmartImage'
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
      {/* FOMO Ticker - Ambient band under nav */}
      <section className="py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FOMOTicker />
        </div>
      </section>

      {/* 1) HERO Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left Content - Text stack */}
            <div className="text-center lg:text-left mb-12 lg:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                👉 Your Referral Dashboard.
              </h1>

              <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-8 leading-relaxed">
                Not another job board. A personalized, trackable referral dashboard <strong>for job leads</strong> — activated only when you need it most.
              </h2>

              <div className="space-y-4 text-base md:text-lg text-gray-600 mb-10 leading-relaxed">
                <p>Job boards don't work. Resumes vanish into black holes.</p>
                <p>The best jobs come through referrals — but there's never been a way to manage them clearly.</p>
                <p className="text-lg font-semibold text-gray-800">
                  <strong>Xainik changes that.</strong> Every referral, endorsement, and recruiter call is visible, trackable, and working for you — <strong>even when you're not.</strong>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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

            {/* Right Content - Only Veteran Pitch Card */}
            <div className="mt-12 lg:mt-0">
              <VeteranPitchCard />
            </div>
          </div>
        </div>
      </section>

      {/* 2) THE PAIN Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                Job boards don't get veterans hired. Referrals do.
              </h2>
              
              <ul className="space-y-2 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <XCircle className="w-3 h-3 text-red-600" />
                  </div>
                  <span className="text-base md:text-lg text-gray-700">Portals swallow resumes with no reply.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <XCircle className="w-3 h-3 text-red-600" />
                  </div>
                  <span className="text-base md:text-lg text-gray-700">Referrals get buried in chats and emails.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <XCircle className="w-3 h-3 text-red-600" />
                  </div>
                  <span className="text-base md:text-lg text-gray-700">Veterans are left guessing, with no visibility.</span>
                </li>
                <li className="flex items-start gap-3 mt-4">
                  <span className="text-lg font-semibold text-blue-600">👉 Veterans deserve better.</span>
                </li>
              </ul>
            </div>

            {/* Visual - Before/After contrast */}
            <div className="mt-12 lg:mt-0">
              <SmartImage 
                src="/api/og/contrast"
                alt="Before: Buried in chats vs After: One dashboard"
                fallbackLabel="Before / After"
                className="rounded-2xl border shadow-sm w-full h-full object-cover min-h-[220px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3) THE EVERYDAY STRUGGLE Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                What veterans do today to stay visible.
              </h2>
              
              <ul className="space-y-2 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Smartphone className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-base md:text-lg text-gray-700">Pay for Naukri subscriptions that don't deliver.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Monitor className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-base md:text-lg text-gray-700">Post endlessly on LinkedIn, hoping someone notices.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-base md:text-lg text-gray-700">Send referral requests on WhatsApp and email, again and again.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-base md:text-lg text-gray-700">Keep tweaking resumes and writing custom notes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-base md:text-lg text-gray-700">Follow up awkwardly, never knowing what happened.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserPlus className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-base md:text-lg text-gray-700">Unsure who can actually connect you to the right role.</span>
                </li>
                <li className="flex items-start gap-3 mt-4">
                  <span className="text-lg font-semibold text-orange-600">👉 A lot of effort. Very little clarity.</span>
                </li>
              </ul>
            </div>

            {/* Visual - Veterans juggling multiple apps */}
            <div className="mt-12 lg:mt-0">
              <SmartImage 
                src="/api/og/contrast"
                alt="Veterans juggling multiple job search platforms"
                fallbackLabel="Today's Reality"
                className="rounded-2xl border shadow-sm w-full h-full object-cover min-h-[220px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4) THE BREAKTHROUGH Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                A Referral Dashboard built for veterans.
              </h2>
              
              <ul className="space-y-2 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-base md:text-lg text-gray-700"><strong>AI turns your details into a powerful, shareable pitch.</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Share2 className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-base md:text-lg text-gray-700">Supporters share in one click.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BarChart3 className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-base md:text-lg text-gray-700">Every share, click, and recruiter call shows up in your dashboard.</span>
                </li>
                <li className="flex items-start gap-3 mt-4">
                  <span className="text-lg font-semibold text-green-600">👉 Finally, you know what's working.</span>
                </li>
              </ul>
            </div>

            {/* Visual - AI pitch with share button */}
            <div className="mt-12 lg:mt-0">
              <SmartImage 
                src="/api/og/step/pitch"
                alt="AI-generated pitch with share button"
                fallbackLabel="Breakthrough: Pitch + Share"
                className="rounded-2xl border shadow-sm w-full h-full object-cover min-h-[220px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5) NO MORE CHASING Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                No more chasing.
              </h2>
              
              <div className="space-y-4 mb-8">
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  As a veteran, you don't need to keep writing referral requests, custom messages, or follow-up emails.
                  Xainik automates it all — sending, tracking, and feedback.
                </p>
                <p className="text-lg font-semibold text-blue-600">👉 Less effort. More results.</p>
              </div>
            </div>

            {/* Visual - Automated messaging */}
            <div className="mt-12 lg:mt-0">
              <SmartImage 
                src="/api/og/dashboard"
                alt="Automated messaging and tracking dashboard"
                fallbackLabel="Automated Messaging"
                className="rounded-2xl border shadow-sm w-full h-full object-cover min-h-[220px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6) ALL IN ONE PLACE Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                All your referrals. In one place.
              </h2>
              
              <ul className="space-y-2 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="w-3 h-3 text-purple-600" />
                  </div>
                  <span className="text-base md:text-lg text-gray-700">Who referred you</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Eye className="w-3 h-3 text-purple-600" />
                  </div>
                  <span className="text-base md:text-lg text-gray-700">Who opened, read, or clicked</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Heart className="w-3 h-3 text-purple-600" />
                  </div>
                  <span className="text-base md:text-lg text-gray-700">Who endorsed or called</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TrendingUp className="w-3 h-3 text-purple-600" />
                  </div>
                  <span className="text-base md:text-lg text-gray-700">Which channels delivered results</span>
                </li>
                <li className="flex items-start gap-3 mt-4">
                  <span className="text-lg font-semibold text-purple-600">👉 Like Google Analytics — but for your job search.</span>
                </li>
              </ul>
            </div>

            {/* Visual - Dashboard snapshot */}
            <div className="mt-12 lg:mt-0">
              <SmartImage 
                src="/api/og/dashboard"
                alt="Dashboard showing referral activity and metrics"
                fallbackLabel="Dashboard Snapshot"
                className="rounded-2xl border shadow-sm w-full h-full object-cover min-h-[220px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7) WHY REFERRALS MATTER Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
              80% of high-quality veteran jobs come through referrals.
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto mb-12">
            <div className="space-y-6 text-base md:text-lg text-gray-700 text-center leading-relaxed">
              <p>Veterans already have strong networks. Supporters want to help.</p>
              <p>Until now, there's been no simple way to put that to work.</p>
              <p className="text-xl font-semibold text-blue-600">👉 Xainik makes referrals organized, measurable, and actionable.</p>
            </div>
          </div>

          {/* Flow Chart Visual */}
          <div className="max-w-4xl mx-auto">
            <SmartImage 
              src="/api/og/flow/referrals"
              alt="Referral flow: Veteran → Supporters → Recruiters → Dashboard"
              fallbackLabel="Referral Flow"
              className="rounded-2xl border shadow-sm w-full h-full object-cover min-h-[220px]"
            />
          </div>
        </div>
      </section>

      {/* 8) MISSION MODE vs STANDBY Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
              Pay only when you're searching.
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto mb-12">
            <div className="space-y-6 text-base md:text-lg text-gray-700 text-center leading-relaxed">
              <p>Starter Mission: 7 days, ₹99</p>
              <p>Plan 30, 60, 90: Active search</p>
              <p>After that: Standby — your pitch saved but hidden, ready anytime.</p>
              <p className="text-xl font-semibold text-blue-600">👉 Fair. Focused. Veteran-first.</p>
            </div>
          </div>

          {/* Toggle Cards Visual */}
          <div className="max-w-4xl mx-auto">
            <SmartImage 
              src="/api/og/mode/mission-vs-standby"
              alt="Mission Mode vs Standby toggle cards"
              fallbackLabel="Mission vs Standby"
              className="rounded-2xl border shadow-sm w-full h-full object-cover min-h-[220px]"
            />
          </div>
        </div>
      </section>

      {/* 9) SUPPORTERS & RECRUITERS Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Supporters */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                👉 Help faster. With minimal effort.
              </h3>
              
              <div className="space-y-4 mb-8">
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">Endorse in one click. Share anywhere, unlimited times, with ready referral messages.</p>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">No manual work — no writing custom notes, no chasing, no updates. Messaging, tracking, and feedback are fully automated — visible to you, the veteran, and everyone in the loop.</p>
              </div>

              <div className="mb-8">
                <Link href="/support" className="btn-secondary text-lg inline-flex items-center gap-2 px-8 py-4">
                  Learn More → Supporters
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

              {/* Supporters Visual */}
              <SmartImage 
                src="/api/og/supporter/endorsement"
                alt="Supporter endorsement interface"
                fallbackLabel="Supporter Actions"
                className="rounded-2xl border shadow-sm w-full h-full object-cover min-h-[220px]"
              />
            </div>

            {/* Recruiters */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                👉 Skip the noise. Hire faster — faster than LinkedIn or Naukri.
              </h3>
              
              <div className="space-y-4 mb-8">
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">Only verified veterans in active search. The most current profiles, available immediately.</p>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">Instant connect by call, email, or resume request — no stale profiles, no wasted time.</p>
              </div>

              <div className="mb-8">
                <Link href="/support" className="btn-secondary text-lg inline-flex items-center gap-2 px-8 py-4">
                  Learn More → Recruiters
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

              {/* Recruiters Visual */}
              <SmartImage 
                src="/api/og/recruiter/action"
                alt="Recruiter action panel"
                fallbackLabel="Recruiter Panel"
                className="rounded-2xl border shadow-sm w-full h-full object-cover min-h-[220px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 10) LIVE PROOF Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
              See the community in action.
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto mb-12">
            <div className="space-y-4 text-base md:text-lg text-gray-700 text-center">
              <p>"Meera endorsed Capt. Arjun Singh"</p>
              <p>"Col. Sharma's pitch opened 23 times today"</p>
              <p>"Recruiter called Anita Rao"</p>
              <p>"₹10,500 donated today to support veteran hiring"</p>
            </div>
          </div>

          {/* Live Activity Ticker */}
          <div className="max-w-4xl mx-auto mb-12">
            <FOMOTicker />
          </div>

          {/* Donations mini-card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Donations Today</h3>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">₹10,500</div>
                  <div className="text-sm text-gray-600">Today</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">₹8,200</div>
                  <div className="text-sm text-gray-600">Highest Today</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">₹45,300</div>
                  <div className="text-sm text-gray-600">This Week</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">Live Updates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11) CLOSING CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
            Stop chasing. Start getting results.
          </h2>
          
          <p className="text-base md:text-lg text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
            Job boards vanish into black holes. High-quality referrals open doors.
            Xainik makes them visible.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/waitlist" className="btn-primary text-lg inline-flex items-center gap-2 px-10 py-4">
              Join the Waitlist
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
