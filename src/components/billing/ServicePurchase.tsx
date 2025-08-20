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
    id: 'free',
    name: 'Free',
    description: 'Experience the platform with limited features',
    price: 0,
    features: [
      'Access to dashboard',
      'Create pitches (not published)',
      'Basic platform experience',
      'View pitch analytics (limited)',
      'No supporter invitations',
      'No pitch publishing'
    ]
  },
  {
    id: 'trial',
    name: '7-Day Trial',
    description: 'Full access for 7 days to test all features',
    price: 49,
    popular: true,
    recommended: true,
    features: [
      'Create and publish pitches',
      'Invite unlimited supporters',
      'Full dashboard access',
      'Complete pitch analytics',
      'Supporter connections',
      'Email support',
      'Pitch sharing and referrals',
      'Endorsement system access'
    ]
  },
  {
    id: '30days',
    name: '30 Days',
    description: 'One month of full platform access',
    price: 399,
    features: [
      'All trial features',
      'Priority pitch placement',
      'Advanced analytics dashboard',
      'Resume request tracking',
      'Performance insights',
      'Priority email support',
      'Enhanced supporter management'
    ]
  },
  {
    id: '60days',
    name: '60 Days',
    description: 'Two months of premium access',
    price: 699,
    features: [
      'All 30-day features',
      'Enhanced analytics with trends',
      'Success tracking metrics',
      'Advanced supporter management',
      'Referral link analytics',
      'Priority placement in searches',
      'Dedicated support channel'
    ]
  },
  {
    id: '90days',
    name: '90 Days',
    description: 'Three months of complete access',
    price: 999,
    features: [
      'All 60-day features',
      'Top priority placement',
      'Advanced performance insights',
      'Complete analytics suite',
      'Maximum supporter connections',
      'Premium support access',
      'Extended pitch visibility'
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

      const supabase = createSupabaseBrowser()

      // Handle free plan
      if (plan.id === 'free') {
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            metadata: { 
              current_plan: 'free',
              plan_activated_at: new Date().toISOString(),
              plan_expires_at: null
            }
          })
          .eq('id', userId)

        if (updateError) {
          console.error('Failed to activate free plan:', updateError)
          setError('Failed to activate free plan. Please try again.')
          return
        }

        alert('Free plan activated! You can now experience the platform with limited features.')
        window.location.reload()
        return
      }

      // Create Razorpay order for paid plans
      const response = await fetch('/api/donations/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.price,
          currency: 'INR',
          receipt: `service_${plan.id}_${Date.now()}`,
          notes: {
            type: 'service',
            user_id: userId,
            plan_id: plan.id,
            plan_name: plan.name,
            buyer_name: 'Veteran User', // Will be fetched from user profile
            buyer_email: 'veteran@example.com', // Will be fetched from user profile
            plan_tier: plan.id,
            plan_meta: {
              features: plan.features,
              description: plan.description,
              duration_days: plan.id === 'trial' ? 7 : 
                            plan.id === '30days' ? 30 :
                            plan.id === '60days' ? 60 : 90
            }
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create payment order')
      }

      const { orderId } = await response.json()

      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: plan.price * 100, // Razorpay expects amount in paise
          currency: 'INR',
          name: 'Xainik',
          description: `${plan.name} Plan - ${plan.description}`,
          order_id: orderId,
          handler: async function (response: any) {
            try {
              // Verify payment
              const verifyResponse = await fetch('/api/donations/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              })

              if (verifyResponse.ok) {
                // Calculate plan expiry date
                const now = new Date()
                const durationDays = plan.id === 'trial' ? 7 : 
                                   plan.id === '30days' ? 30 :
                                   plan.id === '60days' ? 60 : 90
                const expiresAt = new Date(now.getTime() + (durationDays * 24 * 60 * 60 * 1000))

                // Update user's plan
                const { error: updateError } = await supabase
                  .from('users')
                  .update({ 
                    metadata: { 
                      current_plan: plan.id,
                      plan_activated_at: now.toISOString(),
                      plan_expires_at: expiresAt.toISOString(),
                      plan_duration_days: durationDays
                    }
                  })
                  .eq('id', userId)

                if (updateError) {
                  console.error('Failed to update user plan:', updateError)
                }

                alert(`Thank you for purchasing the ${plan.name} plan! Your features are now active for ${durationDays} days.`)
                window.location.reload()
              } else {
                throw new Error('Payment verification failed')
              }
            } catch (error) {
              console.error('Payment verification error:', error)
              alert('Payment verification failed. Please contact support.')
            }
          },
          prefill: {
            name: 'Veteran User', // Will be fetched from user profile
            email: 'veteran@example.com' // Will be fetched from user profile
          },
          theme: {
            color: '#667eea'
          }
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }

    } catch (error) {
      console.error('Purchase error:', error)
      setError('Failed to initiate purchase. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Start free, try for ₹49, then unlock premium features to accelerate your career transition.
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
              {plan.price === 0 ? (
                <span className="text-4xl font-bold text-gray-900">Free</span>
              ) : (
                <>
                  <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                  <span className="text-gray-600">
                    {plan.id === 'trial' ? '/7 days' : 
                     plan.id === '30days' ? '/month' :
                     plan.id === '60days' ? '/2 months' : '/3 months'}
                  </span>
                </>
              )}
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
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                plan.id === 'free'
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Processing...
                </>
              ) : (
                <>
                  {plan.id === 'free' ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Activate Free
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Get {plan.name}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
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
