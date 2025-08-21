'use client'

import { useState } from 'react'
import { createDonationAction } from '@/lib/actions/donations-server'
import { Heart, Loader2 } from 'lucide-react'

const SUGGESTED_AMOUNTS = [100, 250, 500, 1000, 2500]

export default function SimpleDonationForm() {
  const [formData, setFormData] = useState({
    amount: '',
    donor_name: '',
    email: '',
    message: '',
    anonymous: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAmountSelect = (amount: number) => {
    setFormData(prev => ({ ...prev, amount: amount.toString() }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const amount = parseInt(formData.amount)
      if (!amount || amount < 10) {
        setError('Please enter a valid amount (minimum ₹10)')
        setIsLoading(false)
        return
      }

      console.log('Creating donation with data:', {
        amount,
        donor_name: formData.donor_name,
        email: formData.email,
        message: formData.message,
        anonymous: formData.anonymous
      })

      // Create donation and Razorpay order in one server action
      const result = await createDonationAction({
        amount,
        donor_name: formData.donor_name,
        email: formData.email,
        message: formData.message,
        isAnonymous: formData.anonymous
      })

      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.orderId) {
        throw new Error('Failed to create payment order')
      }

      console.log('✅ Donation and order created successfully:', result)

      // Load Razorpay script and open payment gateway
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        if (!razorpayKey) {
          alert('Payment gateway not configured. Please contact support.')
          return
        }
        
        const options = {
          key: razorpayKey,
          amount: amount * 100, // Convert to paise
          currency: 'INR',
          name: 'Xainik',
          description: 'Supporting Veterans',
          order_id: result.orderId,
          handler: function (response: any) {
            console.log('Payment successful:', response)
            // Handle successful payment
            window.location.href = '/donations?success=true'
          },
          prefill: {
            name: formData.donor_name,
            email: formData.email
          },
          theme: {
            color: '#10B981'
          }
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }

    } catch (error) {
      console.error('Donation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to create donation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Support Our Mission</h2>
        <p className="text-gray-600 mt-2">Your donation helps veterans succeed</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Donation Amount (₹)
          </label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {SUGGESTED_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handleAmountSelect(amount)}
                className={`px-3 py-2 text-sm font-medium rounded-md border ${
                  formData.amount === amount.toString()
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                ₹{amount}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="Enter custom amount"
            min="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {/* Donor Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={formData.donor_name}
            onChange={(e) => setFormData(prev => ({ ...prev, donor_name: e.target.value }))}
            placeholder="Enter your name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message (Optional)
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Share a message of support..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="anonymous"
            checked={formData.anonymous}
            onChange={(e) => setFormData(prev => ({ ...prev, anonymous: e.target.checked }))}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
            Make this donation anonymous
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Heart className="w-5 h-5 mr-2" />
              Donate Now
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Your donation is secure and will be processed by Razorpay</p>
      </div>
    </div>
  )
}
