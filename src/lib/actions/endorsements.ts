import { createActionClient } from '@/lib/supabase-server'
import { logUserActivity } from '@/lib/actions/activity-server'

export interface Endorsement {
  id: string
  user_id: string
  endorser_user_id: string | null
  text: string
  created_at: string
}

export async function createEndorsement(
  userId: string,
  endorserId: string | null,
  text: string
): Promise<{ endorsement?: Endorsement; error?: string }> {
  try {
    const supabaseAction = await createActionClient()
    
    const { data: endorsement, error } = await supabaseAction
      .from('endorsements')
      .insert({
        user_id: userId,
        endorser_user_id: endorserId,
        text: text.trim()
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create endorsement:', error)
      return { error: error.message }
    }

    // Log activity
    await logUserActivity({
      user_id: userId,
      activity_type: 'endorsement_created',
      activity_data: {
        endorsement_id: endorsement.id,
        endorser_id: endorserId,
        is_anonymous: endorserId === null
      }
    })

    return { endorsement }
  } catch (error) {
    console.error('Failed to create endorsement:', error)
    return { error: 'Failed to create endorsement' }
  }
}

export async function getVeteranEndorsements(userId: string): Promise<Endorsement[]> {
  try {
    const supabaseAction = await createActionClient()
    
    const { data, error } = await supabaseAction
      .from('endorsements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch endorsements:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch endorsements:', error)
    return []
  }
}

export async function isCommunityVerified(userId: string): Promise<boolean> {
  try {
    const supabaseAction = await createActionClient()
    
    const { count, error } = await supabaseAction
      .from('endorsements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

    if (error) {
      console.error('Failed to check community verification:', error)
      return false
    }

    return (count || 0) >= 3 // Consider verified if 3+ endorsements in last 30 days
  } catch (error) {
    console.error('Failed to check community verification:', error)
    return false
  }
}
