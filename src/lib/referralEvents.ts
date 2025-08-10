import { getServerSupabase } from '@/lib/supabaseClient'
import { createHash } from 'crypto'

const IP_SALT = process.env.IP_HASH_SALT || 'default-salt-change-in-production'

export interface ReferralEventData {
  referralId: string
  type: 'PITCH_VIEWED' | 'CALL_CLICKED' | 'EMAIL_CLICKED' | 'LINK_OPENED'
  platform?: string
  userAgent?: string
  ipAddress?: string
}

export async function recordEvent(data: ReferralEventData): Promise<void> {
  const supabase = getServerSupabase()
  
  // Hash IP address if provided
  const ipHash = data.ipAddress ? hashIP(data.ipAddress) : null
  
  // Create debounce key with 10-minute window
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
      platform: data.platform || detectPlatform(data.userAgent),
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

function detectPlatform(userAgent?: string): string {
  if (!userAgent) return 'unknown'
  
  const ua = userAgent.toLowerCase()
  
  if (ua.includes('whatsapp')) return 'WhatsApp'
  if (ua.includes('linkedin')) return 'LinkedIn'
  if (ua.includes('facebook')) return 'Facebook'
  if (ua.includes('twitter') || ua.includes('x.com')) return 'Twitter'
  if (ua.includes('telegram')) return 'Telegram'
  if (ua.includes('instagram')) return 'Instagram'
  if (ua.includes('email') || ua.includes('mail')) return 'Email'
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile'
  
  return 'Web'
}

// Enhanced analytics functions
export async function getReferralFunnel(referralIds: string[], days: number = 30) {
  const supabase = getServerSupabase()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data: events } = await supabase
    .from('referral_events')
    .select('event_type, platform, created_at')
    .in('referral_id', referralIds)
    .gte('created_at', startDate.toISOString())
  
  if (!events) return { opens: 0, views: 0, calls: 0, emails: 0 }
  
  return {
    opens: events.filter(e => e.event_type === 'LINK_OPENED').length,
    views: events.filter(e => e.event_type === 'PITCH_VIEWED').length,
    calls: events.filter(e => e.event_type === 'CALL_CLICKED').length,
    emails: events.filter(e => e.event_type === 'EMAIL_CLICKED').length
  }
}

export async function getPlatformBreakdown(referralIds: string[], days: number = 30) {
  const supabase = getServerSupabase()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data: events } = await supabase
    .from('referral_events')
    .select('event_type, platform, created_at')
    .in('referral_id', referralIds)
    .gte('created_at', startDate.toISOString())
  
  if (!events) return []
  
  const platformMap = new Map<string, { views: number; calls: number; emails: number }>()
  
  events.forEach(event => {
    if (!platformMap.has(event.platform || 'unknown')) {
      platformMap.set(event.platform || 'unknown', { views: 0, calls: 0, emails: 0 })
    }
    
    const platform = platformMap.get(event.platform || 'unknown')!
    
    switch (event.event_type) {
      case 'PITCH_VIEWED':
        platform.views++
        break
      case 'CALL_CLICKED':
        platform.calls++
        break
      case 'EMAIL_CLICKED':
        platform.emails++
        break
    }
  })
  
  return Array.from(platformMap.entries()).map(([platform, counts]) => ({
    platform,
    ...counts
  }))
}

export async function getTopReferrers(userId: string, days: number = 30) {
  const supabase = getServerSupabase()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  // Get referrals created by this user
  const { data: referrals } = await supabase
    .from('referrals')
    .select('id, created_at')
    .eq('supporter_id', userId)
    .gte('created_at', startDate.toISOString())
  
  if (!referrals || referrals.length === 0) return []
  
  const referralIds = referrals.map(r => r.id)
  
  // Get events for these referrals
  const { data: events } = await supabase
    .from('referral_events')
    .select('referral_id, event_type, created_at')
    .in('referral_id', referralIds)
  
  if (!events) return []
  
  // Group by referral and count events
  const referralStats = new Map<string, { events: number; conversions: number }>()
  
  events.forEach(event => {
    if (!referralStats.has(event.referral_id)) {
      referralStats.set(event.referral_id, { events: 0, conversions: 0 })
    }
    
    const stats = referralStats.get(event.referral_id)!
    stats.events++
    
    if (event.event_type === 'CALL_CLICKED' || event.event_type === 'EMAIL_CLICKED') {
      stats.conversions++
    }
  })
  
  return Array.from(referralStats.entries())
    .map(([referralId, stats]) => ({
      referralId,
      totalEvents: stats.events,
      conversions: stats.conversions,
      conversionRate: stats.events > 0 ? (stats.conversions / stats.events) * 100 : 0
    }))
    .sort((a, b) => b.totalEvents - a.totalEvents)
    .slice(0, 10)
}
