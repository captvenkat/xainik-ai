// =====================================================
// UNIFIED PROGRESS DASHBOARD MICROCOPY PACK
// Veteran-first, clear, human language
// Every line helps veterans understand what they see or what to do next
// =====================================================

export const micro = {
  kpis: {
    shares: "Times your pitch link was posted or forwarded.",
    views: "Unique people who opened your pitch this period.",
    contacts: "Recruiters who called, emailed, or requested your resume.",
  },
  funnel: {
    sharesTip: "Every share recorded with a valid channel.",
    viewsTip: "Each view = one person per day, bots filtered.",
    contactsTip: "Only recruiter actions logged through Xainik.",
    sourceCaption: "Self = your shares · Supporters = signed-up volunteers · Anonymous = wider network.",
  },
  supporters: {
    empty: "No supporters yet — invite your first one today.",
    openNetworkNote: "People outside your circle who still shared your pitch.",
    rowSuffix: (s: number, v: number, c: number) => `${s} shares → ${v} views → ${c} contacts`,
    thank: "Say thanks for their help.",
    askAgain: "Politely ask to share again.",
  },
  channels: {
    helper: "See which channels drive the most attention and recruiter contacts.",
    efficiency: "Efficiency = views generated per share in this channel.",
  },
  contacts: {
    empty: "No recruiter contacts yet — keep sharing and inviting supporters.",
    statusNote: "Closed = you marked a recruiter conversation as complete.",
  },
  nudges: {
    linkedInLow: "LinkedIn underused this week — post now.",
    viewsHighContactsLow: "Many views, few contacts — follow up.",
    thankSupporter: (name: string) => `${name} drove views this week — send a thank-you.`,
  },
}

// =====================================================
// HELPER FUNCTIONS FOR MICROCOPY
// =====================================================

export function getKpiDescription(type: 'shares' | 'views' | 'contacts'): string {
  return micro.kpis[type]
}

export function getKpiTooltip(type: 'shares' | 'views' | 'contacts'): string {
  return micro.kpis[type]
}

export function getFunnelTooltip(stage: 'shares' | 'views' | 'contacts'): string {
  return micro.funnel[`${stage}Tip`]
}

export function getChannelEfficiencyTooltip(): string {
  return micro.channels.efficiency
}

export function getContactStatusTooltip(status: 'open' | 'responded' | 'closed'): string {
  return micro.contacts.statusNote
}

export function getSuggestionExample(key: string): string {
  const nudge = micro.nudges[key as keyof typeof micro.nudges]
  if (typeof nudge === 'function') {
    return nudge('User') // Provide a default name
  }
  return nudge || ''
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  return `${diffInWeeks}w ago`
}
