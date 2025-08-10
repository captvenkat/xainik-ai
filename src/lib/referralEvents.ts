import { getServerSupabase } from '@/lib/supabaseClient'
import { createHash } from 'crypto'

const IP_SALT = process.env.IP_HASH_SALT || 'default-salt-change-in-production'

export interface ReferralEventData {
  referralId: string
  type: 'PITCH_VIEWED' | 'CALL_CLICKED' | 'EMAIL_CLICKED'
  platform?: string
  userAgent?: string
  ipAddress?: string
}

export async function recordEvent(data: ReferralEventData): Promise<void> {
  const supabase = getServerSupabase()
  
  // Hash IP address if provided
  const ipHash = data.ipAddress ? hashIP(data.ipAddress) : null
  
  // Create debounce key
  const debounceKey = createDebounceKey(data.referralId, data.type, ipHash)
  
  // Check for existing event within debounce window (10 minutes)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  
  const { data: existing } = await supabase
    .from('referral_events')
    .select('id')
    .eq('referral_id', data.referralId)
    .eq('event_type', data.type)
    .eq('debounce_key', debounceKey)
    .gte('created_at', tenMinutesAgo)
    .single()

  if (existing) {
    return // Event already logged within debounce window
  }

  // Log the event
  await supabase
    .from('referral_events')
    .insert({
      referral_id: data.referralId,
      event_type: data.type,
      platform: data.platform || null,
      user_agent: data.userAgent || null,
      ip_hash: ipHash,
      debounce_key: debounceKey,
      created_at: new Date().toISOString()
    })
}

function hashIP(ipAddress: string): string {
  return createHash('sha256')
    .update(ipAddress + IP_SALT)
    .digest('hex')
}

function createDebounceKey(referralId: string, eventType: string, ipHash: string | null): string {
  const components = [referralId, eventType]
  if (ipHash) components.push(ipHash)
  return createHash('sha256').update(components.join('|')).digest('hex')
}
