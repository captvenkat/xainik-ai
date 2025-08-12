'use server'

import { createActionClient } from '@/lib/supabase-server'
import { logUserActivity } from '@/lib/actions/activity-server'
import { Database } from '@/types/live-schema'

type Endorsement = Database['public']['Tables']['endorsements']['Row']
type EndorsementInsert = Database['public']['Tables']['endorsements']['Insert']

export interface EndorsementData {
  id: string
  user_id: string
  endorser_user_id: string | null
  text: string
  created_at: string
}

export async function createEndorsement(
  userId: string,
  endorserId: string,
  text: string
): Promise<Endorsement> {
  const supabase = await createActionClient()
  
  // Create endorsement
  const { data: endorsement, error } = await supabase
    .from('endorsements')
    .insert({
      user_id: userId,
      endorser_user_id: endorserId,
      text: text.trim()
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create endorsement: ${error.message}`)
  }
  
  // Log activity
  await logUserActivity({
    user_id: userId,
    activity_type: 'endorsement_created',
    activity_data: {
      endorser_id: endorserId,
      endorsement_text: text.trim()
    }
  })
  
  return endorsement
}

export async function getEndorsementsByUserId(userId: string): Promise<EndorsementData[]> {
  const supabase = await createActionClient()
  
  const { data: endorsements, error } = await supabase
    .from('endorsements')
    .select(`
      id,
      user_id,
      endorser_user_id,
      text,
      created_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to get endorsements: ${error.message}`)
  }
  
  return endorsements || []
}

export async function deleteEndorsement(endorsementId: string, userId: string): Promise<void> {
  const supabase = await createActionClient()
  
  const { error } = await supabase
    .from('endorsements')
    .delete()
    .eq('id', endorsementId)
    .eq('endorser_user_id', userId)
  
  if (error) {
    throw new Error(`Failed to delete endorsement: ${error.message}`)
  }
}
