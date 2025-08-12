// =====================================================
// CLIENT-SIDE REFERRAL FUNCTIONS
// Xainik Platform - Client Components Only
// =====================================================

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/live-schema'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase instance
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// =====================================================
// CLIENT-SIDE REFERRAL UTILITIES
// =====================================================

export async function getReferralByCode(code: string) {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('code', code)
    .single()
  
  if (error) {
    throw new Error(`Failed to get referral: ${error.message}`)
  }
  
  return data
}

export async function getReferralsByUserId(userId: string) {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to get referrals: ${error.message}`)
  }
  
  return data || []
}

export async function getReferralEventsByReferralId(referralId: string) {
  const { data, error } = await supabase
    .from('referral_events')
    .select('*')
    .eq('referral_id', referralId)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to get referral events: ${error.message}`)
  }
  
  return data || []
}
