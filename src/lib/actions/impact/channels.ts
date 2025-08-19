'use server'

import { createActionClient } from '@/lib/supabase-server'

export interface ChannelData {
  platform: string
  shares: number
  opens: number
  conversionRate: number
  valueUsd: number
}

export async function getChannelPerformance(pitchId: string): Promise<ChannelData[]> {
  const supabase = await createActionClient()
  
  try {
    // Note: impact_channel_stats table doesn't exist in live database
    // Return default channels until schema is properly migrated
    // const { data, error } = await supabase
    //   .from('impact_channel_stats')
    //   .select('*')
    //   .eq('pitch_id', pitchId)
    //   .single()
    
    // if (error && error.code !== 'PGRST116') {
    //   console.error('Error fetching channel performance:', error)
    //   return getDefaultChannels()
    // }
    
    // if (!data) {
    //   return getDefaultChannels()
    // }
    
    // const channels: ChannelData[] = []
    
    // // WhatsApp
    // if (data.whatsapp_shares > 0) {
    //   channels.push({
    //     platform: 'WhatsApp',
    //     shares: data.whatsapp_shares,
    //     opens: Math.floor(data.whatsapp_shares * 0.8), // Estimate
    //     conversionRate: 12.5, // Estimate
    //     valueUsd: data.total_value_usd * 0.3 // Estimate
    //   })
    // }
    
    // // LinkedIn
    // if (data.linkedin_shares > 0) {
    //   channels.push({
    //     platform: 'LinkedIn',
    //     shares: data.linkedin_shares,
    //     opens: Math.floor(data.linkedin_shares * 0.6), // Estimate
    //     conversionRate: 8.2, // Estimate
    //     valueUsd: data.total_value_usd * 0.4 // Estimate
    //   })
    // }
    
    // // Email
    // if (data.email_shares > 0) {
    //   channels.push({
    //     platform: 'Email',
    //     shares: data.email_shares,
    //     opens: Math.floor(data.email_shares * 0.9), // Estimate
    //     conversionRate: 15.1, // Estimate
    //     valueUsd: data.total_value_usd * 0.3 // Estimate
    //   })
    // }
    
    // // Direct/Copy
    // const directShares = data.total_shares - (data.whatsapp_shares + data.linkedin_shares + data.email_shares)
    // if (directShares > 0) {
    //   channels.push({
    //     platform: 'Direct',
    //     shares: directShares,
    //     opens: Math.floor(directShares * 0.7), // Estimate
    //     conversionRate: 10.3, // Estimate
    //     valueUsd: data.total_value_usd * 0.1 // Estimate
    //   })
    // }
    
    // return channels.length > 0 ? channels : getDefaultChannels()
    return getDefaultChannels() // Placeholder until schema is migrated
  } catch (error) {
    console.error('Error in getChannelPerformance:', error)
    return getDefaultChannels()
  }
}

function getDefaultChannels(): ChannelData[] {
  return [
    {
      platform: 'WhatsApp',
      shares: 0,
      opens: 0,
      conversionRate: 0,
      valueUsd: 0
    },
    {
      platform: 'LinkedIn',
      shares: 0,
      opens: 0,
      conversionRate: 0,
      valueUsd: 0
    },
    {
      platform: 'Email',
      shares: 0,
      opens: 0,
      conversionRate: 0,
      valueUsd: 0
    }
  ]
}
