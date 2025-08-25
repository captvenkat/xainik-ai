'use client'

import { useState, useEffect } from 'react'
import { getAttributionSummary, getRealtimeAttributionMetrics } from '@/lib/attribution-analytics'
import AttributionChainView from './AttributionChainView'
import SupporterAttributionPerformance from './SupporterAttributionPerformance'
import ViralCoefficientAnalysis from './ViralCoefficientAnalysis'
import { 
  TrendingUp, 
  Users, 
  Share2, 
  Eye, 
  Phone, 
  Mail, 
  Target, 
  Zap,
  BarChart3,
  Activity,
  Network
} from 'lucide-react'

interface AttributionDashboardProps {
  veteranId: string
  pitchId?: string
}

interface AttributionSummary {
  totalReferrals: number
  totalChainReach: number
  totalAttributedViews: number
  totalAttributedCalls: number
  totalAttributedEmails: number
  totalAttributedShares: number
  totalAttributedConversions: number
  viralCoefficient: number
  attributionValue: number
  topSupporters: any[]
  attributionChains: any[]
}

export default function AttributionDashboard({ veteranId, pitchId }: AttributionDashboardProps) {
  const [summary, setSummary] = useState<AttributionSummary | null>(null)
  const [realtimeMetrics, setRealtimeMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'chains' | 'supporters' | 'viral'>('overview')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, realtimeData] = await Promise.all([
          getAttributionSummary(veteranId),
          pitchId ? getRealtimeAttributionMetrics(pitchId) : null
        ])
        
        setSummary(summaryData)
        setRealtimeMetrics(realtimeData)
      } catch (error) {
        console.error('Error fetching attribution data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [veteranId, pitchId])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'chains', label: 'Attribution Chains', icon: Network },
    { id: 'supporters', label: 'Supporter Performance', icon: Users },
    { id: 'viral', label: 'Viral Analysis', icon: TrendingUp }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No Attribution Data</h3>
          <p className="text-sm">Start sharing your pitches to see attribution analytics here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with key metrics */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Attribution Analytics</h2>
            <p className="text-sm text-gray-600">
              Complete tracking of how your content spreads and converts
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Tracking Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
              <Eye className="h-5 w-5" />
              <span className="text-2xl font-bold">{summary.totalAttributedViews}</span>
            </div>
            <div className="text-sm text-gray-600">Attributed Views</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
              <Target className="h-5 w-5" />
              <span className="text-2xl font-bold">{summary.totalAttributedConversions}</span>
            </div>
            <div className="text-sm text-gray-600">Conversions</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
              <Users className="h-5 w-5" />
              <span className="text-2xl font-bold">{summary.totalChainReach}</span>
            </div>
            <div className="text-sm text-gray-600">Chain Reach</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-orange-600 mb-2">
              <Zap className="h-5 w-5" />
              <span className="text-2xl font-bold">{summary.viralCoefficient}%</span>
            </div>
            <div className="text-sm text-gray-600">Viral Coefficient</div>
          </div>
        </div>

        {/* Real-time metrics */}
        {realtimeMetrics && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Activity</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">{realtimeMetrics.today.views}</div>
                <div className="text-xs text-gray-500">Views</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{realtimeMetrics.today.calls}</div>
                <div className="text-xs text-gray-500">Calls</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">{realtimeMetrics.today.emails}</div>
                <div className="text-xs text-gray-500">Emails</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">{realtimeMetrics.today.shares}</div>
                <div className="text-xs text-gray-500">Shares</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-600">{realtimeMetrics.today.conversions}</div>
                <div className="text-xs text-gray-500">Conversions</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Attribution Value Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Total Attribution Value</h3>
                    <p className="text-sm text-gray-600">Calculated value of all attributed conversions</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      ${summary.attributionValue.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">Total Value</div>
                  </div>
                </div>
              </div>

              {/* Top Supporters Preview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Supporters</h3>
                <div className="space-y-3">
                  {summary.topSupporters.slice(0, 3).map((supporter, index) => (
                    <div key={supporter.supporter_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                          {index === 0 && <span className="text-yellow-600">🥇</span>}
                          {index === 1 && <span className="text-gray-400">🥈</span>}
                          {index === 2 && <span className="text-amber-600">🥉</span>}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{supporter.supporter_name}</div>
                          <div className="text-sm text-gray-500">{supporter.total_attributed_conversions} conversions</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">${supporter.attribution_value.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">Value</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Attribution Chains */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attribution Chains</h3>
                <div className="space-y-3">
                  {summary.attributionChains.slice(0, 3).map((chain) => (
                    <div key={chain.referral_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <Share2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {chain.original_supporter_name || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {chain.attribution_depth > 0 ? `Chain depth: ${chain.attribution_depth}` : 'Direct share'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">{chain.chain_total_conversions}</div>
                        <div className="text-xs text-gray-500">Conversions</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chains' && (
            <AttributionChainView pitchId={pitchId || ''} />
          )}

          {activeTab === 'supporters' && (
            <SupporterAttributionPerformance pitchId={pitchId} />
          )}

          {activeTab === 'viral' && (
            <ViralCoefficientAnalysis pitchId={pitchId} />
          )}
        </div>
      </div>
    </div>
  )
}
