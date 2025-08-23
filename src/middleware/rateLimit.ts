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

    // Add rate limit headers
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', (config.maxRequests - entry.count).toString())
    response.headers.set('X-RateLimit-Reset', new Date(entry.resetTime).toISOString())

    return response
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

// Predefined rate limit configurations
export const rateLimits = {
  // Webhook and payment endpoints
  webhook: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
  }),
  
  // Resume and referral endpoints
  resumeRequest: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 requests per minute
  }),
  
  referralEvent: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 requests per minute
  }),
  
  // AI and content generation
  aiPitchGeneration: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 requests per minute per user
  }),
  
  aiPitchGenerationDaily: createRateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 50, // 50 requests per day per user
  }),
  
  // Email endpoints - Critical for preventing spam
  emailSend: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3, // 3 emails per minute per user/IP
  }),
  
  emailDaily: createRateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 50, // 50 emails per day per user/IP
  }),
  
  // Contact form - Prevent spam
  contactForm: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 2, // 2 contact form submissions per minute per IP
  }),
  
  contactFormDaily: createRateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 10, // 10 contact form submissions per day per IP
  }),
  
  // Waitlist endpoints - Prevent abuse
  waitlistJoin: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1, // 1 waitlist join per minute per IP
  }),
  
  waitlistShare: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 waitlist shares per minute per IP
  }),
  
  // Authentication endpoints - Prevent brute force
  auth: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 auth attempts per minute per IP
  }),
  
  authDaily: createRateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 20, // 20 auth attempts per day per IP
  }),
  
  // General API endpoints
  general: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  }),
  
  // Dashboard endpoints - Prevent abuse
  dashboard: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 dashboard requests per minute per user
  })
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
  
  if (!entry) {
    return {
      limit: rateLimits[limitType].maxRequests,
      remaining: rateLimits[limitType].maxRequests,
      resetTime: new Date(Date.now() + rateLimits[limitType].windowMs).toISOString()
    }
  }
  
  return {
    limit: rateLimits[limitType].maxRequests,
    remaining: Math.max(0, rateLimits[limitType].maxRequests - entry.count),
    resetTime: new Date(entry.resetTime).toISOString()
  }
}
