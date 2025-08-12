import { createActionClient } from '@/lib/supabase-server'

export interface MetricsCache {
  key: string
  value: any
  expires_at: string
}

export async function getCachedMetrics(key: string): Promise<any | null> {
  try {
    const supabaseAction = await createActionClient()

    const { data, error } = await supabaseAction
      .from('user_activity_log')
      .select('metadata')
      .eq('activity_type', 'metrics_cache')
      .eq('metadata->key', key)
      .gt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // 5 minutes cache
      .single()

    if (error || !data) {
      return null
    }

    return data.metadata?.value || null
  } catch (error) {
    console.error('Failed to get cached metrics:', error)
    return null
  }
}

export async function setCachedMetrics(key: string, value: any): Promise<void> {
  try {
    const supabaseAction = await createActionClient()

    await supabaseAction
      .from('user_activity_log')
      .insert({
        user_id: 'system',
        activity_type: 'metrics_cache',
        metadata: {
          key,
          value,
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes cache
        }
      })
  } catch (error) {
    console.error('Failed to set cached metrics:', error)
  }
}

export async function clearMetricsCache(): Promise<void> {
  try {
    const supabaseAction = await createActionClient()

    await supabaseAction
      .from('user_activity_log')
      .delete()
      .eq('activity_type', 'metrics_cache')
      .lt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
  } catch (error) {
    console.error('Failed to clear metrics cache:', error)
  }
}

export async function getCachedAvgTime(): Promise<any | null> {
  return getCachedMetrics('avg_time')
}

export async function getCachedCohorts(): Promise<any | null> {
  return getCachedMetrics('cohorts')
}

export async function getCachedTrendline(): Promise<any | null> {
  return getCachedMetrics('trendline')
}
