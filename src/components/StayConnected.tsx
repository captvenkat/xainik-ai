'use client'

import { useState } from 'react'
import Icon from '@/components/ui/Icon'

export default function StayConnected() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name.trim() || undefined })
      })

      if (response.ok) {
        setIsSubmitted(true)
        setEmail('')
        setName('')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to subscribe')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <section className="app-section bg-gradient-to-br from-military-green/10 to-military-blue/10 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="premium-card border border-military-green/30">
            <div className="text-military-green text-6xl mb-6">✅</div>
            <h2 className="premium-heading text-3xl md:text-4xl mb-4 text-premium-white">
              Welcome to the Mission!
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              You're now part of our community building the future for Indian military veterans.
            </p>
            <div className="inline-flex items-center gap-3 bg-premium-gray/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-military-green/30">
                              <Icon name="email" size="md" className="text-military-green" />
              <span className="text-premium-white font-medium">Check your email for updates</span>
            </div>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="mt-6 text-military-green hover:text-yellow-500 transition-colors"
            >
              Subscribe another email
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="app-section bg-gradient-to-br from-military-green/10 to-military-blue/10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="premium-heading text-3xl md:text-5xl mb-6 text-premium-white">
            Veterans & Supporters — <span className="military-heading">Stay Connected</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Be the first to know about milestones, platform updates, and how to take part in this transformative mission.
          </p>
        </div>

        {/* Subscription Form */}
        <div className="premium-card max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-6 py-4 bg-premium-gray/50 backdrop-blur-sm border border-military-green/30 rounded-2xl text-premium-white placeholder-gray-400 focus:ring-2 focus:ring-military-green focus:border-transparent outline-none transition-all duration-300"
              />
              <input
                type="email"
                placeholder="Enter your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-4 bg-premium-gray/50 backdrop-blur-sm border border-military-green/30 rounded-2xl text-premium-white placeholder-gray-400 focus:ring-2 focus:ring-military-green focus:border-transparent outline-none transition-all duration-300"
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-military-green hover:bg-green-600 disabled:bg-gray-600 text-black font-semibold rounded-2xl transition-all duration-300 hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Subscribing...
                  </span>
                ) : (
                  'Get Updates'
                )}
              </button>
            </div>

            {error && (
              <div className="text-military-red text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {error}
              </div>
            )}

            <p className="text-sm text-gray-400">
              No spam. Only mission updates and veteran success stories.
            </p>
          </form>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-6 rounded-2xl bg-premium-gray/30 border border-military-green/20">
            <div className="text-3xl mb-3">🚀</div>
            <h4 className="font-semibold text-premium-white mb-2">Platform Launch</h4>
            <p className="text-gray-400 text-sm">Be first to access when we go live</p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-premium-gray/30 border border-military-green/20">
            <div className="text-3xl mb-3">📊</div>
            <h4 className="font-semibold text-premium-white mb-2">Progress Updates</h4>
            <p className="text-gray-400 text-sm">See how your support makes impact</p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-premium-gray/30 border border-military-green/20">
                          <div className="text-3xl mb-3">
                <Icon name="handshake" size="lg" className="text-military-green mx-auto" />
              </div>
            <h4 className="font-semibold text-premium-white mb-2">Get Involved</h4>
            <p className="text-gray-400 text-sm">Learn how to support veterans</p>
          </div>
        </div>

        {/* Trust Statement */}
        <div className="mt-12">
          <div className="inline-flex items-center gap-3 bg-premium-gray/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-military-green/30">
            <span className="text-military-green">🔒</span>
            <span className="text-premium-white font-medium">Your email is safe with us</span>
          </div>
        </div>
      </div>
    </section>
  )
}
