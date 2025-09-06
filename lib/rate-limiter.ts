import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

class RateLimiter {
  private static readonly POSTER_GENERATION_LIMIT: RateLimitConfig = {
    maxRequests: 10,
    windowMs: 24 * 60 * 60 * 1000 // 24 hours
  };

  /**
   * Check if user can make a poster generation request
   */
  static async checkPosterLimit(userId: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.POSTER_GENERATION_LIMIT.windowMs;

    // Query audit entries for poster generation in the last 24 hours
    const { data: recentGenerations, error } = await supabase
      .from('audit')
      .select('created_at')
      .eq('who', userId)
      .eq('action', 'poster.generate')
      .gte('created_at', new Date(windowStart).toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Rate limit check failed:', error);
      // Fail open - allow request if we can't check
      return {
        allowed: true,
        remaining: this.POSTER_GENERATION_LIMIT.maxRequests,
        resetTime: now + this.POSTER_GENERATION_LIMIT.windowMs
      };
    }

    const requestCount = recentGenerations?.length || 0;
    const remaining = Math.max(0, this.POSTER_GENERATION_LIMIT.maxRequests - requestCount);
    const allowed = requestCount < this.POSTER_GENERATION_LIMIT.maxRequests;

    // Calculate reset time (when the oldest request in window expires)
    let resetTime = now + this.POSTER_GENERATION_LIMIT.windowMs;
    if (recentGenerations && recentGenerations.length > 0) {
      const oldestRequest = new Date(recentGenerations[recentGenerations.length - 1].created_at).getTime();
      resetTime = oldestRequest + this.POSTER_GENERATION_LIMIT.windowMs;
    }

    return {
      allowed,
      remaining,
      resetTime
    };
  }

  /**
   * Record a poster generation request
   */
  static async recordPosterGeneration(userId: string, metadata: any = {}): Promise<void> {
    const { error } = await supabase
      .from('audit')
      .insert({
        who: userId,
        action: 'poster.generate',
        resource: 'media',
        before: null,
        after: metadata,
        source: 'api'
      });

    if (error) {
      console.error('Failed to record poster generation:', error);
      // Don't throw - this is just logging
    }
  }

  /**
   * Get rate limit status for a user
   */
  static async getStatus(userId: string): Promise<{
    limit: number;
    used: number;
    remaining: number;
    resetTime: number;
  }> {
    const result = await this.checkPosterLimit(userId);
    const used = this.POSTER_GENERATION_LIMIT.maxRequests - result.remaining;

    return {
      limit: this.POSTER_GENERATION_LIMIT.maxRequests,
      used,
      remaining: result.remaining,
      resetTime: result.resetTime
    };
  }
}

export { RateLimiter };
