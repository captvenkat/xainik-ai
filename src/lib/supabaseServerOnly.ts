// =====================================================
// ENTERPRISE-GRADE SERVER-ONLY CLIENT
// Xainik Platform - Fresh Implementation
// Single Source of Truth: Live Database Schema
// Unified ID System: user_id everywhere
// =====================================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/live-schema';

// =====================================================
// ENVIRONMENT VALIDATION
// =====================================================

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// =====================================================
// SERVER-ONLY CLIENT INSTANCE
// =====================================================

export const createSupabaseServerOnly = async () => {
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        }
      }
    }
  );
};

// =====================================================
// AUTHENTICATION FUNCTIONS
// =====================================================

export async function getCurrentUser() {
  const supabase = await createSupabaseServerOnly();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  // Get user from our users table
  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (dbError || !dbUser) {
    return null;
  }
  
  return dbUser;
}

export async function getSession() {
  const supabase = await createSupabaseServerOnly();
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    // Session error - return null
    return null;
  }
  
  return session;
}

// =====================================================
// USER MANAGEMENT FUNCTIONS
// =====================================================

export async function getUserById(userId: string) {
  const supabase = await createSupabaseServerOnly();
  
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      *,
      user_profiles (*)
    `)
    .eq('id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get user: ${error.message}`);
  }
  
  return user;
}

export async function getAllUsers() {
  const supabase = await createSupabaseServerOnly();
  
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get users: ${error.message}`);
  }
  
  return users || [];
}

export async function updateUserRole(userId: string, role: string) {
  const supabase = await createSupabaseServerOnly();
  
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);
  
  return { error: error?.message };
}

// =====================================================
// PITCH MANAGEMENT FUNCTIONS
// =====================================================

export async function getAllPitches() {
  const supabase = await createSupabaseServerOnly();
  
  const { data: pitches, error } = await supabase
    .from('pitches')
    .select(`
      *,
      user:users (id, name, email),
      endorsements (*),
      referrals (*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get pitches: ${error.message}`);
  }
  
  return pitches || [];
}

export async function getPitchById(pitchId: string) {
  const supabase = await createSupabaseServerOnly();
  
  const { data: pitch, error } = await supabase
    .from('pitches')
    .select(`
      *,
      user:users (id, name, email),
      endorsements (*),
      referrals (*)
    `)
    .eq('id', pitchId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get pitch: ${error.message}`);
  }
  
  return pitch;
}

export async function getPitchesByUserId(userId: string) {
  const supabase = await createSupabaseServerOnly();
  
  const { data: pitches, error } = await supabase
    .from('pitches')
    .select(`
      *,
      endorsements (*),
      referrals (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get pitches: ${error.message}`);
  }
  
  return pitches || [];
}

// =====================================================
// DONATION FUNCTIONS
// =====================================================

export async function getAllDonations() {
  const supabase = await createSupabaseServerOnly();
  
  const { data: donations, error } = await supabase
    .from('donations')
    .select(`
      *,
      user:users (id, name, email)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get donations: ${error.message}`);
  }
  
  return donations || [];
}

export async function getDonationsByUserId(userId: string) {
  const supabase = await createSupabaseServerOnly();
  
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

export async function getDonationStats() {
  const supabase = await createSupabaseServerOnly();
  
  const { data: donations, error } = await supabase
    .from('donations')
    .select('*');
  
  if (error) {
    throw new Error(`Failed to get donation stats: ${error.message}`);
  }
  
  const allDonations = donations || [];
  
  return {
    total_donations: allDonations.length,
    total_amount: allDonations.reduce((sum, donation) => sum + donation.amount_cents, 0),
    total_donors: new Set(allDonations.filter(d => d.user_id).map(d => d.user_id)).size,
    average_donation: allDonations.length > 0 ? allDonations.reduce((sum, donation) => sum + donation.amount_cents, 0) / allDonations.length : 0
  };
}

// =====================================================
// ENDORSEMENT FUNCTIONS
// =====================================================

export async function getAllEndorsements() {
  const supabase = await createSupabaseServerOnly();
  
  const { data: endorsements, error } = await supabase
    .from('endorsements')
    .select(`
      *,
      endorser:users!endorsements_endorser_user_id_fkey (id, name, email)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get endorsements: ${error.message}`);
  }
  
  return endorsements || [];
}

// =====================================================
// INVOICE FUNCTIONS
// =====================================================

export async function getAllInvoices() {
  const supabase = await createSupabaseServerOnly();
  
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      *,
      user:users (id, name, email),
      plan:service_plans (id, name, description)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get invoices: ${error.message}`);
  }
  
  return invoices || [];
}

export async function getInvoicesByUserId(userId: string) {
  const supabase = await createSupabaseServerOnly();
  
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      *,
      plan:service_plans (id, name, description)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get invoices: ${error.message}`);
  }
  
  return invoices || [];
}

// =====================================================
// RECEIPT FUNCTIONS
// =====================================================

export async function getAllReceipts() {
  const supabase = await createSupabaseServerOnly();
  
  const { data: receipts, error } = await supabase
    .from('receipts')
    .select(`
      *,
      user:users (id, name, email)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get receipts: ${error.message}`);
  }
  
  return receipts || [];
}

export async function getReceiptsByUserId(userId: string) {
  const supabase = await createSupabaseServerOnly();
  
  const { data: receipts, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get receipts: ${error.message}`);
  }
  
  return receipts || [];
}

// =====================================================
// RESUME REQUEST FUNCTIONS
// =====================================================

export async function getAllResumeRequests() {
  const supabase = await createSupabaseServerOnly();
  
  const { data: requests, error } = await supabase
    .from('resume_requests')
    .select(`
      *,
      user:users!resume_requests_user_id_fkey (id, name, email),
      recruiter:users!resume_requests_recruiter_user_id_fkey (id, name, email),
      pitch:pitches (id, title, pitch_text)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get resume requests: ${error.message}`);
  }
  
  return requests || [];
}

export async function getResumeRequestsByRecruiterId(recruiterUserId: string) {
  const supabase = await createSupabaseServerOnly();
  
  const { data: requests, error } = await supabase
    .from('resume_requests')
    .select(`
      *,
      user:users!resume_requests_user_id_fkey (id, name, email),
      pitch:pitches (id, title, pitch_text)
    `)
    .eq('recruiter_user_id', recruiterUserId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get resume requests: ${error.message}`);
  }
  
  return requests || [];
}

// =====================================================
// ACTIVITY LOG FUNCTIONS
// =====================================================

export async function getRecentActivity(limit: number = 50) {
  const supabase = await createSupabaseServerOnly();
  
  const { data: activity, error } = await supabase
    .from('user_activity_log')
    .select(`
      *,
      user:users (id, name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    throw new Error(`Failed to get recent activity: ${error.message}`);
  }
  
  return activity || [];
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export function isAuthenticated(session: any): boolean {
  return !!session?.user;
}

export function getUserRole(user: any): string | null {
  return user?.role || null;
}

export function getUserEmail(user: any): string | null {
  return user?.email || null;
}

export function getUserName(user: any): string | null {
  return user?.name || null;
}

// =====================================================
// EXPORT ALL FUNCTIONS
// =====================================================

// All functions are already exported above
