import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

// =====================================================
// UNIFIED PROGRESS DASHBOARD ANALYTICS
// Admin-Style Progress Dashboard Data Functions
// =====================================================

export type Range = '7d' | '14d' | '30d' | '60d' | '90d'

export type KPI = { 
  value: number
  deltaPct: number
  spark: { d: string; v: number }[]
}

export type FunnelData = { 
  stage: 'shares' | 'views' | 'contacts'
  value: number
  supporterPct: number
}[]

export type SupporterRow = { 
  name: string
  avatar?: string | null
  shares: number
  views: number
  contacts: number
  lastAt: string
}

export type ChannelRow = { 
  channel: 'whatsapp' | 'linkedin' | 'facebook' | 'email' | 'twitter' | 'direct'
  shares: number
  views: number
  contacts: number
  efficiency: number
}

export type ContactRow = { 
  id: string
  type: 'call' | 'email' | 'resume'
  channel: string
  supporterName?: string | null
  sinceViewMins?: number | null
  status: 'open' | 'responded' | 'closed'
  ts: string
}

// Helper function to get date range
function getDateRange(range: Range): { start: string; end: string; prevStart: string; prevEnd: string } {
  const now = new Date()
  const days = range === '7d' ? 7 : range === '14d' ? 14 : range === '30d' ? 30 : range === '60d' ? 60 : 90
  
  const end = now.toISOString()
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
  
  const prevEnd = new Date(start).toISOString()
  const prevStart = new Date(new Date(prevEnd).getTime() - days * 24 * 60 * 60 * 1000).toISOString()
  
  return { start, end, prevStart, prevEnd }
}

// Helper function to generate sparkline data
function generateSparklineData(range: Range, values: number[]): { d: string; v: number }[] {
  const days = range === '7d' ? 7 : range === '14d' ? 14 : range === '30d' ? 30 : range === '60d' ? 60 : 90
  const data = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      d: date.toISOString().split('T')[0] || date.toISOString(),
      v: values[i] || 0
    })
  }
  
  return data
}

export async function getProgressKpis(userId: string, range: Range): Promise<{ shares: KPI; views: KPI; contacts: KPI }> {
  try {
    const supabase = createSupabaseBrowser()
    const { start, end, prevStart, prevEnd } = getDateRange(range)
    
    // Get user's pitches
    const { data: pitches } = await supabase
      .from('pitches')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
    
    if (!pitches || pitches.length === 0) {
      return {
        shares: { value: 0, deltaPct: 0, spark: generateSparklineData(range, []) },
        views: { value: 0, deltaPct: 0, spark: generateSparklineData(range, []) },
        contacts: { value: 0, deltaPct: 0, spark: generateSparklineData(range, []) }
      }
    }
    
    const pitchIds = pitches.map(p => p.id)
    
    // Get current period data
    const { data: currentEvents } = await supabase
      .from('referral_events')
      .select(`
        id,
        event_type,
        occurred_at,
        referrals!inner (
          pitch_id
        )
      `)
      .in('referrals.pitch_id', pitchIds)
      .gte('occurred_at', start)
      .lte('occurred_at', end)
    
    // Get previous period data
    const { data: prevEvents } = await supabase
      .from('referral_events')
      .select(`
        id,
        event_type,
        occurred_at,
        referrals!inner (
          pitch_id
        )
      `)
      .in('referrals.pitch_id', pitchIds)
      .gte('occurred_at', prevStart)
      .lte('occurred_at', prevEnd)
    
    // Calculate current metrics
    const currentShares = currentEvents?.filter(e => e.event_type === 'SHARE_RESHARED').length || 0
    const currentViews = currentEvents?.filter(e => e.event_type === 'PITCH_VIEWED').length || 0
    const currentContacts = currentEvents?.filter(e => ['CALL_CLICKED', 'EMAIL_CLICKED'].includes(e.event_type)).length || 0
    
    // Calculate previous metrics
    const prevShares = prevEvents?.filter(e => e.event_type === 'SHARE_RESHARED').length || 0
    const prevViews = prevEvents?.filter(e => e.event_type === 'PITCH_VIEWED').length || 0
    const prevContacts = prevEvents?.filter(e => ['CALL_CLICKED', 'EMAIL_CLICKED'].includes(e.event_type)).length || 0
    
    // Calculate deltas
    const sharesDelta = prevShares > 0 ? ((currentShares - prevShares) / prevShares) * 100 : currentShares > 0 ? 100 : 0
    const viewsDelta = prevViews > 0 ? ((currentViews - prevViews) / prevViews) * 100 : currentViews > 0 ? 100 : 0
    const contactsDelta = prevContacts > 0 ? ((currentContacts - prevContacts) / prevContacts) * 100 : currentContacts > 0 ? 100 : 0
    
    // Generate sparkline data (simplified - in real implementation, you'd aggregate by day)
    const sharesSpark = generateSparklineData(range, Array(14).fill(0).map(() => Math.floor(Math.random() * 10)))
    const viewsSpark = generateSparklineData(range, Array(14).fill(0).map(() => Math.floor(Math.random() * 50)))
    const contactsSpark = generateSparklineData(range, Array(14).fill(0).map(() => Math.floor(Math.random() * 5)))
    
    return {
      shares: { value: currentShares, deltaPct: sharesDelta, spark: sharesSpark },
      views: { value: currentViews, deltaPct: viewsDelta, spark: viewsSpark },
      contacts: { value: currentContacts, deltaPct: contactsDelta, spark: contactsSpark }
    }
  } catch (error) {
    console.error('Failed to get progress KPIs:', error)
    return {
      shares: { value: 0, deltaPct: 0, spark: [] },
      views: { value: 0, deltaPct: 0, spark: [] },
      contacts: { value: 0, deltaPct: 0, spark: [] }
    }
  }
}

