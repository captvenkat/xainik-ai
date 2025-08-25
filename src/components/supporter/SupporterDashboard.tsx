'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { getSupporterDashboardData, isDualFunnelFeatureEnabled } from '@/lib/analytics-dual-funnel'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { 
  TrendingUp, 
  Share2, 
  Eye, 
  MessageCircle, 
  Award, 
  Star,
  Trophy,
  Users,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface SupporterDashboardProps {
  supporterId: string
  pitchId: string
}

export default function SupporterDashboard({ supporterId, pitchId }: SupporterDashboardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [pitchData, setPitchData] = useState<any>(null)

  useEffect(() => {
    async function loadSupporterData() {
      try {
        setLoading(true)
        setError(null)

        const supabase = createSupabaseBrowser()

        // Load pitch data
        const { data: pitch, error: pitchError } = await supabase
          .from('pitches')
          .select(`
            *,
            users!pitches_user_id_fkey (
              name,
              email
            )
          `)
          .eq('id', pitchId)
          .single()

        if (pitchError) throw pitchError
        setPitchData(pitch)

        // Load supporter dashboard data
        const supporterData = await getSupporterDashboardData(supporterId, pitchId)
        if (!supporterData) {
          throw new Error('No supporter data found')
        }

        setData(supporterData)

      } catch (err) {
        console.error('Failed to load supporter dashboard data:', err)
        setError('Failed to load supporter dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (supporterId && pitchId) {
      loadSupporterData()
    }
  }, [supporterId, pitchId])

  // Check if feature is enabled
  if (!isDualFunnelFeatureEnabled()) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your supporter dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!data || !pitchData) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h2>
        <p className="text-gray-600">Unable to load supporter dashboard data</p>
      </div>
    )
  }

  // Generate mock data for charts (in production, this would come from real analytics)
  const generateChartData = () => {
    const days = 30
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      data.push({
        date: date.toISOString().split('T')[0],
        shares: Math.floor(Math.random() * 3),
        views: Math.floor(Math.random() * 10),
        contacts: Math.floor(Math.random() * 2)
      })
    }
    
    return data
  }

  const chartData = generateChartData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supporter Dashboard</h1>
            <p className="text-gray-600">Track your impact on veteran success</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Supporting</div>
            <div className="font-semibold text-gray-900">{pitchData.users?.name || 'Veteran'}</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{pitchData.title}</h3>
              <p className="text-sm text-gray-600">Your support is making a difference</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600">+15%</div>
              <div className="text-xs text-gray-500">vs last week</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{data.kpis.shares}</div>
          <div className="text-sm text-gray-600">My Shares</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600">+22%</div>
              <div className="text-xs text-gray-500">vs last week</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{data.kpis.views}</div>
          <div className="text-sm text-gray-600">Views Generated</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-600">+8%</div>
              <div className="text-xs text-gray-500">vs last week</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{data.kpis.contacts}</div>
          <div className="text-sm text-gray-600">Contacts Triggered</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-orange-600">+25%</div>
              <div className="text-xs text-gray-500">vs last week</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{data.kpis.hires}</div>
          <div className="text-sm text-gray-600">Hire Impact</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inbound Contribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inbound Contribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  }}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="shares" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Your shares created <span className="font-semibold text-green-600">{data.kpis.views}</span> views
            </p>
          </div>
        </div>

        {/* Conversion Contribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Contribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={[
                  { stage: 'Views', value: data.kpis.views, color: '#3b82f6' },
                  { stage: 'Contacts', value: data.kpis.contacts, color: '#10b981' },
                  { stage: 'Hires', value: data.kpis.hires, color: '#f59e0b' }
                ]}
                layout="horizontal"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  type="category" 
                  dataKey="stage" 
                  stroke="#6b7280"
                  fontSize={12}
                  width={70}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {[
                    { stage: 'Views', value: data.kpis.views, color: '#3b82f6' },
                    { stage: 'Contacts', value: data.kpis.contacts, color: '#10b981' },
                    { stage: 'Hires', value: data.kpis.hires, color: '#f59e0b' }
                  ].map((entry, index) => (
                    <Bar key={index} dataKey="value" fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-purple-600">{data.kpis.contacts}</span> contacts came via you
            </p>
          </div>
        </div>
      </div>

      {/* Recognition and Badges */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recognition & Badges</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Impact Score */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-white">{data.impactScore}</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Impact Score</h4>
            <p className="text-sm text-gray-600">Your contribution level</p>
          </div>

          {/* Badges */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Badges Earned</h4>
            <div className="flex justify-center gap-2 mt-2">
              {data.badges.map((badge: any, index: number) => (
                <div key={index} className="text-2xl">{badge.icon}</div>
              ))}
            </div>
          </div>

          {/* Supporter Rank */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Supporter Rank</h4>
            <p className="text-sm text-gray-600">Top 10% of supporters</p>
          </div>
        </div>

        {/* Badge Details */}
        {data.badges.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-3">Your Badges</h4>
            <div className="flex flex-wrap gap-3">
              {data.badges.map((badge: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="text-lg">{badge.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Items */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Take Action</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              // Share the pitch again
              const shareUrl = `${window.location.origin}/pitch/${pitchId}`
              navigator.clipboard.writeText(shareUrl)
              // Could add a toast notification here
            }}
            className="flex items-center justify-center gap-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Share Again
          </button>
          <button
            onClick={() => {
              // Notify the veteran about your support
              console.log('Notify veteran about support')
            }}
            className="flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Notify Veteran
          </button>
        </div>
      </div>
    </div>
  )
}
