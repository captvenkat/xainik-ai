"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { analyticsService } from '@/lib/services/analyticsService'
import { 
  ArrowLeft, 
  Share2, 
  TrendingUp, 
  TrendingDown, 
  MessageCircle, 
  Users,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Info,
  RefreshCw,
  Calendar,
  Globe,
  Copy,
  Download
} from 'lucide-react'

interface SharesAnalyticsData {
  total: number
  change: number
  overTime: Array<{ date: string; count: number; previousPeriod: number }>
  byChannel: Array<{ channel: string; count: number; percentage: number }>
  byActor: Array<{ actor: string; count: number; percentage: number }>
  shareToViewEfficiency: number
  topSharers: Array<{ name: string; shares: number; views: number; contacts: number; lastShare: string }>
  recentShares: Array<{ timestamp: string; channel: string; actor: string; supporterName?: string; location?: string }>
}

export default function SharesDetailPage() {
  const router = useRouter()
  const [data, setData] = useState<SharesAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [platformFilter, setPlatformFilter] = useState<string>('all')

  useEffect(() => {
    // Check authentication status immediately (only on mount)
    console.log('🔍 useEffect: Checking authentication on mount...')
    const checkAuthAndLoad = async () => {
      try {
        // Try to load real data first
        const sharesData = await analyticsService.getSharesAnalytics(dateRange, platformFilter)
        setData(sharesData)
        setLoading(false)
      } catch (err) {
        console.log('✅ User not authenticated or no data - showing sample data immediately')
        // Fall back to sample data from the service
        const sampleData = await analyticsService.getSharesAnalytics(dateRange, platformFilter)
        setData(sampleData)
        setLoading(false)
      }
    }
    
    checkAuthAndLoad()
  }, []) // Only run on mount

  // Separate effect for refreshing data when filters change
  useEffect(() => {
    if (data && !loading) {
      // Only refresh if we already have data
      loadSharesData()
    }
  }, [dateRange, platformFilter])

  const loadSharesData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const sharesData = await analyticsService.getSharesAnalytics(dateRange, platformFilter)
      setData(sharesData)
    } catch (err) {
      console.error('Failed to load shares data:', err)
      setError('Failed to load shares data')
    } finally {
      setLoading(false)
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />
      case 'linkedin': return <Globe className="w-4 h-4" />
      case 'facebook': return <Users className="w-4 h-4" />
      case 'email': return <MessageCircle className="w-4 h-4" />
      case 'twitter': return <MessageCircle className="w-4 h-4" />
      default: return <Share2 className="w-4 h-4" />
    }
  }

  const getChannelColor = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'whatsapp': return 'bg-green-500'
      case 'linkedin': return 'bg-blue-500'
      case 'facebook': return 'bg-blue-600'
      case 'email': return 'bg-gray-500'
      case 'twitter': return 'bg-blue-400'
      default: return 'bg-purple-500'
    }
  }

  const getActorLabel = (actor: string) => {
    switch (actor) {
      case 'self': return 'Self'
      case 'supporter': return 'Supporters'
      case 'anonymous': return 'Anonymous'
      default: return actor
    }
  }

  const getActorColor = (actor: string) => {
    switch (actor) {
      case 'self': return 'bg-blue-500'
      case 'supporter': return 'bg-green-500'
      case 'anonymous': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Shares Analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load Data</h2>
          <p className="text-gray-600 mb-8">
            {error || 'Unknown error occurred'}
            {!data && !loading && ' (No data available)'}
          </p>
          <div className="text-sm text-gray-500 mb-4">
            Debug: loading={loading.toString()}, data={data ? 'present' : 'null'}, error={error || 'none'}
          </div>
          <button
            onClick={loadSharesData}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Debug logging
  console.log('🎨 Render state:', { 
    loading, 
    data: !!data, 
    error, 
    dataKeys: data ? Object.keys(data) : [],
    dataTotalShares: data?.total || 'N/A'
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard/veteran/admin-style')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Shares Analytics</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              {/* Platform Filter */}
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Platforms</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="email">Email</option>
              </select>
              
              {/* Refresh Button */}
              <button
                onClick={loadSharesData}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <button
            onClick={() => router.push('/dashboard/veteran/admin-style')}
            className="hover:text-gray-700 transition-colors"
          >
            Admin Dashboard
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Shares Analytics</span>
        </nav>

        {/* Hero Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Total Shares: {data.total.toLocaleString()}</h2>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  {data.change >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span className={`text-lg font-medium ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.change >= 0 ? '+' : ''}{data.change.toFixed(1)}%
                  </span>
                  <span className="text-gray-500 ml-2">vs previous period</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Share→View Efficiency: {data.shareToViewEfficiency.toFixed(1)}x
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl mb-2">📤</div>
              <div className="text-sm text-gray-500">Total Shares</div>
            </div>
          </div>
        </div>

        {/* 1-Click Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <button className="bg-green-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>Share Now</span>
            </button>
            
            <button className="bg-blue-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Ask Supporters to Reshare</span>
            </button>
            
            <button className="bg-purple-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Thank Top 3</span>
            </button>
            
            <button className="bg-gray-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
              <Copy className="w-4 h-4" />
              <span>Copy Link</span>
            </button>
            
            <button className="bg-orange-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Shares Over Time */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Shares Over Time</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Daily count; compare vs previous period</span>
            </div>
          </div>
          
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Chart: Shares Over Time</p>
              <p className="text-sm">Line chart showing daily shares vs previous period</p>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-600">
            <span className="font-medium">Definition:</span> Daily count; compare vs previous period.
          </div>
        </div>

        {/* Shares by Channel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Shares by Channel</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <BarChart3 className="w-4 h-4" />
              <span>WA/LI/FB/Email/Twitter</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {data.byChannel.map((channel, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 ${getChannelColor(channel.channel)} rounded-full`}></div>
                  <div className="flex items-center space-x-2">
                    {getChannelIcon(channel.channel)}
                    <span className="font-medium text-gray-900">{channel.channel}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{channel.count} shares</span>
                  <span className="text-sm text-gray-500">({channel.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-600">
            <span className="font-medium">Definition:</span> Shares by channel (WhatsApp, LinkedIn, Facebook, Email, Twitter).
          </div>
        </div>

        {/* Shares by Actor */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Shares by Actor</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <PieChart className="w-4 h-4" />
              <span>Self, Supporters, Anonymous</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.byActor.map((actor, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 ${getActorColor(actor.actor)} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{getActorLabel(actor.actor)}</h4>
                <p className="text-2xl font-bold text-gray-700">{actor.count.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{actor.percentage.toFixed(1)}%</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-600">
            <span className="font-medium">Definition:</span> Shares by actor (Self, Supporters, Anonymous).
          </div>
        </div>

        {/* Top Sharers (Supporter Leaderboard) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Sharers (Supporter Leaderboard)</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>Shares, resulting views, contacts triggered</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supporter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Share</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.topSharers.map((sharer, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sharer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sharer.shares}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sharer.views}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sharer.contacts}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{sharer.lastShare}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                          Thank
                        </button>
                        <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                          Ask to Share Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-xs text-gray-600">
            <span className="font-medium">Definition:</span> Shares, resulting views, contacts triggered.
          </div>
        </div>

        {/* Recent Shares */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Shares</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Activity className="w-4 h-4" />
              <span>Latest share events with channel and actor</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {data.recentShares.map((share, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{share.timestamp}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{share.channel}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{share.actor}</span>
                      {share.supporterName && (
                        <>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-blue-600">via {share.supporterName}</span>
                        </>
                      )}
                      {share.location && (
                        <>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{share.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {share.supporterName && (
                    <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                      Thank Supporter
                    </button>
                  )}
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-600">
            <span className="font-medium">Definition:</span> Latest share events with timestamp, channel, actor, supporter name, and location.
          </div>
        </div>

        {/* Why It Matters */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Why Shares Matter</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Reach:</strong> Shares create reach and expand your network visibility.</p>
                <p><strong>Efficiency:</strong> Share→View efficiency spots high-yield channels.</p>
                <p><strong>Supporter Engagement:</strong> Leaderboard reinforces supporter behavior worth repeating.</p>
                <p><strong>Network Effect:</strong> Each share multiplies your pitch exposure.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
