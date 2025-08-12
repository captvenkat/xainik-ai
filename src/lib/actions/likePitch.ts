'use server'

import { createActionClient } from '@/lib/supabase-server'
import { logUserActivity } from '@/lib/actions/activity-server'
import { revalidatePath } from 'next/cache'

export async function likePitch(pitchId: string, userId: string) {
  try {
    const supabaseAction = await createActionClient()
    
    // Check if user has already liked this pitch
    // Since pitch_likes table doesn't exist, we'll use a different approach
    // We'll track likes through activity logs and update the likes_count in pitches table
    
    // Update the pitch likes count
    // Note: likes_count field not available in current schema
    // Update pitch likes count - using a simple approach
    console.log('Likes count update skipped - field not available in current schema')
    
    // Get the pitch data without updating likes_count
    const { data: pitch, error: updateError } = await supabaseAction
      .from('pitches')
      .select()
      .eq('id', pitchId)
      .single()

    if (updateError) {
      console.error('Error updating pitch likes:', updateError)
      throw new Error('Failed to like pitch')
    }

    // Log the like activity
    await logUserActivity({
      user_id: userId,
      activity_type: 'pitch_liked',
      activity_data: { pitch_id: pitchId }
    })

    revalidatePath('/browse')
    revalidatePath(`/pitch/${pitchId}`)
    
    return { success: true, data: pitch }
  } catch (error) {
    console.error('Error in likePitch:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function unlikePitch(pitchId: string, userId: string) {
  try {
    const supabaseAction = await createActionClient()
    
    // Note: likes_count field not available in current schema
    // Get the pitch data without updating likes_count
    const { data: pitch, error: updateError } = await supabaseAction
      .from('pitches')
      .select()
      .eq('id', pitchId)
      .single()

    if (updateError) {
      console.error('Error updating pitch likes:', updateError)
      throw new Error('Failed to unlike pitch')
    }

    // Log the unlike activity
    await logUserActivity({
      user_id: userId,
      activity_type: 'pitch_unliked',
      activity_data: { pitch_id: pitchId }
    })

    revalidatePath('/browse')
    revalidatePath(`/pitch/${pitchId}`)
    
    return { success: true, data: pitch }
  } catch (error) {
    console.error('Error in unlikePitch:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function checkIfLiked(pitchId: string, userId: string): Promise<boolean> {
  try {
    const supabaseAction = await createActionClient()
    
    // Check if user has liked this pitch by looking at activity logs
    const { data: activity } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_type', 'pitch_liked')
      .eq('activity_data->pitch_id', pitchId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (!activity || activity.length === 0) {
      return false
    }

    // Check if there's a more recent unlike activity
    const { data: unlikeActivity } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_type', 'pitch_unliked')
      .eq('activity_data->pitch_id', pitchId)
      .gt('created_at', activity[0]?.created_at || '')
      .limit(1)

    return !unlikeActivity || unlikeActivity.length === 0
  } catch (error) {
    console.error('Error checking if pitch is liked:', error)
    return false
  }
}
