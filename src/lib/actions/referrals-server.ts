'use server'

import { createActionClient } from '@/lib/supabase-server'
import { nanoid } from 'nanoid'
import { Database } from '@/types/live-schema'

type Referral = Database['public']['Tables']['referrals']['Row']
type ReferralEvent = Database['public']['Tables']['referral_events']['Row']

export async function createOrGetReferral(supporterUserId: string, pitchId: string): Promise<string> {
  const supabase = await createActionClient()
  
  // Check if referral already exists
  const { data: existingReferral } = await supabase
    .from('referrals')
    .select('code')
    .eq('supporter_user_id', supporterUserId)
    .eq('pitch_id', pitchId)
    .single()
  
  if (existingReferral) {
    return `${process.env.NEXT_PUBLIC_SITE_URL}/refer/opened?code=${existingReferral.code}`
  }
  
  // Create new referral
  const code = nanoid(8)
  const { data: referral, error } = await supabase
    .from('referrals')
    .insert({
      supporter_user_id: supporterUserId,
      pitch_id: pitchId,
      code,
      status: 'active'
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create referral: ${error.message}`)
  }
  
  return `${process.env.NEXT_PUBLIC_SITE_URL}/refer/opened?code=${code}`
}

export async function trackReferralEvent(eventData: {
  referral_id: string
  event_type: string
  platform?: string
  user_agent?: string
  ip_hash?: string
}): Promise<void> {
  const supabase = await createActionClient()
  
  const { error } = await supabase
    .from('referral_events')
    .insert({
      referral_id: eventData.referral_id,
      event_type: eventData.event_type,
      platform: eventData.platform || null,
      user_agent: eventData.user_agent || null,
      ip_hash: eventData.ip_hash || null
    })
  
  if (error) {
    throw new Error(`Failed to track referral event: ${error.message}`)
  }
}

export async function getReferralByCode(code: string): Promise<Referral | null> {
  const supabase = await createActionClient()
  
  const { data, error } = await supabase
    .from('referrals')
    .select(`
      *,
      pitch:pitches (id, title, pitch_text, user_id),
      supporter:users!referrals_supporter_user_id_fkey (id, name, email)
    `)
    .eq('code', code)
    .eq('status', 'active')
    .single()
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get referral: ${error.message}`)
  }
  
  return data
}

export async function updateReferralEventFeedback(
  referralId: string,
  feedback: string,
  feedbackComment?: string
): Promise<void> {
  const supabase = await createActionClient()
  
  const { error } = await supabase
    .from('referral_events')
    .update({
      feedback,
      feedback_comment: feedbackComment || null,
      feedback_at: new Date().toISOString()
    })
    .eq('referral_id', referralId)
    .eq('event_type', 'LINK_OPENED')
  
  if (error) {
    throw new Error(`Failed to update referral feedback: ${error.message}`)
  }
}
