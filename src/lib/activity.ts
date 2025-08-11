import { createAdminClient } from './supabaseAdmin'
import { createSupabaseBrowser } from './supabaseBrowser'

// Create browser client instance once
const supabaseBrowser = createSupabaseBrowser()

export type ActivityEvent = 
  | 'veteran_joined'
  | 'pitch_referred'
  | 'recruiter_called'
  | 'recruiter_emailed'
  | 'endorsement_added'
  | 'like_added'
  | 'donation_received'
  | 'resume_request_sent'
  | 'resume_request_approved'
  | 'resume_request_declined'
  | 'pitch_expired'
  | 'plan_activated'
  | 'pitch_updated'

export interface ActivityMeta {
  [key: string]: any
}

// Log activity event with metadata
export async function logActivity(event: ActivityEvent, meta: ActivityMeta = {}): Promise<void> {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('activity_log')
    .insert({
      event,
      meta
    })

  if (error) {
    // Don't throw - activity logging shouldn't break main functionality
  }
}

// Get recent activity for FOMO ticker
export async function getRecentActivity(limit: number = 10): Promise<Array<{
  id: string
  event: string
  meta: any
  created_at: string
  display_text: string
}>> {
  const { data, error } = await supabaseBrowser
    .from('activity_recent')
    .select('*')
    .limit(limit)

  if (error) {
    return []
  }

  return data || []
}

// Get activity for a specific user
export async function getUserActivity(userId: string, limit: number = 20): Promise<Array<{
  id: string
  event: string
  meta: any
  created_at: string
}>> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .or(`meta->>'user_id'.eq.${userId},meta->>'user_id'.eq.${userId},meta->>'recruiter_user_id'.eq.${userId},meta->>'user_id'.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return []
  }

  return data || []
}

// Get activity for a specific pitch
export async function getPitchActivity(pitchId: string, limit: number = 20): Promise<Array<{
  id: string
  event: string
  meta: any
  created_at: string
}>> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .or(`meta->>'pitch_id'.eq.${pitchId}`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return []
  }

  return data || []
}

// Format activity text for display
export function formatActivityText(event: string, meta: ActivityMeta): string {
  switch (event) {
    case 'veteran_joined':
      return `${meta.veteran_name || 'A veteran'} joined the platform`
    case 'pitch_referred':
      return `${meta.supporter_name || 'Someone'} referred ${meta.veteran_name || 'a veteran'}`
    case 'recruiter_called':
      return `${meta.recruiter_name || 'A recruiter'} called ${meta.veteran_name || 'a veteran'}`
    case 'recruiter_emailed':
      return `${meta.recruiter_name || 'A recruiter'} emailed ${meta.veteran_name || 'a veteran'}`
    case 'endorsement_added':
      return `${meta.endorser_name || 'Someone'} endorsed ${meta.veteran_name || 'a veteran'}`
    case 'like_added':
      return `Someone liked "${meta.pitch_title || 'a pitch'}"`
    case 'donation_received':
      return `Received ₹${meta.amount || '0'} donation`
    case 'resume_request_sent':
      return `${meta.recruiter_name || 'A recruiter'} requested resume from ${meta.veteran_name || 'a veteran'}`
    case 'resume_request_approved':
      return `${meta.veteran_name || 'A veteran'} approved resume request`
    case 'resume_request_declined':
      return `${meta.veteran_name || 'A veteran'} declined resume request`
    case 'pitch_expired':
      return `Pitch "${meta.pitch_title || 'Unknown'}" expired`
    case 'plan_activated':
      return `${meta.veteran_name || 'A veteran'} activated ${meta.plan_tier || 'a plan'}`
    case 'pitch_updated':
      return `${meta.veteran_name || 'A veteran'} updated their pitch`
    default:
      return 'New activity on the platform'
  }
}
