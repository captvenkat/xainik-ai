'use server'

import { createActionClient } from '@/lib/supabase-server'

export interface SupporterData {
  id: string
  name: string
  email: string
  referralsGenerated: number
  totalOpens: number
  callsMade: number
  outcomesAchieved: number
  valueGeneratedUsd: number
  lastCallDate: string | null
  lastOutcomeDate: string | null
}

export async function getSupporterImpact(pitchId: string): Promise<SupporterData[]> {
  const supabase = await createActionClient()
  
  try {
    const { data, error } = await supabase
      .from('impact_supporter_stats')
      .select('*')
      .eq('pitch_id', pitchId)
      .order('value_generated_usd', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('Error fetching supporter impact:', error)
      return []
    }
    
    if (!data || data.length === 0) {
      return []
    }
    
    return data.map(supporter => ({
      id: supporter.supporter_id,
      name: supporter.supporter_name || 'Anonymous Supporter',
      email: supporter.supporter_email || '',
      referralsGenerated: supporter.referrals_generated || 0,
      totalOpens: supporter.total_opens || 0,
      callsMade: supporter.calls_made || 0,
      outcomesAchieved: supporter.outcomes_achieved || 0,
      valueGeneratedUsd: supporter.value_generated_usd || 0,
      lastCallDate: supporter.last_call_date,
      lastOutcomeDate: supporter.last_outcome_date
    }))
  } catch (error) {
    console.error('Error in getSupporterImpact:', error)
    return []
  }
}
