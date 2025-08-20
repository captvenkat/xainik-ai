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
    id: 'basic',
    name: 'Basic',
    description: 'Essential features for getting started',
    price: 999,
    features: [
      'Enhanced pitch visibility',
      'Basic analytics',
      'Email support',
      'Standard pitch card'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Advanced features for serious professionals',
    price: 2499,
    popular: true,
    recommended: true,
    features: [
      'Priority pitch placement',
      'Advanced analytics dashboard',
      'Priority support',
      'Premium pitch card design',
      'Direct recruiter access',
      'Performance insights'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Complete solution for maximum impact',
    price: 4999,
    features: [
      'Top priority placement',
      'Full analytics suite',
      'Dedicated support',
      'Custom pitch card design',
      'Direct recruiter matching',
      'Performance optimization',
      'Personal success coach',
      'Exclusive networking events'
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

      // Create Razorpay order
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
              description: plan.description
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
                // Update user's plan
                const { error: updateError } = await supabase
                  .from('users')
                  .update({ 
                    metadata: { 
                      current_plan: plan.id,
                      plan_purchased_at: new Date().toISOString()
                    }
                  })
                  .eq('id', userId)

                if (updateError) {
                  console.error('Failed to update user plan:', updateError)
                }

                alert(`Thank you for purchasing the ${plan.name} plan! Your features are now active.`)
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
          Unlock premium features to maximize your professional impact and accelerate your career growth.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                <span className="text-gray-600">/one-time</span>
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
                plan.popular
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
                  <CreditCard className="h-4 w-4" />
                  Get {plan.name}
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
          Why Choose Premium?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Increased Visibility</h4>
            <p className="text-gray-600">
              Get priority placement in recruiter searches and featured positions.
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Direct Access</h4>
            <p className="text-gray-600">
              Connect directly with top recruiters and hiring managers.
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Performance Insights</h4>
            <p className="text-gray-600">
              Detailed analytics to optimize your pitch and maximize opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
