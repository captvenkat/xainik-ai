'use client'

import { useEffect, useState } from 'react'

interface Metrics {
  total_raised: number
  highest_single: number
  today_raised: number
  total_count: number
  recent_donations: Array<{
    amount: number
    display_name: string
    is_anonymous: boolean
    created_at: string
  }>
}

export default function ImpactTracker() {
  const [metrics, setMetrics] = useState<Metrics>({
    total_raised: 0,
    highest_single: 0,
    today_raised: 0,
    total_count: 0,
    recent_donations: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const phase1Goal = 1000000 // ₹10L
  const progress = Math.min((metrics.total_raised / phase1Goal) * 100, 100)
  const isUnlocked = progress >= 50

  if (loading) {
    return (
      <section className="app-section bg-premium-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-military-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Loading impact data...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="app-section bg-premium-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="premium-heading text-3xl md:text-5xl mb-6 text-premium-light">
            Phase 1 Mission: <span className="military-heading">₹10,00,000</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Building the foundation for a <span className="text-military-gold font-semibold">₹50,00,000</span> one-year mission 
            to make veteran transitions truly frictionless.
          </p>
        </div>

        {/* Progress Section */}
        <div className="military-card mb-12">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-premium-light">
              {formatCurrency(metrics.total_raised)} raised
            </span>
            <span className="text-lg font-semibold text-military-gold">
              {progress.toFixed(1)}% reached
            </span>
          </div>
          
          <div className="premium-progress mb-6">
            <div 
              className="premium-progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Milestone Indicators */}
          <div className="flex justify-between items-center text-sm text-gray-400">
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mb-2 ${progress >= 0 ? 'bg-military-green' : 'bg-premium-gray'}`}></div>
              <span>₹0</span>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mb-2 ${progress >= 25 ? 'bg-military-green' : 'bg-premium-gray'}`}></div>
              <span>₹2.5L</span>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mb-2 ${progress >= 50 ? 'bg-military-green' : 'bg-premium-gray'}`}></div>
              <span>₹5L</span>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mb-2 ${progress >= 75 ? 'bg-military-green' : 'bg-premium-gray'}`}></div>
              <span>₹7.5L</span>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mb-2 ${progress >= 100 ? 'bg-military-green' : 'bg-premium-gray'}`}></div>
              <span>₹10L</span>
            </div>
          </div>
        </div>

        {/* Unlock Status */}
        {isUnlocked && (
          <div className="premium-card mb-12 text-center border border-military-green/30">
            <div className="text-military-green text-4xl mb-4">🔓</div>
            <h3 className="text-2xl font-bold text-military-green mb-3">Build Phase Unlocked!</h3>
            <p className="text-military-green/80 text-lg">
              We've crossed the 50% threshold. Together, we're building the future our veterans deserve.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="premium-stat">
            <div className="premium-stat-value">{formatCurrency(metrics.total_raised)}</div>
            <div className="premium-stat-label">Total Raised</div>
          </div>
          
          <div className="premium-stat">
            <div className="premium-stat-value">{formatCurrency(metrics.today_raised)}</div>
            <div className="premium-stat-label">Today's Support</div>
          </div>
          
          <div className="premium-stat">
            <div className="premium-stat-value">{formatCurrency(metrics.highest_single)}</div>
            <div className="premium-stat-label">Highest Donation</div>
          </div>
        </div>

        {/* Recent Supporters */}
        {metrics.recent_donations.length > 0 && (
          <div className="premium-card">
            <h3 className="text-2xl font-bold text-premium-light mb-6 text-center">
              Recent Supporters
            </h3>
            <div className="space-y-4">
              {metrics.recent_donations.slice(0, 5).map((donation, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-premium-gray/30 rounded-xl border border-military-gold/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-military-gold/20 rounded-full flex items-center justify-center">
                      <span className="text-military-gold text-sm">⭐</span>
                    </div>
                    <span className="text-premium-light font-medium">
                      {donation.is_anonymous ? 'Anonymous Hero' : donation.display_name}
                    </span>
                  </div>
                  <span className="text-military-gold font-semibold">
                    {formatCurrency(donation.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mission Statement */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Every rupee brings us closer to building the <span className="text-military-gold font-semibold">AI-powered platform</span> 
            that will transform how veterans transition to civilian careers.
          </p>
        </div>
      </div>
    </section>
  )
}
