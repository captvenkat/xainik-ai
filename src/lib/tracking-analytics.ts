// Professional Tracking Analytics - Central entities: user_id, pitch_id
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

// Get user tracking summary (central source of truth)
export async function getUserTrackingSummary(userId: string) {
  try {
    const supabase = createSupabaseBrowser()
    
    const { data: summary, error } = await supabase
      .from('user_tracking_summary')
      .select('*')
      .eq('user_id', userId) // Central source of truth
      .single()

    if (error) throw error
    
    return summary || {
      user_id: userId,
      total_pitches: 0,
      total_views: 0,
      total_calls: 0,
      total_emails: 0,
      total_shares: 0,
      total_conversions: 0,
      total_engagement_time: 0,
      avg_conversion_rate: 0,
      avg_engagement_rate: 0,
      viral_coefficient: 0,
      last_activity_at: null
    }
  } catch (error) {
    console.error('Error fetching user tracking summary:', error)
    return null
  }
}

// Get pitch metrics (central tracking entity)
export async function getPitchMetrics(pitchId: string, userId: string) {
  try {
    const supabase = createSupabaseBrowser()
    
    const { data: metrics, error } = await supabase
      .from('pitch_metrics')
      .select('*')
      .eq('pitch_id', pitchId) // Central tracking entity
      .eq('user_id', userId) // Central source of truth
      .single()

    if (error) throw error
    
    return metrics || {
      user_id: userId,
      pitch_id: pitchId,
      total_views: 0,
      total_calls: 0,
      total_emails: 0,
      total_shares: 0,
      total_linkedin_clicks: 0,
      total_resume_requests: 0,
      total_conversions: 0,
      total_engagement_time: 0,
      avg_engagement_time: 0,
      scroll_depth_25_count: 0,
      scroll_depth_50_count: 0,
      scroll_depth_75_count: 0,
      time_30_count: 0,
      time_60_count: 0,
      time_120_count: 0,
      last_activity_at: null
    }
  } catch (error) {
    console.error('Error fetching pitch metrics:', error)
    return null
  }
}

// Get all pitch metrics for a user
export async function getAllPitchMetrics(userId: string) {
  try {
    const supabase = createSupabaseBrowser()
    
    const { data: metrics, error } = await supabase
      .from('pitch_metrics')
      .select(`
        *,
        pitches (
          id,
          title,
          is_active
        )
      `)
      .eq('user_id', userId) // Central source of truth
      .order('last_activity_at', { ascending: false })

    if (error) throw error
    
    return metrics || []
  } catch (error) {
    console.error('Error fetching all pitch metrics:', error)
    return []
  }
}

// Get daily tracking metrics
export async function getDailyTrackingMetrics(pitchId: string, userId: string, days: number = 30) {
  try {
    const supabase = createSupabaseBrowser()
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const { data: metrics, error } = await supabase
      .from('daily_tracking_metrics')
      .select('*')
      .eq('pitch_id', pitchId) // Central tracking entity
      .eq('user_id', userId) // Central source of truth
      .gte('date', startDate)
      .order('date', { ascending: true })

    if (error) throw error
    
    return metrics || []
  } catch (error) {
    console.error('Error fetching daily tracking metrics:', error)
    return []
  }
}

// Get platform metrics
export async function getPlatformMetrics(pitchId: string, userId: string, days: number = 30) {
  try {
    const supabase = createSupabaseBrowser()
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const { data: metrics, error } = await supabase
      .from('platform_metrics')
      .select('*')
      .eq('pitch_id', pitchId) // Central tracking entity
      .eq('user_id', userId) // Central source of truth
      .gte('date', startDate)
      .order('date', { ascending: false })

    if (error) throw error
    
    return metrics || []
  } catch (error) {
    console.error('Error fetching platform metrics:', error)
    return []
  }
}

// Get attribution chains for a pitch
export async function getAttributionChains(pitchId: string, userId: string) {
  try {
    const supabase = createSupabaseBrowser()
    
    const { data: chains, error } = await supabase
      .from('attribution_chains')
      .select(`
        *,
        referrals (
          id,
          supporter_id,
          share_link,
          platform,
          source_type,
          created_at
        ),
        users!attribution_chains_original_supporter_id_fkey (
          id,
          name,
          email
        )
      `)
      .eq('pitch_id', pitchId) // Central tracking entity
      .eq('user_id', userId) // Central source of truth
      .order('last_activity_at', { ascending: false })

    if (error) throw error
    
    return chains || []
  } catch (error) {
    console.error('Error fetching attribution chains:', error)
    return []
  }
}

