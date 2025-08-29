'use client'

import { useState, useEffect } from 'react'

interface Stats {
  total_raised: number
  highest_single: number
  today_raised: number
  total_count: number
}

export default function ImpactTracker() {
  const [stats, setStats] = useState<Stats>({
    total_raised: 642000,
    highest_single: 25000,
    today_raised: 2000,
    total_count: 156
  })

  const phase1Goal = 1000000 // ₹10,00,000
  const progress = (stats.total_raised / phase1Goal) * 100
  const isUnlocked = stats.total_raised >= 500000 // 50% threshold

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/metrics')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Phase 1 Goal: ₹10,00,000 (Build & Launch Fund)
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Part of a ₹50,00,000 one-year mission to make transition truly frictionless for lakhs of veterans.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {formatCurrency(stats.total_raised)} raised
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progress)}% reached
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-xl text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {formatCurrency(stats.total_raised)}
            </div>
            <div className="text-sm text-gray-600">Raised so far</div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-xl text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {formatCurrency(stats.today_raised)}
            </div>
            <div className="text-sm text-gray-600">Donated today</div>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-xl text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {formatCurrency(stats.highest_single)}
            </div>
            <div className="text-sm text-gray-600">Highest single donation</div>
          </div>
        </div>

        {/* Unlock Status */}
        {isUnlocked && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-8">
            <div className="text-green-600 text-2xl mb-2">🔓</div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Build Phase Unlocked!
            </h3>
            <p className="text-green-700">
              We start building once we cross 50% of Phase 1 — ₹5,00,000. Together, we've already unlocked it.
            </p>
          </div>
        )}

        {/* Milestone Indicators */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="text-center">
            <div className="w-3 h-3 bg-gray-300 rounded-full mb-1"></div>
            <span>₹0</span>
          </div>
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mb-1 ${stats.total_raised >= 250000 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>₹2.5L</span>
          </div>
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mb-1 ${stats.total_raised >= 500000 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>₹5L</span>
          </div>
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mb-1 ${stats.total_raised >= 750000 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>₹7.5L</span>
          </div>
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mb-1 ${stats.total_raised >= 1000000 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>₹10L</span>
          </div>
        </div>
      </div>
    </section>
  )
}
