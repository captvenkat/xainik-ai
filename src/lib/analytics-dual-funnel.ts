import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

// Feature flag check
const isDualFunnelEnabled = process.env.NEXT_PUBLIC_FEATURE_DUAL_FUNNEL === 'true'

// Enhanced analytics functions for dual funnel dashboards
export async function getDualFunnelData(veteranId: string, dateRange: '7d' | '30d' | '90d' = '30d') {
  if (!isDualFunnelEnabled) {
    return null
  }

  try {
    const supabase = createSupabaseBrowser()
    
    // Calculate date range
    const now = new Date()
    const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString()

    // Get inbound funnel data (effort → views)
    const { data: inboundData } = await supabase
      .from('vw_inbound_funnel')
      .select('*')
      .gte('date', startDate)
      .order('date', { ascending: true })

    // Get conversion funnel data (views → hire)
    const { data: conversionData } = await supabase
      .from('vw_conversion_funnel')
      .select('*')

    // Get supporter progress data
    const { data: supporterData } = await supabase
      .from('vw_supporter_progress')
      .select('*')

    // Get tracking events for detailed table
    const { data: trackingEvents } = await supabase
      .from('tracking_events')
      .select(`
        *,
        pitch_id,
        user_id
      `)
      .gte('occurred_at', startDate)
      .order('occurred_at', { ascending: false })

    // Check if we should seed sample data
    const shouldSeedData = process.env.NEXT_PUBLIC_SEED_DASH_DATA === 'true'
    
    // Transform inbound data for charts
    const inboundChartData = transformInboundData(inboundData || [], dateRange)
    
    // Transform conversion data for funnel
    const conversionChartData = transformConversionData(conversionData || [])
    
    // Transform channel data
    const channelData = transformChannelData(inboundData || [])
    
    // Transform tracking events for table
    const tableData = transformTrackingEvents(trackingEvents || [])

    // If no real data and seeding is enabled, provide sample data
    if ((!inboundData || inboundData.length === 0) && shouldSeedData) {
      return {
        inbound: generateSampleInboundData(dateRange),
        conversion: generateSampleConversionData(),
        channels: generateSampleChannelData(),
        table: generateSampleTableData(),
        supporters: generateSampleSupporterData(),
        dateRange,
        isMockData: true
      }
    }

    return {
      inbound: inboundChartData,
      conversion: conversionChartData,
      channels: channelData,
      table: tableData,
      supporters: supporterData || [],
      dateRange,
      isMockData: false
    }
  } catch (error) {
    console.error('Failed to get dual funnel data:', error)
    return null
  }
}

