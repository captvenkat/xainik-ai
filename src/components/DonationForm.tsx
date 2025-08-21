'use client'

import { useState } from 'react'
import { createDonationAction } from '@/lib/actions/donations-server'
import { logActivity } from '@/lib/actions/analytics-server'
import { sendDonationReceipt } from '@/lib/email'
import { downloadReceipt } from '@/lib/receipts'

import { Heart, Loader2 } from 'lucide-react'

const SUGGESTED_AMOUNTS = [100, 250, 500, 1000, 2500]

export default function DonationForm() {
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

      // Create donation record
      // Create FormData for server action
      const formDataForAction = new FormData()
      formDataForAction.append('amount', amount.toString())
      formDataForAction.append('donor_name', formData.donor_name)
      formDataForAction.append('email', formData.email)
      formDataForAction.append('anonymous', formData.anonymous.toString())
      
      const result = await createDonationAction(formDataForAction)
      
      if (!result.success || !result.donation) {
        console.error('Donation creation failed:', result)
        throw new Error(result.error || 'Failed to create donation')
      }
      
      const donation = result.donation

      // Create Razorpay order
      console.log('Creating Razorpay order with data:', {
        amount,
        donationId: donation.id,
        donor_name: formData.donor_name,
        email: formData.email
      })
      
      const response = await fetch('/api/donations/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          donationId: donation.id,
          donor_name: formData.donor_name,
          email: formData.email
        })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Payment order creation failed:', errorData)
        console.error('Response status:', response.status)
        console.error('Response status text:', response.statusText)
        throw new Error(errorData.error || 'Failed to create payment order')
      }

      const { orderId } = await response.json()

      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        // Check if Razorpay key is available
        const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        console.log('Razorpay key available:', !!razorpayKey)
        
        if (!razorpayKey) {
          alert('Payment gateway not configured. Please contact support.')
          return
        }
        
        const options = {
          key: razorpayKey,
          amount: amount * 100, // Razorpay expects amount in paise
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
                // Log activity
                await logActivity({
                  user_id: 'anonymous', // Anonymous donation
                  activity_type: 'donation_received',
                  activity_data: {
                    amount: amount, // Amount in INR
                    name: formData.anonymous ? 'Anonymous' : formData.donor_name
                  }
                })

                // Generate and download receipt
                const receiptNumber = `RCP-${new Date().getFullYear()}-${response.razorpay_payment_id.slice(-8).toUpperCase()}`
                const currentDate = new Date().toLocaleDateString('en-IN')
                const financialYear = new Date().getFullYear() + '-' + (new Date().getFullYear() + 1).toString().slice(-2)
                
                downloadReceipt({
                  receiptNumber,
                  donorName: formData.anonymous ? 'Anonymous Donor' : formData.donor_name,
                  donorEmail: formData.email,
                  amount: amount,
                  transactionId: response.razorpay_payment_id,
                  donationDate: currentDate,
                  financialYear: financialYear
                })
                
                // Show success message
                alert('Thank you for your donation! Your Section 80G receipt has been downloaded. Your contribution will help veterans find meaningful opportunities.')
                
                // Reset form
                setFormData({
                  amount: '',
                  donor_name: '',
                  email: '',
                  message: '',
                  anonymous: false
                })
              } else {
                throw new Error('Payment verification failed')
              }
            } catch (error) {
              alert('Payment completed but verification failed. Please contact support.')
            }
          },
          prefill: {
            name: formData.donor_name,
            email: formData.email
          },
          theme: {
            color: '#2563eb'
          }
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Amount Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Donation Amount (₹)
        </label>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {SUGGESTED_AMOUNTS.map(amount => (
            <button
              key={amount}
              type="button"
              onClick={() => handleAmountSelect(amount)}
              className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                formData.amount === amount.toString()
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              ₹{amount}
            </button>
          ))}
        </div>
        <input
          type="number"
          placeholder="Or enter custom amount"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="10"
          required
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
            value={formData.donor_name}
            onChange={(e) => setFormData(prev => ({ ...prev, donor_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
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
          placeholder="Share why you're supporting our mission..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Anonymous Option */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="anonymous"
          checked={formData.anonymous}
          onChange={(e) => setFormData(prev => ({ ...prev, anonymous: e.target.checked }))}
          className="mr-2 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="anonymous" className="text-sm text-gray-700">
          Make this donation anonymous
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-primary text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Heart className="w-5 h-5" />
            Donate ₹{formData.amount || '0'}
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Your donation is secure and will be processed by Razorpay. 
        You'll receive a confirmation email after successful payment.
      </p>
    </form>
  )
}
