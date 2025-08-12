// =====================================================
// CLIENT-SIDE AUTH FUNCTIONS
// Xainik Platform - Client Components Only
// =====================================================

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/live-schema'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase instance
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// =====================================================
// CLIENT-SIDE AUTH UTILITIES
// =====================================================

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    throw new Error(`Failed to get current user: ${error.message}`)
  }
  
  return user
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(`Failed to sign out: ${error.message}`)
  }
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      user_profiles (*)
    `)
    .eq('id', userId)
    .single()
  
  if (error) {
    throw new Error(`Failed to get user profile: ${error.message}`)
  }
  
  return data
}

export async function isSubscriptionActive(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('end_date')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gte('end_date', new Date().toISOString())
    .single()
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to check subscription: ${error.message}`)
  }
  
  return !!data
}

export async function getSubscriptionDetails(userId: string) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get subscription details: ${error.message}`)
  }
  
  return data
}
