// =====================================================
// ENTERPRISE-GRADE AUTHENTICATION SYSTEM
// Xainik Platform - Fresh Implementation
// Single Source of Truth: Live Database Schema
// Unified ID System: user_id everywhere
// =====================================================

import { createActionClient } from '@/lib/supabase-server';
import { Database } from '@/types/live-schema';

type User = Database['public']['Tables']['users']['Row'];
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

// =====================================================
// AUTHENTICATION FUNCTIONS - ENTERPRISE FEATURES
// =====================================================

// Note: These functions are now handled by auth-client.ts for client-side auth
// Server-side auth functions are in auth-server.ts

export async function getUserWithProfiles(userId: string): Promise<{
  user: User;
  profiles: UserProfile[];
} | null> {
  const supabaseAction = await createActionClient();
  
  const { data: user, error: userError } = await supabaseAction
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (userError || !user) {
    return null;
  }
  
  const { data: profiles, error: profilesError } = await supabaseAction
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId);
  
  if (profilesError) {
    return null;
  }
  
  return {
    user,
    profiles: profiles || []
  };
}

export async function updateUserRole(userId: string, role: string): Promise<{ error?: string }> {
  const supabaseAction = await createActionClient();
  
  const { error } = await supabaseAction
    .from('users')
    .update({ role })
    .eq('id', userId);
  
  return error ? { error: error.message } : {};
}

export async function createUserProfile(
  userId: string,
  profileType: string,
  profileData: any
): Promise<{ error?: string }> {
  const supabaseAction = await createActionClient();
  
  const { error } = await supabaseAction
    .from('user_profiles')
    .insert({
      user_id: userId,
      profile_type: profileType,
      profile_data: profileData
    });
  
  return error ? { error: error.message } : {};
}

export async function updateUserProfile(
  userId: string,
  profileType: string,
  profileData: any
): Promise<{ error?: string }> {
  const supabaseAction = await createActionClient();
  
  const { error } = await supabaseAction
    .from('user_profiles')
    .upsert({
      user_id: userId,
      profile_type: profileType,
      profile_data: profileData,
      updated_at: new Date().toISOString()
    });
  
  return error ? { error: error.message } : {};
}

// =====================================================
// ROLE-BASED ACCESS CONTROL - ENTERPRISE FEATURES
// =====================================================

export async function hasRole(userId: string, role: string): Promise<boolean> {
  const supabaseAction = await createActionClient();
  const { data: user } = await supabaseAction
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
  return user?.role === role;
}

export async function isVeteran(userId: string): Promise<boolean> {
  return hasRole(userId, 'veteran');
}

export async function isRecruiter(userId: string): Promise<boolean> {
  return hasRole(userId, 'recruiter');
}

export async function isSupporter(userId: string): Promise<boolean> {
  return hasRole(userId, 'supporter');
}

export async function isAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, 'admin');
}

// =====================================================
// SESSION MANAGEMENT - ENTERPRISE FEATURES
// =====================================================

// Note: Session management is now handled by auth-client.ts

// =====================================================
// USER MANAGEMENT - ENTERPRISE FEATURES
// =====================================================

export async function createUser(userData: {
  email: string;
  name?: string;
  role?: string;
}): Promise<{ user?: User; error?: string }> {
  const supabaseAction = await createActionClient();
  
  const { data: user, error } = await supabaseAction
    .from('users')
    .insert({
      id: crypto.randomUUID(),
      email: userData.email,
      name: userData.name || 'Unknown User',
      role: userData.role || 'veteran'
    })
    .select()
    .single();
  
  return user ? { user } : { error: error?.message || 'Unknown error' };
}

export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<{ user?: User; error?: string }> {
  const supabaseAction = await createActionClient();
  
  const { data: user, error } = await supabaseAction
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();
  
  return user ? { user } : { error: error?.message || 'Unknown error' };
}

export async function deleteUser(userId: string): Promise<{ error?: string }> {
  const supabaseAction = await createActionClient();
  
  const { error } = await supabaseAction
    .from('users')
    .delete()
    .eq('id', userId);
  
  return error ? { error: error.message } : {};
}

// =====================================================
// UTILITY FUNCTIONS - ENTERPRISE FEATURES
// =====================================================

export function isAuthenticated(session: any): boolean {
  return !!session?.user;
}

export function getUserRole(user: User | null): string | null {
  return user?.role || null;
}

export function getUserEmail(user: User | null): string | null {
  return user?.email || null;
}

export function getUserName(user: User | null): string | null {
  return user?.name || null;
}

// =====================================================
// SUBSCRIPTION MANAGEMENT - ENTERPRISE FEATURES
// =====================================================

export async function isSubscriptionActive(userId: string): Promise<{ active: boolean; error?: string }> {
  try {
    const supabaseAction = await createActionClient()

    const { data: subscription, error } = await supabaseAction
      .from('user_subscriptions')
          .select('status, end_date')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('end_date', new Date().toISOString())
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Failed to check subscription status:', error)
      return { active: false, error: error.message }
    }

    return { active: !!subscription }
  } catch (error) {
    console.error('Failed to check subscription status:', error)
    return { active: false, error: 'Failed to check subscription status' }
  }
}

// =====================================================
// EXPORT ALL ENTERPRISE FEATURES
// =====================================================
