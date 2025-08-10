'use client'

import { useState, useEffect } from 'react'
import { getServerSupabase } from '@/lib/supabaseClient'
import { TrendingUp, Users, Heart, Award } from 'lucide-react'

interface DonationStats {
  total_donations: number
  total_amount: number
  today_count: number
  today_amount: number
  highest_donation: number
  last_donation_at: string
}

export default function DonationSnapshot() {
  const [stats, setStats] = useState<DonationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = getServerSupabase()
        const { data, error } = await supabase
          .from('donations_aggregates')
          .select('*')
          .single()

        if (error) {
          console.error('Error fetching donation stats:', error)
          return
        }

        setStats(data)
      } catch (error) {
        console.error('Error fetching donation stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()

    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 text-sm">Unable to load donation stats</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    })
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Donations */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium text-gray-600">Total Donations</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {stats.total_donations || 0}
        </div>
      </div>

      {/* Total Amount */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-gray-600">Total Raised</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {formatCurrency(stats.total_amount || 0)}
        </div>
      </div>

      {/* Today's Donations */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-600">Today</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {stats.today_count || 0}
        </div>
        <div className="text-sm text-gray-500">
          {formatCurrency(stats.today_amount || 0)}
        </div>
      </div>

      {/* Highest Donation */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium text-gray-600">Highest</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {formatCurrency(stats.highest_donation || 0)}
        </div>
        <div className="text-sm text-gray-500">
          {formatDate(stats.last_donation_at)}
        </div>
      </div>
    </div>
  )
}
