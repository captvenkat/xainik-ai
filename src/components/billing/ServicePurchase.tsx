'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { 
  Crown, Star, Zap, Users, TrendingUp, 
  CheckCircle, ArrowRight, CreditCard, AlertCircle
} from 'lucide-react'

interface ServicePlan {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  popular?: boolean
  recommended?: boolean
}

const servicePlans: ServicePlan[] = [
  {
    id: 'veteran-access',
    name: 'Privileged Access',
    description: 'First 50 veterans get exclusive access',
    price: 0,
    popular: true,
    recommended: true,
    features: [
      'Publish unlimited active pitches',
      'Send unlimited supporter invitations',
      'Connect with unlimited supporters',
      'Receive endorsements',
      'View complete analytics dashboard',
      'Generate referral links',
      'Track supporter connections',
      'Priority placement in search results',
      'Resume request tracking',
      'Download performance reports',
      'Email support within 12 hours',
      'Access to all platform features'
    ]
  }
]

export default function ServicePurchase({ userId }: { userId: string }) {
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async (plan: ServicePlan) => {
    try {
      setLoading(true)
      setError(null)

      // Handle veteran access
      if (plan.id === 'veteran-access') {
        // Redirect to auth page
        window.location.href = '/auth'
        return
      }

      // This should not be reached for now, but keeping for future
      setError('Invalid plan selection. Please try again.')
    } catch (error) {
      console.error('Veteran access error:', error)
      setError('Failed to join platform. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Join the Platform
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          First 50 veterans get privileged access to the complete platform. Join now and be among the founding members.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {servicePlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-lg ${
              plan.popular 
                ? 'border-blue-500 shadow-lg scale-105' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            {plan.recommended && (
              <div className="absolute -top-2 -right-2">
                <div className="bg-yellow-400 text-white p-2 rounded-full">
                  <Star className="h-4 w-4" />
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              
                          <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">FREE</span>
              <div className="text-sm text-gray-600 mt-1">Privileged Access</div>
            </div>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePurchase(plan)}
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Join Platform
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Features Comparison */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Why Upgrade from Free?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Publish Your Pitch</h4>
            <p className="text-gray-600">
              Free users can create pitches but can't publish them. Upgrade to make your pitch live and visible to recruiters.
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Invite Supporters</h4>
            <p className="text-gray-600">
              Connect with supporters who can help amplify your pitch and increase your visibility to potential employers.
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Full Analytics</h4>
            <p className="text-gray-600">
              Track your pitch performance, supporter engagement, and recruiter interest with detailed analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
