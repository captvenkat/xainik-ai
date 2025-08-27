// Professional Tracking System - Central entities: user_id, pitch_id
export interface TrackingEvent {
  eventType: string
  pitchId: string // Central tracking entity
  userId: string // Central source of truth
  referralId?: string
  parentReferralId?: string
  platform?: string
  metadata?: Record<string, any>
  sessionId?: string
}

// Universal tracking function with central entities
export async function trackEvent(event: TrackingEvent) {
  try {
    // Method 1: API call (preferred for complex events)
    const response = await fetch('/api/track-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType: event.eventType,
        pitchId: event.pitchId, // Central tracking entity
        userId: event.userId, // Central source of truth
        referralId: event.referralId,
        parentReferralId: event.parentReferralId,
        platform: event.platform || 'web',
        userAgent: navigator.userAgent,
        ipAddress: 'client-side',
        sessionId: event.sessionId || generateSessionId(),
        metadata: event.metadata || {},
        timestamp: new Date().toISOString()
      })
    })

    if (!response.ok) {
      throw new Error('API tracking failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Tracking failed:', error)
    
    // Method 2: Pixel fallback (always works)
    try {
      const params = new URLSearchParams({
        event: event.eventType,
        pitch: event.pitchId, // Central tracking entity
        user: event.userId, // Central source of truth
        ...(event.referralId && { ref: event.referralId }),
        ...(event.parentReferralId && { parent: event.parentReferralId }),
        ...(event.platform && { platform: event.platform }),
        ...(event.sessionId && { session: event.sessionId }),
        ...(event.metadata && { meta: JSON.stringify(event.metadata) })
      })

      const pixelUrl = `/api/track-event?${params}`
      
      // Create invisible image for pixel tracking
      const img = new Image()
      img.src = pixelUrl
      img.style.display = 'none'
      document.body.appendChild(img)
      
      // Clean up after tracking
      setTimeout(() => {
        if (img.parentNode) {
          img.parentNode.removeChild(img)
        }
      }, 1000)
      
      return { success: true, tracked: true, method: 'pixel' }
    } catch (pixelError) {
      console.error('Pixel tracking also failed:', pixelError)
      return { success: false, error: 'All tracking methods failed' }
    }
  }
}

// Generate unique session ID
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Get current user ID (central source of truth)
async function getCurrentUserId(): Promise<string | null> {
  try {
    // Try to get from auth context or localStorage
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('supabase.auth.token')
      if (authData) {
        const parsed = JSON.parse(authData)
        return parsed?.currentSession?.user?.id || null
      }
    }
    return null
  } catch (error) {
    console.error('Error getting current user ID:', error)
    return null
  }
}

