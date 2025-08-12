'use server'

import { createActionClient } from '@/lib/supabase-server'

export interface ReferralEvent {
  id: string
  referral_id: string
  event_type: string
  platform: string
  user_agent?: string
  ip_address?: string
  metadata?: Record<string, any>
  created_at: string
}



export async function recordEvent(data: {
  referralId: string
  type: string
  platform: string
  userAgent?: string
  ipAddress?: string
  metadata?: Record<string, any>
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseAction = await createActionClient()
    
    const { error } = await supabaseAction
      .from('referral_events')
      .insert({
        referral_id: data.referralId,
        event_type: data.type,
        platform: data.platform,
        user_agent: data.userAgent,
        ip_address: data.ipAddress,
        metadata: data.metadata || {}
      })

    if (error) {
      console.error('Referral event logging error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Referral event logging failed:', error)
    return { success: false, error: 'Failed to log referral event' }
  }
}

export async function getReferralEvents(referralId: string): Promise<ReferralEvent[]> {
  try {
    const supabaseAction = await createActionClient()
    
    const { data, error } = await supabaseAction
      .from('referral_events')
      .select('*')
      .eq('referral_id', referralId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch referral events:', error)
      return []
    }

    return (data as any) || []
  } catch (error) {
    console.error('Failed to fetch referral events:', error)
    return []
  }
}

export async function updateReferralEventFeedback(
  eventId: string, 
  feedback: string, 
  feedbackComment?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseAction = await createActionClient()
    
    const { error } = await supabaseAction
      .from('referral_events')
      .update({
        feedback: feedback,
        feedback_comment: feedbackComment,
        feedback_at: new Date().toISOString()
      })
      .eq('id', eventId)

    if (error) {
      console.error('Failed to update referral event feedback:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to update referral event feedback:', error)
    return { success: false, error: 'Failed to update feedback' }
  }
}
