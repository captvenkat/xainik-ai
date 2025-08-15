'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorState from '@/components/ErrorState'
import ShareModal from '@/components/ShareModal'
import SmartNotifications from '@/components/SmartNotifications'
import LiveActivityTicker from '@/components/LiveActivityTicker'
import AIContactSuggestions from '@/components/AIContactSuggestions'
import SupportersWall from '@/components/SupportersWall'
import { Eye, Heart, Mail, Phone, TrendingUp, Share2, Users, RefreshCw } from 'lucide-react'

interface ConversionMetrics {
  pitchViews: number
  likes: number
  shares: number
  endorsements: number
  emails: number
  calls: number
  totalSupporters: number
}



export default function VeteranDashboard() {
  const { user, profile, isLoading: authLoading, error: authError } = useAuth({ 
    requiredRole: 'veteran',
    redirectTo: '/auth?redirect=/dashboard/veteran'
  })


  
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [pitchId, setPitchId] = useState<string | null>(null)
  const [pitchData, setPitchData] = useState<{ title: string; pitch_text: string } | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)

  const fetchVeteranData = useCallback(async (userId: string) => {
    try {
      console.log('Veteran Dashboard: Fetching conversion data for user:', userId)
      const supabase = createSupabaseBrowser()
      
      // Fetch pitch data
      const { data: pitch } = await supabase
        .from('pitches')
        .select('id, title, pitch_text, created_at')
        .eq('user_id', userId)
        .single()

      // If no pitch exists, we'll use null and show 0 counts
      // This allows the dashboard to render with empty state
      const currentPitchId = pitch?.id || null
      setPitchId(currentPitchId)
      setPitchData(pitch ? { title: pitch.title, pitch_text: pitch.pitch_text } : null)

      // Fetch conversion metrics (handle case when no pitch exists)
      const [viewsResult, likesResult, sharesResult, endorsementsResult, emailsResult, callsResult, supportersResult] = await Promise.all([
              // Pitch views (from pitch_views or similar table)
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
        pitchViews: viewsResult,
        likes: likesResult,
        shares: sharesResult,
        endorsements: endorsementsResult,
        emails: emailsResult,
        calls: callsResult,
        totalSupporters: supportersResult
      })


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

  const handleCreateOrSharePitch = () => {
    if (!pitchId) {
      window.open('/pitch/new', '_blank')
    } else {
      setShowShareModal(true)
    }
  }

  const handleInviteSupporters = () => {
    window.open('/supporter/refer', '_blank')
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
                Welcome back, {profile?.name || profile?.full_name || 'Veteran'}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Your success dashboard - see how your pitch is performing
              </p>
              {!pitchId && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Ready to get opportunities?</strong> Create your pitch and start sharing it with people. Jobs and opportunities will come your way!
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <SmartNotifications 
                userId={user.id} 
                pitchId={pitchId || undefined}
                className="mr-2"
              />
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
                <p className="text-sm font-medium text-gray-600">Pitch Views</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.pitchViews || 0}</p>
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
            <h2 className="text-lg font-semibold text-gray-900">Your Journey to Opportunities</h2>
            <p className="text-sm text-gray-600">See how people discover and connect with you</p>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap justify-center items-center gap-4">
              {/* Pitch Views */}
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Pitch Views</p>
                <p className="text-2xl font-bold text-blue-600">{metrics?.pitchViews || 0}</p>
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
                  {metrics?.pitchViews ? Math.round((metrics.likes / metrics.pitchViews) * 100) : 0}% conversion
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

        {/* Live Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Live Activity Ticker */}
          <div className="lg:col-span-1">
            <LiveActivityTicker pitchId={pitchId || undefined} />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Take Action</h2>
              <p className="text-sm text-gray-600">Share your pitch and invite people to help you succeed</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleCreateOrSharePitch}
                  className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  {pitchId ? 'Share Your Pitch' : 'Create Your Pitch'}
                </button>
                 
                <button
                  onClick={handleInviteSupporters}
                  className={`flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    pitchId 
                      ? 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                      : 'text-gray-400 bg-gray-300 cursor-not-allowed'
                  }`}
                  disabled={!pitchId}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Invite Supporters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Features and Supporters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* AI Contact Suggestions */}
          <div>
            <AIContactSuggestions 
              userId={user.id} 
              pitchId={pitchId || undefined}
            />
          </div>

          {/* Supporters Wall */}
          <div>
            <SupportersWall 
              pitchId={pitchId || undefined}
            />
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && pitchData && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            pitchId={pitchId!}
            pitchTitle={pitchData.title}
            pitchText={pitchData.pitch_text}
                                veteranName={profile?.name || profile?.full_name || 'Veteran'}
          />
        )}

      </div>
    </div>
  )
}
