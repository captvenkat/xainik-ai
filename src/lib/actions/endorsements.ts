import { createActionClient } from '@/lib/supabase-server'
import { logUserActivity } from '@/lib/actions/activity-server'
import { sendEndorsementEmail } from '@/lib/email'

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
    
    // Live database endorsements table has different schema
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

    // Log activity - commented out due to user_activity_log table not existing
    // await logUserActivity({
    //   user_id: userId,
    //   activity_type: 'endorsement_created',
    //   activity_data: {
    //     endorsement_id: endorsement.id,
    //     endorser_id: endorserId,
    //     is_anonymous: endorserId === null
    //   }
    // })

    // Send endorsement email notification (non-blocking)
    try {
      // Get veteran and endorser details for the email
      const [veteranData, endorserData] = await Promise.all([
        supabaseAction.from('users').select('name, email').eq('id', userId).single(),
        endorserId ? supabaseAction.from('users').select('name').eq('id', endorserId).single() : Promise.resolve({ data: null })
      ])

      if (veteranData.data) {
        await sendEndorsementEmail(
          veteranData.data.email,
          veteranData.data.name,
          endorserData.data?.name || 'Anonymous Supporter',
          'Leadership & Teamwork' // Default skill until schema includes specific skills
        )
      }
    } catch (emailError) {
      console.error('Failed to send endorsement email:', emailError)
      // Don't fail the request if email fails
    }

    // Return the actual endorsement
    return { endorsement: endorsement }
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

    return (count || 0) >= 3 // Need at least 3 endorsements in last 30 days
  } catch (error) {
    console.error('Failed to check community verification:', error)
    return false
  }
}
