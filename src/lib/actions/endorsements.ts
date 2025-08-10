import { getServerSupabase } from '../supabaseClient'
import { logActivity } from '../activity'
import { first } from '@/lib/db'

export interface Endorsement {
  id: string
  veteran_id: string
  endorser_id: string
  text?: string
  created_at: string
}

export interface EndorsementWithUser extends Endorsement {
  endorser: {
    name: string
    role: string
  }
}

// Create endorsement with unique constraint
export async function createEndorsement(
  veteranId: string, 
  endorserId: string, 
  text?: string
): Promise<Endorsement> {
  const supabase = getServerSupabase()
  
  // Validate text length
  if (text && text.length > 150) {
    throw new Error('Endorsement text must be 150 characters or less')
  }

  // Check if endorsement already exists
  const { data: existing } = await supabase
    .from('endorsements')
    .select('id')
    .eq('veteran_id', veteranId)
    .eq('endorser_id', endorserId)
    .single()

  if (existing) {
    throw new Error('You have already endorsed this veteran')
  }

  // Create endorsement
  const { data, error } = await supabase
    .from('endorsements')
    .insert({
      veteran_id: veteranId,
      endorser_id: endorserId,
      text: text?.trim() || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating endorsement:', error)
    throw new Error('Failed to create endorsement')
  }

  // Log activity
  await logActivity('endorsement_added', {
    endorser_id: endorserId,
    veteran_id: veteranId,
    endorsement_text: text
  })

  return data
}

// Get endorsements for a veteran
export async function getVeteranEndorsements(veteranId: string): Promise<EndorsementWithUser[]> {
  const supabase = getServerSupabase()
  
  const { data, error } = await supabase
    .from('endorsements')
    .select(`
      id,
      veteran_id,
      endorser_id,
      text,
      created_at,
      endorser:users!endorser_id(name, role)
    `)
    .eq('veteran_id', veteranId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map(item => ({
    ...item,
    endorser: Array.isArray(item.endorser) ? first(item.endorser) : item.endorser
  })) as EndorsementWithUser[]
}

// Get endorsement count for community verification
export async function getEndorsementCount(veteranId: string): Promise<number> {
  const supabase = getServerSupabase()
  
  const { data, error } = await supabase
    .rpc('get_endorsement_count', { veteran_uuid: veteranId })

  if (error) {
    console.error('Error getting endorsement count:', error)
    return 0
  }

  return data || 0
}

// Check if veteran is community verified (>=10 endorsements)
export async function isCommunityVerified(veteranId: string): Promise<boolean> {
  const count = await getEndorsementCount(veteranId)
  return count >= 10
}

// Get endorsements made by a user
export async function getUserEndorsements(userId: string): Promise<EndorsementWithUser[]> {
  const supabase = getServerSupabase()
  
  const { data, error } = await supabase
    .from('endorsements')
    .select(`
      id,
      veteran_id,
      endorser_id,
      text,
      created_at,
      veteran:users!veteran_id(name, role)
    `)
    .eq('endorser_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map((item: any) => ({
    ...item,
    endorser: Array.isArray(item.endorser) ? first(item.endorser) : item.endorser,
    veteran: Array.isArray(item.veteran) ? first(item.veteran) : item.veteran
  })) as EndorsementWithUser[]
}
