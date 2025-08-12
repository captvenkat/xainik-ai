'use server'

import { createActionClient } from '@/lib/supabase-server'

export interface AnalyticsData {
  totalViews: number
  totalClicks: number
  totalConversions: number
  conversionRate: number
  recentActivity: any[]
  performanceInsights?: {
    suggestions: string[]
    lowViews: any[]
    lowConversions: any[]
  }
}



export async function refreshAnalytics(userId: string, role: string, path: string): Promise<AnalyticsData> {
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
    console.error('Failed to refresh analytics:', error)
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

export async function logActivity(data: {
  user_id: string
  activity_type: string
  activity_data?: Record<string, any>
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseAction = await createActionClient()
    
    const { error } = await supabaseAction
      .from('user_activity_log')
      .insert({
        user_id: data.user_id,
        activity_type: data.activity_type,
        activity_data: data.activity_data || {}
      })

    if (error) {
      console.error('Activity logging error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Activity logging failed:', error)
    return { success: false, error: 'Failed to log activity' }
  }
}
