import { unstable_cache } from 'next/cache';
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
