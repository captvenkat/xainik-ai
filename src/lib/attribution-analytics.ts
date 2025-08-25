// Attribution Analytics - Complete referral chain tracking and analysis
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

// Get complete attribution chain for a pitch
export async function getAttributionChain(pitchId: string) {
  try {
    const supabase = createSupabaseBrowser()
    
    const { data: attributionChain, error } = await supabase
      .from('attribution_chain_view')
      .select('*')
      .eq('pitch_id', pitchId)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    return attributionChain || []
  } catch (error) {
    console.error('Error fetching attribution chain:', error)
    return []
  }
}

// Get supporter attribution performance
export async function getSupporterAttributionPerformance(pitchId?: string, supporterId?: string) {
  try {
    const supabase = createSupabaseBrowser()
    
    let query = supabase
      .from('supporter_attribution_performance')
      .select('*')
      .order('attribution_value', { ascending: false })

    if (pitchId) {
      query = query.eq('pitch_id', pitchId)
    }
    
    if (supporterId) {
      query = query.eq('supporter_id', supporterId)
    }

    const { data: performance, error } = await query

    if (error) throw error
    
    return performance || []
  } catch (error) {
    console.error('Error fetching supporter attribution performance:', error)
    return []
  }
}

// Get viral coefficient analysis
export async function getViralCoefficientAnalysis(pitchId?: string) {
  try {
    const supabase = createSupabaseBrowser()
    
    let query = supabase
      .from('viral_coefficient_analysis')
      .select('*')
      .order('viral_coefficient', { ascending: false })

    if (pitchId) {
      query = query.eq('pitch_id', pitchId)
    }

    const { data: analysis, error } = await query

    if (error) throw error
    
    return analysis || []
  } catch (error) {
    console.error('Error fetching viral coefficient analysis:', error)
    return []
  }
}

// Get attribution summary for veteran dashboard
export async function getAttributionSummary(veteranId: string) {
  try {
    const supabase = createSupabaseBrowser()
    
    // Get all pitches for the veteran
    const { data: pitches } = await supabase
      .from('pitches')
      .select('id')
      .eq('user_id', veteranId)
      .eq('is_active', true)

    if (!pitches || pitches.length === 0) {
      return {
        totalReferrals: 0,
        totalChainReach: 0,
        totalAttributedViews: 0,
        totalAttributedCalls: 0,
        totalAttributedEmails: 0,
        totalAttributedShares: 0,
        totalAttributedConversions: 0,
        viralCoefficient: 0,
        attributionValue: 0,
        topSupporters: [],
        attributionChains: []
      }
    }

    const pitchIds = pitches.map(p => p.id)

    // Get supporter attribution performance for all pitches
    const { data: supporterPerformance } = await supabase
      .from('supporter_attribution_performance')
      .select('*')
      .in('pitch_id', pitchIds)
      .order('attribution_value', { ascending: false })
      .limit(10)

    // Get attribution chains for all pitches
    const { data: attributionChains } = await supabase
      .from('attribution_chain_view')
      .select('*')
      .in('pitch_id', pitchIds)
      .order('created_at', { ascending: false })
      .limit(20)

    // Calculate totals
    const totals = supporterPerformance?.reduce((acc, perf) => ({
      totalReferrals: acc.totalReferrals + (perf.total_referrals_created || 0),
      totalChainReach: acc.totalChainReach + (perf.total_chain_reach || 0),
      totalAttributedViews: acc.totalAttributedViews + (perf.total_attributed_views || 0),
      totalAttributedCalls: acc.totalAttributedCalls + (perf.total_attributed_calls || 0),
      totalAttributedEmails: acc.totalAttributedEmails + (perf.total_attributed_emails || 0),
      totalAttributedShares: acc.totalAttributedShares + (perf.total_attributed_shares || 0),
      totalAttributedConversions: acc.totalAttributedConversions + (perf.total_attributed_conversions || 0),
      attributionValue: acc.attributionValue + (perf.attribution_value || 0)
    }), {
      totalReferrals: 0,
      totalChainReach: 0,
      totalAttributedViews: 0,
      totalAttributedCalls: 0,
      totalAttributedEmails: 0,
      totalAttributedShares: 0,
      totalAttributedConversions: 0,
      attributionValue: 0
    }) || {
      totalReferrals: 0,
      totalChainReach: 0,
      totalAttributedViews: 0,
      totalAttributedCalls: 0,
      totalAttributedEmails: 0,
      totalAttributedShares: 0,
      totalAttributedConversions: 0,
      attributionValue: 0
    }

    // Calculate viral coefficient
    const viralCoefficient = totals.totalAttributedViews > 0 
      ? (totals.totalAttributedShares / totals.totalAttributedViews) * 100 
      : 0

    return {
      ...totals,
      viralCoefficient: Math.round(viralCoefficient * 100) / 100,
      topSupporters: supporterPerformance || [],
      attributionChains: attributionChains || []
    }
  } catch (error) {
    console.error('Error fetching attribution summary:', error)
    return {
      totalReferrals: 0,
      totalChainReach: 0,
      totalAttributedViews: 0,
      totalAttributedCalls: 0,
      totalAttributedEmails: 0,
      totalAttributedShares: 0,
      totalAttributedConversions: 0,
      viralCoefficient: 0,
      attributionValue: 0,
      topSupporters: [],
      attributionChains: []
    }
  }
}

