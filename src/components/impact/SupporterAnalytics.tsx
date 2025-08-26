'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { 
  TrendingUp, TrendingDown, Users, Share2, Star, Gift, Eye, Phone, Mail,
  BarChart3, Activity, Target, Award, Calendar, ArrowUpRight, ArrowDownRight,
  Download, Filter, RefreshCw, Zap, Trophy, Heart, MessageCircle
} from 'lucide-react'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import LineChart from '@/components/charts/LineChart'

// =====================================================
// WORLD-CLASS SUPPORTER ANALYTICS COMPONENT
// Enterprise-Grade Professional Implementation
// =====================================================

interface SupporterAnalyticsData {
  // Core Metrics
  totalImpact: number
  totalVeteransHelped: number
  totalReferrals: number
  totalEndorsements: number
  totalDonations: number
  totalViews: number
  totalCalls: number
  totalEmails: number
  
  // Performance Metrics
  conversionRate: number
  engagementRate: number
  referralSuccessRate: number
  averageResponseTime: number
  
  // Growth Metrics
  monthlyGrowth: number
  weeklyGrowth: number
  dailyGrowth: number
  
  // Funnel Data
  funnelData: {
    awareness: number
    interest: number
    action: number
    conversion: number
  }
  
  // Activity Timeline
  activityTimeline: Array<{
    date: string
    referrals: number
    endorsements: number
    donations: number
    views: number
  }>
  
  // Channel Performance
  channelPerformance: Array<{
    channel: string
    referrals: number
    views: number
    conversions: number
    conversionRate: number
  }>
  
  // Veteran Impact
  veteranImpact: Array<{
    veteranId: string
    veteranName: string
    pitchTitle: string
    referrals: number
    views: number
    calls: number
    emails: number
    totalImpact: number
  }>
  
  // Achievement Progress
  achievements: Array<{
    id: string
    title: string
    description: string
    current: number
    target: number
    progress: number
    icon: string
    category: string
  }>
}

interface SupporterAnalyticsProps {
  userId: string
  timeRange?: '7d' | '30d' | '90d' | '1y'
}