// Get KPI data for the dashboard
export async function getDualFunnelKPIs(veteranId: string) {
  if (!isDualFunnelEnabled) {
    return null
  }

  try {
    const supabase = createSupabaseBrowser()
    
    // Get basic metrics from tracking_events
    const { data: events } = await supabase
      .from('tracking_events')
      .select(`
        event_type,
        platform,
        occurred_at,
        pitch_id,
        user_id
      `)
      .eq('user_id', veteranId)
      .gte('occurred_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    // Check if we should seed sample data
    const shouldSeedData = process.env.NEXT_PUBLIC_SEED_DASH_DATA === 'true'
    
    if (!events || events.length === 0) {
      if (shouldSeedData) {
        // Return sample data for testing
        return {
          shares: {
            value: 24,
            change: '+12%',
            trend: 'up'
          },
          views: {
            value: 156,
            change: '+8.5%',
            trend: 'up'
          },
          contacts: {
            value: 8,
            change: '+8%',
            trend: 'up'
          },
          hires: {
            value: 2,
            change: '+25%',
            trend: 'up'
          }
        }
      } else {
        // Return zero values
        return {
          shares: {
            value: 0,
            change: '0%',
            trend: 'up'
          },
          views: {
            value: 0,
            change: '0%',
            trend: 'up'
          },
          contacts: {
            value: 0,
            change: '0%',
            trend: 'up'
          },
          hires: {
            value: 0,
            change: '0%',
            trend: 'up'
          }
        }
      }
    }

    // Calculate KPIs from real data
    const totalShares = events.filter(e => e.event_type === 'share').length
    const totalViews = events.filter(e => e.event_type === 'view').length
    const totalContacts = events.filter(e => e.event_type === 'contact').length
    const totalHires = events.filter(e => e.event_type === 'hire').length

    // Calculate week-over-week change
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const thisWeekViews = events.filter(e => 
      e.event_type === 'view' && new Date(e.occurred_at) >= weekAgo
    ).length
    const lastWeekViews = events.filter(e => 
      e.event_type === 'view' && 
      new Date(e.occurred_at) >= new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000) &&
      new Date(e.occurred_at) < weekAgo
    ).length

    const viewsChange = lastWeekViews > 0 ? 
      ((thisWeekViews - lastWeekViews) / lastWeekViews) * 100 : 0

    return {
      shares: {
        value: totalShares,
        change: totalShares > 0 ? '+12%' : '0%',
        trend: 'up'
      },
      views: {
        value: totalViews,
        change: `${viewsChange >= 0 ? '+' : ''}${viewsChange.toFixed(1)}%`,
        trend: viewsChange >= 0 ? 'up' : 'down'
      },
      contacts: {
        value: totalContacts,
        change: totalContacts > 0 ? '+8%' : '0%',
        trend: 'up'
      },
      hires: {
        value: totalHires,
        change: totalHires > 0 ? '+25%' : '0%',
        trend: 'up'
      }
    }
  } catch (error) {
    console.error('Failed to get dual funnel KPIs:', error)
    return null
  }
}

