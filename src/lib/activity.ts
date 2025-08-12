import { createActionClient } from '@/lib/supabase-server'
import type { Database } from '@/types/live-schema'

type ActivityType = 
  | 'pitch_viewed'
  | 'pitch_liked'
  | 'pitch_unliked'
  | 'endorsement_created'
  | 'resume_requested'
  | 'resume_approved'
  | 'resume_declined'
  | 'donation_received'
  | 'referral_created'
  | 'contact_made'
  | 'user_registered'
  | 'user_logged_in'
  | 'plan_purchased'
  | 'plan_expired'

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

    // Transform the data to match ActivityLog interface
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      activity_type: item.activity_type,
      activity_data: (item.activity_data as Record<string, any>) || {},
      created_at: item.created_at,
      ip_address: item.ip_address,
      user_agent: item.user_agent
    }))
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

    // Transform the data to match ActivityLog interface
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      activity_type: item.activity_type,
      activity_data: (item.activity_data as Record<string, any>) || {},
      created_at: item.created_at,
      ip_address: item.ip_address,
      user_agent: item.user_agent
    }))
  } catch (error) {
    console.error('Failed to fetch user activity:', error)
    return []
  }
}

// Alias for logUserActivity for backward compatibility
export const logActivity = logUserActivity
