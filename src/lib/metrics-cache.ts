import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';
import { getTrendlineAllPitches, getCohortsBySource, getAvgTimeToFirstContact, type WindowOpt } from './metrics';

// Cache TTL: 10 minutes (600 seconds)
const CACHE_TTL = 600;

// Cache key generators
const getTrendlineCacheKey = (opt: WindowOpt) => `metrics:trend:${opt.window}:${opt.veteranId || 'all'}`;
const getCohortCacheKey = (opt: WindowOpt) => `metrics:cohort:${opt.window}:${opt.veteranId || 'all'}`;
const getAvgTimeCacheKey = (opt: WindowOpt) => `metrics:avg:${opt.window}:${opt.veteranId || 'all'}`;

// Cached wrapper for getTrendlineAllPitches
export const getCachedTrendline = unstable_cache(
  async (opt: WindowOpt) => {
    return getTrendlineAllPitches(opt);
  },
  ['metrics-trendline'],
  {
    revalidate: CACHE_TTL,
    tags: ['metrics-trendline'],
  }
);

// Cached wrapper for getCohortsBySource
export const getCachedCohorts = unstable_cache(
  async (opt: WindowOpt) => {
    return getCohortsBySource(opt);
  },
  ['metrics-cohorts'],
  {
    revalidate: CACHE_TTL,
    tags: ['metrics-cohorts'],
  }
);

// Cached wrapper for getAvgTimeToFirstContact
export const getCachedAvgTime = unstable_cache(
  async (opt: WindowOpt) => {
    return getAvgTimeToFirstContact(opt);
  },
  ['metrics-avg-time'],
  {
    revalidate: CACHE_TTL,
    tags: ['metrics-avg-time'],
  }
);

// Revalidation function for veteran-specific metrics
export async function revalidateMetricsForVeteran(veteranId: string) {
  // Revalidate all metrics for this veteran
  await Promise.all([
    revalidateTag('metrics-trendline'),
    revalidateTag('metrics-cohorts'),
    revalidateTag('metrics-avg-time'),
  ]);
}

// Revalidation function for global metrics (no veteran filter)
export async function revalidateGlobalMetrics() {
  // Revalidate all global metrics
  await Promise.all([
    revalidateTag('metrics-trendline'),
    revalidateTag('metrics-cohorts'),
    revalidateTag('metrics-avg-time'),
  ]);
}

// Revalidation function for specific window and veteran
export async function revalidateMetrics(opt: WindowOpt) {
  // Revalidate all metrics (simplified approach)
  await Promise.all([
    revalidateTag('metrics-trendline'),
    revalidateTag('metrics-cohorts'),
    revalidateTag('metrics-avg-time'),
  ]);
}
