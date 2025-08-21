// =====================================================
// CLIENT-SIDE REFERRAL FUNCTIONS
// Xainik Platform - Client Components Only
// =====================================================

import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { nanoid } from 'nanoid'

export interface CreateReferralData {
  pitch_id: string
  user_id: string
}

export interface ReferralEventData {
  referral_id: string
  event_type: string
  platform?: string
  userAgent?: string
  country?: string
  ipHash?: string
  feedback?: string
  feedbackComment?: string
  debounceKey?: string
}

export async function createOrGetReferralClient(data: CreateReferralData) {
  try {
    const supabase = createSupabaseBrowser()
    
    // Check if referral already exists
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('*')
      .eq('pitch_id', data.pitch_id)
      .eq('user_id', data.user_id)
      .single()

    if (existingReferral) {
      return { success: true, data: existingReferral }
    }

    // Create new referral
    const shareLink = `${process.env.NEXT_PUBLIC_SITE_URL}/refer/opened/${nanoid(12)}`
    
    const { data: newReferral, error } = await supabase
      .from('referrals')
      .insert({
        pitch_id: data.pitch_id,
        user_id: data.user_id,
        share_link: shareLink
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating referral:', error)
      throw new Error('Failed to create referral')
    }

    return { success: true, data: newReferral }
  } catch (error) {
    console.error('Error in createOrGetReferralClient:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function trackReferralEventClient(data: ReferralEventData) {
  try {
    const supabase = createSupabaseBrowser()
    
    const { data: event, error } = await supabase
      .from('referral_events')
      .insert({
        referral_id: data.referral_id,
        event_type: data.event_type,
        platform: data.platform,
        user_agent: data.userAgent,
        country: data.country,
        ip_hash: data.ipHash,
        feedback: data.feedback,
        feedback_comment: data.feedbackComment,
        debounce_key: data.debounceKey
      })
      .select()
      .single()

    if (error) {
      console.error('Error tracking referral event:', error)
      throw new Error('Failed to track referral event')
    }

    return { success: true, data: event }
  } catch (error) {
    console.error('Error in trackReferralEventClient:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function trackReferralShareClient(referralId: string, platform: string) {
  try {
    // Track share event
    await trackReferralEventClient({
      referral_id: referralId,
      event_type: 'SHARE_RESHARED',
      platform,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
    })

    return { success: true }
  } catch (error) {
    console.error('Error in trackReferralShareClient:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
