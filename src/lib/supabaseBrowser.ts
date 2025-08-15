// =====================================================
// ENTERPRISE-GRADE BROWSER CLIENT
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

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// =====================================================
// SINGLETON BROWSER CLIENT INSTANCE
// =====================================================

let supabaseBrowserInstance: ReturnType<typeof createClient<Database>> | null = null;

export const createSupabaseBrowser = () => {
  if (supabaseBrowserInstance) {
    return supabaseBrowserInstance;
  }

  supabaseBrowserInstance = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'xainik-auth-token'
      },
      db: {
        schema: 'public'
      }
    }
  );

  return supabaseBrowserInstance;
};

// Function to clear the singleton instance (useful for sign out)
export const clearSupabaseBrowserInstance = () => {
  supabaseBrowserInstance = null;
};

// =====================================================
// GOOGLE OAUTH HELPER
// =====================================================

export const signInWithGoogle = async () => {
  const supabase = createSupabaseBrowser();
  
  console.log('signInWithGoogle: Starting OAuth flow...');
  console.log('signInWithGoogle: Redirect URL:', `${window.location.origin}/auth/callback`);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { access_type: 'offline', prompt: 'consent' }
    }
  });

  console.log('signInWithGoogle: OAuth response:', { data, error });

  if (error) {
    console.error('signInWithGoogle: OAuth error:', error);
    throw error;
  }

  // If we get here, the OAuth flow should have started
  console.log('signInWithGoogle: OAuth flow initiated successfully');
};

export async function signOut() {
  const supabase = createSupabaseBrowser();
  
  const { error } = await supabase.auth.signOut();
  return { error: error?.message };
}

export async function getCurrentUser() {
  const supabase = createSupabaseBrowser();
  
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
  const supabase = createSupabaseBrowser();
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Session error:', error);
    return null;
  }
  
  return session;
}

// =====================================================
// USER MANAGEMENT FUNCTIONS
// =====================================================

export async function updateUserRole(userId: string, role: string) {
  const supabase = createSupabaseBrowser();
  
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);
  
  return { error: error?.message };
}

export async function getUserProfile(userId: string) {
  const supabase = createSupabaseBrowser();
  
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get user profile: ${error.message}`);
  }
  
  return profile;
}

// =====================================================
// PITCH MANAGEMENT FUNCTIONS
// =====================================================

export async function getPitches() {
  const supabase = createSupabaseBrowser();
  
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
  const supabase = createSupabaseBrowser();
  
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

// =====================================================
// DONATION FUNCTIONS
// =====================================================

export async function getDonations() {
  const supabase = createSupabaseBrowser();
  
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

export async function getDonationStats() {
  const supabase = createSupabaseBrowser();
  
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
