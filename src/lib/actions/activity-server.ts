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
    
    // Note: user_activity_log table doesn't exist in live schema
    // Skip logging activity until schema is properly migrated
    // const { error } = await supabaseAction
    //   .from('user_activity_log')
    //   .insert({
    //     user_id: data.user_id,
    //     activity_type: data.activity_type,
    //     activity_data: data.activity_data || {}
    //   })
    const error = null

    if (error) {
      console.error('Activity logging error:', error)
      return { success: false, error: 'Activity logging failed' }
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
    
    // Note: user_activity_log table doesn't exist in live schema
    // Skip fetching activity until schema is properly migrated
    // const { data, error } = await supabaseAction
    //   .from('user_activity_log')
    //   .select('*')
    //   .order('created_at', { ascending: false })
    //   .limit(limit)
    const data: any[] = []
    const error = null

    if (error) {
      console.error('Failed to fetch recent activity:', error)
      return []
    }

    return (data as any) || []
  } catch (error) {
    console.error('Failed to fetch recent activity:', error)
    return []
  }
}

export async function getUserActivity(userId: string, limit: number = 20): Promise<ActivityLog[]> {
  try {
    const supabaseAction = await createActionClient()
    
    // Note: user_activity_log table doesn't exist in live schema
    // Skip fetching user activity until schema is properly migrated
    // const { data, error } = await supabaseAction
    //   .from('user_activity_log')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .order('created_at', { ascending: false })
    //   .limit(limit)
    const data: any[] = []
    const error = null

    if (error) {
      console.error('Failed to fetch user activity:', error)
      return []
    }

    return (data as any) || []
  } catch (error) {
    console.error('Failed to fetch user activity:', error)
    return []
  }
}

export async function logEmail(data: {
  user_id: string
  email_type: string
  email_data?: Record<string, any>
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseAction = await createActionClient()
    
    // Note: user_activity_log table doesn't exist in live schema
    // Skip logging email activity until schema is properly migrated
    // const { error } = await supabaseAction
    //   .from('user_activity_log')
    //   .insert({
    //     user_id: data.user_id,
    //     activity_type: `email_${data.email_type}`,
    //     activity_data: data.email_data || {}
    //   })
    const error = null

    if (error) {
      console.error('Email logging error:', error)
      return { success: false, error: 'Email logging failed' }
    }

    return { success: true }
  } catch (error) {
    console.error('Email logging failed:', error)
    return { success: false, error: 'Failed to log email' }
  }
}
