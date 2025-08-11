import { createSupabaseServerOnly } from '../supabaseServerOnly'
import { logActivity } from '../activity'
import { first } from '@/lib/db'
import { notifyEndorsementReceived, notifyVerifiedBadge } from '@/lib/notify'


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
  const supabase = createSupabaseServerOnly()
  
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

  // Get endorser details for notification
  const { data: endorser } = await supabase
    .from('users')
    .select('name')
    .eq('id', endorserId)
    .single()

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

  // Send notification to veteran
  try {
    await notifyEndorsementReceived(veteranId, {
      endorser_name: endorser?.name || 'Someone',
      message: text || 'Endorsed your pitch'
    })
  } catch (notificationError) {
    console.error('Failed to send endorsement notification:', notificationError)
    // Don't fail the endorsement if notification fails
  }

  // Check if veteran should get verified badge (10+ endorsements)
  try {
    const endorsementCount = await getEndorsementCount(veteranId)
    if (endorsementCount === 10) {
      await notifyVerifiedBadge(veteranId)
    }
  } catch (badgeError) {
    console.error('Failed to check/send verified badge notification:', badgeError)
    // Don't fail the endorsement if badge notification fails
  }

  // Log activity
  await logActivity('endorsement_added', {
    endorser_id: endorserId,
    veteran_id: veteranId,
    endorsement_text: text
  })

  // Invalidate metrics cache for the veteran
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/revalidate-metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ veteranId }),
    });
  } catch (error) {
    console.warn('Failed to invalidate metrics cache for endorsement:', error);
  }

  return data
}

// Get endorsements for a veteran
export async function getVeteranEndorsements(veteranId: string): Promise<EndorsementWithUser[]> {
  const supabase = createSupabaseServerOnly()
  
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
  const supabase = createSupabaseServerOnly()
  
  const { count, error } = await supabase
    .from('endorsements')
    .select('*', { count: 'exact', head: true })
    .eq('veteran_id', veteranId)

  if (error) throw error
  return count || 0
}

// Check if veteran is community verified (10+ endorsements)
export async function isCommunityVerified(veteranId: string): Promise<boolean> {
  const count = await getEndorsementCount(veteranId)
  return count >= 10
}

// Get endorsements made by a user
export async function getUserEndorsements(userId: string): Promise<EndorsementWithUser[]> {
  const supabase = createSupabaseServerOnly()
  
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

  return (data || []).map(item => ({
    ...item,
    endorser: Array.isArray(item.veteran) ? first(item.veteran) : item.veteran
  })) as EndorsementWithUser[]
}
