'use client'

import { useState, useEffect } from 'react'
import { generateMockDonations, DonationStats } from '@/lib/mockData'

interface HeroDonationsWidgetProps {
  className?: string
}

export default function HeroDonationsWidget({ className = '' }: HeroDonationsWidgetProps) {
  const [stats, setStats] = useState<DonationStats>({
    todayTotal: 0,
    todayHighest: 0,
    weekTotal: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load initial mock data
    const mockStats = generateMockDonations()
    setStats(mockStats)
    setIsLoading(false)

    // Simulate live updates every 30 seconds
    const interval = setInterval(() => {
      const newStats = generateMockDonations()
      setStats(newStats)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 ${className}`}
      aria-label="Live donation totals"
    >
      <h3 className="text-base font-semibold text-gray-900 mb-4 text-center">
        Donations Today
      </h3>
      
      <div className="space-y-4 text-center">
        <div className="text-2xl font-bold text-green-600">
          {formatCurrency(stats.todayTotal)}
        </div>
        
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Highest Today:</span>
            <span className="font-semibold">{formatCurrency(stats.todayHighest)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">This Week:</span>
            <span className="font-semibold">{formatCurrency(stats.weekTotal)}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 italic">
          Updates live
        </div>
      </div>

      {/* Live indicator */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-green-600 font-medium">Live</span>
      </div>
    </div>
  )
}
