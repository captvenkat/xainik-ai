// =====================================================
// ENTERPRISE-GRADE ADMIN CLIENT
// Xainik Platform - Fresh Implementation
// Single Source of Truth: Live Database Schema
// Unified ID System: user_id everywhere
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/live-schema';

// =====================================================
// ENVIRONMENT VALIDATION
// =====================================================

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

// =====================================================
// ADMIN CLIENT INSTANCE
// =====================================================

export const createAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    }
  );
};

// =====================================================
// USER MANAGEMENT FUNCTIONS
// =====================================================

export async function getAllUsers() {
  const supabase = createAdminClient();
  
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get users: ${error.message}`);
  }
  
  return users || [];
}

export async function getUserById(userId: string) {
  const supabase = createAdminClient();
  
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

export async function updateUser(userId: string, updates: any) {
  const supabase = createAdminClient();
  
  const { data: user, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
  
  return user;
}

export async function deleteUser(userId: string) {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
  
  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
  
  return { success: true };
}

// =====================================================
// PITCH MANAGEMENT FUNCTIONS
// =====================================================

export async function getAllPitches() {
  const supabase = createAdminClient();
  
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
  const supabase = createAdminClient();
  
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

export async function updatePitch(pitchId: string, updates: any) {
  const supabase = createAdminClient();
  
  const { data: pitch, error } = await supabase
    .from('pitches')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', pitchId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update pitch: ${error.message}`);
  }
  
  return pitch;
}

export async function deletePitch(pitchId: string) {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('pitches')
    .delete()
    .eq('id', pitchId);
  
  if (error) {
    throw new Error(`Failed to delete pitch: ${error.message}`);
  }
  
  return { success: true };
}

// =====================================================
// DONATION MANAGEMENT FUNCTIONS
// =====================================================

export async function getAllDonations() {
  const supabase = createAdminClient();
  
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

export async function getDonationById(donationId: string) {
  const supabase = createAdminClient();
  
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

// =====================================================
// INVOICE MANAGEMENT FUNCTIONS
// =====================================================

export async function getAllInvoices() {
  const supabase = createAdminClient();
  
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

export async function getInvoiceById(invoiceId: string) {
  const supabase = createAdminClient();
  
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      user:users (id, name, email),
      plan:service_plans (id, name, description)
    `)
    .eq('id', invoiceId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get invoice: ${error.message}`);
  }
  
  return invoice;
}

export async function updateInvoice(invoiceId: string, updates: any) {
  const supabase = createAdminClient();
  
  const { data: invoice, error } = await supabase
    .from('invoices')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', invoiceId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update invoice: ${error.message}`);
  }
  
  return invoice;
}

// =====================================================
// RECEIPT MANAGEMENT FUNCTIONS
// =====================================================

export async function getAllReceipts() {
  const supabase = createAdminClient();
  
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

export async function getReceiptById(receiptId: string) {
  const supabase = createAdminClient();
  
  const { data: receipt, error } = await supabase
    .from('receipts')
    .select(`
      *,
      user:users (id, name, email)
    `)
    .eq('id', receiptId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get receipt: ${error.message}`);
  }
  
  return receipt;
}

// =====================================================
// ENDORSEMENT MANAGEMENT FUNCTIONS
// =====================================================

export async function getAllEndorsements() {
  const supabase = createAdminClient();
  
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

export async function deleteEndorsement(endorsementId: string) {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('endorsements')
    .delete()
    .eq('id', endorsementId);
  
  if (error) {
    throw new Error(`Failed to delete endorsement: ${error.message}`);
  }
  
  return { success: true };
}

// =====================================================
// RESUME REQUEST MANAGEMENT FUNCTIONS
// =====================================================

export async function getAllResumeRequests() {
  const supabase = createAdminClient();
  
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

export async function updateResumeRequest(requestId: string, updates: any) {
  const supabase = createAdminClient();
  
  const { data: request, error } = await supabase
    .from('resume_requests')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update resume request: ${error.message}`);
  }
  
  return request;
}

// =====================================================
// ACTIVITY LOG FUNCTIONS
// =====================================================

export async function getAllActivityLogs(limit: number = 1000) {
  // Commented out due to user_activity_log table not existing in live schema
  // const supabase = createAdminClient();
  
  // const { data: activity, error } = await supabase
  //   .from('user_activity_log')
  //   .select(`
  //     *,
  //     user:users (id, name, email)
  //   `)
  //   .order('created_at', { ascending: false })
  //   .limit(limit);
  
  // if (error) {
  //   throw new Error(`Failed to get activity logs: ${error.message}`);
  // }
  
  // return activity || [];
  return [];
}

export async function getActivityLogsByUserId(userId: string) {
  // Commented out due to user_activity_log table not existing in live schema
  // const supabase = createAdminClient();
  
  // const { data: activity, error } = await supabase
  //   .from('user_activity_log')
  //   .select('*')
  //   .eq('user_id', userId)
  //   .order('created_at', { ascending: false });
  
  // if (error) {
  //   throw new Error(`Failed to get activity logs: ${error.message}`);
  // }
  
  // return activity || [];
  return [];
}

// =====================================================
// EMAIL LOG FUNCTIONS
// =====================================================

export async function getAllEmailLogs() {
  const supabase = createAdminClient();
  
  const { data: emails, error } = await supabase
    .from('email_logs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get email logs: ${error.message}`);
  }
  
  return emails || [];
}

// =====================================================
// ANALYTICS FUNCTIONS
// =====================================================

export async function getPlatformStats() {
  const supabase = createAdminClient();
  
  // Get counts
  const [
    { count: usersCount },
    { count: pitchesCount },
    { count: donationsCount },
    { count: invoicesCount },
    { count: receiptsCount },
    { count: endorsementsCount },
    { count: resumeRequestsCount }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('pitches').select('*', { count: 'exact', head: true }),
    supabase.from('donations').select('*', { count: 'exact', head: true }),
    supabase.from('invoices').select('*', { count: 'exact', head: true }),
    supabase.from('receipts').select('*', { count: 'exact', head: true }),
    supabase.from('endorsements').select('*', { count: 'exact', head: true }),
    supabase.from('resume_requests').select('*', { count: 'exact', head: true })
  ]);
  
  return {
    total_users: usersCount || 0,
    total_pitches: pitchesCount || 0,
    total_donations: donationsCount || 0,
    total_invoices: invoicesCount || 0,
    total_receipts: receiptsCount || 0,
    total_endorsements: endorsementsCount || 0,
    total_resume_requests: resumeRequestsCount || 0
  };
}

// =====================================================
// EXPORT ALL FUNCTIONS
// =====================================================

// All functions are already exported above
