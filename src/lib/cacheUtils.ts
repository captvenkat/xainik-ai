// =====================================================
// CACHE UTILITIES
// Xainik Platform - Handle Frontend Cache Management
// =====================================================

import { clearSupabaseBrowserInstance } from './supabaseBrowser';

// =====================================================
// CACHE CLEARING FUNCTIONS
// =====================================================

/**
 * Clear all browser cache and storage
 */
export const clearBrowserCache = () => {
  if (typeof window === 'undefined') return;

  try {
    // Clear localStorage
    localStorage.clear();
    console.log('✅ localStorage cleared');

    // Clear sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');

    // Clear any cached data
    if (window.supabaseCache) {
      delete window.supabaseCache;
      console.log('✅ Supabase cache cleared');
    }

    // Clear any other cached data
    if (window.__NEXT_DATA__) {
      delete window.__NEXT_DATA__;
      console.log('✅ Next.js data cache cleared');
    }

    // Clear any service worker cache
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
        console.log('✅ Service worker caches cleared');
      });
    }

  } catch (error) {
    console.error('❌ Error clearing browser cache:', error);
  }
};

/**
 * Clear Supabase browser instance and force refresh
 */
export const clearSupabaseCache = () => {
  try {
    // Clear the singleton instance
    clearSupabaseBrowserInstance();
    console.log('✅ Supabase browser instance cleared');

    // Clear browser cache
    clearBrowserCache();

    // Force a page reload to get fresh instance
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  } catch (error) {
    console.error('❌ Error clearing Supabase cache:', error);
  }
};

/**
 * Force a complete cache refresh
 */
export const forceCacheRefresh = () => {
  console.log('🔄 Starting complete cache refresh...');
  
  // Clear all caches
  clearSupabaseCache();
  
  // Additional cache clearing
  if (typeof window !== 'undefined') {
    // Clear any indexedDB data
    if ('indexedDB' in window) {
      indexedDB.databases().then(databases => {
        databases.forEach(db => {
          indexedDB.deleteDatabase(db.name);
        });
        console.log('✅ IndexedDB cleared');
      });
    }

    // Clear any other storage
    if ('localStorage' in window) {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('cache')) {
          localStorage.removeItem(key);
        }
      });
      console.log('✅ Auth-related localStorage cleared');
    }
  }
};

// =====================================================
// SCHEMA VERIFICATION FUNCTIONS
// =====================================================

/**
 * Check if tables exist in the current schema
 */
export const verifySchemaTables = async (tables: string[]) => {
  const { createSupabaseBrowser } = await import('./supabaseBrowser');
  const supabase = createSupabaseBrowser();

  const results = [];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        results.push({ table, exists: false, error: error.message });
      } else {
        results.push({ table, exists: true, count: data?.length || 0 });
      }
    } catch (err) {
      results.push({ table, exists: false, error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  return results;
};

/**
 * Check if community suggestions tables exist
 */
export const verifyCommunityTables = async () => {
  const tables = [
    'community_suggestions',
    'community_suggestions_with_votes',
    'community_suggestions_summary'
  ];

  return await verifySchemaTables(tables);
};

/**
 * Check if mission invitation tables exist
 */
export const verifyMissionTables = async () => {
  const tables = [
    'mission_invitations',
    'mission_invitation_summary'
  ];

  return await verifySchemaTables(tables);
};

// =====================================================
// CACHE STATUS FUNCTIONS
// =====================================================

/**
 * Get current cache status
 */
export const getCacheStatus = () => {
  if (typeof window === 'undefined') {
    return { available: false, message: 'Server-side rendering' };
  }

  const status = {
    localStorage: localStorage.length,
    sessionStorage: sessionStorage.length,
    hasSupabaseCache: !!window.supabaseCache,
    hasNextData: !!window.__NEXT_DATA__,
    timestamp: new Date().toISOString()
  };

  return status;
};

/**
 * Check if cache refresh is needed
 */
export const isCacheRefreshNeeded = async () => {
  try {
    const communityTables = await verifyCommunityTables();
    const missionTables = await verifyMissionTables();

    const allTables = [...communityTables, ...missionTables];
    const missingTables = allTables.filter(table => !table.exists);

    return {
      needed: missingTables.length > 0,
      missingTables: missingTables.map(t => t.table),
      message: missingTables.length > 0 
        ? `Missing tables: ${missingTables.map(t => t.table).join(', ')}`
        : 'All tables are accessible'
    };
  } catch (error) {
    return {
      needed: true,
      missingTables: [],
      message: 'Unable to verify tables - cache refresh recommended'
    };
  }
};

// =====================================================
// EXPORT ALL FUNCTIONS
// =====================================================

export {
  clearBrowserCache,
  clearSupabaseCache,
  forceCacheRefresh,
  verifySchemaTables,
  verifyCommunityTables,
  verifyMissionTables,
  getCacheStatus,
  isCacheRefreshNeeded
};
