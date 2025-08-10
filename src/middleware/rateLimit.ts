import { NextRequest, NextResponse } from 'next/server'

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
  
  return `${ip}:${route}`
}

// Predefined rate limit configurations
export const rateLimits = {
  webhook: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
  }),
  
  resumeRequest: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 requests per minute
  }),
  
  referralEvent: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 requests per minute
  }),
  
  aiPitchGeneration: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 requests per minute per user
  }),
  
  aiPitchGenerationDaily: createRateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 50, // 50 requests per day per user
  }),
  
  general: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
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