// Get real-time attribution metrics
export async function getRealtimeAttributionMetrics(pitchId: string) {
  try {
    const supabase = createSupabaseBrowser()
    
    // Get today's attribution events
    const today = new Date().toISOString().split('T')[0]
    
    const { data: todayEvents } = await supabase
      .from('attribution_events')
      .select('*')
      .eq('pitch_id', pitchId)
      .gte('occurred_at', today)
      .order('occurred_at', { ascending: false })

    // Get this week's attribution events
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: weekEvents } = await supabase
      .from('attribution_events')
      .select('*')
      .eq('pitch_id', pitchId)
      .gte('occurred_at', oneWeekAgo)
      .order('occurred_at', { ascending: false })

    // Calculate metrics
    const todayMetrics = {
      views: todayEvents?.filter(e => e.event_type === 'PITCH_VIEWED').length || 0,
      calls: todayEvents?.filter(e => e.event_type === 'CALL_CLICKED' || e.event_type === 'PHONE_CLICKED').length || 0,
      emails: todayEvents?.filter(e => e.event_type === 'EMAIL_CLICKED').length || 0,
      shares: todayEvents?.filter(e => e.event_type === 'SHARE_RESHARED').length || 0,
      conversions: todayEvents?.filter(e => ['CALL_CLICKED', 'PHONE_CLICKED', 'EMAIL_CLICKED'].includes(e.event_type)).length || 0
    }

    const weekMetrics = {
      views: weekEvents?.filter(e => e.event_type === 'PITCH_VIEWED').length || 0,
      calls: weekEvents?.filter(e => e.event_type === 'CALL_CLICKED' || e.event_type === 'PHONE_CLICKED').length || 0,
      emails: weekEvents?.filter(e => e.event_type === 'EMAIL_CLICKED').length || 0,
      shares: weekEvents?.filter(e => e.event_type === 'SHARE_RESHARED').length || 0,
      conversions: weekEvents?.filter(e => ['CALL_CLICKED', 'PHONE_CLICKED', 'EMAIL_CLICKED'].includes(e.event_type)).length || 0
    }

    return {
      today: todayMetrics,
      thisWeek: weekMetrics,
      recentEvents: todayEvents?.slice(0, 10) || []
    }
  } catch (error) {
    console.error('Error fetching realtime attribution metrics:', error)
    return {
      today: { views: 0, calls: 0, emails: 0, shares: 0, conversions: 0 },
      thisWeek: { views: 0, calls: 0, emails: 0, shares: 0, conversions: 0 },
      recentEvents: []
    }
  }
}

