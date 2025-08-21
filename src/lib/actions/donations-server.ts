'use server'

import { createActionClient } from '@/lib/supabase-server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { Database } from '@/types/live-schema'

type Donation = Database['public']['Tables']['donations']['Row']
type DonationInsert = Database['public']['Tables']['donations']['Insert']

export async function createDonation(donationData: Omit<DonationInsert, 'id'>): Promise<Donation> {
  // Always use service role to bypass RLS issues
  const supabaseAdmin = await createSupabaseServerOnly()
  
  const { data: donation, error } = await supabaseAdmin
    .from('donations')
    .insert(donationData)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating donation:', error)
    throw new Error(`Failed to create donation: ${error.message}`)
  }
  
  return donation
}

// Server action wrapper for client components
export async function createDonationAction(formData: FormData): Promise<{ success: boolean; donation?: Donation; error?: string }> {
  try {
    const amount = parseInt(formData.get('amount') as string)
    const donorName = formData.get('donor_name') as string
    const email = formData.get('email') as string
    const isAnonymous = formData.get('anonymous') === 'true'
    
    if (!amount || amount < 10) {
      return { success: false, error: 'Invalid amount. Minimum donation is ₹10.' }
    }
    
    if (!donorName || !email) {
      return { success: false, error: 'Name and email are required.' }
    }
    
    const donation = await createDonation({
      user_id: null, // Anonymous donation
      amount_cents: amount,
      currency: 'INR',
      is_anonymous: isAnonymous,
      razorpay_payment_id: null, // Will be set after payment
      created_at: new Date().toISOString()
    })
    
    return { success: true, donation }
  } catch (error) {
    console.error('Error in createDonationAction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create donation' 
    }
  }
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
  const supabase = await createSupabaseServerOnly()
  
  const { data: donations, error } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error getting all donations:', error)
    throw new Error(`Failed to get donations: ${error.message}`)
  }
  
  return donations || []
}

export async function getDonationStats(): Promise<{
  totalDonations: number;
  totalAmount: number;
  recentDonations: Donation[];
}> {
  const supabase = await createSupabaseServerOnly()
  
  const { count: totalDonations } = await supabase
    .from('donations')
    .select('*', { count: 'exact', head: true })
  
  // Calculate total amount from donations
  const { data: amountData } = await supabase
    .from('donations')
    .select('amount_cents')
  
  const totalAmount = amountData?.reduce((sum, donation) => sum + (donation.amount_cents || 0), 0) || 0
  
  const { data: recentDonations } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  
  return {
    totalDonations: totalDonations || 0,
    totalAmount,
    recentDonations: recentDonations || []
  }
}
