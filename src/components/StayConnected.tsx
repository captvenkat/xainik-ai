'use client'

import { useState } from 'react'

export default function StayConnected() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setEmail('')
      } else {
        const data = await response.json()
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-green-800 mb-4">
            You're Connected!
          </h2>
          <p className="text-lg text-green-700 mb-6">
            You'll be the first to know about milestones, updates, and how to take part in our mission.
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Subscribe Another Email
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-2xl mx-auto text-center">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Veterans & Supporters — Stay Connected
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Be the first to know milestones, updates, and how to take part.
        </p>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Subscribing...' : 'Get Updates'}
            </button>
          </div>
          
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
        </form>

        {/* Microcopy */}
        <p className="text-sm text-gray-500 mt-6">
          No spam. Only mission updates.
        </p>
      </div>
    </section>
  )
}
