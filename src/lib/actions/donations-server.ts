'use server'

import { createActionClient } from '@/lib/supabase-server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { Database } from '@/types/live-schema'
import { createOrder } from '@/lib/payments/razorpay'

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

// New server action that creates donation and Razorpay order
export async function createDonationAction(data: {
  amount: number
  donor_name: string
  email: string
  message?: string
  isAnonymous: boolean
}): Promise<{ success: boolean; donation?: Donation; orderId?: string; error?: string }> {
  try {
    console.log('createDonationAction: Starting with data:', data)
    
    const { amount, donor_name, email, message, isAnonymous } = data
    
    if (!amount || amount < 10) {
      return { success: false, error: 'Invalid amount. Minimum donation is ₹10.' }
    }
    
    if (!donor_name || !email) {
      return { success: false, error: 'Name and email are required.' }
    }
    
    // Step 1: Create donation record
    console.log('createDonationAction: Creating donation...')
    const donation = await createDonation({
      user_id: null, // Anonymous donation
      amount_cents: amount,
      currency: 'INR',
      is_anonymous: isAnonymous,
      razorpay_payment_id: null, // Will be set after payment
      created_at: new Date().toISOString()
    })
    
    console.log('createDonationAction: Donation created:', donation.id)
    
    // Step 2: Create Razorpay order
    console.log('createDonationAction: Creating Razorpay order...')
    const order = await createOrder({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `don_${donation.id.substring(0, 8)}`, // Short receipt ID (max 40 chars)
      notes: {
        type: 'donation',
        donation_id: donation.id,
        donor_name: donor_name,
        donor_email: email,
        message: message || ''
      }
    })
    
    console.log('createDonationAction: Razorpay order created:', order.id)
    
    return { 
      success: true, 
      donation, 
      orderId: order.id 
    }
    
  } catch (error) {
    console.error('Error in createDonationAction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create donation' 
    }
  }
}

// Legacy server action wrapper for client components (keeping for backward compatibility)
export async function createDonationActionLegacy(formData: FormData): Promise<{ success: boolean; donation?: Donation; error?: string }> {
  try {
    console.log('createDonationActionLegacy: Starting...')
    
    const amount = parseInt(formData.get('amount') as string)
    const donorName = formData.get('donor_name') as string
    const email = formData.get('email') as string
    const isAnonymous = formData.get('anonymous') === 'true'
    
    console.log('createDonationActionLegacy: Parsed data:', { amount, donorName, email, isAnonymous })
    
    if (!amount || amount < 10) {
      console.log('createDonationActionLegacy: Invalid amount')
      return { success: false, error: 'Invalid amount. Minimum donation is ₹10.' }
    }
    
    if (!donorName || !email) {
      console.log('createDonationActionLegacy: Missing required fields')
      return { success: false, error: 'Name and email are required.' }
    }
    
    console.log('createDonationActionLegacy: About to create donation...')
    
    try {
      const donation = await createDonation({
        user_id: null, // Anonymous donation
        amount_cents: amount,
        currency: 'INR',
        is_anonymous: isAnonymous,
        razorpay_payment_id: null, // Will be set after payment
        created_at: new Date().toISOString()
      })
      
      console.log('createDonationActionLegacy: Donation created successfully:', donation.id)
      return { success: true, donation }
    } catch (createError) {
      console.error('createDonationActionLegacy: Error in createDonation:', createError)
      throw createError
    }
  } catch (error) {
    console.error('Error in createDonationActionLegacy:', error)
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
    .limit(5) // Limit to 5 most recent donations
  
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
