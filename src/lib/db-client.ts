// =====================================================
// CLIENT-SIDE DATABASE CLIENT
// Xainik Platform - Client Components Only
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/live-schema';

// =====================================================
// ENVIRONMENT VALIDATION
// =====================================================

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// =====================================================
// CLIENT CONFIGURATION
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// =====================================================
// CLIENT INSTANCE
// =====================================================

// Public client for client-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// =====================================================
// CLIENT-SIDE UTILITIES
// =====================================================

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Failed to get current user: ${error.message}`);
  return user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Failed to sign out: ${error.message}`);
}

// =====================================================
// EXPORT CLIENT INSTANCE
// =====================================================

export default supabase;