// Get pitch owner user ID
async function getPitchOwnerId(pitchId: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/pitch/${pitchId}/owner`)
    if (response.ok) {
      const data = await response.json()
      return data.userId
    }
    return null
  } catch (error) {
    console.error('Error getting pitch owner ID:', error)
    return null
  }
}

// Convenience functions for common events with central entities
export const tracking = {
  // Pitch views
  pitchViewed: async (pitchId: string, referralId?: string, parentReferralId?: string, platform?: string) => {
    const userId = await getPitchOwnerId(pitchId)
    if (!userId) return { success: false, error: 'Could not determine pitch owner' }
    
    return trackEvent({ 
      eventType: 'PITCH_VIEWED', 
      pitchId, // Central tracking entity
      userId, // Central source of truth
      referralId, 
      parentReferralId, 
      platform 
    })
  },
  
  // Contact actions
  callClicked: async (pitchId: string, referralId?: string, parentReferralId?: string, platform?: string) => {
    const userId = await getPitchOwnerId(pitchId)
    if (!userId) return { success: false, error: 'Could not determine pitch owner' }
    
    return trackEvent({ 
      eventType: 'CALL_CLICKED', 
      pitchId, // Central tracking entity
      userId, // Central source of truth
      referralId, 
      parentReferralId, 
      platform 
    })
  },
  
  phoneClicked: async (pitchId: string, referralId?: string, parentReferralId?: string, platform?: string) => {
    const userId = await getPitchOwnerId(pitchId)
    if (!userId) return { success: false, error: 'Could not determine pitch owner' }
    
    return trackEvent({ 
      eventType: 'PHONE_CLICKED', 
      pitchId, // Central tracking entity
      userId, // Central source of truth
      referralId, 
      parentReferralId, 
      platform 
    })
  },
  
  emailClicked: async (pitchId: string, referralId?: string, parentReferralId?: string, platform?: string) => {
    const userId = await getPitchOwnerId(pitchId)
    if (!userId) return { success: false, error: 'Could not determine pitch owner' }
    
    return trackEvent({ 
      eventType: 'EMAIL_CLICKED', 
      pitchId, // Central tracking entity
      userId, // Central source of truth
      referralId, 
      parentReferralId, 
      platform 
    })
  },
  
  linkedinClicked: async (pitchId: string, referralId?: string, parentReferralId?: string, platform?: string) => {
    const userId = await getPitchOwnerId(pitchId)
    if (!userId) return { success: false, error: 'Could not determine pitch owner' }
    
    return trackEvent({ 
      eventType: 'LINKEDIN_CLICKED', 
      pitchId, // Central tracking entity
      userId, // Central source of truth
      referralId, 
      parentReferralId, 
      platform 
    })
  },
  
  // Resume requests
  resumeRequestClicked: async (pitchId: string, referralId?: string, parentReferralId?: string, platform?: string) => {
    const userId = await getPitchOwnerId(pitchId)
    if (!userId) return { success: false, error: 'Could not determine pitch owner' }
    
    return trackEvent({ 
      eventType: 'RESUME_REQUEST_CLICKED', 
      pitchId, // Central tracking entity
      userId, // Central source of truth
      referralId, 
      parentReferralId, 
      platform 
    })
  },
  
  // Share actions
  shareClicked: async (pitchId: string, referralId?: string, parentReferralId?: string, platform?: string) => {
    const userId = await getPitchOwnerId(pitchId)
    if (!userId) return { success: false, error: 'Could not determine pitch owner' }
    
    return trackEvent({ 
      eventType: 'SHARE_RESHARED', 
      pitchId, // Central tracking entity
      userId, // Central source of truth
      referralId, 
      parentReferralId, 
      platform 
    })
  },
  
  // Sharing
  shareReshared: async (pitchId: string, referralId?: string, parentReferralId?: string, platform?: string) => {
    const userId = await getPitchOwnerId(pitchId)
    if (!userId) return { success: false, error: 'Could not determine pitch owner' }
    
    return trackEvent({ 
      eventType: 'SHARE_RESHARED', 
      pitchId, // Central tracking entity
      userId, // Central source of truth
      referralId, 
      parentReferralId, 
      platform 
    })
  },
  
  linkOpened: async (pitchId: string, referralId?: string, parentReferralId?: string, platform?: string) => {
    const userId = await getPitchOwnerId(pitchId)
    if (!userId) return { success: false, error: 'Could not determine pitch owner' }
    
    return trackEvent({ 
      eventType: 'LINK_OPENED', 
      pitchId, // Central tracking entity
      userId, // Central source of truth
      referralId, 
      parentReferralId, 
      platform 
    })
  },
  
  // Signups
  signupFromReferral: async (pitchId: string, referralId: string, parentReferralId?: string, platform?: string) => {
    const userId = await getPitchOwnerId(pitchId)
    if (!userId) return { success: false, error: 'Could not determine pitch owner' }
    
    return trackEvent({ 
      eventType: 'SIGNUP_FROM_REFERRAL', 
      pitchId, // Central tracking entity
      userId, // Central source of truth
      referralId, 
      parentReferralId, 
      platform 
    })
  },
  
  // Custom events
  custom: async (eventType: string, pitchId: string, referralId?: string, parentReferralId?: string, platform?: string, metadata?: Record<string, any>) => {
    const userId = await getPitchOwnerId(pitchId)
    if (!userId) return { success: false, error: 'Could not determine pitch owner' }
    
    return trackEvent({ 
      eventType, 
      pitchId, // Central tracking entity
      userId, // Central source of truth
      referralId, 
      parentReferralId, 
      platform, 
      metadata 
    })
  }
}

// Auto-tracking for common interactions with central entities
export function enableAutoTracking() {
  // Track all pitch views automatically
  const trackPitchViews = async () => {
    const pitchId = window.location.pathname.match(/\/pitch\/([^\/]+)(?:\/|$)/)?.[1]
    const referralId = new URLSearchParams(window.location.search).get('ref')
    const parentReferralId = new URLSearchParams(window.location.search).get('parent')
    
    // Skip tracking for special routes like /pitch/new, /pitch/edit, etc.
    if (pitchId && ['new', 'edit', 'create'].includes(pitchId)) {
      return
    }
    
    if (pitchId) {
      await tracking.pitchViewed(pitchId, referralId || undefined, parentReferralId || undefined, 'web')
    }
  }

  // Track contact button clicks
  const trackContactClicks = async (event: Event) => {
    const target = event.target as HTMLElement
    const pitchId = window.location.pathname.match(/\/pitch\/([^\/]+)(?:\/|$)/)?.[1]
    const referralId = new URLSearchParams(window.location.search).get('ref')
    const parentReferralId = new URLSearchParams(window.location.search).get('parent')
    
    // Skip tracking for special routes like /pitch/new, /pitch/edit, etc.
    if (!pitchId || ['new', 'edit', 'create'].includes(pitchId)) return
    
    if (target.closest('[data-track="call"]') || target.closest('[data-track="phone"]')) {
      await tracking.callClicked(pitchId, referralId || undefined, parentReferralId || undefined, 'web')
    } else if (target.closest('[data-track="email"]')) {
      await tracking.emailClicked(pitchId, referralId || undefined, parentReferralId || undefined, 'web')
    } else if (target.closest('[data-track="linkedin"]')) {
      await tracking.linkedinClicked(pitchId, referralId || undefined, parentReferralId || undefined, 'web')
    } else if (target.closest('[data-track="resume-request"]')) {
      await tracking.resumeRequestClicked(pitchId, referralId || undefined, parentReferralId || undefined, 'web')
    }
  }

  // Set up event listeners
  if (typeof window !== 'undefined') {
    // Track page views
    trackPitchViews()
    
    // Track contact clicks
    document.addEventListener('click', trackContactClicks)
    
    // Track on page visibility change (user returns to tab)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        trackPitchViews()
      }
    })
  }
}

// Real-time tracking with central entities
export function enableRealTimeTracking() {
  if (typeof window === 'undefined') return
  
  // Track scroll depth
  let maxScrollDepth = 0
  const trackScrollDepth = async () => {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
    if (scrollPercent > maxScrollDepth) {
      maxScrollDepth = scrollPercent
      
      const pitchId = window.location.pathname.match(/\/pitch\/([^\/]+)(?:\/|$)/)?.[1]
      const referralId = new URLSearchParams(window.location.search).get('ref')
      const parentReferralId = new URLSearchParams(window.location.search).get('parent')
      
      // Skip tracking for special routes like /pitch/new, /pitch/edit, etc.
      if (pitchId && !['new', 'edit', 'create'].includes(pitchId)) {
        // Track significant scroll milestones
        if (maxScrollDepth >= 25 && maxScrollDepth < 50) {
          await tracking.custom('SCROLL_25_PERCENT', pitchId, referralId || undefined, parentReferralId || undefined, 'web', { scrollDepth: maxScrollDepth })
        } else if (maxScrollDepth >= 50 && maxScrollDepth < 75) {
          await tracking.custom('SCROLL_50_PERCENT', pitchId, referralId || undefined, parentReferralId || undefined, 'web', { scrollDepth: maxScrollDepth })
        } else if (maxScrollDepth >= 75) {
          await tracking.custom('SCROLL_75_PERCENT', pitchId, referralId || undefined, parentReferralId || undefined, 'web', { scrollDepth: maxScrollDepth })
        }
      }
    }
  }

  // Track time spent on page
  let startTime = Date.now()
  const trackTimeSpent = async () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    
    const pitchId = window.location.pathname.match(/\/pitch\/([^\/]+)(?:\/|$)/)?.[1]
    const referralId = new URLSearchParams(window.location.search).get('ref')
    const parentReferralId = new URLSearchParams(window.location.search).get('parent')
    
    // Skip tracking for special routes like /pitch/new, /pitch/edit, etc.
    if (pitchId && !['new', 'edit', 'create'].includes(pitchId)) {
      // Track time milestones
      if (timeSpent === 30) {
        await tracking.custom('TIME_30_SECONDS', pitchId, referralId || undefined, parentReferralId || undefined, 'web', { timeSpent })
      } else if (timeSpent === 60) {
        await tracking.custom('TIME_60_SECONDS', pitchId, referralId || undefined, parentReferralId || undefined, 'web', { timeSpent })
      } else if (timeSpent === 120) {
        await tracking.custom('TIME_120_SECONDS', pitchId, referralId || undefined, parentReferralId || undefined, 'web', { timeSpent })
      }
    }
  }

  // Set up tracking
  window.addEventListener('scroll', trackScrollDepth)
  setInterval(trackTimeSpent, 1000)
  
  // Track when user leaves the page
  window.addEventListener('beforeunload', async () => {
    const pitchId = window.location.pathname.match(/\/pitch\/([^\/]+)/)?.[1]
    const referralId = new URLSearchParams(window.location.search).get('ref')
    const parentReferralId = new URLSearchParams(window.location.search).get('parent')
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    
    if (pitchId && timeSpent > 5) {
      await tracking.custom('PAGE_EXIT', pitchId, referralId || undefined, parentReferralId || undefined, 'web', { 
        timeSpent, 
        scrollDepth: maxScrollDepth 
      })
    }
  })
}

// Initialize tracking
if (typeof window !== 'undefined') {
  enableAutoTracking()
  enableRealTimeTracking()
}
