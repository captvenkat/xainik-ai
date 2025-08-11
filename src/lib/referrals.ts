import { createClient } from '@supabase/supabase-js'
import { getServerSupabase } from './supabaseClient'
import { many } from '@/lib/db'
import { createAdminClient } from './supabaseAdmin'
import { logActivity } from './activity'
import { revalidateMetricsForVeteran } from './metrics-cache'

export interface ReferralEvent {
  referral_id: string
  event_type: 'LINK_OPENED' | 'PITCH_VIEWED' | 'CALL_CLICKED' | 'EMAIL_CLICKED' | 'SHARE_RESHARED' | 'SIGNUP_FROM_REFERRAL'
  platform?: string
  user_agent?: string
  country?: string
  ip_hash?: string
}

export interface ReferralStats {
  total_referrals: number
  total_clicks: number
  recent_events: Array<{
    event_type: string
    platform: string
    occurred_at: string
  }>
}

// Create or get unique referral link for supporter + pitch
export async function createOrGetReferral(supporterId: string, pitchId: string): Promise<string> {
  const supabase = getServerSupabase()
  
  // Check if referral already exists
  const { data: existing } = await supabase
    .from('referrals')
    .select('share_link')
    .eq('supporter_id', supporterId)
    .eq('pitch_id', pitchId)
    .single()

  if (existing) {
    return existing.share_link
  }

  // Create new referral with unique link
  const shareLink = `${process.env.NEXT_PUBLIC_SITE_URL}/pitch/${pitchId}?ref=${supporterId}`
  
  const { data, error } = await supabase
    .from('referrals')
    .insert({
      supporter_id: supporterId,
      pitch_id: pitchId,
      share_link: shareLink
    })
    .select('share_link')
    .single()

  if (error) {
    console.error('Error creating referral:', error)
    throw new Error('Failed to create referral')
  }

  // Log activity
  await logActivity('pitch_referred', {
    supporter_id: supporterId,
    pitch_id: pitchId,
    share_link: shareLink
  })

  // Cache refresh - invalidate metrics for the veteran
  try {
    const { data: pitch } = await supabase
      .from('pitches')
      .select('veteran_id')
      .eq('id', pitchId)
      .single();
    
    if (pitch?.veteran_id) {
      await revalidateMetricsForVeteran(pitch.veteran_id);
    }
  } catch (error) {
    console.warn('Failed to invalidate metrics cache for referral:', error);
  }

  return data.share_link
}

// Track referral event with debouncing (10 min)
export async function trackReferralEvent(event: ReferralEvent): Promise<void> {
  const supabase = createAdminClient()
  
  // Check for recent duplicate events (debouncing)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  
  const { data: recentEvents } = await supabase
    .from('referral_events')
    .select('id')
    .eq('referral_id', event.referral_id)
    .eq('event_type', event.event_type)
    .gte('occurred_at', tenMinutesAgo)
    .limit(1)

  // If recent event exists, skip (debouncing)
  if (recentEvents && recentEvents.length > 0) {
    return
  }

  // Insert new event
  const { error } = await supabase
    .from('referral_events')
    .insert({
      referral_id: event.referral_id,
      event_type: event.event_type,
      platform: event.platform,
      user_agent: event.user_agent,
      country: event.country,
      ip_hash: event.ip_hash
    })

  // Cache refresh - invalidate metrics for the veteran
  try {
    const { data: referral } = await supabase
      .from('referrals')
      .select('pitch_id')
      .eq('id', event.referral_id)
      .single();
    
    if (referral?.pitch_id) {
      const { data: pitch } = await supabase
        .from('pitches')
        .select('veteran_id')
        .eq('id', referral.pitch_id)
        .single();
      
      if (pitch?.veteran_id) {
        await revalidateMetricsForVeteran(pitch.veteran_id);
      }
    }
  } catch (error) {
    console.warn('Failed to invalidate metrics cache for referral event:', error);
  }

  if (error) {
    console.error('Error tracking referral event:', error)
    throw new Error('Failed to track referral event')
  }

  // Update shared_pitches click count for LINK_OPENED events
  if (event.event_type === 'LINK_OPENED') {
    await supabase
      .from('shared_pitches')
      .upsert({
        supporter_id: event.referral_id.split('_')[0], // Extract from referral_id
        pitch_id: event.referral_id.split('_')[1],
        share_link: event.referral_id,
        click_count: 1
      }, {
        onConflict: 'supporter_id,pitch_id',
        ignoreDuplicates: false
      })
  }
}

// Get referral statistics for a supporter
export async function getReferralStats(supporterId: string): Promise<ReferralStats> {
  const supabase = getServerSupabase()
  
  const { data, error } = await supabase
    .rpc('get_supporter_referral_stats', { supporter_uuid: supporterId })

  if (error) {
    console.error('Error getting referral stats:', error)
    throw new Error('Failed to get referral stats')
  }

  return data || {
    total_referrals: 0,
    total_clicks: 0,
    recent_events: []
  }
}

// Get referral events for a pitch (veteran view)
export async function getPitchReferralEvents(pitchId: string): Promise<ReferralEvent[]> {
  const supabase = getServerSupabase()
  
  const { data, error } = await supabase
    .from('referral_events')
    .select(`
      id,
      event_type,
      platform,
      occurred_at,
      referrals!inner(pitch_id)
    `)
    .eq('referrals.pitch_id', pitchId)
    .order('occurred_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error getting pitch referral events:', error)
    throw new Error('Failed to get pitch referral events')
  }

  return data?.map(item => ({
    id: item.id,
    referral_id: item.referrals?.[0]?.pitch_id || '',
    event_type: item.event_type,
    platform: item.platform,
    occurred_at: item.occurred_at
  })) || []
}

// Hash IP address for privacy
export function hashIP(ip: string): string {
  // Simple hash for demo - in production use proper hashing
  return Buffer.from(ip).toString('base64').substring(0, 16)
}

// Extract platform from user agent
export function detectPlatform(userAgent: string): string {
  if (userAgent.includes('WhatsApp')) return 'whatsapp'
  if (userAgent.includes('LinkedIn')) return 'linkedin'
  if (userAgent.includes('Telegram')) return 'telegram'
  if (userAgent.includes('Email')) return 'email'
  return 'direct'
}
