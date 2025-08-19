'use server'

import { createActionClient } from '@/lib/supabase-server'

export interface FunnelData {
  opens: number
  views: number
  calls: number
  emails: number
  jobOffers: number
  interviews: number
  referrals: number
  totalValueUsd: number
}

export async function getFunnel(pitchId: string): Promise<FunnelData> {
  const supabase = await createActionClient()
  
  try {
    // Note: impact_funnel table doesn't exist in live database
    // Return default funnel until schema is properly migrated
    // const { data, error } = await supabase
    //   .from('impact_funnel')
    //   .select('*')
    //   .eq('pitch_id', pitchId)
    //   .single()
    
    // if (error && error.code !== 'PGRST116') {
    //   console.error('Error fetching funnel data:', error)
    //   return getDefaultFunnel()
    // }
    
    // if (!data) {
    //   return getDefaultFunnel()
    // }
    
    // return {
    //   opens: data.total_referrals || 0,
    //   views: data.unique_opens || 0,
    //   calls: data.total_calls || 0,
    //   emails: 0, // Not tracked in current schema, could be added later
    //   jobOffers: data.job_offers || 0,
    //   interviews: data.interviews || 0,
    //   referrals: data.referrals || 0,
    //   totalValueUsd: data.total_value_usd || 0
    // }
    
    return getDefaultFunnel() // Placeholder until schema is migrated
  } catch (error) {
    console.error('Error in getFunnel:', error)
    return getDefaultFunnel()
  }
}

function getDefaultFunnel(): FunnelData {
  return {
    opens: 0,
    views: 0,
    calls: 0,
    emails: 0,
    jobOffers: 0,
    interviews: 0,
    referrals: 0,
    totalValueUsd: 0
  }
}
