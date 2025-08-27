import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

export type Range = '7d' | '14d' | '30d' | '60d' | '90d'

export type KPI = { 
  value: number
  deltaPct: number
  spark: { d: string; v: number }[] 
}

export type FunnelPoint = {
  stage: 'shares' | 'views' | 'contacts'
  value: number
  sourceSplit: { 
    selfPct: number
    supporterPct: number
    anonPct: number 
  }
}

export type SupporterRow = {
  id: string
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
  efficiency: number // views per share in range
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

function getDateRangeFilter(range: Range): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()
  
  switch (range) {
    case '7d':
      start.setDate(end.getDate() - 7)
      break
    case '14d':
      start.setDate(end.getDate() - 14)
      break
    case '30d':
      start.setDate(end.getDate() - 30)
      break
    case '60d':
      start.setDate(end.getDate() - 60)
      break
    case '90d':
      start.setDate(end.getDate() - 90)
      break
  }
  
  return { start, end }
}

export async function getProgressKpis(userId: string, range: Range): Promise<{ shares: KPI; views: KPI; contacts: KPI }> {
  try {
    const supabase = createSupabaseBrowser()
    const { start, end } = getDateRangeFilter(range)
    
    // Get current period data
    const { data: currentEvents } = await supabase
      .from('referral_events')
      .select(`
        id,
        event_type,
        occurred_at,
        referrals!inner (
          pitch_id,
          pitches!inner (
            user_id
          )
        )
      `)
      .eq('referrals.pitches.user_id', userId)
      .gte('occurred_at', start.toISOString())
      .lte('occurred_at', end.toISOString())

    // Get previous period data for comparison
    const prevStart = new Date(start)
    const prevEnd = new Date(start)
    const periodDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    prevStart.setDate(prevStart.getDate() - periodDays)
    prevEnd.setDate(prevEnd.getDate() - 1)

    const { data: previousEvents } = await supabase
      .from('referral_events')
      .select(`
        id,
        event_type,
        occurred_at,
        referrals!inner (
          pitch_id,
          pitches!inner (
            user_id
          )
        )
      `)
      .eq('referrals.pitches.user_id', userId)
      .gte('occurred_at', prevStart.toISOString())
      .lte('occurred_at', prevEnd.toISOString())

    // Calculate current period metrics
    const currentShares = currentEvents?.filter(e => e.event_type === 'SHARE_RESHARED').length || 0
    const currentViews = currentEvents?.filter(e => e.event_type === 'PITCH_VIEWED').length || 0
    const currentContacts = currentEvents?.filter(e => ['CALL_CLICKED', 'EMAIL_CLICKED'].includes(e.event_type)).length || 0

    // Calculate previous period metrics
    const previousShares = previousEvents?.filter(e => e.event_type === 'SHARE_RESHARED').length || 0
    const previousViews = previousEvents?.filter(e => e.event_type === 'PITCH_VIEWED').length || 0
    const previousContacts = previousEvents?.filter(e => ['CALL_CLICKED', 'EMAIL_CLICKED'].includes(e.event_type)).length || 0

    // Calculate delta percentages
    const sharesDelta = previousShares > 0 ? ((currentShares - previousShares) / previousShares) * 100 : 0
    const viewsDelta = previousViews > 0 ? ((currentViews - previousViews) / previousViews) * 100 : 0
    const contactsDelta = previousContacts > 0 ? ((currentContacts - previousContacts) / previousContacts) * 100 : 0

    // Generate sparkline data (last 7 days)
    const sparkData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      const dayViews = currentEvents?.filter(e => 
        e.event_type === 'PITCH_VIEWED' &&
        new Date(e.occurred_at) >= dayStart &&
        new Date(e.occurred_at) <= dayEnd
      ).length || 0
      
      sparkData.push({
        d: date.toISOString().split('T')[0] || date.toISOString(),
        v: dayViews
      })
    }

    return {
      shares: {
        value: currentShares,
        deltaPct: sharesDelta,
        spark: sparkData
      },
      views: {
        value: currentViews,
        deltaPct: viewsDelta,
        spark: sparkData
      },
      contacts: {
        value: currentContacts,
        deltaPct: contactsDelta,
        spark: sparkData
      }
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

export async function getFunnel(userId: string, range: Range): Promise<FunnelPoint[]> {
  try {
    const supabase = createSupabaseBrowser()
    const { start, end } = getDateRangeFilter(range)

    // Get all events for the period
    const { data: events } = await supabase
      .from('referral_events')
      .select(`
        id,
        event_type,
        occurred_at,
        referrals!inner (
          id,
          supporter_id,
          pitch_id,
          pitches!inner (
            user_id
          )
        )
      `)
      .eq('referrals.pitches.user_id', userId)
      .gte('occurred_at', start.toISOString())
      .lte('occurred_at', end.toISOString())

    if (!events) return []

    // Calculate funnel stages
    const shares = events.filter(e => e.event_type === 'SHARE_RESHARED').length
    const views = events.filter(e => e.event_type === 'PITCH_VIEWED').length
    const contacts = events.filter(e => ['CALL_CLICKED', 'EMAIL_CLICKED'].includes(e.event_type)).length

    // Calculate source attribution
    const selfShares = events.filter(e => 
      e.event_type === 'SHARE_RESHARED' && 
      (e.referrals as any)?.supporter_id === userId
    ).length

    const supporterShares = events.filter(e => 
      e.event_type === 'SHARE_RESHARED' && 
      (e.referrals as any)?.supporter_id !== userId
    ).length

    const anonShares = shares - selfShares - supporterShares

    const selfPct = shares > 0 ? (selfShares / shares) * 100 : 0
    const supporterPct = shares > 0 ? (supporterShares / shares) * 100 : 0
    const anonPct = shares > 0 ? (anonShares / shares) * 100 : 0

    return [
      {
        stage: 'shares',
        value: shares,
        sourceSplit: { selfPct, supporterPct, anonPct }
      },
      {
        stage: 'views',
        value: views,
        sourceSplit: { selfPct, supporterPct, anonPct }
      },
      {
        stage: 'contacts',
        value: contacts,
        sourceSplit: { selfPct, supporterPct, anonPct }
      }
    ]
  } catch (error) {
    console.error('Failed to get funnel data:', error)
    return []
  }
}

export async function getTopSupporters(userId: string, range: Range): Promise<SupporterRow[]> {
  try {
    const supabase = createSupabaseBrowser()
    const { start, end } = getDateRangeFilter(range)

    // Get supporter referrals and their events
    const { data: referrals } = await supabase
      .from('referrals')
      .select(`
        id,
        supporter_id,
        created_at,
        users!referrals_supporter_id_fkey (
          id,
          name,
          email
        ),
        referral_events (
          id,
          event_type,
          occurred_at
        ),
        pitches!inner (
          user_id
        )
      `)
      .eq('pitches.user_id', userId)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())

    if (!referrals) return []

    // Process supporter data
    const supporterMap = new Map<string, SupporterRow>()

    referrals.forEach(referral => {
      const supporterId = referral.supporter_id
      const events = referral.referral_events || []
      
      if (!supporterMap.has(supporterId)) {
        supporterMap.set(supporterId, {
          id: supporterId,
          name: (referral.users as any)?.name || 'Unknown Supporter',
          avatar: null,
          shares: 0,
          views: 0,
          contacts: 0,
          lastAt: referral.created_at
        })
      }

      const supporter = supporterMap.get(supporterId)!
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
    return Array.from(supporterMap.values())
      .map(s => ({
        ...s,
        totalImpact: s.shares + s.views + s.contacts
      }))
      .sort((a, b) => b.totalImpact - a.totalImpact)
      .slice(0, 10) // Top 10 supporters
      .map(({ totalImpact, ...supporter }) => supporter)
  } catch (error) {
    console.error('Failed to get top supporters:', error)
    return []
  }
}

export async function getChannelInsights(userId: string, range: Range): Promise<ChannelRow[]> {
  try {
    const supabase = createSupabaseBrowser()
    const { start, end } = getDateRangeFilter(range)

    // Get events by channel
    const { data: events } = await supabase
      .from('referral_events')
      .select(`
        id,
        event_type,
        occurred_at,
        referrals!inner (
          pitch_id,
          pitches!inner (
            user_id
          )
        )
      `)
      .eq('referrals.pitches.user_id', userId)
      .gte('occurred_at', start.toISOString())
      .lte('occurred_at', end.toISOString())

    if (!events) return []

    // Group by channel
    const channelMap = new Map<string, ChannelRow>()

    const channels: Array<'whatsapp' | 'linkedin' | 'facebook' | 'email' | 'twitter' | 'direct'> = [
      'whatsapp', 'linkedin', 'facebook', 'email', 'twitter', 'direct'
    ]

    channels.forEach(channel => {
      channelMap.set(channel, {
        channel,
        shares: 0,
        views: 0,
        contacts: 0,
        efficiency: 0
      })
    })

    events.forEach(event => {
      const channel = 'direct'
      const channelData = channelMap.get(channel) || channelMap.get('direct')!
      
      if (event.event_type === 'SHARE_RESHARED') {
        channelData.shares++
      } else if (event.event_type === 'PITCH_VIEWED') {
        channelData.views++
      } else if (['CALL_CLICKED', 'EMAIL_CLICKED'].includes(event.event_type)) {
        channelData.contacts++
      }
    })

    // Calculate efficiency
    Array.from(channelMap.values()).forEach(channel => {
      channel.efficiency = channel.shares > 0 ? channel.views / channel.shares : 0
    })

    return Array.from(channelMap.values())
      .filter(channel => channel.shares > 0 || channel.views > 0 || channel.contacts > 0)
      .sort((a, b) => b.views - a.views)
  } catch (error) {
    console.error('Failed to get channel insights:', error)
    return []
  }
}

export async function getContacts(userId: string, range: Range): Promise<ContactRow[]> {
  try {
    const supabase = createSupabaseBrowser()
    const { start, end } = getDateRangeFilter(range)

    // Get contact events
    const { data: events } = await supabase
      .from('referral_events')
      .select(`
        id,
        event_type,
        occurred_at,
        referrals!inner (
          id,
          supporter_id,
          pitch_id,
          users!referrals_supporter_id_fkey (
            name
          ),
          pitches!inner (
            user_id
          )
        )
      `)
      .eq('referrals.pitches.user_id', userId)
      .in('event_type', ['CALL_CLICKED', 'EMAIL_CLICKED'])
      .gte('occurred_at', start.toISOString())
      .lte('occurred_at', end.toISOString())
      .order('occurred_at', { ascending: false })

    if (!events) return []

    // Convert to contact rows
    const contacts: ContactRow[] = events.map(event => {
      const type = event.event_type === 'CALL_CLICKED' ? 'call' : 'email'
      const channel = 'direct'
      const supporterName = (event.referrals as any)?.users?.name || null
      
      return {
        id: event.id,
        type,
        channel,
        supporterName,
        sinceViewMins: null, // Could be calculated if we track view timestamps
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
