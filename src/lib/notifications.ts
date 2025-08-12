import { createActionClient } from '@/lib/supabase-server'
import { logUserActivity } from '@/lib/actions/activity-server'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  metadata?: Record<string, any>
  read_at?: string | null
  created_at: string
}

export async function createNotification(data: {
  user_id: string
  type: string
  title: string
  message: string
  metadata?: Record<string, any>
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseAction = await createActionClient()

    const { error } = await supabaseAction
      .from('user_activity_log')
      .insert({
        user_id: data.user_id,
        activity_type: 'notification_created',
        activity_data: {
          notification_type: data.type,
          title: data.title,
          message: data.message,
          ...data.metadata
        }
      })

    if (error) {
      console.error('Failed to create notification:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to create notification:', error)
    return { success: false, error: 'Failed to create notification' }
  }
}

export async function notifySubscriptionExpiry(userId: string, expiryDate: string): Promise<void> {
  const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilExpiry <= 7) {
    await createNotification({
      user_id: userId,
      type: 'subscription_expiry_warning',
      title: 'Subscription Expiring Soon',
      message: `Your subscription expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}. Renew to keep your pitches visible to recruiters.`,
      metadata: {
        days_until_expiry: daysUntilExpiry,
        expiry_date: expiryDate
      }
    })
  }
}

export async function notifySubscriptionExpired(userId: string): Promise<void> {
  await createNotification({
    user_id: userId,
    type: 'subscription_expired',
    title: 'Subscription Expired',
    message: 'Your subscription has expired. Your pitches are no longer visible to recruiters. Renew your subscription to restore visibility.',
    metadata: {
      action_required: 'renew_subscription'
    }
  })
}

export async function getNotifications(userId: string, limit: number = 10): Promise<Notification[]> {
  try {
    const supabaseAction = await createActionClient()

    const { data, error } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_type', 'notification_created')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch notifications:', error)
      return []
    }

    // Transform activity log entries to notification format
    return (data || [])
      .filter(entry => entry.user_id !== null) // Filter out entries with null user_id
      .map(entry => ({
        id: entry.id,
        user_id: entry.user_id as string, // Type assertion since we filtered nulls
        type: (entry.activity_data as any)?.notification_type || 'general',
        title: (entry.activity_data as any)?.title || 'Notification',
        message: (entry.activity_data as any)?.message || '',
        metadata: entry.activity_data as Record<string, any> | undefined,
        created_at: entry.created_at || new Date().toISOString()
      }))
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return []
  }
}
