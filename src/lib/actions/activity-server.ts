'use server'

import { createActionClient } from '@/lib/supabase-server'

export interface ActivityLog {
  id: string
  user_id: string | null
  activity_type: string
  activity_data: Record<string, any>
  created_at: string | null
  ip_address?: unknown | null
  user_agent?: string | null
}



export async function logUserActivity(data: {
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

export async function getRecentActivity(limit: number = 10): Promise<ActivityLog[]> {
  try {
    const supabaseAction = await createActionClient()
    
    const { data, error } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch recent activity:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch recent activity:', error)
    return []
  }
}

export async function getUserActivity(userId: string, limit: number = 20): Promise<ActivityLog[]> {
  try {
    const supabaseAction = await createActionClient()
    
    const { data, error } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch user activity:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch user activity:', error)
    return []
  }
}
