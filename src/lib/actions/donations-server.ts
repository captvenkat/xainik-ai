'use server'

import { createActionClient } from '@/lib/supabase-server'
import { Database } from '@/types/live-schema'

type Donation = Database['public']['Tables']['donations']['Row']
type DonationInsert = Database['public']['Tables']['donations']['Insert']

export async function createDonation(donationData: Omit<DonationInsert, 'id'>): Promise<Donation> {
  const supabase = await createActionClient()
  
  const { data: donation, error } = await supabase
    .from('donations')
    .insert(donationData)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create donation: ${error.message}`)
  }
  
  return donation
}

export async function getDonationById(donationId: string): Promise<Donation | null> {
  const supabase = await createActionClient()
  
  const { data: donation, error } = await supabase
    .from('donations')
    .select('*')
    .eq('id', donationId)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get donation: ${error.message}`)
  }
  
  return donation
}

export async function getDonationsByUserId(userId: string): Promise<Donation[]> {
  const supabase = await createActionClient()
  
  const { data: donations, error } = await supabase
    .from('donations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to get donations: ${error.message}`)
  }
  
  return donations || []
}

export async function getAllDonations(): Promise<Donation[]> {
  const supabase = await createActionClient()
  
  const { data: donations, error } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to get donations: ${error.message}`)
  }
  
  return donations || []
}

export async function getDonationStats(): Promise<{
  totalDonations: number;
  totalAmount: number;
  recentDonations: Donation[];
}> {
  const supabase = await createActionClient()
  
  const { count: totalDonations } = await supabase
    .from('donations')
    .select('*', { count: 'exact', head: true })
  
  // Note: donations table has limited schema in live database
  // Skip calculating total amount until schema is properly migrated
  // const { data: amountData } = await supabase
  //   .from('donations')
  //   .select('amount_cents')
  // 
  // const totalAmount = amountData?.reduce((sum, donation) => sum + (donation.amount_cents || 0), 0) || 0
  
  const totalAmount = 0 // Placeholder until schema is migrated
  
  const { data: recentDonations } = await supabase
    .from('donations')
    .select(`
      *,
      user:users (id, name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(5)
  
  return {
    totalDonations: totalDonations || 0,
    totalAmount,
    recentDonations: recentDonations || []
  }
}
