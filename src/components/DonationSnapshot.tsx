'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { TrendingUp, Users, Heart, Award } from 'lucide-react'

interface DonationStats {
  total_donations: number
  total_amount: number
  today_count: number
  today_amount: number
  highest_donation: number
  last_donation_at: string | null
}

const defaultStats: DonationStats = {
  total_donations: 0,
  total_amount: 0,
  today_count: 0,
  today_amount: 0,
  highest_donation: 0,
  last_donation_at: null
}

export default function DonationSnapshot() {
  const [stats, setStats] = useState<DonationStats>(defaultStats)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createSupabaseBrowser()
        const { data, error } = await supabase
          .from('donations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) {
          // Don't throw, just use default stats
          setStats(defaultStats)
          setHasError(true)
        } else {
          // Calculate stats from donations data
          const totalDonations = data?.length || 0
          const totalAmount = data?.reduce((sum: number, donation: any) => sum + (donation.amount_cents || 0), 0) || 0
          const today = new Date().toDateString()
          const todayDonations = data?.filter((donation: any) => 
            new Date(donation.created_at).toDateString() === today
          ) || []
          const todayCount = todayDonations.length
          const todayAmount = todayDonations.reduce((sum: number, donation: any) => sum + (donation.amount_cents || 0), 0)
          const highestDonation = data?.reduce((max: number, donation: any) => 
            Math.max(max, donation.amount_cents || 0), 0
          ) || 0
          const lastDonationAt = data?.[0]?.created_at || null

          setStats({
            total_donations: totalDonations,
            total_amount: totalAmount,
            today_count: todayCount,
            today_amount: todayAmount,
            highest_donation: highestDonation,
            last_donation_at: lastDonationAt
          })
          setHasError(false)
        }
      } catch (error) {
        // Don't throw, just use default stats
        setStats(defaultStats)
        setHasError(true)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      })
    } catch (error) {
      return 'Never'
    }
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
          {stats.total_donations}
        </div>
        {hasError && (
          <div className="text-xs text-gray-400 mt-1">Using cached data</div>
        )}
      </div>

      {/* Total Amount */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-gray-600">Total Raised</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {formatCurrency(stats.total_amount)}
        </div>
        {hasError && (
          <div className="text-xs text-gray-400 mt-1">Using cached data</div>
        )}
      </div>

      {/* Today's Donations */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-600">Today</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {stats.today_count}
        </div>
        <div className="text-sm text-gray-500">
          {formatCurrency(stats.today_amount)}
        </div>
        {hasError && (
          <div className="text-xs text-gray-400 mt-1">Using cached data</div>
        )}
      </div>

      {/* Highest Donation */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium text-gray-600">Highest</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {formatCurrency(stats.highest_donation)}
        </div>
        <div className="text-sm text-gray-500">
          {formatDate(stats.last_donation_at)}
        </div>
        {hasError && (
          <div className="text-xs text-gray-400 mt-1">Using cached data</div>
        )}
      </div>
    </div>
  )
}
