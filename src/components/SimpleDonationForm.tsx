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
        throw new Error('Please enter a valid amount (minimum ₹10)')
      }

      // Step 1: Create donation record in database
      const formDataForAction = new FormData()
      formDataForAction.append('amount', amount.toString())
      formDataForAction.append('donor_name', formData.donor_name)
      formDataForAction.append('email', formData.email)
      formDataForAction.append('anonymous', formData.anonymous.toString())
      
      const result = await createDonationAction(formDataForAction)
      
      if (!result.success || !result.donation) {
        throw new Error(result.error || 'Failed to create donation')
      }
      
      const donation = result.donation
      console.log('✅ Donation created:', donation.id)

      // Step 2: Create Razorpay order using simple API
      const orderResponse = await fetch('/api/donations/simple-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          donationId: donation.id,
          donor_name: formData.donor_name,
          email: formData.email
        })
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        console.error('❌ Order creation failed:', errorData)
        throw new Error('Failed to create payment order. Please try again.')
      }

      const { orderId } = await orderResponse.json()
      console.log('✅ Razorpay order created:', orderId)

      // Step 3: Load Razorpay and process payment
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
          description: 'Donation to support veterans',
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
                  razorpay_signature: response.razorpay_signature,
                  donationId: donation.id
                })
              })

              if (verifyResponse.ok) {
                alert('Thank you for your donation! Your contribution will help veterans find meaningful opportunities.')
                setFormData({
                  amount: '',
                  donor_name: '',
                  email: '',
                  message: '',
                  anonymous: false
                })
              } else {
                alert('Payment verification failed. Please contact support.')
              }
            } catch (error) {
              console.error('Payment verification error:', error)
              alert('Payment verification failed. Please contact support.')
            }
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
      setError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Amount Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Amount (₹)
        </label>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {SUGGESTED_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handleAmountSelect(amount)}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                formData.amount === amount.toString()
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              ₹{amount}
            </button>
          ))}
        </div>
        <input
          type="number"
          placeholder="Or enter custom amount (minimum ₹10)"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          min="10"
        />
      </div>

      {/* Donor Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.donor_name}
            onChange={(e) => setFormData(prev => ({ ...prev, donor_name: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message (Optional)
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Share why you're supporting veterans..."
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

      <p className="text-xs text-gray-500 text-center">
        Your donation is secure and will be processed by Razorpay
      </p>
    </form>
  )
}
