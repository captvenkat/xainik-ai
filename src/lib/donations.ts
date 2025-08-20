// =====================================================
// ENTERPRISE-GRADE DONATIONS SYSTEM
// Xainik Platform - Fresh Implementation
// Single Source of Truth: Live Database Schema
// Unified ID System: user_id everywhere
// =====================================================

import { createActionClient } from '@/lib/supabase-server';
import { Database } from '@/types/live-schema';
import { logUserActivity } from '@/lib/actions/activity-server';

type Donation = Database['public']['Tables']['donations']['Row'];
type DonationInsert = Database['public']['Tables']['donations']['Insert'];

// =====================================================
// DONATION MANAGEMENT - ENTERPRISE FEATURES
// =====================================================

export async function createDonation(donationData: Omit<DonationInsert, 'id'>): Promise<Donation> {
  const supabase = await createActionClient();
  
  // Create donation with unified ID system
  const { data: donation, error } = await supabase
    .from('donations')
    .insert(donationData)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create donation: ${error.message}`);
  }
  
  // Log activity
  if (donation.user_id) {
      await logUserActivity({
    user_id: donation.user_id,
    activity_type: 'donation_created',
    activity_data: { 
      donation_id: donation.id, 
      amount_cents: donation.amount,
      is_anonymous: false
    }
  });
  }
  
  return donation;
}

export async function getDonationById(donationId: string): Promise<Donation | null> {
  const supabase = await createActionClient();
  
  const { data: donation, error } = await supabase
    .from('donations')
    .select(`
      *,
      user:users (id, name, email)
    `)
    .eq('id', donationId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get donation: ${error.message}`);
  }
  
  return donation;
}

export async function getDonationsByUserId(userId: string): Promise<Donation[]> {
  const supabase = await createActionClient();
  
  const { data: donations, error } = await supabase
    .from('donations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get donations: ${error.message}`);
  }
  
  return donations || [];
}

export async function getAllDonations(): Promise<Donation[]> {
  const supabase = await createActionClient();
  
  const { data: donations, error } = await supabase
    .from('donations')
    .select(`
      *,
      user:users (id, name, email)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get all donations: ${error.message}`);
  }
  
  return donations || [];
}

export async function getAnonymousDonations(): Promise<Donation[]> {
  const supabase = await createActionClient();
  
  const { data: donations, error } = await supabase
    .from('donations')
    .select('*')
    .eq('user_id', null)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get anonymous donations: ${error.message}`);
  }
  
  return donations || [];
}

// =====================================================
// DONATION ANALYTICS - ENTERPRISE FEATURES
// =====================================================

export async function getDonationStats(): Promise<{
  total_donations: number;
  total_amount: number;
  total_donors: number;
  average_donation: number;
  recent_donations: Donation[];
}> {
  const supabase = await createActionClient();
  
  // Get all donations
  const { data: donations, error } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get donation stats: ${error.message}`);
  }
  
  const allDonations = donations || [];
  
  // Calculate stats
  const totalDonations = allDonations.length;
  const totalAmount = allDonations.reduce((sum, donation) => sum + donation.amount, 0);
  const uniqueDonors = new Set(allDonations.filter(d => d.user_id).map(d => d.user_id)).size;
  const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;
  const recentDonations = allDonations.slice(0, 10);
  
  return {
    total_donations: totalDonations,
    total_amount: totalAmount,
    total_donors: uniqueDonors,
    average_donation: averageDonation,
    recent_donations: recentDonations
  };
}

export async function getDonationStatsByPeriod(days: number): Promise<{
  period_donations: number;
  period_amount: number;
  period_donors: number;
  period_average: number;
}> {
  const supabase = await createActionClient();
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data: donations, error } = await supabase
    .from('donations')
    .select('*')
    .gte('created_at', startDate.toISOString());
  
  if (error) {
    throw new Error(`Failed to get donation stats by period: ${error.message}`);
  }
  
  const periodDonations = donations || [];
  
  // Calculate period stats
  const periodAmount = periodDonations.reduce((sum, donation) => sum + donation.amount, 0);
  const uniqueDonors = new Set(periodDonations.filter(d => d.user_id).map(d => d.user_id)).size;
  const periodAverage = periodDonations.length > 0 ? periodAmount / periodDonations.length : 0;
  
  return {
    period_donations: periodDonations.length,
    period_amount: periodAmount,
    period_donors: uniqueDonors,
    period_average: periodAverage
  };
}

