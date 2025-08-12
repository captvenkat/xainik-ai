'use server'

import { createActionClient } from '@/lib/supabase-server'
import { Database } from '@/types/live-schema'

type Notification = Database['public']['Tables']['notifications']['Row']
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

export interface NotificationData {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  data?: any
  read: boolean
  created_at: string
}

export async function createNotification(notificationData: Omit<NotificationInsert, 'id'>): Promise<Notification> {
  const supabase = await createActionClient()
  
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert(notificationData)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`)
  }
  
  return notification
}

export async function getNotificationsByUserId(userId: string): Promise<NotificationData[]> {
  const supabase = await createActionClient()
  
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to get notifications: ${error.message}`)
  }
  
  return (notifications as any) || []
}

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
  const supabase = await createActionClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId)
  
  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`)
  }
}

export async function notifySubscriptionExpiry(userId: string, subscriptionData: any): Promise<void> {
  await createNotification({
    user_id: userId,
    type: 'plan_expiry',
    payload_json: {
      title: 'Subscription Expiring Soon',
      message: 'Your subscription will expire in 3 days. Renew to maintain access to premium features.',
      data: subscriptionData
    },
    channel: 'IN_APP',
    status: 'PENDING'
  })
}

export async function notifySubscriptionExpired(userId: string, subscriptionData: any): Promise<void> {
  await createNotification({
    user_id: userId,
    type: 'plan_expiry',
    payload_json: {
      title: 'Subscription Expired',
      message: 'Your subscription has expired. Renew to restore access to premium features.',
      data: subscriptionData
    },
    channel: 'IN_APP',
    status: 'PENDING'
  })
}
