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
import LiveCommunityEvents from '@/components/LiveCommunityEvents'
import HeroDashboardIllustration from '@/components/HeroDashboardIllustration'
import SupportersIllustration from '@/components/SupportersIllustration'
import RecruitersIllustration from '@/components/RecruitersIllustration'
import DonationsIllustration from '@/components/DonationsIllustration'
import ClosingCTAIllustration from '@/components/ClosingCTAIllustration'
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
                Personalised Job-Referral Dashboard for Military Veterans
              </h1>

              <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-8 leading-relaxed">
                Automatically sends customised referral messages — and tracks who referred you, how often it's shared, where it's opened, and when it turns into calls.
              </h2>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/waitlist" 
                  className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold"
                >
                  Join the Waitlist
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="text-sm text-gray-600 mt-2 lg:mt-0 lg:ml-4 lg:self-center">
                  First 50 get 30 days of full access free
                </p>
              </div>
            </div>

            {/* Right Content - Visual */}
            <div className="flex justify-center lg:justify-end">
              <HeroDashboardIllustration />
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
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                Supporters
              </h3>
              <h4 className="text-xl md:text-2xl font-semibold text-gray-700 mb-8 leading-tight">
                👉 Help faster. With minimal effort.
              </h4>
              
              <div className="space-y-4 mb-8">
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  Automated referral system with custom messages, tracking, and feedback — visible to you, the veteran, and everyone in the loop.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/supporter" 
                  className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-base font-semibold"
                >
                  Become a Supporter
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Supporters Visual */}
              <div className="mt-8">
                <SupportersIllustration />
              </div>
            </div>

            {/* Recruiters */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                Recruiters
              </h3>
              <h4 className="text-xl md:text-2xl font-semibold text-gray-700 mb-8 leading-tight">
                👉 Skip the noise. Get qualified candidates.
              </h4>
              
              <div className="space-y-4 mb-8">
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  Every profile is current and active — no profile is more than 90 days old. Instantly reachable by call or email, or request a resume in one click.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/recruiter" 
                  className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-base font-semibold"
                >
                  Start Hiring
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Recruiters Visual */}
              <div className="mt-8">
                <RecruitersIllustration />
              </div>
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
            <LiveCommunityEvents />
          </div>

          {/* Donations mini-card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">We are a Section 8 non-profit.</h3>
              <p className="text-base text-gray-700 mb-6 text-center">
                Supported by generous donations that power referrals for those who served.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/donations" 
                  className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-base font-semibold"
                >
                  Support with ₹499
                </Link>
                <Link 
                  href="/donations" 
                  className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-base font-semibold"
                >
                  Support with ₹999
                </Link>
                <Link 
                  href="/donations" 
                  className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-base font-semibold"
                >
                  Support with ₹1999
                </Link>
              </div>

              {/* Donations Visual */}
              <div className="mt-8">
                <DonationsIllustration />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11) CLOSING CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
            Get hired faster.
          </h2>
          
          <p className="text-base md:text-lg text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
            The referral advantage, built for you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/waitlist" className="btn-primary text-lg inline-flex items-center gap-2 px-10 py-4">
              Join the Waitlist
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Closing CTA Visual */}
          <div className="mt-8 max-w-2xl mx-auto">
            <ClosingCTAIllustration />
          </div>
        </div>
      </section>
    </div>
  )
}
