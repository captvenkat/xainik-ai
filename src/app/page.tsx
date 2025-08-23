'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowRight
} from 'lucide-react'
import FOMOTicker from '@/components/FOMOTicker'
import HeroDashboardIllustration from '@/components/HeroDashboardIllustration'
import SupportersIllustration from '@/components/SupportersIllustration'
import RecruitersIllustration from '@/components/RecruitersIllustration'
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

      {/* 2) SUPPORTERS & RECRUITERS Section */}
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

      {/* 3) CLOSING CTA Section */}
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