export async function getProgressFunnel(userId: string, range: Range): Promise<FunnelData> {
  try {
    const supabase = createSupabaseBrowser()
    const { start, end } = getDateRange(range)
    
    // Get user's pitches
    const { data: pitches } = await supabase
      .from('pitches')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
    
    if (!pitches || pitches.length === 0) {
      return [
        { stage: 'shares', value: 0, supporterPct: 0 },
        { stage: 'views', value: 0, supporterPct: 0 },
        { stage: 'contacts', value: 0, supporterPct: 0 }
      ]
    }
    
    const pitchIds = pitches.map(p => p.id)
    
    // Get events for the period
    const { data: events } = await supabase
      .from('referral_events')
      .select(`
        id,
        event_type,
        occurred_at,
        referrals!inner (
          pitch_id,
          user_id
        )
      `)
      .in('referrals.pitch_id', pitchIds)
      .gte('occurred_at', start)
      .lte('occurred_at', end)
    
    // Calculate funnel metrics
    const shares = events?.filter(e => e.event_type === 'SHARE_RESHARED').length || 0
    const views = events?.filter(e => e.event_type === 'PITCH_VIEWED').length || 0
    const contacts = events?.filter(e => ['CALL_CLICKED', 'EMAIL_CLICKED'].includes(e.event_type)).length || 0
    
    // Calculate supporter percentages (simplified - in real implementation, you'd check if user_id is not the veteran)
    const supporterShares = Math.floor(shares * 0.7) // Assume 70% are from supporters
    const supporterViews = Math.floor(views * 0.8) // Assume 80% are from supporters
    const supporterContacts = Math.floor(contacts * 0.6) // Assume 60% are from supporters
    
    return [
      { stage: 'shares', value: shares, supporterPct: shares > 0 ? (supporterShares / shares) * 100 : 0 },
      { stage: 'views', value: views, supporterPct: views > 0 ? (supporterViews / views) * 100 : 0 },
      { stage: 'contacts', value: contacts, supporterPct: contacts > 0 ? (supporterContacts / contacts) * 100 : 0 }
    ]
  } catch (error) {
    console.error('Failed to get progress funnel:', error)
    return [
      { stage: 'shares', value: 0, supporterPct: 0 },
      { stage: 'views', value: 0, supporterPct: 0 },
      { stage: 'contacts', value: 0, supporterPct: 0 }
    ]
  }
}

export async function getTopSupporters(userId: string, range: Range): Promise<SupporterRow[]> {
  try {
    const supabase = createSupabaseBrowser()
    const { start, end } = getDateRange(range)
    
    // Get user's pitches
    const { data: pitches } = await supabase
      .from('pitches')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
    
    if (!pitches || pitches.length === 0) {
      return []
    }
    
    const pitchIds = pitches.map(p => p.id)
    
    // Get referrals with supporter data
    const { data: referrals } = await supabase
      .from('referrals')
      .select(`
        id,
        user_id,
        created_at,
        users!referrals_user_id_fkey (
          name,
          email
        ),
        referral_events (
          id,
          event_type,
          occurred_at
        )
      `)
      .in('pitch_id', pitchIds)
      .gte('created_at', start)
      .lte('created_at', end)
    
    if (!referrals) return []
    
    // Process supporter data
    const supporterMap = new Map<string, SupporterRow>()
    
    referrals.forEach(referral => {
      const supporterId = referral.user_id
      const supporterName = referral.users?.[0]?.name || 'Unknown Supporter'
      
      if (!supporterMap.has(supporterId)) {
        supporterMap.set(supporterId, {
          name: supporterName,
          avatar: null,
          shares: 0,
          views: 0,
          contacts: 0,
          lastAt: referral.created_at
        })
      }
      
      const supporter = supporterMap.get(supporterId)!
      const events = referral.referral_events || []
      
      supporter.shares += events.filter(e => e.event_type === 'SHARE_RESHARED').length
      supporter.views += events.filter(e => e.event_type === 'PITCH_VIEWED').length
      supporter.contacts += events.filter(e => ['CALL_CLICKED', 'EMAIL_CLICKED'].includes(e.event_type)).length
      
      // Update last activity
      const lastEvent = events.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())[0]
      if (lastEvent && new Date(lastEvent.occurred_at) > new Date(supporter.lastAt)) {
        supporter.lastAt = lastEvent.occurred_at
      }
    })
    
    // Convert to array and sort by total impact
    const supporters = Array.from(supporterMap.values())
      .map(s => ({
        ...s,
        totalImpact: s.shares + s.views + s.contacts
      }))
      .sort((a, b) => b.totalImpact - a.totalImpact)
      .slice(0, 10) // Top 10 supporters
      .map(({ totalImpact, ...s }) => s)
    
    return supporters
  } catch (error) {
    console.error('Failed to get top supporters:', error)
    return []
  }
}

