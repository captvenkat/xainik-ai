'use client'

import { useState, useEffect } from 'react'
import { getViralCoefficientAnalysis } from '@/lib/attribution-analytics'
import { TrendingUp, Share2, Users, Target, Zap } from 'lucide-react'

interface ViralCoefficientAnalysisProps {
  pitchId?: string
}

interface ViralAnalysis {
  pitch_id: string
  pitch_title: string
  pitch_owner_name: string
  total_referrals: number
  unique_supporters: number
  total_shares: number
  total_views: number
  viral_coefficient: number
  last_activity: string
}

export default function ViralCoefficientAnalysis({ pitchId }: ViralCoefficientAnalysisProps) {
  const [analysis, setAnalysis] = useState<ViralAnalysis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const data = await getViralCoefficientAnalysis(pitchId)
        setAnalysis(data)
      } catch (error) {
        console.error('Error fetching viral coefficient analysis:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [pitchId])

  const getViralCoefficientColor = (coefficient: number) => {
    if (coefficient >= 5) return 'text-green-600'
    if (coefficient >= 2) return 'text-yellow-600'
    if (coefficient >= 1) return 'text-orange-600'
    return 'text-red-600'
  }

  const getViralCoefficientLabel = (coefficient: number) => {
    if (coefficient >= 5) return 'Highly Viral'
    if (coefficient >= 2) return 'Viral'
    if (coefficient >= 1) return 'Growing'
    return 'Low Spread'
  }

  const getViralCoefficientIcon = (coefficient: number) => {
    if (coefficient >= 5) return <Zap className="h-5 w-5 text-green-600" />
    if (coefficient >= 2) return <TrendingUp className="h-5 w-5 text-yellow-600" />
    if (coefficient >= 1) return <Share2 className="h-5 w-5 text-orange-600" />
    return <Target className="h-5 w-5 text-red-600" />
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (analysis.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No Viral Data</h3>
          <p className="text-sm">Viral coefficient analysis will appear here once sharing activity begins.</p>
        </div>
      </div>
    )
  }

  const totalViralCoefficient = analysis.reduce((sum, item) => sum + item.viral_coefficient, 0) / analysis.length
  const totalShares = analysis.reduce((sum, item) => sum + item.total_shares, 0)
  const totalViews = analysis.reduce((sum, item) => sum + item.total_views, 0)
  const totalReferrals = analysis.reduce((sum, item) => sum + item.total_referrals, 0)

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Viral Coefficient Analysis</h3>
            <p className="text-sm text-gray-600">
              How effectively your content spreads through sharing
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingUp className="h-4 w-4" />
            <span>Average: {totalViralCoefficient.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {totalViralCoefficient.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-600">Avg Viral Coefficient</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {totalShares}
            </div>
            <div className="text-sm text-gray-600">Total Shares</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {totalViews}
            </div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {totalReferrals}
            </div>
            <div className="text-sm text-gray-600">Total Referrals</div>
          </div>
        </div>
      </div>

      <div className="divide-y">
        {analysis.map((item, index) => (
          <div key={item.pitch_id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {getViralCoefficientIcon(item.viral_coefficient)}
                  <div>
                    <h4 className="font-medium text-gray-900">{item.pitch_title}</h4>
                    <p className="text-sm text-gray-600">by {item.pitch_owner_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {item.total_referrals}
                    </div>
                    <div className="text-xs text-gray-500">Referrals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {item.unique_supporters}
                    </div>
                    <div className="text-xs text-gray-500">Supporters</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">
                      {item.total_shares}
                    </div>
                    <div className="text-xs text-gray-500">Shares</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-orange-600">
                      {item.total_views}
                    </div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-3xl font-bold ${getViralCoefficientColor(item.viral_coefficient)}`}>
                  {item.viral_coefficient}%
                </div>
                <div className="text-sm text-gray-500">
                  {getViralCoefficientLabel(item.viral_coefficient)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Last: {new Date(item.last_activity).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    Share Rate: {item.total_views > 0 ? ((item.total_shares / item.total_views) * 100).toFixed(1) : 0}%
                  </span>
                  <span className="text-gray-600">
                    Supporter Ratio: {item.total_referrals > 0 ? ((item.unique_supporters / item.total_referrals) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getViralCoefficientColor(item.viral_coefficient).replace('text-', 'bg-')}`}></div>
                  <span className="text-gray-600">
                    {item.viral_coefficient >= 1 ? 'Above 1.0 - Viral Growth' : 'Below 1.0 - Limited Spread'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-gray-50 border-t">
        <div className="text-sm text-gray-600">
          <h4 className="font-medium text-gray-900 mb-2">Viral Coefficient Explained</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span>≥5%: Highly viral content with exponential growth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
              <span>2-5%: Viral content with steady growth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span>1-2%: Growing content with moderate spread</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>&lt;1%: Limited spread, needs optimization</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
