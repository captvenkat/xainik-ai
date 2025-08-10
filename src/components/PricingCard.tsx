'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plan } from '@/lib/pricing'
import { Check, Star } from 'lucide-react'

interface PricingCardProps {
  plan: Plan
  canUseTrial: boolean
  userId: string | null
  isPopular?: boolean
}

export default function PricingCard({ plan, canUseTrial, userId, isPopular }: PricingCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSelectPlan = async () => {
    if (!userId) {
      router.push('/login?redirect=/pricing')
      return
    }

    setIsLoading(true)

    try {
      // Redirect to pitch creation with plan pre-selected
      router.push(`/pitch/new?plan=${plan.id}`)
    } catch (error) {
      console.error('Failed to select plan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isDisabled = plan.id === 'trial_14' && !canUseTrial

  return (
    <div className={`relative bg-white rounded-xl shadow-lg p-6 ${
      isPopular ? 'ring-2 ring-blue-500' : ''
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Star className="w-3 h-3" />
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
          {plan.id !== 'trial_14' && (
            <span className="text-gray-600 ml-2">/ {plan.duration}</span>
          )}
        </div>
        <p className="text-gray-600 text-sm">{plan.description}</p>
      </div>

      <div className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{feature}</span>
          </div>
        ))}
      </div>

      {isDisabled ? (
        <div className="text-center">
          <button
            disabled
            className="w-full px-4 py-3 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed"
          >
            Trial Already Used
          </button>
          <p className="text-xs text-gray-500 mt-2">
            You can only use the trial once per account
          </p>
        </div>
      ) : (
        <button
          onClick={handleSelectPlan}
          disabled={isLoading}
          className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
            isPopular
              ? 'bg-gradient-primary text-white hover:opacity-90'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            'Loading...'
          ) : plan.id === 'trial_14' ? (
            'Start Trial'
          ) : (
            'Choose Plan'
          )}
        </button>
      )}

      {plan.id !== 'trial_14' && (
        <p className="text-xs text-gray-500 text-center mt-3">
          One-time payment • No recurring charges
        </p>
      )}
    </div>
  )
}
