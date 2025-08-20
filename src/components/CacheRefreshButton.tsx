'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { 
  clearSupabaseCache, 
  getCacheStatus, 
  isCacheRefreshNeeded,
  verifyCommunityTables,
  verifyMissionTables 
} from '@/lib/cacheUtils';

interface CacheStatus {
  needed: boolean;
  missingTables: string[];
  message: string;
}

export default function CacheRefreshButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkCacheStatus();
  }, []);

  const checkCacheStatus = async () => {
    setIsChecking(true);
    try {
      const status = await isCacheRefreshNeeded();
      setCacheStatus(status);
    } catch (error) {
      console.error('Error checking cache status:', error);
      setCacheStatus({
        needed: true,
        missingTables: [],
        message: 'Unable to check cache status'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleCacheRefresh = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Starting cache refresh...');
      
      // Clear the cache
      clearSupabaseCache();
      
      // The page will reload automatically
    } catch (error) {
      console.error('Error during cache refresh:', error);
      setIsLoading(false);
    }
  };

  const handleManualRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking cache status...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Cache Status Display */}
      <div className="flex items-center gap-2 text-sm">
        {cacheStatus?.needed ? (
          <>
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <span className="text-orange-600">
              Cache refresh needed: {cacheStatus.message}
            </span>
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-600">
              Cache is up to date: {cacheStatus?.message}
            </span>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleCacheRefresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isLoading ? 'Refreshing...' : 'Refresh Cache'}
        </Button>

        <Button
          onClick={checkCacheStatus}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Recheck
        </Button>

        <Button
          onClick={handleManualRefresh}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reload Page
        </Button>
      </div>

      {/* Detailed Status */}
      {cacheStatus?.missingTables && cacheStatus.missingTables.length > 0 && (
        <div className="text-xs text-gray-500">
          <p>Missing tables:</p>
          <ul className="list-disc list-inside ml-2">
            {cacheStatus.missingTables.map(table => (
              <li key={table}>{table}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// =====================================================
// CACHE STATUS COMPONENT
// =====================================================

export function CacheStatusDisplay() {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const updateStatus = () => {
      const cacheStatus = getCacheStatus();
      setStatus(cacheStatus);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  return (
    <div className="text-xs text-gray-500 space-y-1">
      <div>localStorage: {status.localStorage} items</div>
      <div>sessionStorage: {status.sessionStorage} items</div>
      <div>Supabase cache: {status.hasSupabaseCache ? 'Yes' : 'No'}</div>
      <div>Next.js data: {status.hasNextData ? 'Yes' : 'No'}</div>
      <div>Last updated: {new Date(status.timestamp).toLocaleTimeString()}</div>
    </div>
  );
}
