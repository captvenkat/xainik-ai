'use client'

import { useState, useEffect } from 'react'
import { getSupporterAttributionPerformance } from '@/lib/attribution-analytics'
import { Trophy, TrendingUp, Users, Target, Award } from 'lucide-react'

interface SupporterAttributionPerformanceProps {
  pitchId?: string
  supporterId?: string
}

interface SupporterPerformance {
  supporter_id: string
  pitch_id: string
  supporter_name: string
  supporter_email: string
  pitch_title: string
  pitch_owner_name: string
  total_referrals_created: number
  total_chain_reach: number
  total_attributed_views: number
  total_attributed_calls: number
  total_attributed_emails: number
  total_attributed_shares: number
  total_attributed_conversions: number
  viral_coefficient: number
  attribution_value: number
  last_activity_at: string
  conversion_rate: number
  engagement_rate: number
}

export default function SupporterAttributionPerformance({ 
  pitchId, 
  supporterId 
}: SupporterAttributionPerformanceProps) {
  const [performance, setPerformance] = useState<SupporterPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'attribution_value' | 'conversion_rate' | 'total_chain_reach'>('attribution_value')

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const data = await getSupporterAttributionPerformance(pitchId, supporterId)
        setPerformance(data)
      } catch (error) {
        console.error('Error fetching supporter performance:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPerformance()
  }, [pitchId, supporterId])

  const sortedPerformance = [...performance].sort((a, b) => {
    switch (sortBy) {
      case 'attribution_value':
        return b.attribution_value - a.attribution_value
      case 'conversion_rate':
        return b.conversion_rate - a.conversion_rate
      case 'total_chain_reach':
        return b.total_chain_reach - a.total_chain_reach
      default:
        return 0
    }
  })

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Award className="h-5 w-5 text-gray-400" />
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
    }
  }

  const getPerformanceColor = (value: number, type: 'conversion' | 'engagement' | 'viral') => {
    if (type === 'conversion') {
      if (value >= 10) return 'text-green-600'
      if (value >= 5) return 'text-yellow-600'
      return 'text-red-600'
    }
    if (type === 'engagement') {
      if (value >= 20) return 'text-green-600'
      if (value >= 10) return 'text-yellow-600'
      return 'text-red-600'
    }
    if (type === 'viral') {
      if (value >= 5) return 'text-green-600'
      if (value >= 2) return 'text-yellow-600'
      return 'text-red-600'
    }
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (performance.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No Supporter Data</h3>
          <p className="text-sm">Supporter attribution performance will appear here once they start sharing.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Supporter Performance</h3>
            <p className="text-sm text-gray-600">
              Top supporters and their attribution impact
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="attribution_value">Attribution Value</option>
              <option value="conversion_rate">Conversion Rate</option>
              <option value="total_chain_reach">Chain Reach</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y">
        {sortedPerformance.map((supporter, index) => (
          <div key={supporter.supporter_id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                  {getRankIcon(index)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{supporter.supporter_name}</h4>
                    <span className="text-sm text-gray-500">({supporter.supporter_email})</span>
                  </div>
                  
                  {pitchId && (
                    <p className="text-sm text-gray-600 mb-3">
                      Supporting: {supporter.pitch_title}
                    </p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {supporter.total_attributed_views}
                      </div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {supporter.total_attributed_conversions}
                      </div>
                      <div className="text-xs text-gray-500">Conversions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {supporter.total_chain_reach}
                      </div>
                      <div className="text-xs text-gray-500">Chain Reach</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">
                        {supporter.total_attributed_shares}
                      </div>
                      <div className="text-xs text-gray-500">Shares</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${supporter.attribution_value.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">Attribution Value</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-lg font-semibold ${getPerformanceColor(supporter.conversion_rate, 'conversion')}`}>
                    {supporter.conversion_rate}%
                  </div>
                  <div className="text-xs text-gray-500">Conversion Rate</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-semibold ${getPerformanceColor(supporter.engagement_rate, 'engagement')}`}>
                    {supporter.engagement_rate}%
                  </div>
                  <div className="text-xs text-gray-500">Engagement Rate</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-semibold ${getPerformanceColor(supporter.viral_coefficient, 'viral')}`}>
                    {supporter.viral_coefficient}%
                  </div>
                  <div className="text-xs text-gray-500">Viral Coefficient</div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>Referrals: {supporter.total_referrals_created}</span>
                <span>Calls: {supporter.total_attributed_calls}</span>
                <span>Emails: {supporter.total_attributed_emails}</span>
              </div>
              <span>
                Last active: {new Date(supporter.last_activity_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {performance.length > 0 && (
        <div className="p-6 bg-gray-50 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {performance.reduce((sum, p) => sum + p.total_attributed_views, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {performance.reduce((sum, p) => sum + p.total_attributed_conversions, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Conversions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {performance.reduce((sum, p) => sum + p.total_chain_reach, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Chain Reach</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                ${performance.reduce((sum, p) => sum + p.attribution_value, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
