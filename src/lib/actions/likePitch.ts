"use server"

import { createSupabaseServerOnly } from '../supabaseServerOnly'
import { logActivity } from '../activity'

export async function likePitch(pitchId: string, userId: string): Promise<{ success: boolean; likesCount: number }> {
  const supabase = createSupabaseServerOnly()
  
  try {
    // Get pitch details for activity logging
    const { data: pitch } = await supabase
      .from('pitches')
      .select('user_id') // Changed from veteran_id
      .eq('id', pitchId)
      .single()

    if (!pitch) {
      throw new Error('Pitch not found')
    }

    // Increment likes count
    const { data: updatedPitch, error: updateError } = await supabase
      .from('pitches')
      .update({ 
        likes_count: pitch.likes_count + 1 
      })
      .eq('id', pitchId)
      .select('likes_count')
      .single()

    if (updateError) {
      throw new Error('Failed to update pitch likes')
    }

    // Log activity
    await logActivity('like_added', {
      pitch_id: pitchId,
      pitch_title: pitch.title,
      veteran_name: pitch.users?.[0]?.name || 'Unknown',
      user_id: userId
    })

    return {
      success: true,
      likesCount: updatedPitch.likes_count
    }

  } catch (error) {
    throw new Error('Failed to like pitch')
  }
}

export async function unlikePitch(pitchId: string, userId: string): Promise<{ success: boolean; likesCount: number }> {
  const supabase = createSupabaseServerOnly()
  
  try {
    // Get current likes count
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select('likes_count')
      .eq('id', pitchId)
      .single()

    if (pitchError || !pitch) {
      throw new Error('Pitch not found')
    }

    // Decrement likes count (ensure it doesn't go below 0)
    const newLikesCount = Math.max(0, pitch.likes_count - 1)
    
    const { data: updatedPitch, error: updateError } = await supabase
      .from('pitches')
      .update({ 
        likes_count: newLikesCount 
      })
      .eq('id', pitchId)
      .select('likes_count')
      .single()

    if (updateError) {
      throw new Error('Failed to update pitch likes')
    }

    return {
      success: true,
      likesCount: updatedPitch.likes_count
    }

  } catch (error) {
    throw new Error('Failed to unlike pitch')
  }
}

// Check if user has liked a pitch (for UI state)
export async function hasUserLikedPitch(pitchId: string, userId: string): Promise<boolean> {
  // Note: This is a simplified implementation
  // In a real app, you might want a separate likes table to track individual user likes
  // For now, we'll return false as we're only tracking total count
  
  return false
}