export default function SupporterAnalytics({ userId, timeRange = '30d' }: SupporterAnalyticsProps) {
  const [data, setData] = useState<SupporterAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)
  const [selectedMetric, setSelectedMetric] = useState<'referrals' | 'endorsements' | 'donations' | 'views'>('referrals')

  useEffect(() => {
    fetchAnalyticsData()
  }, [userId, selectedTimeRange])

  async function fetchAnalyticsData() {
    try {
      setIsLoading(true)
      setError(null)
      
      const supabase = createSupabaseBrowser()
      
      // Calculate date range
      const now = new Date()
      const daysAgo = selectedTimeRange === '7d' ? 7 : 
                     selectedTimeRange === '30d' ? 30 : 
                     selectedTimeRange === '90d' ? 90 : 365
      const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
      
      // Fetch comprehensive analytics data
      const [
        { data: referrals },
        { data: endorsements },
        { data: donations },
        { data: activityLog },
        { data: referralEvents },
        { data: userProfiles }
      ] = await Promise.all([
        supabase
          .from('referrals')
          .select('*, pitches(*)')
          .eq('user_id', userId)
          .gte('created_at', startDate.toISOString()),
        
        // Note: endorsements table has incomplete schema (endorser_user_id doesn't exist)
        // Skip endorsements until schema is properly migrated
        Promise.resolve({ data: [], error: null }),
        
        // Note: donations table has limited schema (user_id doesn't exist)
        // Skip donations until schema is properly migrated
        Promise.resolve({ data: [], error: null }),
        
        // Note: user_activity_log table doesn't exist in live schema
        // Skip activity log until table is created
        Promise.resolve({ data: [], error: null }),
        
        supabase
          .from('tracking_events')
          .select('*')
          .eq('user_id', userId)
          .gte('occurred_at', startDate.toISOString()),
        
        supabase
          .from('users')
          .select('id, name, avatar_url')
          .in('role', ['veteran'])
      ])

      // Process and calculate analytics
      const analyticsData = processAnalyticsData({
        referrals: referrals || [],
        endorsements: endorsements || [],
        donations: donations || [],
        activityLog: activityLog || [],
        referralEvents: referralEvents || [],
        userProfiles: userProfiles || [],
        startDate,
        endDate: now
      })
      
      setData(analyticsData)
      
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      setError('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  function processAnalyticsData(rawData: any): SupporterAnalyticsData {
    const { referrals, endorsements, donations, activityLog, referralEvents, userProfiles, startDate, endDate } = rawData
    
    // Calculate core metrics
    const totalReferrals = referrals.length
    const totalEndorsements = endorsements.length
    const totalDonations = donations.length
    const totalDonationAmount = donations.reduce((sum: number, d: any) => sum + (d.amount_cents || 0), 0) / 100
    
    // Calculate views, calls, emails from activity log
    const views = activityLog.filter((a: any) => a.activity_type === 'pitch_viewed').length
    const calls = activityLog.filter((a: any) => a.activity_type === 'call_clicked').length
    const emails = activityLog.filter((a: any) => a.activity_type === 'email_clicked').length
    
    // Calculate conversion rates
    const conversionRate = views > 0 ? ((calls + emails) / views) * 100 : 0
    const engagementRate = totalReferrals > 0 ? (views / totalReferrals) * 100 : 0
    const referralSuccessRate = totalReferrals > 0 ? (referralEvents.length / totalReferrals) * 100 : 0
    
    // Calculate impact score
    const totalImpact = (totalDonationAmount * 10) + (totalReferrals * 50) + (totalEndorsements * 25) + (activityLog.length * 5)
    
    // Generate activity timeline
    const timeline = generateActivityTimeline(activityLog, startDate, endDate)
    
    // Generate channel performance
    const channels = generateChannelPerformance(referralEvents, referrals)
    
    // Generate veteran impact
    const veteranImpact = generateVeteranImpact(referrals, endorsements, referralEvents, userProfiles)
    
    // Generate achievements
    const achievements = generateAchievements({
      referrals: totalReferrals,
      endorsements: totalEndorsements,
      donations: totalDonations,
      impact: totalImpact,
      views,
      calls,
      emails
    })
    
    return {
      totalImpact,
      totalVeteransHelped: new Set([...referrals.map((r: any) => r.pitch?.user_id), ...endorsements.map((e: any) => e.pitch?.user_id)]).size,
      totalReferrals,
      totalEndorsements,
      totalDonations,
      totalViews: views,
      totalCalls: calls,
      totalEmails: emails,
      conversionRate,
      engagementRate,
      referralSuccessRate,
      averageResponseTime: calculateAverageResponseTime(referralEvents),
      monthlyGrowth: calculateGrowthRate(activityLog, 30),
      weeklyGrowth: calculateGrowthRate(activityLog, 7),
      dailyGrowth: calculateGrowthRate(activityLog, 1),
      funnelData: {
        awareness: totalReferrals,
        interest: views,
        action: calls + emails,
        conversion: referralEvents.length
      },
      activityTimeline: timeline,
      channelPerformance: channels,
      veteranImpact,
      achievements
    }
  }

  function generateActivityTimeline(activityLog: any[], startDate: Date, endDate: Date) {
    const timeline: Array<{
      date: string
      referrals: number
      endorsements: number
      donations: number
      views: number
    }> = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]!
      const dayActivities = activityLog.filter((a: any) => 
        a.created_at.startsWith(dateStr)
      )
      
      timeline.push({
        date: dateStr,
        referrals: dayActivities.filter((a: any) => a.activity_type === 'referral_created').length,
        endorsements: dayActivities.filter((a: any) => a.activity_type === 'endorsement_created').length,
        donations: dayActivities.filter((a: any) => a.activity_type === 'donation_made').length,
        views: dayActivities.filter((a: any) => a.activity_type === 'pitch_viewed').length
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return timeline
  }

  function generateChannelPerformance(referralEvents: any[], referrals: any[]) {
    const channels = ['Direct', 'Email', 'LinkedIn', 'Twitter', 'WhatsApp', 'Other']
    
    return channels.map(channel => {
      const channelReferrals = referrals.filter((r: any) => r.platform === channel).length
      const channelEvents = referralEvents.filter((e: any) => e.platform === channel).length
      const channelViews = referralEvents.filter((e: any) => e.platform === channel && e.event_type === 'view').length
      
      return {
        channel,
        referrals: channelReferrals,
        views: channelViews,
        conversions: channelEvents,
        conversionRate: channelReferrals > 0 ? (channelEvents / channelReferrals) * 100 : 0
      }
    }).filter(c => c.referrals > 0)
  }

  function generateVeteranImpact(referrals: any[], endorsements: any[], referralEvents: any[], userProfiles: any[]) {
    const veteranMap = new Map()
    
    // Process referrals
    referrals.forEach((referral: any) => {
      const veteranId = referral.pitch?.user_id
      if (veteranId) {
        const veteran = userProfiles.find((u: any) => u.id === veteranId)
        if (!veteranMap.has(veteranId)) {
          veteranMap.set(veteranId, {
            veteranId,
            veteranName: veteran?.name || 'Unknown Veteran',
            pitchTitle: referral.pitch?.title || 'Unknown Pitch',
            referrals: 0,
            views: 0,
            calls: 0,
            emails: 0,
            totalImpact: 0
          })
        }
        veteranMap.get(veteranId).referrals++
      }
    })
    
    // Process endorsements
    endorsements.forEach((endorsement: any) => {
      const veteranId = endorsement.pitch?.user_id
      if (veteranId && veteranMap.has(veteranId)) {
        veteranMap.get(veteranId).totalImpact += 25
      }
    })
    
    // Process referral events
    referralEvents.forEach((event: any) => {
      const veteranId = event.veteran_id
      if (veteranId && veteranMap.has(veteranId)) {
        const veteran = veteranMap.get(veteranId)
        if (event.event_type === 'view') veteran.views++
        if (event.event_type === 'call') veteran.calls++
        if (event.event_type === 'email') veteran.emails++
        veteran.totalImpact += 10
      }
    })
    
    return Array.from(veteranMap.values()).sort((a, b) => b.totalImpact - a.totalImpact)
  }

  function generateAchievements(metrics: any) {
    const achievements = []
    
    // Referral achievements
    if (metrics.referrals >= 1) achievements.push({
      id: 'first_referral',
      title: 'First Referral',
      description: 'Made your first veteran referral',
      current: metrics.referrals,
      target: 1,
      progress: Math.min((metrics.referrals / 1) * 100, 100),
      icon: '🔗',
      category: 'referral'
    })
    
    if (metrics.referrals >= 5) achievements.push({
      id: 'referral_master',
      title: 'Referral Master',
      description: 'Referred 5+ veterans',
      current: metrics.referrals,
      target: 5,
      progress: Math.min((metrics.referrals / 5) * 100, 100),
      icon: '🎯',
      category: 'referral'
    })
    
    // Endorsement achievements
    if (metrics.endorsements >= 1) achievements.push({
      id: 'first_endorsement',
      title: 'First Endorsement',
      description: 'Endorsed your first veteran',
      current: metrics.endorsements,
      target: 1,
      progress: Math.min((metrics.endorsements / 1) * 100, 100),
      icon: '⭐',
      category: 'endorsement'
    })
    
    // Impact achievements
    if (metrics.impact >= 100) achievements.push({
      id: 'bronze_impact',
      title: 'Bronze Impact',
      description: 'Reached 100 impact points',
      current: metrics.impact,
      target: 100,
      progress: Math.min((metrics.impact / 100) * 100, 100),
      icon: '🥉',
      category: 'impact'
    })
    
    if (metrics.impact >= 500) achievements.push({
      id: 'silver_impact',
      title: 'Silver Impact',
      description: 'Reached 500 impact points',
      current: metrics.impact,
      target: 500,
      progress: Math.min((metrics.impact / 500) * 100, 100),
      icon: '🥈',
      category: 'impact'
    })
    
    return achievements
  }

  function calculateGrowthRate(activityLog: any[], days: number) {
    const now = new Date()
    const periodStart = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
    const previousPeriodStart = new Date(periodStart.getTime() - (days * 24 * 60 * 60 * 1000))
    
    const currentPeriod = activityLog.filter((a: any) => 
      new Date(a.created_at) >= periodStart
    ).length
    
    const previousPeriod = activityLog.filter((a: any) => 
      new Date(a.created_at) >= previousPeriodStart && new Date(a.created_at) < periodStart
    ).length
    
    return previousPeriod > 0 ? ((currentPeriod - previousPeriod) / previousPeriod) * 100 : 0
  }

  function calculateAverageResponseTime(referralEvents: any[]) {
    if (referralEvents.length === 0) return 0
    
    const responseTimes = referralEvents
      .filter((e: any) => e.response_time)
      .map((e: any) => e.response_time)
    
    return responseTimes.length > 0 ? 
      responseTimes.reduce((sum: number, time: number) => sum + time, 0) / responseTimes.length : 0
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="text-center py-12">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="text-center py-12">
          <div className="text-gray-500 text-4xl mb-4">📊</div>
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Support Impact</h2>
          <p className="text-gray-600">See how your contributions are helping veterans succeed</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={fetchAnalyticsData}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className={`flex items-center text-sm ${
              data.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.monthlyGrowth >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {Math.abs(data.monthlyGrowth).toFixed(1)}%
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{data.totalImpact}</h3>
          <p className="text-sm text-gray-600">Total Impact Score</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className={`flex items-center text-sm ${
              data.weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.weeklyGrowth >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {Math.abs(data.weeklyGrowth).toFixed(1)}%
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{data.totalVeteransHelped}</h3>
          <p className="text-sm text-gray-600">Veterans Helped</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Share2 className="w-6 h-6 text-purple-600" />
            </div>
            <div className={`flex items-center text-sm ${
              data.dailyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.dailyGrowth >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {Math.abs(data.dailyGrowth).toFixed(1)}%
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{data.totalReferrals}</h3>
          <p className="text-sm text-gray-600">Total Referrals</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4 inline mr-1" />
              {data.conversionRate.toFixed(1)}%
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{data.conversionRate.toFixed(1)}%</h3>
          <p className="text-sm text-gray-600">Conversion Rate</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Timeline */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
            >
              <option value="referrals">Referrals</option>
              <option value="endorsements">Endorsements</option>
              <option value="donations">Donations</option>
              <option value="views">Views</option>
            </select>
          </div>
          <LineChart
            title=""
            data={data.activityTimeline.map(item => ({
              label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              value: item[selectedMetric]
            }))}
            height={250}
            color="#8B5CF6"
          />
        </div>

        {/* Funnel Analysis */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Impact Funnel</h3>
          <div className="space-y-4">
            {Object.entries(data.funnelData).map(([stage, value], index) => (
              <div key={stage} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900 capitalize">{stage}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{value}</div>
                  <div className="text-xs text-gray-500">
                    {index > 0 ? (() => {
                      const prevValue = Object.values(data.funnelData)[index - 1]
                      return prevValue && prevValue > 0 ? `${((value / prevValue) * 100).toFixed(1)}%` : '0%'
                    })() : '100%'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Channel Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.channelPerformance.map((channel, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 mb-1">{channel.referrals}</div>
              <div className="text-sm text-gray-600 mb-2">{channel.channel}</div>
              <div className="text-xs text-green-600 font-medium">
                {channel.conversionRate.toFixed(1)}% conversion
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Veteran Impact */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Veterans Impacted</h3>
        <div className="space-y-4">
          {data.veteranImpact.slice(0, 5).map((veteran, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{veteran.veteranName}</div>
                  <div className="text-sm text-gray-600">{veteran.pitchTitle}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">{veteran.totalImpact} pts</div>
                <div className="text-xs text-gray-500">
                  {veteran.referrals} refs • {veteran.views} views
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Achievement Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.achievements.map((achievement) => (
            <div key={achievement.id} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <div className="font-medium text-gray-900">{achievement.title}</div>
                  <div className="text-xs text-gray-600">{achievement.description}</div>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>{achievement.current} / {achievement.target}</span>
                  <span>{Math.round(achievement.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${achievement.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
