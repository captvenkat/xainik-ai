import { createActionClient } from '@/lib/supabase-server'

export interface ReferralEvent {
  id: string
  referral_id: string
  event_type: string
  platform: string | null
  user_agent?: string | null
  ip_address?: string | null
  country?: string | null
  ip_hash?: string | null
  feedback?: string | null
  feedback_comment?: string | null
  feedback_at?: string | null
  debounce_key?: string | null
  occurred_at: string
  created_at: string
}

export async function recordEvent(data: {
  referralId: string
  type: string
  platform: string
  userAgent?: string
  ipAddress?: string
  country?: string
  ipHash?: string
  feedback?: string
  feedbackComment?: string
  debounceKey?: string
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
        ip_hash: data.ipHash,
        country: data.country,
        feedback: data.feedback,
        feedback_comment: data.feedbackComment,
        debounce_key: data.debounceKey
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
      .order('occurred_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch referral events:', error)
      return []
    }

    return (data || []).map(event => ({
      ...event,
      referral_id: event.referral_id || '', // Handle null referral_id
      occurred_at: event.occurred_at || new Date().toISOString(), // Handle null occurred_at
      created_at: event.occurred_at || new Date().toISOString() // Map occurred_at to created_at for compatibility
    }))
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
        feedback,
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
