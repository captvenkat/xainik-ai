import { getServerSupabase } from '@/lib/supabaseClient'

export interface DonationStats {
  total: number
  today: number
  last: number
  highest: number
}

export async function getDonationStats(): Promise<DonationStats> {
  const supabase = getServerSupabase()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayISO = today.toISOString()
  
  // Get total donations
  const { data: totalResult } = await supabase
    .from('donations')
    .select('amount')
    .eq('status', 'completed')
  
  const total = totalResult?.reduce((sum, donation) => sum + (donation.amount || 0), 0) || 0
  
  // Get today's donations
  const { data: todayResult } = await supabase
    .from('donations')
    .select('amount')
    .eq('status', 'completed')
    .gte('created_at', todayISO)
  
  const todayAmount = todayResult?.reduce((sum, donation) => sum + (donation.amount || 0), 0) || 0
  
  // Get last donation amount
  const { data: lastDonation } = await supabase
    .from('donations')
    .select('amount')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  const last = lastDonation?.amount || 0
  
  // Get highest donation
  const { data: highestDonation } = await supabase
    .from('donations')
    .select('amount')
    .eq('status', 'completed')
    .order('amount', { ascending: false })
    .limit(1)
    .single()
  
  const highest = highestDonation?.amount || 0
  
  return {
    total,
    today: todayAmount,
    last,
    highest
  }
}

export async function getRecentDonations(limit: number = 20) {
  const supabase = getServerSupabase()
  
  const { data: donations } = await supabase
    .from('donations')
    .select(`
      id,
      amount,
      donor_name,
      message,
      created_at,
      anonymous
    `)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return donations?.map(donation => ({
    ...donation,
    donor_name: donation.anonymous ? 'Anonymous' : donation.donor_name
  })) || []
}

export async function createDonation(data: {
  amount: number
  donor_name: string
  email: string
  message?: string
  anonymous?: boolean
}) {
  const supabase = getServerSupabase()
  
  const { data: donation, error } = await supabase
    .from('donations')
    .insert({
      amount: data.amount,
      donor_name: data.donor_name,
      email: data.email,
      message: data.message,
      anonymous: data.anonymous || false,
      status: 'pending'
    })
    .select()
    .single()
  
  if (error) {
    throw new Error('Failed to create donation')
  }
  
  return donation
}

export async function updateDonationStatus(donationId: string, status: 'completed' | 'failed') {
  const supabase = getServerSupabase()
  
  const { error } = await supabase
    .from('donations')
    .update({ status })
    .eq('id', donationId)
  
  if (error) {
    throw new Error('Failed to update donation status')
  }
}
