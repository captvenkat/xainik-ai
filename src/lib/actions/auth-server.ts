'use server'

import { createActionClient } from '@/lib/supabase-server'
import { Database } from '@/types/live-schema'

type User = Database['public']['Tables']['users']['Row']
// Note: user_profiles table doesn't exist in live schema
// type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserProfile = any

export async function updateUserRole(userId: string, role: string): Promise<{ error?: string }> {
  const supabase = await createActionClient()
  
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)
  
  return error ? { error: 'User role update failed' } : {}
}

export async function createUserProfile(
  userId: string,
  profileType: string,
  profileData: any
): Promise<{ error?: string }> {
  const supabase = await createActionClient()
  
  // Note: user_profiles table doesn't exist in live schema
  // Skip creating user profile until schema is properly migrated
  // const { error } = await supabase
  //   .from('user_profiles')
  //   .insert({
  //     user_id: userId,
  //     profile_type: profileType,
  //     profile_data: profileData
  //   })
  const error = null
  
  return error ? { error: 'User profile creation failed' } : {}
}

export async function getUserWithProfiles(userId: string): Promise<{
  user: User
  profiles: UserProfile[]
} | null> {
  const supabase = await createActionClient()
  
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (userError || !user) {
    return null
  }
  
  // Note: user_profiles table doesn't exist in live schema
  // Skip fetching user profiles until schema is properly migrated
  // const { data: profiles, error: profilesError } = await supabase
  //   .from('user_profiles')
  //   .select('*')
  //   .eq('user_id', userId)
  const profiles: any[] = []
  const profilesError = null
  
  if (profilesError) {
    return null
  }
  
  return {
    user,
    profiles: profiles || []
  }
}

export async function isSubscriptionActive(userId: string): Promise<boolean> {
  const supabase = await createActionClient()
  
  // Note: user_subscriptions table doesn't exist in live schema
  // Skip checking subscription until schema is properly migrated
  // const { data, error } = await supabase
  //   .from('user_subscriptions')
  //   .select('end_date')
  //   .eq('user_id', userId)
  //   .eq('status', 'active')
  //   .gte('end_date', new Date().toISOString())
  //   .single()
  // 
  // if (error && error.code !== 'PGRST116') {
  //   throw new Error(`Failed to check subscription: ${error.message}`)
  // }
  // 
  // return !!data
  
  // For now, return false (no active subscription)
  return false
}
