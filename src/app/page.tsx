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
  FileText
} from 'lucide-react'
import FOMOTicker from '@/components/FOMOTicker'
import HeroDonationsWidget from '@/components/HeroDonationsWidget'
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
      {/* FOMO Ticker - Slim band below nav */}
      <section className="py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FOMOTicker />
        </div>
      </section>

      {/* Hero Section - Clean two-column layout */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left Content - Text stack */}
            <div className="text-center lg:text-left mb-12 lg:mb-0">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                👉 Your Referral Dashboard.
              </h1>

              <h2 className="text-lg lg:text-xl font-semibold text-gray-700 mb-8 leading-relaxed">
                Not another job board. A personalized, trackable referral dashboard <strong>for job leads</strong> — activated only when you need it most.
              </h2>

              <div className="space-y-4 text-base text-gray-600 mb-10">
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

            {/* Right Content - Visuals column */}
            <div className="space-y-6">
              <VeteranPitchCard />
              <HeroDonationsWidget />
            </div>
          </div>
        </div>
      </section>

      {/* The Pain Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                Job boards don't get veterans hired. Referrals do.
              </h2>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <XCircle className="w-3 h-3 text-red-600" />
                  </div>
                  <span className="text-base text-gray-700">Portals swallow resumes with no reply.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <XCircle className="w-3 h-3 text-red-600" />
                  </div>
                  <span className="text-base text-gray-700">Referrals get buried in chats and emails.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <XCircle className="w-3 h-3 text-red-600" />
                  </div>
                  <span className="text-base text-gray-700">Veterans are left guessing, with no visibility.</span>
                </li>
              </ul>
            </div>

            {/* Visual - Before/After contrast */}
            <div className="mt-12 lg:mt-0">
              <SmartImage 
                src="/api/og/contrast"
                alt="Before: Buried in chats vs After: One dashboard"
                fallbackLabel="Before vs After: Referral Management"
                aspectRatio="4:3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Everyday Struggle Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                What veterans do today to stay visible.
              </h2>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Smartphone className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-base text-gray-700">Pay for Naukri subscriptions that don't deliver.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Monitor className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-base text-gray-700">Post endlessly on LinkedIn, hoping someone notices.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-base text-gray-700">Send referral requests on WhatsApp and email, again and again.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-base text-gray-700">Keep tweaking resumes and writing custom notes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-base text-gray-700">Follow up awkwardly, never knowing what happened.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserPlus className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-base text-gray-700">Unsure who can actually connect you to the right role.</span>
                </li>
              </ul>
            </div>

            {/* Visual - Veterans juggling multiple apps */}
            <div className="mt-12 lg:mt-0">
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Multiple Platforms</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="w-8 h-8 bg-blue-100 rounded mx-auto mb-2"></div>
                    <p className="text-xs text-gray-600">Naukri</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="w-8 h-8 bg-blue-100 rounded mx-auto mb-2"></div>
                    <p className="text-xs text-gray-600">LinkedIn</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="w-8 h-8 bg-green-100 rounded mx-auto mb-2"></div>
                    <p className="text-xs text-gray-600">WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Breakthrough Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                A Referral Dashboard built for veterans.
              </h2>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-base text-gray-700">AI turns your details into a powerful, shareable pitch.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Share2 className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-base text-gray-700">Supporters share in one click.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BarChart3 className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-base text-gray-700">Every share, click, and recruiter call shows up in your dashboard.</span>
                </li>
              </ul>
            </div>

            {/* Visual - AI pitch with share button */}
            <div className="mt-12 lg:mt-0">
              <SmartImage 
                src="/api/og/step/pitch"
                alt="AI-generated pitch with share button"
                fallbackLabel="AI Pitch Generator"
                aspectRatio="4:3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* No More Chasing Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                No more chasing.
              </h2>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-base text-gray-700">Your pitch is automatically shared to supporters' networks.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-base text-gray-700">Every interaction is tracked and visible.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-base text-gray-700">Recruiters can reach you directly through the platform.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-base text-gray-700">No more wondering who saw what, when.</span>
                </li>
              </ul>
            </div>

            {/* Visual - Dashboard overview */}
            <div className="mt-12 lg:mt-0">
              <SmartImage 
                src="/api/og/dashboard"
                alt="Dashboard showing referral activity and metrics"
                fallbackLabel="Referral Dashboard"
                aspectRatio="4:3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* All in One Place Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                All your referral activity in one place.
              </h2>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Eye className="w-3 h-3 text-purple-600" />
                  </div>
                  <span className="text-base text-gray-700">Who opened, read, and clicked your pitch</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Heart className="w-3 h-3 text-purple-600" />
                  </div>
                  <span className="text-base text-gray-700">Who endorsed or called</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TrendingUp className="w-3 h-3 text-purple-600" />
                  </div>
                  <span className="text-base text-gray-700">Which channels delivered results</span>
                </li>
              </ul>
            </div>

            {/* Visual - Dashboard snapshot */}
            <div className="mt-12 lg:mt-0">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
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

      {/* Why Referrals Matter Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <SmartImage 
              src="/api/og/flow/referrals"
              alt="Referral flow: Veteran → Supporters → Recruiters → Dashboard"
              fallbackLabel="Referral Flow Diagram"
              aspectRatio="16:9"
            />
          </div>
        </div>
      </section>

      {/* Mission Mode vs Standby Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <SmartImage 
              src="/api/og/mode/mission-vs-standby"
              alt="Mission Mode vs Standby toggle cards"
              fallbackLabel="Pricing Toggle Cards"
              aspectRatio="16:9"
            />
          </div>
        </div>
      </section>

      {/* Supporters & Recruiters Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              Supporters & Recruiters
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Two sides of the same mission: helping veterans get hired through quality referrals.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Supporters */}
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                👉 Help faster. With minimal effort.
              </h3>
              
              <div className="space-y-4 mb-8">
                <p className="text-base text-gray-700">Endorse in one click. Share anywhere, unlimited times, with ready referral messages.</p>
                <p className="text-base text-gray-700">No manual work — no writing custom notes, no chasing, no updates.</p>
                <p className="text-base text-gray-700">Messaging, tracking, and feedback are fully automated — visible to you, the veteran, and everyone in the loop.</p>
              </div>

              {/* Supporters Visual */}
              <SmartImage 
                src="/api/og/supporter/endorsement"
                alt="Supporter endorsement interface"
                fallbackLabel="Supporter Endorsement"
                aspectRatio="4:3"
              />
            </div>

            {/* Recruiters */}
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                👉 Skip the noise. Hire faster — faster than LinkedIn or Naukri.
              </h3>
              
              <div className="space-y-4 mb-8">
                <p className="text-base text-gray-700">Only verified veterans in active search. The most current profiles, available immediately.</p>
                <p className="text-base text-gray-700">Instant connect by call, email, or resume request — no stale profiles, no wasted time.</p>
              </div>

              {/* Recruiters Visual */}
              <SmartImage 
                src="/api/og/recruiter/action"
                alt="Recruiter action panel"
                fallbackLabel="Recruiter Panel"
                aspectRatio="4:3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Live Proof Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              Live Proof
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See real activity happening on the platform right now.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <FOMOTicker />
          </div>
        </div>
      </section>

      {/* Closing CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
            Ready to transform your job search?
          </h2>
          
          <p className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
            Join the first 50 veterans and get 30 days of full access. See the difference a referral dashboard makes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/waitlist" className="btn-primary text-lg inline-flex items-center gap-2 px-10 py-4">
              Join the Waitlist
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/support" className="btn-secondary text-lg inline-flex items-center gap-2 px-10 py-4">
              Learn More
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
