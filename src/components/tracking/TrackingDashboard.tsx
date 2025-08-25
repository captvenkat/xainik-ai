'use client'
import { useState, useEffect } from 'react'
import { 
  BarChart3, Eye, Phone, Mail, Share2, TrendingUp, Users, 
  Clock, MousePointer, Activity, Target, Zap, RefreshCw 
} from 'lucide-react'
import { 
  getUserTrackingSummary, 
  getPitchMetrics, 
  getAllPitchMetrics,
  getDailyTrackingMetrics,
  getPlatformMetrics,
  getAttributionChains,
  getSupporterPerformance,
  getRecentTrackingEvents,
  getTodayMetrics,
  getConversionFunnel,
  getEngagementMetrics,
  getViralCoefficient,
  getDashboardData
} from '@/lib/tracking-analytics'

interface TrackingDashboardProps {
  userId: string // Central source of truth
  pitchId?: string // Central tracking entity (optional for user-level view)
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ReactNode
  color: string
}

const MetricCard = ({ title, value, change, icon, color }: MetricCardProps) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  </div>
)

export default function TrackingDashboard({ userId, pitchId }: TrackingDashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [pitchMetrics, setPitchMetrics] = useState<any>(null)
  const [todayMetrics, setTodayMetrics] = useState<any>(null)
  const [conversionFunnel, setConversionFunnel] = useState<any>(null)
  const [engagementMetrics, setEngagementMetrics] = useState<any>(null)
  const [viralCoefficient, setViralCoefficient] = useState<any>(null)
  const [attributionChains, setAttributionChains] = useState<any[]>([])
  const [supporterPerformance, setSupporterPerformance] = useState<any[]>([])
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState<'overview' | 'pitch' | 'attribution' | 'engagement' | 'recent'>('overview')

  const refreshData = async () => {
    setLoading(true)
    try {
      if (pitchId) {
        // Pitch-specific data
        const [
          pitchData,
          todayData,
          funnelData,
          engagementData,
          viralData,
          chainsData,
          supportersData,
          eventsData
        ] = await Promise.all([
          getPitchMetrics(pitchId, userId),
          getTodayMetrics(pitchId, userId),
          getConversionFunnel(pitchId, userId),
          getEngagementMetrics(pitchId, userId),
          getViralCoefficient(pitchId, userId),
          getAttributionChains(pitchId, userId),
          getSupporterPerformance(pitchId, userId),
          getRecentTrackingEvents(pitchId, userId, 20)
        ])

        setPitchMetrics(pitchData)
        setTodayMetrics(todayData)
        setConversionFunnel(funnelData)
        setEngagementMetrics(engagementData)
        setViralCoefficient(viralData)
        setAttributionChains(chainsData)
        setSupporterPerformance(supportersData)
        setRecentEvents(eventsData)
      } else {
        // User-level data
        const userData = await getDashboardData(userId)
        setDashboardData(userData)
      }
      
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [userId, pitchId])

  const handleManualRefresh = () => {
    refreshData()
  }

  if (loading && !dashboardData && !pitchMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh status */}
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-800">
            Real-time tracking active
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={handleManualRefresh}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            {pitchId && (
              <>
                <button
                  onClick={() => setActiveTab('pitch')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pitch'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pitch Analytics
                </button>
                <button
                  onClick={() => setActiveTab('attribution')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'attribution'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Attribution
                </button>
                <button
                  onClick={() => setActiveTab('engagement')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'engagement'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Engagement
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab('recent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recent Activity
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {pitchId ? (
                // Pitch-specific overview
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                      title="Total Views"
                      value={pitchMetrics?.total_views || 0}
                      icon={<Eye className="w-6 h-6 text-white" />}
                      color="bg-blue-500"
                    />
                    <MetricCard
                      title="Total Calls"
                      value={pitchMetrics?.total_calls || 0}
                      icon={<Phone className="w-6 h-6 text-white" />}
                      color="bg-green-500"
                    />
                    <MetricCard
                      title="Total Emails"
                      value={pitchMetrics?.total_emails || 0}
                      icon={<Mail className="w-6 h-6 text-white" />}
                      color="bg-purple-500"
                    />
                    <MetricCard
                      title="Total Shares"
                      value={pitchMetrics?.total_shares || 0}
                      icon={<Share2 className="w-6 h-6 text-white" />}
                      color="bg-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <MetricCard
                      title="Conversion Rate"
                      value={`${conversionFunnel?.conversionRate?.toFixed(1) || 0}%`}
                      icon={<Target className="w-6 h-6 text-white" />}
                      color="bg-red-500"
                    />
                    <MetricCard
                      title="Viral Coefficient"
                      value={viralCoefficient?.viralCoefficient?.toFixed(2) || 0}
                      icon={<TrendingUp className="w-6 h-6 text-white" />}
                      color="bg-indigo-500"
                    />
                    <MetricCard
                      title="Today's Views"
                      value={todayMetrics?.views || 0}
                      icon={<Activity className="w-6 h-6 text-white" />}
                      color="bg-teal-500"
                    />
                  </div>
                </>
              ) : (
                // User-level overview
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                      title="Total Pitches"
                      value={dashboardData?.totalPitches || 0}
                      icon={<BarChart3 className="w-6 h-6 text-white" />}
                      color="bg-blue-500"
                    />
                    <MetricCard
                      title="Total Views"
                      value={dashboardData?.totalViews || 0}
                      icon={<Eye className="w-6 h-6 text-white" />}
                      color="bg-green-500"
                    />
                    <MetricCard
                      title="Total Conversions"
                      value={dashboardData?.totalConversions || 0}
                      icon={<Target className="w-6 h-6 text-white" />}
                      color="bg-purple-500"
                    />
                    <MetricCard
                      title="Avg Conversion Rate"
                      value={`${dashboardData?.avgConversionRate?.toFixed(1) || 0}%`}
                      icon={<TrendingUp className="w-6 h-6 text-white" />}
                      color="bg-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        {dashboardData?.recentEvents?.slice(0, 5).map((event: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">
                              {event.event_type.replace(/_/g, ' ').toLowerCase()}
                            </span>
                            <span className="text-gray-400">
                              {new Date(event.occurred_at).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Pitches</h3>
                      <div className="space-y-3">
                        {dashboardData?.allPitchMetrics?.slice(0, 5).map((pitch: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 truncate">
                              {pitch.pitches?.title || 'Untitled Pitch'}
                            </span>
                            <span className="text-gray-900 font-medium">
                              {pitch.total_views} views
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Pitch Analytics Tab */}
          {activeTab === 'pitch' && pitchId && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard
                  title="LinkedIn Clicks"
                  value={pitchMetrics?.total_linkedin_clicks || 0}
                  icon={<MousePointer className="w-6 h-6 text-white" />}
                  color="bg-blue-600"
                />
                <MetricCard
                  title="Resume Requests"
                  value={pitchMetrics?.total_resume_requests || 0}
                  icon={<Users className="w-6 h-6 text-white" />}
                  color="bg-green-600"
                />
                <MetricCard
                  title="Avg Engagement Time"
                  value={`${pitchMetrics?.avg_engagement_time?.toFixed(0) || 0}s`}
                  icon={<Clock className="w-6 h-6 text-white" />}
                  color="bg-purple-600"
                />
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Views</span>
                    <span className="font-semibold">{conversionFunnel?.views || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Calls</span>
                    <span className="font-semibold">{conversionFunnel?.calls || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Emails</span>
                    <span className="font-semibold">{conversionFunnel?.emails || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Shares</span>
                    <span className="font-semibold">{conversionFunnel?.shares || 0}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 font-medium">Conversion Rate</span>
                      <span className="text-green-600 font-semibold">
                        {conversionFunnel?.conversionRate?.toFixed(1) || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attribution Tab */}
          {activeTab === 'attribution' && pitchId && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Attribution Chains</h3>
                  <div className="space-y-3">
                    {attributionChains?.slice(0, 5).map((chain: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-600">
                            {chain.users?.name || 'Anonymous'}
                          </span>
                          <span className="text-gray-400 ml-2">
                            (Depth: {chain.chain_depth})
                          </span>
                        </div>
                        <span className="text-gray-900 font-medium">
                          {chain.total_chain_views} views
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Supporters</h3>
                  <div className="space-y-3">
                    {supporterPerformance?.slice(0, 5).map((supporter: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {supporter.users?.name || 'Anonymous'}
                        </span>
                        <span className="text-gray-900 font-medium">
                          {supporter.total_attributed_conversions} conversions
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Engagement Tab */}
          {activeTab === 'engagement' && pitchId && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard
                  title="25% Scroll Rate"
                  value={`${engagementMetrics?.scroll25Rate?.toFixed(1) || 0}%`}
                  icon={<TrendingUp className="w-6 h-6 text-white" />}
                  color="bg-blue-500"
                />
                <MetricCard
                  title="50% Scroll Rate"
                  value={`${engagementMetrics?.scroll50Rate?.toFixed(1) || 0}%`}
                  icon={<TrendingUp className="w-6 h-6 text-white" />}
                  color="bg-green-500"
                />
                <MetricCard
                  title="75% Scroll Rate"
                  value={`${engagementMetrics?.scroll75Rate?.toFixed(1) || 0}%`}
                  icon={<TrendingUp className="w-6 h-6 text-white" />}
                  color="bg-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  title="30s Engagement"
                  value={`${engagementMetrics?.time30Rate?.toFixed(1) || 0}%`}
                  icon={<Clock className="w-6 h-6 text-white" />}
                  color="bg-orange-500"
                />
                <MetricCard
                  title="60s Engagement"
                  value={`${engagementMetrics?.time60Rate?.toFixed(1) || 0}%`}
                  icon={<Clock className="w-6 h-6 text-white" />}
                  color="bg-red-500"
                />
                <MetricCard
                  title="120s Engagement"
                  value={`${engagementMetrics?.time120Rate?.toFixed(1) || 0}%`}
                  icon={<Clock className="w-6 h-6 text-white" />}
                  color="bg-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Recent Activity Tab */}
          {activeTab === 'recent' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Tracking Events</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {(pitchId ? recentEvents : dashboardData?.recentEvents)?.map((event: any, index: number) => (
                    <div key={index} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {event.event_type.replace(/_/g, ' ').toLowerCase()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {event.referrals?.platform || 'web'} • {event.referrals?.source_type || 'direct'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">
                            {new Date(event.occurred_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.occurred_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
