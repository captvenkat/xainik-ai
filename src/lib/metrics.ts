import { createActionClient } from '@/lib/supabase-server'

export interface DashboardMetrics {
  totalUsers: number
  totalPitches: number
  totalEndorsements: number
  totalDonations: number
  activeSubscriptions: number
  recentActivity: any[]
}

export interface AnalyticsMetrics {
  totalViews: number
  totalClicks: number
  totalConversions: number
  conversionRate: number
  recentActivity: any[]
  performanceInsights?: {
    suggestions: any[]
    lowViews: any[]
    lowConversions: any[]
  }
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const supabaseAction = await createActionClient()

    // Get counts
    const [
      { count: totalUsers },
      { count: totalPitches },
      { count: totalEndorsements },
      { count: totalDonations },
      { count: activeSubscriptions }
    ] = await Promise.all([
      supabaseAction.from('users').select('*', { count: 'exact', head: true }),
      supabaseAction.from('pitches').select('*', { count: 'exact', head: true }),
      supabaseAction.from('endorsements').select('*', { count: 'exact', head: true }),
      supabaseAction.from('donations').select('*', { count: 'exact', head: true }),
      supabaseAction.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active')
    ])

    // Get recent activity
    const { data: recentActivity } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    return {
      totalUsers: totalUsers || 0,
      totalPitches: totalPitches || 0,
      totalEndorsements: totalEndorsements || 0,
      totalDonations: totalDonations || 0,
      activeSubscriptions: activeSubscriptions || 0,
      recentActivity: recentActivity || []
    }
  } catch (error) {
    console.error('Failed to get dashboard metrics:', error)
    return {
      totalUsers: 0,
      totalPitches: 0,
      totalEndorsements: 0,
      totalDonations: 0,
      activeSubscriptions: 0,
      recentActivity: []
    }
  }
}

export async function getUserMetrics(userId: string): Promise<any> {
  try {
    const supabaseAction = await createActionClient()

    // Get user-specific metrics
    const [
      { count: userPitches },
      { count: userEndorsements },
      { data: userActivity }
    ] = await Promise.all([
      supabaseAction.from('pitches').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabaseAction.from('endorsements').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabaseAction.from('user_activity_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
    ])

    return {
      pitches: userPitches || 0,
      endorsements: userEndorsements || 0,
      recentActivity: userActivity || []
    }
  } catch (error) {
    console.error('Failed to get user metrics:', error)
    return {
      pitches: 0,
      endorsements: 0,
      recentActivity: []
    }
  }
}

export async function getRecruiterMetrics(userId: string): Promise<any> {
  try {
    const supabaseAction = await createActionClient()

    // Get recruiter-specific metrics
    const [
      { count: savedFilters },
      { count: resumeRequests },
      { data: recentActivity }
    ] = await Promise.all([
      supabaseAction.from('recruiter_saved_filters').select('*', { count: 'exact', head: true }).eq('recruiter_user_id', userId),
      supabaseAction.from('resume_requests').select('*', { count: 'exact', head: true }).eq('recruiter_user_id', userId),
      supabaseAction.from('user_activity_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
    ])

    return {
      savedFilters: savedFilters || 0,
      resumeRequests: resumeRequests || 0,
      recentActivity: recentActivity || []
    }
  } catch (error) {
    console.error('Failed to get recruiter metrics:', error)
    return {
      savedFilters: 0,
      resumeRequests: 0,
      recentActivity: []
    }
  }
}

export async function getRecruiterAnalytics(userId: string): Promise<any> {
  try {
    const supabaseAction = await createActionClient()

    // Get recruiter analytics data
    const { data: analytics } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_type', 'recruiter_action')
      .order('created_at', { ascending: false })
      .limit(50)

    return {
      analytics: analytics || [],
      totalActions: analytics?.length || 0
    }
  } catch (error) {
    console.error('Failed to get recruiter analytics:', error)
    return {
      analytics: [],
      totalActions: 0
    }
  }
}

export async function getSupporterMetrics(userId: string): Promise<any> {
  try {
    const supabaseAction = await createActionClient()

    // Get supporter-specific metrics
    const [
      { count: totalDonations },
      { count: totalEndorsements },
      { data: recentActivity }
    ] = await Promise.all([
      supabaseAction.from('donations').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabaseAction.from('endorsements').select('*', { count: 'exact', head: true }).eq('endorser_user_id', userId),
      supabaseAction.from('user_activity_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
    ])

    return {
      totalDonations: totalDonations || 0,
      totalEndorsements: totalEndorsements || 0,
      recentActivity: recentActivity || []
    }
  } catch (error) {
    console.error('Failed to get supporter metrics:', error)
    return {
      totalDonations: 0,
      totalEndorsements: 0,
      recentActivity: []
    }
  }
}

export async function getVeteranMetrics(userId: string): Promise<any> {
  try {
    const supabaseAction = await createActionClient()

    // Get veteran-specific metrics
    const [
      { count: totalPitches },
      { count: totalEndorsements },
      { data: recentActivity }
    ] = await Promise.all([
      supabaseAction.from('pitches').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabaseAction.from('endorsements').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabaseAction.from('user_activity_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
    ])

    return {
      totalPitches: totalPitches || 0,
      totalEndorsements: totalEndorsements || 0,
      recentActivity: recentActivity || []
    }
  } catch (error) {
    console.error('Failed to get veteran metrics:', error)
    return {
      totalPitches: 0,
      totalEndorsements: 0,
      recentActivity: []
    }
  }
}

export async function getVeteranAnalytics(userId: string): Promise<any> {
  try {
    const supabaseAction = await createActionClient()

    // Get veteran analytics data
    const { data: analytics } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_type', 'pitch_view')
      .order('created_at', { ascending: false })
      .limit(50)

    return {
      analytics: analytics || [],
      totalViews: analytics?.length || 0
    }
  } catch (error) {
    console.error('Failed to get veteran analytics:', error)
    return {
      analytics: [],
      totalViews: 0
    }
  }
}

export async function getTrendlineAllPitches(): Promise<any> {
  try {
    const supabaseAction = await createActionClient()

    // Get trendline data for all pitches
    const { data: trendline } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .eq('activity_type', 'pitch_view')
      .order('created_at', { ascending: true })
      .limit(100)

    return {
      trendline: trendline || [],
      totalViews: trendline?.length || 0
    }
  } catch (error) {
    console.error('Failed to get trendline data:', error)
    return {
      trendline: [],
      totalViews: 0
    }
  }
}

export async function getCohortsBySource(): Promise<any> {
  try {
    const supabaseAction = await createActionClient()

    // Get cohort data by source
    const { data: cohorts } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .eq('activity_type', 'user_registered')
      .order('created_at', { ascending: false })
      .limit(50)

    return {
      cohorts: cohorts || [],
      totalUsers: cohorts?.length || 0
    }
  } catch (error) {
    console.error('Failed to get cohort data:', error)
    return {
      cohorts: [],
      totalUsers: 0
    }
  }
}

export async function getAvgTimeToFirstContact(): Promise<any> {
  try {
    const supabaseAction = await createActionClient()

    // Get average time to first contact data
    const { data: contacts } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .eq('activity_type', 'first_contact')
      .order('created_at', { ascending: false })
      .limit(100)

    return {
      avgTime: contacts?.length ? 24 : 0, // Mock data for now
      totalContacts: contacts?.length || 0
    }
  } catch (error) {
    console.error('Failed to get average time data:', error)
    return {
      avgTime: 0,
      totalContacts: 0
    }
  }
}