export async function getTopDonors(limit: number = 10): Promise<{
  user_id: string;
  total_amount: number;
  donation_count: number;
  user_name: string;
  user_email: string;
}[]> {
  const supabase = await createActionClient();
  
  const { data: donations, error } = await supabase
    .from('donations')
    .select(`
      user_id,
      amount,
      user:users (id, name, email)
    `)
    .not('user_id', 'is', null);
  
  if (error) {
    throw new Error(`Failed to get top donors: ${error.message}`);
  }
  
  const allDonations = donations || [];
  
  // Group by user and calculate totals
  const donorMap = new Map<string, {
    user_id: string;
    total_amount: number;
    donation_count: number;
    user_name: string;
    user_email: string;
  }>();
  
  allDonations.forEach(donation => {
    if (!donation.user_id) return;
    
    const existing = donorMap.get(donation.user_id);
    const user = donation.user as any;
    
    if (existing) {
      existing.total_amount += donation.amount;
      existing.donation_count += 1;
    } else {
      donorMap.set(donation.user_id, {
        user_id: donation.user_id,
        total_amount: donation.amount,
        donation_count: 1,
        user_name: user?.name || 'Anonymous',
        user_email: user?.email || 'unknown@example.com'
      });
    }
  });
  
  // Sort by total amount and return top donors
  return Array.from(donorMap.values())
    .sort((a, b) => b.total_amount - a.total_amount)
    .slice(0, limit);
}

// =====================================================
// DONATION VALIDATION - ENTERPRISE FEATURES
// =====================================================

export function validateDonationAmount(amountCents: number): { valid: boolean; error?: string } {
  if (amountCents <= 0) {
    return { valid: false, error: 'Donation amount must be greater than 0' };
  }
  
  if (amountCents > 100000000) { // 1 million dollars in cents
    return { valid: false, error: 'Donation amount exceeds maximum limit' };
  }
  
  return { valid: true };
}

export function validateDonationData(donationData: DonationInsert): { valid: boolean; error?: string } {
  // Validate amount
  const amountValidation = validateDonationAmount(donationData.amount);
  if (!amountValidation.valid) {
    return amountValidation;
  }
  
  // Validate currency
  if (!donationData.currency || donationData.currency.length !== 3) {
    return { valid: false, error: 'Invalid currency code' };
  }
  
  // Validate user_id if provided
  if (donationData.user_id && typeof donationData.user_id !== 'string') {
    return { valid: false, error: 'Invalid user ID' };
  }
  
  return { valid: true };
}

// =====================================================
// DONATION RECEIPT GENERATION - ENTERPRISE FEATURES
// =====================================================

export async function generateDonationReceipt(donationId: string): Promise<{
  receipt_number: string;
  donation: Donation;
  receipt_data: any;
}> {
  const donation = await getDonationById(donationId);
  if (!donation) {
    throw new Error('Donation not found');
  }
  
  // Generate receipt number
  const receiptNumber = `RCP-${new Date().getFullYear()}-${donationId.slice(0, 8).toUpperCase()}`;
  
  // Prepare receipt data
  const receiptData = {
    receipt_number: receiptNumber,
    donation_date: donation.created_at,
    donor_name: 'Donor',
    amount: donation.amount / 100,
    currency: donation.currency,
    payment_id: donation.razorpay_payment_id,
    is_anonymous: false
  };
  
  return {
    receipt_number: receiptNumber,
    donation,
    receipt_data: receiptData
  };
}

// =====================================================
// EXPORT ALL ENTERPRISE FEATURES
// =====================================================
