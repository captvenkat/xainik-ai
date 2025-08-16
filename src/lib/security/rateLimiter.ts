import { createClient } from '@supabase/supabase-js'

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  // API endpoints
  'api/auth': { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
  'api/pitch': { windowMs: 60 * 1000, max: 10 }, // 10 requests per minute
  'api/analytics': { windowMs: 60 * 1000, max: 30 }, // 30 requests per minute
  'api/upload': { windowMs: 60 * 1000, max: 5 }, // 5 uploads per minute
  
  // General endpoints
  'default': { windowMs: 60 * 1000, max: 100 }, // 100 requests per minute
} as const

type RateLimitEndpoint = keyof typeof RATE_LIMIT_CONFIG

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private supabase: any
  private cache: Map<string, RateLimitEntry> = new Map()

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /**
   * Check if request is within rate limits
   */
  async checkRateLimit(
    identifier: string,
    endpoint: RateLimitEndpoint = 'default'
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const config = RATE_LIMIT_CONFIG[endpoint] || RATE_LIMIT_CONFIG.default
    const key = `${identifier}:${endpoint}`
    const now = Date.now()

    // Check cache first
    const cached = this.cache.get(key)
    if (cached && now < cached.resetTime) {
      if (cached.count >= config.max) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: cached.resetTime
        }
      }
      
      cached.count++
      return {
        allowed: true,
        remaining: config.max - cached.count,
        resetTime: cached.resetTime
      }
    }

    // Check database for persistent rate limiting
    const { data: rateLimitData } = await this.supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
      .single()

    if (rateLimitData && now < rateLimitData.reset_time) {
      if (rateLimitData.count >= config.max) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: rateLimitData.reset_time
        }
      }

      // Update count
      await this.supabase
        .from('rate_limits')
        .update({ count: rateLimitData.count + 1 })
        .eq('id', rateLimitData.id)

      // Update cache
      this.cache.set(key, {
        count: rateLimitData.count + 1,
        resetTime: rateLimitData.reset_time
      })

      return {
        allowed: true,
        remaining: config.max - (rateLimitData.count + 1),
        resetTime: rateLimitData.reset_time
      }
    }

    // Create new rate limit entry
    const resetTime = now + config.windowMs
    const { data: newEntry } = await this.supabase
      .from('rate_limits')
      .insert({
        identifier,
        endpoint,
        count: 1,
        reset_time: new Date(resetTime).toISOString()
      })
      .select()
      .single()

    // Update cache
    this.cache.set(key, {
      count: 1,
      resetTime
    })

    return {
      allowed: true,
      remaining: config.max - 1,
      resetTime
    }
  }

  /**
   * Get rate limit info without checking
   */
  async getRateLimitInfo(
    identifier: string,
    endpoint: RateLimitEndpoint = 'default'
  ): Promise<{ remaining: number; resetTime: number; limit: number }> {
    const config = RATE_LIMIT_CONFIG[endpoint] || RATE_LIMIT_CONFIG.default
    const key = `${identifier}:${endpoint}`
    const now = Date.now()

    // Check cache
    const cached = this.cache.get(key)
    if (cached && now < cached.resetTime) {
      return {
        remaining: Math.max(0, config.max - cached.count),
        resetTime: cached.resetTime,
        limit: config.max
      }
    }

    // Check database
    const { data: rateLimitData } = await this.supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
      .single()

    if (rateLimitData && now < rateLimitData.reset_time) {
      return {
        remaining: Math.max(0, config.max - rateLimitData.count),
        resetTime: rateLimitData.reset_time,
        limit: config.max
      }
    }

    return {
      remaining: config.max,
      resetTime: now + config.windowMs,
      limit: config.max
    }
  }

  /**
   * Reset rate limit for testing
   */
  async resetRateLimit(identifier: string, endpoint: string = 'default'): Promise<void> {
    const key = `${identifier}:${endpoint}`
    this.cache.delete(key)

    await this.supabase
      .from('rate_limits')
      .delete()
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
  }

  /**
   * Clean up expired entries
   */
  async cleanup(): Promise<void> {
    const now = Date.now()

    // Clean cache
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.resetTime) {
        this.cache.delete(key)
      }
    }

    // Clean database
    await this.supabase
      .from('rate_limits')
      .delete()
      .lt('reset_time', new Date(now).toISOString())
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

// Cleanup every 5 minutes
setInterval(() => {
  rateLimiter.cleanup()
}, 5 * 60 * 1000)

export default rateLimiter
