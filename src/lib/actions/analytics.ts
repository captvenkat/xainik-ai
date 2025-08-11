'use server'

import { getServerSupabase } from '@/lib/supabaseClient'
import { getVeteranAnalytics, getRecruiterAnalytics } from '@/lib/metrics'
import { revalidatePath } from 'next/cache'

// Cache duration in seconds (5-10 minutes)
const CACHE_DURATION = 7 * 60 // 7 minutes

interface CachedAnalytics {
  data: any
  timestamp: number
}

// In-memory cache (in production, use Redis or similar)
const analyticsCache = new Map<string, CachedAnalytics>()

function getCacheKey(userId: string, role: string): string {
  return `analytics:${role}:${userId}`
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION * 1000
}

export async function getCachedVeteranAnalytics(userId: string) {
  const cacheKey = getCacheKey(userId, 'veteran')
  const cached = analyticsCache.get(cacheKey)
  
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data
  }
  
  // Fetch fresh data
  const analytics = await getVeteranAnalytics(userId)
  
  // Cache the result
  analyticsCache.set(cacheKey, {
    data: analytics,
    timestamp: Date.now()
  })
  
  return analytics
}

export async function getCachedRecruiterAnalytics(userId: string) {
  const cacheKey = getCacheKey(userId, 'recruiter')
  const cached = analyticsCache.get(cacheKey)
  
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data
  }
  
  // Fetch fresh data
  const analytics = await getRecruiterAnalytics(userId)
  
  // Cache the result
  analyticsCache.set(cacheKey, {
    data: analytics,
    timestamp: Date.now()
  })
  
  return analytics
}

export async function getCachedSupporterAnalytics(userId: string) {
  const cacheKey = getCacheKey(userId, 'supporter')
  const cached = analyticsCache.get(cacheKey)
  
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data
  }
  
  // For now, return empty analytics for supporters
  // TODO: Implement getSupporterAnalytics function
  const analytics = {
    trendlines: { views: [], calls: [], emails: [], endorsements: [] },
    cohortConversions: [],
    performanceInsights: {
      lowViews: false,
      lowConversions: false,
      suggestions: [],
      goals: { next30Days: [], next90Days: [] },
      benchmarks: { industryAvg: 0, topPerformers: 0, yourPerformance: 0 }
    },
    comparativeMetrics: {
      last30d: { views: 0, calls: 0, emails: 0, endorsements: 0 },
      last90d: { views: 0, calls: 0, emails: 0, endorsements: 0 },
      growth: { views: 0, calls: 0, emails: 0, endorsements: 0 }
    }
  }
  
  // Cache the result
  analyticsCache.set(cacheKey, {
    data: analytics,
    timestamp: Date.now()
  })
  
  return analytics
}

export async function refreshAnalytics(userId: string, role: string, path: string) {
  const cacheKey = getCacheKey(userId, role)
  
  // Clear cache for this user
  analyticsCache.delete(cacheKey)
  
  // Revalidate the page
  revalidatePath(path)
  
  return { success: true, message: 'Analytics refreshed' }
}

export async function clearAnalyticsCache(userId?: string) {
  if (userId) {
    // Clear cache for specific user
    const keysToDelete = Array.from(analyticsCache.keys()).filter(key => key.includes(userId))
    keysToDelete.forEach(key => analyticsCache.delete(key))
  } else {
    // Clear all cache
    analyticsCache.clear()
  }
  
  return { success: true, message: 'Cache cleared' }
}

// Get cache statistics for monitoring
export async function getCacheStats() {
  const now = Date.now()
  const totalEntries = analyticsCache.size
  const validEntries = Array.from(analyticsCache.values()).filter(entry => 
    isCacheValid(entry.timestamp)
  ).length
  const expiredEntries = totalEntries - validEntries
  
  return {
    totalEntries,
    validEntries,
    expiredEntries,
    cacheDuration: CACHE_DURATION,
    cacheDurationMinutes: Math.round(CACHE_DURATION / 60)
  }
}
