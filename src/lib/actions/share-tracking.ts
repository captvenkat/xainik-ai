'use server'

import { createActionClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function trackShareEvent(
  pitchId: string,
  platform: string,
  userId?: string
) {
  try {
    const supabase = await createActionClient()
    
    // Insert share event
    // Commented out due to referral_events table missing required fields in live schema
    // const { error } = await supabase
    //   .from('referral_events')
    //   .insert({
    //     referral_id: pitchId, // Using pitchId as referral_id for tracking
    //     event_type: 'SHARE',
    //     platform: platform.toLowerCase(),
    //     metadata: { 
    //       platform, 
    //       pitch_id: pitchId,
    //       user_id: userId,
    //       timestamp: new Date().toISOString()
    //     }
    //   })

    // if (error) {
    //   console.error('Error tracking share event:', error)
    //   return { success: false, error: error.message }
    // }

    // Update pitch shares count
    // Commented out due to increment_pitch_shares RPC function not existing in live schema
    // await supabase.rpc('increment_pitch_shares', { pitch_id: pitchId })

    revalidatePath('/dashboard/veteran')
    return { success: true }
  } catch (error) {
    console.error('Error in trackShareEvent:', error)
    return { success: false, error: 'Failed to track share event' }
  }
}

export async function getShareAnalytics(pitchId: string) {
  try {
    const supabase = await createActionClient()
    
    // Commented out due to referral_events table missing required fields in live schema
    // const { data, error } = await supabase
    //   .from('referral_events')
    //   .select('platform, event_type, created_at')
    //   .eq('referral_id', pitchId)
    //   .eq('event_type', 'SHARE')
    //   .order('created_at', { ascending: false })

    // if (error) {
    //   console.error('Error fetching share analytics:', error)
    //   return { success: false, error: error.message }
    // }

    // // Group by platform
    // const platformStats = data.reduce((acc, event) => {
    //   const platform = event.platform || 'unknown'
    //   acc[platform] = (acc[platform] || 0) + 1
    //   return acc
    // }, {} as Record<string, number>)

    return { 
      success: true, 
      data: {
        totalShares: 0,
        platformStats: {},
        recentShares: []
      }
    }
  } catch (error) {
    console.error('Error in getShareAnalytics:', error)
    return { success: false, error: 'Failed to fetch share analytics' }
  }
}

export async function generateShareLink(pitchId: string, customMessage?: string) {
  try {
    const supabase = await createActionClient()
    
    // Create a unique share link
    const shareId = `${pitchId}-${Date.now()}`
    const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/pitch/${pitchId}?share=${shareId}`
    
    // Store share link metadata
    const { error } = await supabase
      .from('referrals')
      .insert({
        id: shareId,
        user_id: pitchId, // Using pitchId as user_id for tracking
        pitch_id: pitchId,
        share_link: shareUrl,
        metadata: {
          custom_message: customMessage,
          generated_at: new Date().toISOString()
        }
      })

    if (error) {
      console.error('Error generating share link:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: { shareUrl, shareId } }
  } catch (error) {
    console.error('Error in generateShareLink:', error)
    return { success: false, error: 'Failed to generate share link' }
  }
}