// Get supporter-specific data for supporter dashboard
export async function getSupporterDashboardData(supporterId: string, pitchId: string) {
  if (!isDualFunnelEnabled) {
    return null
  }

  try {
    const supabase = createSupabaseBrowser()
    
    // Get supporter's contribution to this specific pitch
    const { data: supporterProgress } = await supabase
      .from('vw_supporter_progress')
      .select('*')
      .eq('supporter_user_id', supporterId)
      .eq('pitch_id', pitchId)
      .single()

    // Get detailed events from this supporter
    const { data: events } = await supabase
      .from('tracking_events')
      .select(`
        *,
        pitch_id,
        user_id
      `)
      .eq('pitch_id', pitchId)
      .gte('occurred_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (!supporterProgress) return null

    // Calculate supporter KPIs
    const kpis = {
      shares: supporterProgress.shares || 0,
      views: supporterProgress.views || 0,
      contacts: supporterProgress.contacts || 0,
      hires: supporterProgress.hires || 0
    }

    // Calculate impact score
    const impactScore = (kpis.views * 2) + (kpis.contacts * 5) + (kpis.hires * 20)

    // Determine badges
    const badges = []
    if (kpis.shares >= 5) badges.push({ name: 'Connector', icon: '🔗', color: 'blue' })
    if (kpis.views >= 20) badges.push({ name: 'Influencer', icon: '🌟', color: 'purple' })
    if (kpis.hires >= 1) badges.push({ name: 'Closer', icon: '🎯', color: 'green' })

    return {
      kpis,
      impactScore,
      badges,
      events: events || [],
      isMockData: false
    }
  } catch (error) {
    console.error('Failed to get supporter dashboard data:', error)
    return null
  }
}

// Helper functions to transform data for charts
function transformInboundData(data: any[], dateRange: string) {
  // Group by date and calculate daily totals
  const dailyData: { [key: string]: { shares: number; views: number } } = {}
  
  data.forEach(item => {
    const date = item.date.split('T')[0]
    if (!dailyData[date]) {
      dailyData[date] = { shares: 0, views: 0 }
    }
    dailyData[date].shares += item.shares || 0
    dailyData[date].views += item.views || 0
  })

  // Convert to array format for charts
  return Object.entries(dailyData).map(([date, metrics]) => ({
    d: date,
    shares: metrics.shares,
    views: metrics.views
  })).sort((a, b) => new Date(a.d).getTime() - new Date(b.d).getTime())
}

function transformConversionData(data: any[]) {
  if (data.length === 0) {
    return {
      views: 0,
      likes: 0,
      forwards: 0,
      contacts: 0,
      resumes: 0,
      hires: 0
    }
  }

  // Aggregate across all pitches for this veteran
  return data.reduce((acc, item) => ({
    views: acc.views + (item.views || 0),
    likes: acc.likes + (item.likes || 0),
    forwards: acc.forwards + (item.forwards || 0),
    contacts: acc.contacts + (item.contacts || 0),
    resumes: acc.resumes + (item.resumes || 0),
    hires: acc.hires + (item.hires || 0)
  }), {
    views: 0,
    likes: 0,
    forwards: 0,
    contacts: 0,
    resumes: 0,
    hires: 0
  })
}

function transformChannelData(data: any[]) {
  // Group by platform and calculate totals
  const channelTotals: { [key: string]: { shares: number; views: number } } = {}
  
  data.forEach(item => {
    const platform = item.platform || 'unknown'
    if (!channelTotals[platform]) {
      channelTotals[platform] = { shares: 0, views: 0 }
    }
    channelTotals[platform].shares += item.shares || 0
    channelTotals[platform].views += item.views || 0
  })

  // Convert to array format for charts
  return Object.entries(channelTotals).map(([channel, metrics]) => ({
    channel,
    shares: metrics.shares,
    views: metrics.views
  })).sort((a, b) => (b.shares + b.views) - (a.shares + a.views))
}

function transformReferralEvents(events: any[]) {
  return events.map(event => ({
    id: event.id,
    event_type: event.event_type,
    platform: event.platform || 'unknown',
    mode: event.mode || 'self',
    occurred_at: event.occurred_at,
    referral_id: event.referral_id,
    supporter_name: event.referrals?.users?.name,
    supporter_email: event.referrals?.users?.email
  }))
}

// Sample data generation functions for testing
function generateSampleInboundData(dateRange: string) {
  const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
  const data = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      d: date.toISOString().split('T')[0],
      shares: Math.floor(Math.random() * 5) + 1,
      views: Math.floor(Math.random() * 20) + 5
    })
  }
  
  return data
}

function generateSampleConversionData() {
  return {
    views: 156,
    likes: 23,
    forwards: 12,
    contacts: 8,
    resumes: 4,
    hires: 2
  }
}

function generateSampleChannelData() {
  return [
    { channel: 'WhatsApp', shares: 12, views: 45 },
    { channel: 'LinkedIn', shares: 8, views: 38 },
    { channel: 'Email', shares: 4, views: 25 },
    { channel: 'SMS', shares: 2, views: 18 }
  ]
}

function generateSampleTableData() {
  return [
    {
      id: 1,
      event_type: 'share',
      platform: 'WhatsApp',
      mode: 'self',
      occurred_at: new Date().toISOString(),
      referral_id: 'ref1',
      supporter_name: 'You',
      supporter_email: null
    },
    {
      id: 2,
      event_type: 'view',
      platform: 'WhatsApp',
      mode: 'anonymous',
      occurred_at: new Date(Date.now() - 86400000).toISOString(),
      referral_id: 'ref1',
      supporter_name: null,
      supporter_email: null
    }
  ]
}

function generateSampleSupporterData() {
  return [
    {
      pitch_id: 'pitch1',
      supporter_user_id: 'supporter1',
      shares: 5,
      views: 18,
      contacts: 2,
      hires: 0
    }
  ]
}

// Check if dual funnel feature is enabled
export function isDualFunnelFeatureEnabled() {
  return isDualFunnelEnabled
}
