'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface MediaHealthStats {
  totalMedia: number;
  convertedWebp: number;
  legacyPending: number;
  lastMigrationRun: string | null;
}

export default function AdminMediaHealth() {
  const [stats, setStats] = useState<MediaHealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningScan, setRunningScan] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Get total media count
      const { count: totalMedia } = await supabase
        .from('media')
        .select('*', { count: 'exact', head: true });

      // Get converted WebP count
      const { count: convertedWebp } = await supabase
        .from('media')
        .select('*', { count: 'exact', head: true })
        .eq('meta->mime', 'image/webp')
        .not('meta->sizes', 'is', null);

      // Get legacy pending count
      const { count: legacyPending } = await supabase
        .from('media')
        .select('*', { count: 'exact', head: true })
        .or('meta->mime.neq.image/webp,meta->sizes.is.null');

      // Get last migration run
      const { data: lastMigration } = await supabase
        .from('audit')
        .select('created_at')
        .eq('action', 'media_migration')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setStats({
        totalMedia: totalMedia || 0,
        convertedWebp: convertedWebp || 0,
        legacyPending: legacyPending || 0,
        lastMigrationRun: lastMigration?.created_at || null
      });
    } catch (error) {
      console.error('Failed to load media stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const runDryScan = async () => {
    try {
      setRunningScan(true);
      setScanResult(null);

      const response = await fetch('/api/admin/run-migration-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dry: true, limit: 100 })
      });

      const result = await response.json();
      
      if (response.ok) {
        setScanResult(`✅ Dry scan completed: ${result.message}`);
      } else {
        setScanResult(`❌ Scan failed: ${result.error}`);
      }
    } catch (error) {
      setScanResult(`❌ Scan error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRunningScan(false);
    }
  };

  const getHealthStatus = () => {
    if (!stats) return 'Unknown';
    
    const conversionRate = stats.totalMedia > 0 ? (stats.convertedWebp / stats.totalMedia) * 100 : 100;
    
    if (conversionRate >= 95) return 'Excellent';
    if (conversionRate >= 80) return 'Good';
    if (conversionRate >= 50) return 'Fair';
    return 'Poor';
  };

  const getHealthColor = () => {
    const status = getHealthStatus();
    switch (status) {
      case 'Excellent': return 'text-green-600';
      case 'Good': return 'text-blue-600';
      case 'Fair': return 'text-yellow-600';
      case 'Poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Media Health Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor and manage media conversion status</p>
        </div>

        {/* Health Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Overall Health</h2>
              <p className={`text-2xl font-bold ${getHealthColor()}`}>
                {getHealthStatus()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats ? Math.round((stats.convertedWebp / stats.totalMedia) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Media</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalMedia || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Converted WebP</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.convertedWebp || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Legacy Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.legacyPending || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Last Migration</p>
                <p className="text-sm font-semibold text-gray-900">
                  {stats?.lastMigrationRun 
                    ? new Date(stats.lastMigrationRun).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={runDryScan}
                disabled={runningScan}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {runningScan ? 'Running...' : 'Run Dry Scan'}
              </button>
              
              <button
                onClick={loadStats}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Refresh Stats
              </button>
            </div>

            {scanResult && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-700">{scanResult}</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Migration Commands</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p><code className="bg-blue-100 px-2 py-1 rounded">pnpm tsx scripts/migrate-media.ts --dry</code> - Test migration</p>
                <p><code className="bg-blue-100 px-2 py-1 rounded">pnpm tsx scripts/migrate-media.ts --limit 100</code> - Run migration</p>
                <p><code className="bg-blue-100 px-2 py-1 rounded">pnpm run webp:check</code> - Check WebP policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
