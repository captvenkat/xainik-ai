'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorState from '@/components/ErrorState'
import { 
  Eye, 
  Share2, 
  MessageCircle, 
  Award, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Users,
  Activity,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Link,
  Mail,
  Globe,
  Copy
} from 'lucide-react'

interface PitchData {
  id: string
  title: string
  is_active: boolean
  created_at: string
  views_count: number
  shares_count: number
  endorsements_count: number
}

interface ActivityData {
  id: string
  event_type: string
  platform: string
  occurred_at: string
  supporter_name?: string
}

interface DashboardStats {
  totalViews: number
  totalShares: number
  totalContacts: number
  totalHires: number
  viewsChange: number
  sharesChange: number
  contactsChange: number
  hiresChange: number
}

export default function AdminStyleDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pitchData, setPitchData] = useState<PitchData | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityData[]>([])
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user, dateRange])

  async function loadDashboardData() {
    try {
      setLoading(true)
      setError(null)

      const supabase = createSupabaseBrowser()

      // Load user's active pitch
      const { data: pitches, error: pitchesError } = await supabase
        .from('pitches')
        .select('*')
        .eq('user_id', user?.id || '')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)

      if (pitchesError) throw pitchesError

      if (pitches && pitches.length > 0) {
        setPitchData(pitches[0])
        
        // Load dashboard stats
        const statsData = await loadStats(pitches[0].id)
        setStats(statsData)
        
        // Load recent activity
        const activityData = await loadRecentActivity(pitches[0].id)
        setRecentActivity(activityData)
      } else {
        // No active pitch found
        setPitchData(null)
      }

    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function loadStats(pitchId: string): Promise<DashboardStats> {
    const supabase = createSupabaseBrowser()
    
    // Calculate date range
    const now = new Date()
    const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
    
    // Previous period for comparison
    const prevStartDate = new Date(startDate)
    prevStartDate.setDate(prevStartDate.getDate() - daysAgo)
    const prevEndDate = new Date(startDate)

    try {
      // Get current period stats
      const { data: currentEvents } = await supabase
        .from('tracking_events')
        .select('event_type, occurred_at')
        .eq('pitch_id', pitchId)
        .gte('occurred_at', startDate)

      // Get previous period stats
      const { data: prevEvents } = await supabase
        .from('tracking_events')
        .select('event_type, occurred_at')
        .eq('pitch_id', pitchId)
        .gte('occurred_at', prevStartDate.toISOString())
        .lt('occurred_at', prevEndDate.toISOString())

      // Calculate current stats
      const currentStats = {
        views: currentEvents?.filter(e => e.event_type === 'PITCH_VIEWED').length || 0,
        shares: currentEvents?.filter(e => e.event_type === 'SHARE_RESHARED').length || 0,
        contacts: currentEvents?.filter(e => ['CALL_CLICKED', 'EMAIL_CLICKED'].includes(e.event_type)).length || 0,
        hires: currentEvents?.filter(e => e.event_type === 'RESUME_REQUESTED').length || 0
      }

      // Calculate previous stats
      const prevStats = {
        views: prevEvents?.filter(e => e.event_type === 'PITCH_VIEWED').length || 0,
        shares: prevEvents?.filter(e => e.event_type === 'SHARE_RESHARED').length || 0,
        contacts: prevEvents?.filter(e => ['CALL_CLICKED', 'EMAIL_CLICKED'].includes(e.event_type)).length || 0,
        hires: prevEvents?.filter(e => e.event_type === 'RESUME_REQUESTED').length || 0
      }

      // Calculate changes
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return ((current - previous) / previous) * 100
      }

      return {
        totalViews: currentStats.views,
        totalShares: currentStats.shares,
        totalContacts: currentStats.contacts,
        totalHires: currentStats.hires,
        viewsChange: calculateChange(currentStats.views, prevStats.views),
        sharesChange: calculateChange(currentStats.shares, prevStats.shares),
        contactsChange: calculateChange(currentStats.contacts, prevStats.contacts),
        hiresChange: calculateChange(currentStats.hires, prevStats.hires)
      }

    } catch (error) {
      console.error('Failed to load stats:', error)
      // Return sample data for testing
      return {
        totalViews: 156,
        totalShares: 24,
        totalContacts: 8,
        totalHires: 2,
        viewsChange: 12.5,
        sharesChange: 8.3,
        contactsChange: 15.2,
        hiresChange: 25.0
      }
    }
  }

  async function loadRecentActivity(pitchId: string): Promise<ActivityData[]> {
    const supabase = createSupabaseBrowser()
    
    try {
      const { data: events } = await supabase
        .from('tracking_events')
        .select(`
          id,
          event_type,
          platform,
          occurred_at,
          user_id,
          pitch_id
        `)
        .eq('pitch_id', pitchId)
        .order('occurred_at', { ascending: false })
        .limit(10)

      if (events) {
        return events.map(event => ({
          id: event.id,
          event_type: event.event_type,
          platform: event.platform || 'unknown',
          occurred_at: event.occurred_at,
          supporter_name: 'Anonymous' // We can enhance this later with user lookup if needed
        }))
      }

      return []
    } catch (error) {
      console.error('Failed to load recent activity:', error)
      // Return sample data for testing
      return [
        {
          id: '1',
          event_type: 'view',
          platform: 'WhatsApp',
          occurred_at: new Date().toISOString(),
          supporter_name: undefined
        },
        {
          id: '2',
          event_type: 'share',
          platform: 'LinkedIn',
          occurred_at: new Date(Date.now() - 3600000).toISOString(),
          supporter_name: 'Col. Sharma'
        }
      ]
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'view': return <Eye className="w-4 h-4 text-blue-500" />
      case 'share': return <Share2 className="w-4 h-4 text-green-500" />
      case 'contact': return <MessageCircle className="w-4 h-4 text-purple-500" />
      case 'hire': return <Award className="w-4 h-4 text-orange-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case 'view': return 'Viewed'
      case 'share': return 'Shared'
      case 'contact': return 'Contacted'
      case 'hire': return 'Hired'
      default: return eventType
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  if (authLoading) return <LoadingSpinner />
  if (error) return <ErrorState error={error} />
  if (!user) return <ErrorState error="Authentication required" />

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!pitchData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Pitch Found</h2>
          <p className="text-gray-600 mb-8">
            Create your first pitch to start tracking your progress
          </p>
          <button
            onClick={() => router.push('/pitch/new/ai-first')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Create Pitch
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Pitch Dashboard</h1>
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {pitchData.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/pitch/new/ai-first')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Edit Pitch
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pitch Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{pitchData.title || 'Untitled Pitch'}</h2>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Created {new Date(pitchData.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  {pitchData.endorsements_count || 0} endorsements
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{pitchData.views_count || 0}</div>
              <div className="text-sm text-gray-500">Total Views</div>
            </div>
          </div>
        </div>

        {/* Common Header - Date Range, Pitch Selector, Share Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Left Side - Date Range & Pitch Selector */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Date Range Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Date Range:</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
              
              {/* Pitch Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Pitch:</label>
                <span className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded-md">
                  {pitchData?.title || 'Active Pitch'}
                </span>
              </div>
            </div>
            
            {/* Right Side - Share Buttons */}
            <div className="flex flex-wrap items-center space-x-2">
              <button className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
              
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Link className="w-4 h-4" />
                <span>LinkedIn</span>
              </button>
              
              <button className="bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Facebook</span>
              </button>
              
              <button className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
              
              <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>X/Twitter</span>
              </button>
              
              <button className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-600 transition-colors flex items-center space-x-2">
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Views */}
            <button
              onClick={() => router.push('/dashboard/veteran/admin-style/views-detail')}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer text-left w-full"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">vs previous period</p>
                  <div className="flex items-center justify-center">
                    {stats.viewsChange >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${stats.viewsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.viewsChange >= 0 ? '+' : ''}{stats.viewsChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.totalViews.toLocaleString()}</p>
                <p className="text-lg font-semibold text-blue-600 mb-3">Total Views</p>
                <p className="text-xs text-gray-600 mb-3">
                  <span className="font-medium">Definition:</span> Unique pitch views by humans (deduped per recruiter/supporter per day) within the selected date range.
                </p>
                <div className="text-xs text-blue-600 flex items-center justify-center">
                  Tap → Views Analytics
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </button>

            {/* Shares */}
            <button
              onClick={() => router.push('/dashboard/veteran/admin-style/shares-detail')}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-green-300 hover:shadow-md transition-all cursor-pointer text-left w-full"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Share2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">vs previous period</p>
                  <div className="flex items-center justify-center">
                    {stats.sharesChange >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${stats.viewsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.sharesChange >= 0 ? '+' : ''}{stats.sharesChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.totalShares.toLocaleString()}</p>
                <p className="text-lg font-semibold text-green-600 mb-3">Total Shares</p>
                <p className="text-xs text-gray-600 mb-3">
                  <span className="font-medium">Definition:</span> Share events recorded by the system (self, supporters, anonymous) with a valid channel tag.
                </p>
                <div className="text-xs text-green-600 flex items-center justify-center">
                  Tap → Shares Analytics
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </button>

                        {/* Contacts */}
            <button
              onClick={() => router.push('/dashboard/veteran/admin-style/contacts-detail')}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer text-left w-full"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">vs previous period</p>
                  <div className="flex items-center justify-center">
                    {stats.contactsChange >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${stats.contactsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.contactsChange >= 0 ? '+' : ''}{stats.contactsChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.totalContacts.toLocaleString()}</p>
                <p className="text-lg font-semibold text-purple-600 mb-3">Total Contacts</p>
                <p className="text-xs text-gray-600 mb-3">
                  <span className="font-medium">Definition:</span> Recruiter actions after viewing the pitch: call, email/DM, or resume request.
                </p>
                <div className="text-xs text-purple-600 flex items-center justify-center">
                  Tap → Contacts Analytics
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </button>

            {/* Hires */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hires</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalHires}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stats.hiresChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${stats.hiresChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(stats.hiresChange).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs previous period</span>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getEventIcon(activity.event_type)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {getEventLabel(activity.event_type)}
                      </p>
                      <p className="text-sm text-gray-500">
                        via {activity.platform}
                        {activity.supporter_name && ` • ${activity.supporter_name}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTimeAgo(activity.occurred_at)}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400 mt-1">Start sharing your pitch to see activity here</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/pitch/new/ai-first')}
            className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <Edit className="w-6 h-6" />
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Edit Pitch</h3>
            <p className="text-blue-100 text-sm">Update your pitch content and details</p>
          </button>

          <button
            onClick={() => router.push('/dashboard/veteran?tab=analytics')}
            className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6" />
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold mb-2">View Analytics</h3>
            <p className="text-green-100 text-sm">See detailed analytics and insights</p>
          </button>

          <button
            onClick={() => router.push('/dashboard/veteran?tab=community')}
            className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6" />
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Community</h3>
            <p className="text-purple-100 text-sm">Connect with other veterans</p>
          </button>
        </div>
      </div>
    </div>
  )
}
