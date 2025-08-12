import { createActionClient } from '@/lib/supabase-server'
import { nanoid } from 'nanoid'

export interface CreateReferralData {
  pitch_id: string
  user_id: string
}

export interface ReferralEventData {
  referral_id: string
  event_type: string
  platform?: string
  metadata?: any
}

export async function createOrGetReferral(data: CreateReferralData) {
  try {
    const supabase = await createActionClient()
    
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
        supporter_user_id: data.user_id,
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
    console.error('Error in createOrGetReferral:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function trackReferralEvent(data: ReferralEventData) {
  try {
    const supabase = await createActionClient()
    
    const { data: event, error } = await supabase
      .from('referral_events')
      .insert({
        referral_id: data.referral_id,
        event_type: data.event_type,
        platform: data.platform,
        metadata: data.metadata || {}
      })
      .select()
      .single()

    if (error) {
      console.error('Error tracking referral event:', error)
      throw new Error('Failed to track referral event')
    }

    return { success: true, data: event }
  } catch (error) {
    console.error('Error in trackReferralEvent:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function getReferralStats(userId: string) {
  try {
    const supabase = await createActionClient()
    
    // Get user's referrals
    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select(`
        id,
        pitch_id,
        share_link,
        created_at,
        pitches (
          id,
          title
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (referralsError) {
      console.error('Error fetching referrals:', referralsError)
      throw new Error('Failed to fetch referrals')
    }

    // Get referral events for each referral
    const referralStats = await Promise.all(
      referrals?.map(async (referral) => {
        const { data: events } = await supabase
          .from('referral_events')
          .select('event_type, occurred_at')
          .eq('referral_id', referral.id)

        const clicks = events?.filter((e: any) => e.event_type === 'click').length || 0
        const shares = events?.filter((e: any) => e.event_type === 'share').length || 0

        return {
          ...referral,
          clicks,
          shares,
          events: events || []
        }
      }) || []
    )

    return { success: true, data: referralStats }
  } catch (error) {
    console.error('Error in getReferralStats:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function getReferralByShareLink(shareLink: string) {
  try {
    const supabase = await createActionClient()
    
    const { data: referral, error } = await supabase
      .from('referrals')
      .select(`
        *,
        pitches (
          id,
          title,
          pitch_text,
          user_id,
          is_active
        ),
        users (
          id,
          name,
          email
        )
      `)
      .eq('share_link', shareLink)
      .single()

    if (error) {
      console.error('Error fetching referral:', error)
      throw new Error('Referral not found')
    }

    return { success: true, data: referral }
  } catch (error) {
    console.error('Error in getReferralByShareLink:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function trackReferralClick(referralId: string, platform?: string) {
  try {
    const supabase = await createActionClient()
    
    // Track click event
    await trackReferralEvent({
      referral_id: referralId,
      event_type: 'click',
      platform: platform || null,
      metadata: {
        timestamp: new Date().toISOString(),
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error in trackReferralClick:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function trackReferralShare(referralId: string, platform: string) {
  try {
    const supabase = await createActionClient()
    
    // Track share event
    await trackReferralEvent({
      referral_id: referralId,
      event_type: 'share',
      platform,
      metadata: {
        timestamp: new Date().toISOString(),
        platform
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error in trackReferralShare:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
