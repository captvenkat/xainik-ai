import { Suspense } from 'react'
import { PLANS, canUseTrial } from '@/lib/pricing'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { Shield, Check, Star, Zap } from 'lucide-react'
import PricingCard from '@/components/PricingCard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing | Xainik',
  description: 'Simple, transparent pricing for veteran hiring platform. Choose from trial, monthly, and extended plans. All plans include full visibility and direct recruiter contact.',
  openGraph: {
    title: 'Pricing | Xainik',
    description: 'Simple, transparent pricing for veteran hiring platform. Choose from trial, monthly, and extended plans.',
    url: '/pricing',
  },
  alternates: {
    canonical: '/pricing',
  },
}

export default async function PricingPage() {
  const supabase = createSupabaseServerOnly()
  
  // Check if user is logged in
  let userId: string | null = null
  
  try {
    const supabaseClient = await supabase
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (user) {
      userId = user.id
    }
  } catch (error) {
    // User not logged in
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that works best for your career transition. 
            All plans include full visibility and direct recruiter contact.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Suspense fallback={<PricingCardSkeleton />}>
            {Object.values(PLANS).map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                canUseTrial={true}
                userId={userId}
                isPopular={plan.id === 'plan_60'}
              />
            ))}
          </Suspense>
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What's Included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Full Visibility</h3>
              <p className="text-gray-600 text-sm">Your pitch appears in search results and browse pages</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Direct Contact</h3>
              <p className="text-gray-600 text-sm">Recruiters can call and email you directly</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Resume Requests</h3>
              <p className="text-gray-600 text-sm">Recruiters can request your resume with your approval</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">Track views, likes, and engagement with your pitch</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I upgrade my plan?</h3>
              <p className="text-gray-600 text-sm">Yes, you can upgrade to a longer plan at any time. The remaining time from your current plan will be added to the new plan.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What happens when my plan expires?</h3>
              <p className="text-gray-600 text-sm">Your pitch becomes inactive and won't appear in search results. You can renew anytime to reactivate it.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is the trial really ₹1?</h3>
              <p className="text-gray-600 text-sm">Yes! The 14-day trial costs just ₹1 and includes all features. You can only use it once per account.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 text-sm">Plans are one-time payments with no recurring charges. Your pitch remains active until the expiry date.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PricingCardSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3 mb-6">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      ))}
    </>
  )
}
