// =====================================================
// UNIFIED PROGRESS DASHBOARD DEMO DATA
// Mock data for testing without authentication
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

// Helper function to generate sparkline data
function generateSparklineData(range: Range, baseValue: number): { d: string; v: number }[] {
  const days = range === '7d' ? 7 : range === '14d' ? 14 : range === '30d' ? 30 : range === '60d' ? 60 : 90
  const data = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    // Generate realistic variation around base value
    const variation = Math.random() * 0.4 - 0.2 // ±20% variation
    const value = Math.max(0, Math.round(baseValue * (1 + variation)))
    data.push({
      d: date.toISOString().split('T')[0] || date.toISOString(),
      v: value
    })
  }
  
  return data
}

export async function getProgressKpis(userId: string, range: Range): Promise<{ shares: KPI; views: KPI; contacts: KPI }> {
  // Mock data - simulate realistic values
  const sharesValue = 45
  const viewsValue = 128
  const contactsValue = 12
  
  return {
    shares: { 
      value: sharesValue, 
      deltaPct: 15.2, 
      spark: generateSparklineData(range, sharesValue / 7) 
    },
    views: { 
      value: viewsValue, 
      deltaPct: 8.7, 
      spark: generateSparklineData(range, viewsValue / 7) 
    },
    contacts: { 
      value: contactsValue, 
      deltaPct: -3.1, 
      spark: generateSparklineData(range, contactsValue / 7) 
    }
  }
}

export async function getProgressFunnel(userId: string, range: Range): Promise<FunnelData> {
  return [
    { stage: 'shares', value: 45, supporterPct: 65 },
    { stage: 'views', value: 128, supporterPct: 45 },
    { stage: 'contacts', value: 12, supporterPct: 25 }
  ]
}

export async function getTopSupporters(userId: string, range: Range): Promise<SupporterRow[]> {
  return [
    {
      id: '1',
      name: 'Col. Ramesh Kumar',
      avatar: null,
      shares: 8,
      views: 24,
      contacts: 3,
      lastAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      name: 'Lt. Priya Singh',
      avatar: null,
      shares: 6,
      views: 18,
      contacts: 2,
      lastAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      name: 'Open Network Supporters',
      avatar: null,
      shares: 12,
      views: 35,
      contacts: 4,
      lastAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  ]
}

export async function getChannelInsights(userId: string, range: Range): Promise<ChannelRow[]> {
  return [
    { channel: 'whatsapp', shares: 18, views: 52, contacts: 5, efficiency: 2.9 },
    { channel: 'linkedin', shares: 12, views: 38, contacts: 4, efficiency: 3.2 },
    { channel: 'facebook', shares: 8, views: 22, contacts: 2, efficiency: 2.8 },
    { channel: 'email', shares: 5, views: 12, contacts: 1, efficiency: 2.4 },
    { channel: 'twitter', shares: 2, views: 4, contacts: 0, efficiency: 2.0 }
  ]
}

export async function getContacts(userId: string, range: Range): Promise<ContactRow[]> {
  return [
    {
      id: '1',
      type: 'call',
      channel: 'whatsapp',
      supporterName: 'Col. Ramesh Kumar',
      sinceViewMins: 45,
      status: 'open',
      ts: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      type: 'email',
      channel: 'linkedin',
      supporterName: 'Lt. Priya Singh',
      sinceViewMins: 120,
      status: 'responded',
      ts: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      type: 'resume',
      channel: 'email',
      supporterName: null,
      sinceViewMins: 90,
      status: 'closed',
      ts: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      type: 'call',
      channel: 'whatsapp',
      supporterName: 'Open Network Supporters',
      sinceViewMins: 30,
      status: 'open',
      ts: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  ]
}
