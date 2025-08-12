'use server'

import { createActionClient } from '@/lib/supabase-server'
import { Database } from '@/types/live-schema'

type Referral = Database['public']['Tables']['referrals']['Row']
type ReferralEvent = Database['public']['Tables']['referral_events']['Row']

export async function createOrGetReferral(supporterUserId: string, pitchId: string): Promise<string> {
  const supabase = await createActionClient()
  
  // Check if referral already exists
  const { data: existingReferral } = await supabase
    .from('referrals')
    .select('share_link')
    .eq('user_id', supporterUserId)
    .eq('pitch_id', pitchId)
    .single()
  
  if (existingReferral) {
    return existingReferral.share_link
  }
  
  // Create new referral
  const shareLink = `${process.env.NEXT_PUBLIC_SITE_URL}/refer/opened?pitch=${pitchId}&user=${supporterUserId}`
  const { data: referral, error } = await supabase
    .from('referrals')
    .insert({
      user_id: supporterUserId,
      pitch_id: pitchId,
      share_link: shareLink
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create referral: ${error.message}`)
  }
  
  return shareLink
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
  
  // Parse the code to extract pitch_id and user_id
  const urlParams = new URLSearchParams(code.split('?')[1])
  const pitchId = urlParams.get('pitch')
  const userId = urlParams.get('user')
  
  if (!pitchId || !userId) {
    return null
  }
  
  const { data, error } = await supabase
    .from('referrals')
    .select(`
      *,
      pitch:pitches (id, title, pitch_text, user_id),
      supporter:users!referrals_user_id_fkey (id, name, email)
    `)
    .eq('pitch_id', pitchId)
    .eq('user_id', userId)
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
