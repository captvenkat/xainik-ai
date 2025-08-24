import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function createRateLimit(config: RateLimitConfig) {
  return function rateLimit(req: NextRequest) {
    // Skip rate limiting in test environment
    if (process.env.NODE_ENV === 'test') {
      return null
    }

    const key = getRateLimitKey(req)
    const now = Date.now()
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key)
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs
      }
      rateLimitStore.set(key, entry)
    }

    // Increment count
    entry.count++

    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil(config.windowMs / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
          }
        }
      )
    }

    // Return null to continue (no rate limit exceeded)
    return null
  }
}

function getRateLimitKey(req: NextRequest): string {
  // Use IP address as key
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  
  // Add route-specific key for different limits
  const route = req.nextUrl.pathname
  
  // For authenticated endpoints, include user ID if available
  const authHeader = req.headers.get('authorization')
  let userId = 'anonymous'
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Extract user ID from JWT token (simplified - in production use proper JWT decoding)
    try {
      const token = authHeader.substring(7)
      // This is a simplified approach - in production, properly decode the JWT
      userId = token.split('.')[0] || 'authenticated'
    } catch (error) {
      userId = 'authenticated'
    }
  }
  
  return `${ip}:${userId}:${route}`
}

// Rate limit configurations
const rateLimitConfigs = {
  webhook: { windowMs: 60 * 1000, maxRequests: 10 },
  resumeRequest: { windowMs: 60 * 1000, maxRequests: 5 },
  referralEvent: { windowMs: 60 * 1000, maxRequests: 20 },
  aiPitchGeneration: { windowMs: 60 * 1000, maxRequests: 5 },
  aiPitchGenerationDaily: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 50 },
  aiContactSuggestions: { windowMs: 60 * 1000, maxRequests: 3 },
  aiContactSuggestionsDaily: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 20 },
  aiSmartNotifications: { windowMs: 60 * 1000, maxRequests: 2 },
  aiSmartNotificationsDaily: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 10 },
  aiInsights: { windowMs: 60 * 1000, maxRequests: 2 },
  aiInsightsDaily: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 10 },
  donations: { windowMs: 60 * 1000, maxRequests: 3 },
  donationsDaily: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 10 },
  resumeRequests: { windowMs: 60 * 1000, maxRequests: 5 },
  resumeRequestsDaily: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 20 },
  emailSending: { windowMs: 60 * 1000, maxRequests: 10 },
  emailSendingDaily: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 100 },
  // Add back the missing configurations
  contactForm: { windowMs: 60 * 1000, maxRequests: 2 },
  contactFormDaily: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 10 },
  emailSend: { windowMs: 60 * 1000, maxRequests: 3 },
  emailDaily: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 50 },
  waitlistJoin: { windowMs: 60 * 1000, maxRequests: 1 },
  waitlistShare: { windowMs: 60 * 1000, maxRequests: 5 },
  auth: { windowMs: 60 * 1000, maxRequests: 5 },
  authDaily: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 20 },
  general: { windowMs: 60 * 1000, maxRequests: 100 },
  dashboard: { windowMs: 60 * 1000, maxRequests: 30 }
}

// Create rate limit functions
export const rateLimits = {
  webhook: createRateLimit(rateLimitConfigs.webhook),
  resumeRequest: createRateLimit(rateLimitConfigs.resumeRequest),
  referralEvent: createRateLimit(rateLimitConfigs.referralEvent),
  aiPitchGeneration: createRateLimit(rateLimitConfigs.aiPitchGeneration),
  aiPitchGenerationDaily: createRateLimit(rateLimitConfigs.aiPitchGenerationDaily),
  aiContactSuggestions: createRateLimit(rateLimitConfigs.aiContactSuggestions),
  aiContactSuggestionsDaily: createRateLimit(rateLimitConfigs.aiContactSuggestionsDaily),
  aiSmartNotifications: createRateLimit(rateLimitConfigs.aiSmartNotifications),
  aiSmartNotificationsDaily: createRateLimit(rateLimitConfigs.aiSmartNotificationsDaily),
  aiInsights: createRateLimit(rateLimitConfigs.aiInsights),
  aiInsightsDaily: createRateLimit(rateLimitConfigs.aiInsightsDaily),
  donations: createRateLimit(rateLimitConfigs.donations),
  donationsDaily: createRateLimit(rateLimitConfigs.donationsDaily),
  resumeRequests: createRateLimit(rateLimitConfigs.resumeRequests),
  resumeRequestsDaily: createRateLimit(rateLimitConfigs.resumeRequestsDaily),
  emailSending: createRateLimit(rateLimitConfigs.emailSending),
  emailSendingDaily: createRateLimit(rateLimitConfigs.emailSendingDaily),
  // Add back the missing rate limit functions
  contactForm: createRateLimit(rateLimitConfigs.contactForm),
  contactFormDaily: createRateLimit(rateLimitConfigs.contactFormDaily),
  emailSend: createRateLimit(rateLimitConfigs.emailSend),
  emailDaily: createRateLimit(rateLimitConfigs.emailDaily),
  waitlistJoin: createRateLimit(rateLimitConfigs.waitlistJoin),
  waitlistShare: createRateLimit(rateLimitConfigs.waitlistShare),
  auth: createRateLimit(rateLimitConfigs.auth),
  authDaily: createRateLimit(rateLimitConfigs.authDaily),
  general: createRateLimit(rateLimitConfigs.general),
  dashboard: createRateLimit(rateLimitConfigs.dashboard)
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60 * 1000) // Clean up every minute

// Utility function to apply rate limiting to any endpoint
export function applyRateLimit(req: NextRequest, limitType: keyof typeof rateLimits) {
  const rateLimitResult = rateLimits[limitType](req)
  if (rateLimitResult) {
    return rateLimitResult
  }
  return null // No rate limit applied
}

// Utility function to apply multiple rate limits
export function applyMultipleRateLimits(req: NextRequest, limitTypes: (keyof typeof rateLimits)[]) {
  for (const limitType of limitTypes) {
    const rateLimitResult = rateLimits[limitType](req)
    if (rateLimitResult) {
      return rateLimitResult
    }
  }
  return null // No rate limits applied
}

// Helper function to get rate limit info for debugging
export function getRateLimitInfo(req: NextRequest, limitType: keyof typeof rateLimits) {
  const key = getRateLimitKey(req)
  const entry = rateLimitStore.get(key)
  const config = rateLimitConfigs[limitType]
  
  if (!entry) {
    return {
      limit: config.maxRequests,
      remaining: config.maxRequests,
      resetTime: new Date(Date.now() + config.windowMs).toISOString()
    }
  }
  
  return {
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: new Date(entry.resetTime).toISOString()
  }
}
