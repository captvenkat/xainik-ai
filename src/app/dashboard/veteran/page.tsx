'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorState from '@/components/ErrorState'
import { Eye, Heart, Mail, Phone, TrendingUp, Share2, Users, Target, Activity, Calendar, RefreshCw } from 'lucide-react'

interface ConversionMetrics {
  profileViews: number
  likes: number
  shares: number
  endorsements: number
  emails: number
  calls: number
  totalSupporters: number
}

interface ChannelData {
  channel: string
  views: number
  endorsements: number
  emails: number
  calls: number
  conversionRate: number
}

interface SupporterData {
  name: string
  shares: number
  endorsements: number
  emails: number
  calls: number
  totalImpact: number
}

export default function VeteranDashboard() {
  const { user, profile, isLoading: authLoading, error: authError } = useAuth({ 
    requiredRole: 'veteran',
    redirectTo: '/auth?redirect=/dashboard/veteran'
  })
  
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null)
  const [channels, setChannels] = useState<ChannelData[]>([])
  const [topSupporters, setTopSupporters] = useState<SupporterData[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [pitchId, setPitchId] = useState<string | null>(null)

  const fetchVeteranData = useCallback(async (userId: string) => {
    try {
      console.log('Veteran Dashboard: Fetching conversion data for user:', userId)
      const supabase = createSupabaseBrowser()
      
      // Fetch pitch data
      const { data: pitch } = await supabase
        .from('pitches')
        .select('id, title, created_at')
        .eq('user_id', userId)
        .single()

      // If no pitch exists, we'll use null and show 0 counts
      // This allows the dashboard to render with empty state
      const currentPitchId = pitch?.id || null
      setPitchId(currentPitchId)

      // Fetch conversion metrics (handle case when no pitch exists)
      const [viewsResult, likesResult, sharesResult, endorsementsResult, emailsResult, callsResult, supportersResult] = await Promise.all([
        // Profile views (from pitch_views or similar table)
        currentPitchId ? supabase.from('pitch_views').select('count').eq('pitch_id', currentPitchId).single().then(r => r.data?.count || 0) : Promise.resolve(0),
        // Likes (from pitch_likes or similar table)
        currentPitchId ? supabase.from('pitch_likes').select('count').eq('pitch_id', currentPitchId).single().then(r => r.data?.count || 0) : Promise.resolve(0),
        // Shares (from referral_events or similar)
        currentPitchId ? supabase.from('referral_events').select('count').eq('pitch_id', currentPitchId).eq('event_type', 'share').single().then(r => r.data?.count || 0) : Promise.resolve(0),
        // Endorsements
        currentPitchId ? supabase.from('endorsements').select('count').eq('pitch_id', currentPitchId).single().then(r => r.data?.count || 0) : Promise.resolve(0),
        // Emails (from contact_requests or similar)
        currentPitchId ? supabase.from('contact_requests').select('count').eq('pitch_id', currentPitchId).eq('type', 'email').single().then(r => r.data?.count || 0) : Promise.resolve(0),
        // Calls (from contact_requests or similar)
        currentPitchId ? supabase.from('contact_requests').select('count').eq('pitch_id', currentPitchId).eq('type', 'call').single().then(r => r.data?.count || 0) : Promise.resolve(0),
        // Supporters count
        supabase.from('users').select('count').eq('role', 'supporter').single().then(r => r.data?.count || 0)
      ])



      setMetrics({
        profileViews: viewsResult,
        likes: likesResult,
        shares: sharesResult,
        endorsements: endorsementsResult,
        emails: emailsResult,
        calls: callsResult,
        totalSupporters: supportersResult
      })

      // Fetch channel performance (mock data for now)
      setChannels([
        { channel: 'LinkedIn', views: 450, endorsements: 23, emails: 8, calls: 3, conversionRate: 7.6 },
        { channel: 'Twitter', views: 320, endorsements: 18, emails: 6, calls: 2, conversionRate: 8.1 },
        { channel: 'WhatsApp', views: 280, endorsements: 15, emails: 5, calls: 2, conversionRate: 7.9 },
        { channel: 'Email', views: 197, endorsements: 12, emails: 4, calls: 1, conversionRate: 8.6 }
      ])

      // Fetch top supporters (mock data for now)
      setTopSupporters([
        { name: 'John Doe', shares: 23, endorsements: 12, emails: 5, calls: 2, totalImpact: 42 },
        { name: 'Jane Smith', shares: 18, endorsements: 8, emails: 3, calls: 1, totalImpact: 30 },
        { name: 'Mike Johnson', shares: 15, endorsements: 6, emails: 2, calls: 1, totalImpact: 24 }
      ])

      // Fetch recent activity
      const { data: activity } = await supabase
        .from('referral_events')
        .select('event_type, created_at, user_id')
        .eq('pitch_id', currentPitchId || '')
        .order('created_at', { ascending: false })
        .limit(10)

      setRecentActivity(activity || [])
      setLastUpdated(new Date())

    } catch (error) {
      console.error('Failed to fetch veteran data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user && !authLoading) {
      fetchVeteranData(user.id)
    }
  }, [user, authLoading, fetchVeteranData])

  const handleRefresh = () => {
    if (user) {
      setIsLoading(true)
      fetchVeteranData(user.id)
    }
  }

  const handleSharePitch = () => {
    if (!pitchId) {
      // If no pitch exists, redirect to create pitch
      window.open('/pitch/new', '_blank')
    } else {
      // Navigate to pitch sharing page
      window.open(`/pitch/${pitchId}`, '_blank')
    }
  }

  const handleInviteSupporters = () => {
    if (!pitchId) {
      // If no pitch exists, redirect to create pitch first
      window.open('/pitch/new', '_blank')
    } else {
      // Navigate to supporter invitation page
      window.open('/supporter/refer', '_blank')
    }
  }

  if (authLoading || isLoading) {
    return <LoadingSpinner />
  }

  if (authError || error) {
    return <ErrorState error={authError || error || 'Failed to load dashboard'} />
  }

  if (!user || !profile) {
    return <ErrorState error="Authentication required" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {profile.full_name || 'Veteran'}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Track your pitch performance and conversion funnel
              </p>
              {!pitchId && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Get started:</strong> Create your first pitch to start tracking your conversion funnel and analytics.
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <span className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.profileViews || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Heart className="h-8 w-8 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Likes</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.likes || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Share2 className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shares</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.shares || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Endorsements</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.endorsements || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Emails</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.emails || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Phone className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Calls</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.calls || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Conversion Funnel</h2>
            <p className="text-sm text-gray-600">Track how viewers become supporters</p>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap justify-center items-center gap-4">
              {/* Profile Views */}
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Profile Views</p>
                <p className="text-2xl font-bold text-blue-600">{metrics?.profileViews || 0}</p>
              </div>
              
              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="w-8 h-0.5 bg-gray-300"></div>
              </div>
              
              {/* Likes */}
              <div className="text-center">
                <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                  <Heart className="h-8 w-8 text-pink-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Likes</p>
                <p className="text-2xl font-bold text-pink-600">{metrics?.likes || 0}</p>
                <p className="text-xs text-gray-500">
                  {metrics?.profileViews ? Math.round((metrics.likes / metrics.profileViews) * 100) : 0}% conversion
                </p>
              </div>
              
              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="w-8 h-0.5 bg-gray-300"></div>
              </div>
              
              {/* Shares */}
              <div className="text-center">
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                  <Share2 className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Shares</p>
                <p className="text-2xl font-bold text-orange-600">{metrics?.shares || 0}</p>
                <p className="text-xs text-gray-500">
                  {metrics?.likes ? Math.round((metrics.shares / metrics.likes) * 100) : 0}% conversion
                </p>
              </div>
              
              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="w-8 h-0.5 bg-gray-300"></div>
              </div>
              
              {/* Endorsements */}
              <div className="text-center">
                <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Endorsements</p>
                <p className="text-2xl font-bold text-red-600">{metrics?.endorsements || 0}</p>
                <p className="text-xs text-gray-500">
                  {metrics?.shares ? Math.round((metrics.endorsements / metrics.shares) * 100) : 0}% conversion
                </p>
              </div>
              
              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="w-8 h-0.5 bg-gray-300"></div>
              </div>
              
              {/* Emails */}
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Emails</p>
                <p className="text-2xl font-bold text-green-600">{metrics?.emails || 0}</p>
                <p className="text-xs text-gray-500">
                  {metrics?.endorsements ? Math.round((metrics.emails / metrics.endorsements) * 100) : 0}% conversion
                </p>
              </div>
              
              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="w-8 h-0.5 bg-gray-300"></div>
              </div>
              
              {/* Calls */}
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                  <Phone className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Calls</p>
                <p className="text-2xl font-bold text-purple-600">{metrics?.calls || 0}</p>
                <p className="text-xs text-gray-500">
                  {metrics?.emails ? Math.round((metrics.calls / metrics.emails) * 100) : 0}% conversion
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-600">Take action to improve your conversions</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleSharePitch}
                className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Share2 className="w-5 h-5 mr-2" />
                {pitchId ? 'Share Your Pitch' : 'Create Your Pitch'}
              </button>
               
               <button
                 onClick={handleInviteSupporters}
                 className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
               >
                 <Users className="w-5 h-5 mr-2" />
                 {pitchId ? 'Invite Supporters' : 'Get Started'}
               </button>
              
              <button
                onClick={() => window.open('/dashboard/veteran/impact', '_blank')}
                className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                View Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Channel Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Channel Performance</h2>
              <p className="text-sm text-gray-600">See which platforms drive the most conversions</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {channels.map((channel, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="font-medium text-gray-900">{channel.channel}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{channel.views} views</p>
                      <p className="text-xs text-gray-500">{channel.conversionRate}% conversion</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top Supporters</h2>
              <p className="text-sm text-gray-600">Your most engaged supporters</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topSupporters.map((supporter, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{supporter.name}</p>
                      <p className="text-sm text-gray-500">{supporter.shares} shares</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{supporter.totalImpact} total impact</p>
                      <p className="text-xs text-gray-500">{supporter.endorsements} endorsements</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