// Get attribution breakdown by source type
export async function getAttributionBreakdown(pitchId: string) {
  try {
    const supabase = createSupabaseBrowser()
    
    const { data: breakdown, error } = await supabase
      .from('attribution_events')
      .select('source_type, event_type, occurred_at')
      .eq('pitch_id', pitchId)
      .gte('occurred_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

    if (error) throw error

    // Group by source type
    const sourceBreakdown = breakdown?.reduce((acc, event) => {
      const sourceType = event.source_type || 'unknown'
      if (!acc[sourceType]) {
        acc[sourceType] = {
          views: 0,
          calls: 0,
          emails: 0,
          shares: 0,
          conversions: 0,
          total: 0
        }
      }
      
      acc[sourceType].total++
      
      switch (event.event_type) {
        case 'PITCH_VIEWED':
          acc[sourceType].views++
          break
        case 'CALL_CLICKED':
        case 'PHONE_CLICKED':
          acc[sourceType].calls++
          acc[sourceType].conversions++
          break
        case 'EMAIL_CLICKED':
          acc[sourceType].emails++
          acc[sourceType].conversions++
          break
        case 'SHARE_RESHARED':
          acc[sourceType].shares++
          break
      }
      
      return acc
    }, {} as Record<string, any>) || {}

    return sourceBreakdown
  } catch (error) {
    console.error('Error fetching attribution breakdown:', error)
    return {}
  }
}

// Get attribution chain depth analysis
export async function getChainDepthAnalysis(pitchId: string) {
  try {
    const supabase = createSupabaseBrowser()
    
    const { data: chains, error } = await supabase
      .from('attribution_chain_view')
      .select('attribution_depth, chain_total_views, chain_total_calls, chain_total_emails, chain_total_shares, chain_total_conversions')
      .eq('pitch_id', pitchId)

    if (error) throw error

    // Group by depth
    const depthAnalysis = chains?.reduce((acc, chain) => {
      const depth = chain.attribution_depth || 0
      if (!acc[depth]) {
        acc[depth] = {
          chains: 0,
          totalViews: 0,
          totalCalls: 0,
          totalEmails: 0,
          totalShares: 0,
          totalConversions: 0
        }
      }
      
      acc[depth].chains++
      acc[depth].totalViews += chain.chain_total_views || 0
      acc[depth].totalCalls += chain.chain_total_calls || 0
      acc[depth].totalEmails += chain.chain_total_emails || 0
      acc[depth].totalShares += chain.chain_total_shares || 0
      acc[depth].totalConversions += chain.chain_total_conversions || 0
      
      return acc
    }, {} as Record<number, any>) || {}

    return depthAnalysis
  } catch (error) {
    console.error('Error fetching chain depth analysis:', error)
    return {}
  }
}

// Get top performing attribution chains
export async function getTopAttributionChains(pitchId: string, limit: number = 10) {
  try {
    const supabase = createSupabaseBrowser()
    
    const { data: chains, error } = await supabase
      .from('attribution_chain_view')
      .select('*')
      .eq('pitch_id', pitchId)
      .order('chain_total_conversions', { ascending: false })
      .limit(limit)

    if (error) throw error
    
    return chains || []
  } catch (error) {
    console.error('Error fetching top attribution chains:', error)
    return []
  }
}

// Get attribution timeline
export async function getAttributionTimeline(pitchId: string, days: number = 30) {
  try {
    const supabase = createSupabaseBrowser()
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: events, error } = await supabase
      .from('attribution_events')
      .select('event_type, occurred_at, source_type, attribution_depth')
      .eq('pitch_id', pitchId)
      .gte('occurred_at', startDate)
      .order('occurred_at', { ascending: true })

    if (error) throw error

    // Group by date
    const timeline = events?.reduce((acc, event) => {
      const date = event.occurred_at.split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          views: 0,
          calls: 0,
          emails: 0,
          shares: 0,
          conversions: 0,
          direct: 0,
          supporter: 0,
          chain: 0,
          anonymous: 0
        }
      }
      
      // Count by event type
      switch (event.event_type) {
        case 'PITCH_VIEWED':
          acc[date].views++
          break
        case 'CALL_CLICKED':
        case 'PHONE_CLICKED':
          acc[date].calls++
          acc[date].conversions++
          break
        case 'EMAIL_CLICKED':
          acc[date].emails++
          acc[date].conversions++
          break
        case 'SHARE_RESHARED':
          acc[date].shares++
          break
      }
      
      // Count by source type
      const sourceType = event.source_type || 'unknown'
      if (acc[date].hasOwnProperty(sourceType)) {
        acc[date][sourceType]++
      }
      
      return acc
    }, {} as Record<string, any>) || {}

    return timeline
  } catch (error) {
    console.error('Error fetching attribution timeline:', error)
    return {}
  }
}