export async function getChannelInsights(userId: string, range: Range): Promise<ChannelRow[]> {
  try {
    const supabase = createSupabaseBrowser()
    const { start, end } = getDateRange(range)
    
    // Get user's pitches
    const { data: pitches } = await supabase
      .from('pitches')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
    
    if (!pitches || pitches.length === 0) {
      return []
    }
    
    const pitchIds = pitches.map(p => p.id)
    
    // Get events with platform data
    const { data: events } = await supabase
      .from('referral_events')
      .select(`
        id,
        event_type,
        occurred_at,
        referrals!inner (
          pitch_id
        )
      `)
      .in('referrals.pitch_id', pitchIds)
      .gte('occurred_at', start)
      .lte('occurred_at', end)
    
    if (!events) return []
    
    // Group by channel
    const channelMap = new Map<string, { shares: number; views: number; contacts: number }>()
    
    events.forEach(event => {
      const channel = 'direct'
      const normalizedChannel = channel.toLowerCase() as ChannelRow['channel']
      
      if (!channelMap.has(normalizedChannel)) {
        channelMap.set(normalizedChannel, { shares: 0, views: 0, contacts: 0 })
      }
      
      const channelData = channelMap.get(normalizedChannel)!
      
      if (event.event_type === 'SHARE_RESHARED') {
        channelData.shares++
      } else if (event.event_type === 'PITCH_VIEWED') {
        channelData.views++
      } else if (['CALL_CLICKED', 'EMAIL_CLICKED'].includes(event.event_type)) {
        channelData.contacts++
      }
    })
    
    // Convert to ChannelRow format
    const channels: ChannelRow[] = Array.from(channelMap.entries()).map(([channel, data]) => ({
      channel: channel as ChannelRow['channel'],
      shares: data.shares,
      views: data.views,
      contacts: data.contacts,
      efficiency: data.shares > 0 ? data.views / data.shares : 0
    }))
    
    // Sort by total impact
    return channels.sort((a, b) => (b.views + b.contacts) - (a.views + a.contacts))
  } catch (error) {
    console.error('Failed to get channel insights:', error)
    return []
  }
}

export async function getContacts(userId: string, range: Range): Promise<ContactRow[]> {
  try {
    const supabase = createSupabaseBrowser()
    const { start, end } = getDateRange(range)
    
    // Get user's pitches
    const { data: pitches } = await supabase
      .from('pitches')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
    
    if (!pitches || pitches.length === 0) {
      return []
    }
    
    const pitchIds = pitches.map(p => p.id)
    
    // Get contact events
    const { data: events } = await supabase
      .from('referral_events')
      .select(`
        id,
        event_type,
        occurred_at,
        referrals!inner (
          pitch_id,
          user_id,
          users!referrals_user_id_fkey (
            name
          )
        )
      `)
      .in('referrals.pitch_id', pitchIds)
      .in('event_type', ['CALL_CLICKED', 'EMAIL_CLICKED'])
      .gte('occurred_at', start)
      .lte('occurred_at', end)
      .order('occurred_at', { ascending: false })
    
    if (!events) return []
    
    // Convert to ContactRow format
    const contacts: ContactRow[] = events.map(event => {
      const type = event.event_type === 'CALL_CLICKED' ? 'call' : 'email'
      const channel = 'direct'
      const supporterName = event.referrals?.[0]?.users?.[0]?.name || null
      
      // Calculate time since view (simplified)
      const sinceViewMins = Math.floor(Math.random() * 1440) // Random minutes for demo
      
      return {
        id: event.id,
        type,
        channel,
        supporterName,
        sinceViewMins,
        status: 'open' as const, // Default status
        ts: event.occurred_at
      }
    })
    
    return contacts
  } catch (error) {
    console.error('Failed to get contacts:', error)
    return []
  }
}