// Get supporter performance for a pitch
export async function getSupporterPerformance(pitchId: string, userId: string) {
  try {
    const supabase = createSupabaseBrowser()
    
    const { data: performance, error } = await supabase
      .from('supporter_performance')
      .select(`
        *,
        users!supporter_performance_supporter_id_fkey (
          id,
          name,
          email
        )
      `)
      .eq('pitch_id', pitchId) // Central tracking entity
      .eq('user_id', userId) // Central source of truth
      .order('attribution_value', { ascending: false })

    if (error) throw error
    
    return performance || []
  } catch (error) {
    console.error('Error fetching supporter performance:', error)
    return []
  }
}

// Get recent tracking events
export async function getRecentTrackingEvents(pitchId: string, userId: string, limit: number = 50) {
  try {
    const supabase = createSupabaseBrowser()
    
    const { data: events, error } = await supabase
      .from('tracking_events')
      .select(`
        *,
        referrals (
          id,
          supporter_id,
          platform,
          source_type
        )
      `)
      .eq('pitch_id', pitchId) // Central tracking entity
      .eq('user_id', userId) // Central source of truth
      .order('occurred_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    
    return events || []
  } catch (error) {
    console.error('Error fetching recent tracking events:', error)
    return []
  }
}

// Get real-time metrics for today
export async function getTodayMetrics(pitchId: string, userId: string) {
  try {
    const supabase = createSupabaseBrowser()
    
    const today = new Date().toISOString().split('T')[0]
    
    const { data: metrics, error } = await supabase
      .from('daily_tracking_metrics')
      .select('*')
      .eq('pitch_id', pitchId) // Central tracking entity
      .eq('user_id', userId) // Central source of truth
      .eq('date', today)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    
    return metrics || {
      user_id: userId,
      pitch_id: pitchId,
      date: today,
      views: 0,
      calls: 0,
      emails: 0,
      shares: 0,
      conversions: 0,
      engagement_time: 0,
      unique_visitors: 0
    }
  } catch (error) {
    console.error('Error fetching today metrics:', error)
    return null
  }
}

// Get conversion funnel data
export async function getConversionFunnel(pitchId: string, userId: string, days: number = 30) {
  try {
    const supabase = createSupabaseBrowser()
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    
    // Get all events for the period
    const { data: events, error } = await supabase
      .from('tracking_events')
      .select('event_type, occurred_at')
      .eq('pitch_id', pitchId) // Central tracking entity
      .eq('user_id', userId) // Central source of truth
      .gte('occurred_at', startDate)

    if (error) throw error

    // Calculate funnel
    const views = events?.filter(e => e.event_type === 'PITCH_VIEWED').length || 0
    const calls = events?.filter(e => e.event_type === 'CALL_CLICKED').length || 0
    const emails = events?.filter(e => e.event_type === 'EMAIL_CLICKED').length || 0
    const shares = events?.filter(e => e.event_type === 'SHARE_RESHARED').length || 0
    const conversions = calls + emails

    return {
      views,
      calls,
      emails,
      shares,
      conversions,
      conversionRate: views > 0 ? (conversions / views) * 100 : 0,
      shareRate: views > 0 ? (shares / views) * 100 : 0
    }
  } catch (error) {
    console.error('Error fetching conversion funnel:', error)
    return {
      views: 0,
      calls: 0,
      emails: 0,
      shares: 0,
      conversions: 0,
      conversionRate: 0,
      shareRate: 0
    }
  }
}

// Get engagement metrics
export async function getEngagementMetrics(pitchId: string, userId: string, days: number = 30) {
  try {
    const supabase = createSupabaseBrowser()
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    
    // Get engagement events
    const { data: events, error } = await supabase
      .from('tracking_events')
      .select('event_type, occurred_at')
      .eq('pitch_id', pitchId) // Central tracking entity
      .eq('user_id', userId) // Central source of truth
      .gte('occurred_at', startDate)
      .in('event_type', [
        'SCROLL_25_PERCENT',
        'SCROLL_50_PERCENT',
        'SCROLL_75_PERCENT',
        'TIME_30_SECONDS',
        'TIME_60_SECONDS',
        'TIME_120_SECONDS'
      ])

    if (error) throw error

    // Calculate engagement metrics
    const scroll25 = events?.filter(e => e.event_type === 'SCROLL_25_PERCENT').length || 0
    const scroll50 = events?.filter(e => e.event_type === 'SCROLL_50_PERCENT').length || 0
    const scroll75 = events?.filter(e => e.event_type === 'SCROLL_75_PERCENT').length || 0
    const time30 = events?.filter(e => e.event_type === 'TIME_30_SECONDS').length || 0
    const time60 = events?.filter(e => e.event_type === 'TIME_60_SECONDS').length || 0
    const time120 = events?.filter(e => e.event_type === 'TIME_120_SECONDS').length || 0

    // Get total views for rate calculation
    const { data: viewsData } = await supabase
      .from('tracking_events')
      .select('id')
      .eq('pitch_id', pitchId) // Central tracking entity
      .eq('user_id', userId) // Central source of truth
      .gte('occurred_at', startDate)
      .eq('event_type', 'PITCH_VIEWED')

    const totalViews = viewsData?.length || 0

    return {
      scroll25,
      scroll50,
      scroll75,
      time30,
      time60,
      time120,
      totalViews,
      scroll25Rate: totalViews > 0 ? (scroll25 / totalViews) * 100 : 0,
      scroll50Rate: totalViews > 0 ? (scroll50 / totalViews) * 100 : 0,
      scroll75Rate: totalViews > 0 ? (scroll75 / totalViews) * 100 : 0,
      time30Rate: totalViews > 0 ? (time30 / totalViews) * 100 : 0,
      time60Rate: totalViews > 0 ? (time60 / totalViews) * 100 : 0,
      time120Rate: totalViews > 0 ? (time120 / totalViews) * 100 : 0
    }
  } catch (error) {
    console.error('Error fetching engagement metrics:', error)
    return {
      scroll25: 0,
      scroll50: 0,
      scroll75: 0,
      time30: 0,
      time60: 0,
      time120: 0,
      totalViews: 0,
      scroll25Rate: 0,
      scroll50Rate: 0,
      scroll75Rate: 0,
      time30Rate: 0,
      time60Rate: 0,
      time120Rate: 0
    }
  }
}

// Get viral coefficient analysis
export async function getViralCoefficient(pitchId: string, userId: string) {
  try {
    const supabase = createSupabaseBrowser()
    
    // Get total views and shares
    const { data: events, error } = await supabase
      .from('tracking_events')
      .select('event_type')
      .eq('pitch_id', pitchId) // Central tracking entity
      .eq('user_id', userId) // Central source of truth
      .in('event_type', ['PITCH_VIEWED', 'SHARE_RESHARED'])

    if (error) throw error

    const views = events?.filter(e => e.event_type === 'PITCH_VIEWED').length || 0
    const shares = events?.filter(e => e.event_type === 'SHARE_RESHARED').length || 0

    const viralCoefficient = views > 0 ? (shares / views) * 100 : 0

    return {
      views,
      shares,
      viralCoefficient,
      isViral: viralCoefficient >= 1.0
    }
  } catch (error) {
    console.error('Error fetching viral coefficient:', error)
    return {
      views: 0,
      shares: 0,
      viralCoefficient: 0,
      isViral: false
    }
  }
}

// Get comprehensive dashboard data
export async function getDashboardData(userId: string) {
  try {
    const [
      userSummary,
      allPitchMetrics,
      recentEvents
    ] = await Promise.all([
      getUserTrackingSummary(userId),
      getAllPitchMetrics(userId),
      getRecentTrackingEvents('', userId, 20) // Get recent events across all pitches
    ])

    return {
      userSummary,
      allPitchMetrics,
      recentEvents,
      totalPitches: allPitchMetrics.length,
      activePitches: allPitchMetrics.filter(p => p.pitches?.is_active).length,
      totalViews: allPitchMetrics.reduce((sum, p) => sum + p.total_views, 0),
      totalConversions: allPitchMetrics.reduce((sum, p) => sum + p.total_conversions, 0),
      avgConversionRate: allPitchMetrics.length > 0 
        ? allPitchMetrics.reduce((sum, p) => sum + (p.total_views > 0 ? (p.total_conversions / p.total_views) * 100 : 0), 0) / allPitchMetrics.length
        : 0
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return null
  }
}
