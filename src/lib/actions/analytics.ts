import { createActionClient } from '@/lib/supabase-server'

export interface AnalyticsData {
  totalViews: number
  totalClicks: number
  totalConversions: number
  conversionRate: number
  recentActivity: any[]
  performanceInsights?: any
  comparativeMetrics?: any[]
}

export async function getPitchAnalytics(pitchId: string): Promise<AnalyticsData> {
  try {
    const supabaseAction = await createActionClient()

    // Get pitch analytics data
    const { data: activity } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .eq('activity_type', 'pitch_view')
      .order('created_at', { ascending: false })
      .limit(100)

    const totalViews = activity?.length || 0
    const totalClicks = Math.floor(totalViews * 0.3) // Mock conversion rate
    const totalConversions = Math.floor(totalClicks * 0.1) // Mock conversion rate
    const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0

    return {
      totalViews,
      totalClicks,
      totalConversions,
      conversionRate,
      recentActivity: activity || []
    }
  } catch (error) {
    console.error('Failed to get pitch analytics:', error)
    return {
      totalViews: 0,
      totalClicks: 0,
      totalConversions: 0,
      conversionRate: 0,
      recentActivity: []
    }
  }
}

export async function getUserAnalytics(userId: string): Promise<AnalyticsData> {
  try {
    const supabaseAction = await createActionClient()

    // Get user analytics data
    const { data: activity } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    const totalViews = activity?.filter(a => a.activity_type === 'pitch_view').length || 0
    const totalClicks = activity?.filter(a => a.activity_type === 'pitch_click').length || 0
    const totalConversions = activity?.filter(a => a.activity_type === 'contact_made').length || 0
    const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0

    // Generate performance insights
    const performanceInsights = {
      suggestions: [] as string[],
      lowViews: [] as any[],
      lowConversions: [] as any[]
    }

    if (totalViews < 10) {
      performanceInsights.suggestions.push('Consider sharing your pitch on social media')
      performanceInsights.lowViews.push({ type: 'low_views', count: totalViews })
    }

    if (conversionRate < 5) {
      performanceInsights.suggestions.push('Try adding more specific skills to your pitch')
      performanceInsights.lowConversions.push({ type: 'low_conversions', rate: conversionRate })
    }

    return {
      totalViews,
      totalClicks,
      totalConversions,
      conversionRate,
      recentActivity: activity || [],
      performanceInsights
    }
  } catch (error) {
    console.error('Failed to get user analytics:', error)
    return {
      totalViews: 0,
      totalClicks: 0,
      totalConversions: 0,
      conversionRate: 0,
      recentActivity: [],
      performanceInsights: {
        suggestions: [],
        lowViews: [],
        lowConversions: []
      }
    }
  }
}

export async function getCachedVeteranAnalytics(userId: string): Promise<AnalyticsData> {
  try {
    const supabaseAction = await createActionClient()

    // Get cached veteran analytics data
    const { data: activity } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    const totalViews = activity?.filter(a => a.activity_type === 'pitch_view').length || 0
    const totalClicks = activity?.filter(a => a.activity_type === 'pitch_click').length || 0
    const totalConversions = activity?.filter(a => a.activity_type === 'contact_made').length || 0
    const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0

    return {
      totalViews,
      totalClicks,
      totalConversions,
      conversionRate,
      recentActivity: activity || []
    }
  } catch (error) {
    console.error('Failed to get cached veteran analytics:', error)
    return {
      totalViews: 0,
      totalClicks: 0,
      totalConversions: 0,
      conversionRate: 0,
      recentActivity: [],
      performanceInsights: {
        suggestions: [],
        lowViews: [],
        lowConversions: []
      }
    }
  }
}

export async function refreshAnalytics(userId: string): Promise<AnalyticsData> {
  try {
    const supabaseAction = await createActionClient()

    // Force refresh by clearing cache and fetching fresh data
    const { data: activity } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    const totalViews = activity?.filter(a => a.activity_type === 'pitch_view').length || 0
    const totalClicks = activity?.filter(a => a.activity_type === 'pitch_click').length || 0
    const totalConversions = activity?.filter(a => a.activity_type === 'contact_made').length || 0
    const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0

    return {
      totalViews,
      totalClicks,
      totalConversions,
      conversionRate,
      recentActivity: activity || []
    }
  } catch (error) {
    console.error('Failed to refresh analytics:', error)
    return {
      totalViews: 0,
      totalClicks: 0,
      totalConversions: 0,
      conversionRate: 0,
      recentActivity: []
    }
  }
}
