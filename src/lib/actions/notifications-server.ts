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
  
  // Note: notifications table has limited schema in live database
  // Only basic fields are available (id, created_at, updated_at)
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      // Only include fields that exist in the live schema
      // user_id, type, payload_json, channel, status, read_at are missing
      type: 'system',
      user_id: 'system',
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`)
  }
  
  return notification
}

export async function getNotificationsByUserId(userId: string): Promise<NotificationData[]> {
  const supabase = await createActionClient()
  
  // Note: notifications table has limited schema in live database
  // user_id field doesn't exist, so return empty array until schema is migrated
  // const { data: notifications, error } = await supabase
  //   .from('notifications')
  //   .select('*')
  //   .eq('user_id', userId)
  //   .order('created_at', { ascending: false })
  
  // if (error) {
  //   throw new Error(`Failed to get notifications: ${error.message}`)
  // }
  
  return [] // Placeholder until schema is migrated
}

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
  const supabase = await createActionClient()
  
  // Note: notifications table has limited schema in live database
  // read_at and user_id fields don't exist, so skip update until schema is migrated
  // const { error } = await supabase
  //   .from('notifications')
  //   .update({ read_at: new Date().toISOString() })
  //   .eq('id', notificationId)
  //   .eq('user_id', userId)
  
  // if (error) {
  //   throw new Error(`Failed to mark notification as read: ${error.message}`)
  // }
  
  // Placeholder - no operation until schema is migrated
}

export async function notifySubscriptionExpiry(userId: string, subscriptionData: any): Promise<void> {
  // Note: notifications table has limited schema in live database
  // Skip notification creation until schema is migrated
  // await createNotification({
  //   user_id: userId,
  //   type: 'plan_expiry',
  //   payload_json: {
  //     title: 'Subscription Expiring Soon',
  //     message: 'Your subscription will expire in 3 days. Renew to maintain access to premium features.',
  //     data: subscriptionData
  //   },
  //   channel: 'IN_APP',
  //   status: 'PENDING'
  // })
  
  // Placeholder - no operation until schema is migrated
}

export async function notifySubscriptionExpired(userId: string, subscriptionData: any): Promise<void> {
  // Note: notifications table has limited schema in live database
  // Skip notification creation until schema is migrated
  // await createNotification({
  //   user_id: userId,
  //   type: 'plan_expiry',
  //   payload_json: {
  //     title: 'Subscription Expired',
  //     message: 'Your subscription has expired. Renew to restore access to premium features.',
  //     data: subscriptionData
  //   },
  //   channel: 'IN_APP',
  //   status: 'PENDING'
  // })
  
  // Placeholder - no operation until schema is migrated
}
