'use server'

import { createActionClient } from '@/lib/supabase-server'

export interface ImpactKpis {
  totalReferrals: number
  totalOpens: number
  totalCalls: number
  totalOutcomes: number
  totalValueUsd: number
  conversionRate: number
  avgValuePerOutcome: number
}

export async function getImpactKpis(pitchId: string): Promise<ImpactKpis> {
  const supabase = await createActionClient()
  
  try {
    const { data, error } = await supabase
      .from('impact_funnel')
      .select('*')
      .eq('pitch_id', pitchId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching impact KPIs:', error)
      return getDefaultKpis()
    }
    
    if (!data) {
      return getDefaultKpis()
    }
    
    const totalReferrals = data.total_referrals || 0
    const totalOpens = data.unique_opens || 0
    const totalCalls = data.total_calls || 0
    const totalOutcomes = data.total_outcomes || 0
    const totalValueUsd = data.total_value_usd || 0
    
    const conversionRate = totalOpens > 0 ? (totalOutcomes / totalOpens) * 100 : 0
    const avgValuePerOutcome = totalOutcomes > 0 ? totalValueUsd / totalOutcomes : 0
    
    return {
      totalReferrals,
      totalOpens,
      totalCalls,
      totalOutcomes,
      totalValueUsd,
      conversionRate,
      avgValuePerOutcome
    }
  } catch (error) {
    console.error('Error in getImpactKpis:', error)
    return getDefaultKpis()
  }
}

function getDefaultKpis(): ImpactKpis {
  return {
    totalReferrals: 0,
    totalOpens: 0,
    totalCalls: 0,
    totalOutcomes: 0,
    totalValueUsd: 0,
    conversionRate: 0,
    avgValuePerOutcome: 0
  }
}
