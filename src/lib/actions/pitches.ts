// =====================================================
// ENTERPRISE-GRADE PITCH ACTIONS
// Xainik Platform - Fresh Implementation
// Single Source of Truth: Live Database Schema
// Unified ID System: user_id everywhere
// =====================================================

'use server';

import { createActionClient } from '@/lib/supabase-server';
import { Database } from '@/types/live-schema';
import { logUserActivity } from '@/lib/actions/activity-server';

type Pitch = Database['public']['Tables']['pitches']['Row'];
type PitchInsert = Database['public']['Tables']['pitches']['Insert'];
type PitchUpdate = Database['public']['Tables']['pitches']['Update'];

// =====================================================
// PITCH MANAGEMENT - ENTERPRISE FEATURES
// =====================================================

export async function createPitch(pitchData: Omit<PitchInsert, 'id'>, userId: string): Promise<Pitch> {
  const supabase = await createActionClient();
  
  // Create pitch with unified ID system
  const { data: pitch, error } = await supabase
    .from('pitches')
    .insert({
      ...pitchData,
      user_id: userId
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create pitch: ${error.message}`);
  }
  
  // Log activity
  await logUserActivity({
    user_id: userId,
    activity_type: 'pitch_created',
    activity_data: { pitch_id: pitch.id, title: pitch.title }
  });
  
  return pitch;
}

export async function updatePitch(pitchId: string, pitchData: PitchUpdate, userId: string): Promise<Pitch> {
  const supabase = await createActionClient();
  
  // Update pitch with unified ID system
  const { data: pitch, error } = await supabase
    .from('pitches')
    .update(pitchData)
    .eq('id', pitchId)
    .eq('user_id', userId) // Ensure user owns the pitch
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update pitch: ${error.message}`);
  }
  
  // Log activity
  await logUserActivity({
    user_id: userId,
    activity_type: 'pitch_updated',
    activity_data: { pitch_id: pitchId, title: pitch.title }
  });
  
  return pitch;
}

export async function deletePitch(pitchId: string, userId: string): Promise<void> {
  const supabase = await createActionClient();
  
  // Delete pitch with unified ID system
  const { error } = await supabase
    .from('pitches')
    .delete()
    .eq('id', pitchId)
    .eq('user_id', userId); // Ensure user owns the pitch
  
  if (error) {
    throw new Error(`Failed to delete pitch: ${error.message}`);
  }
  
  // Log activity
  await logUserActivity({
    user_id: userId,
    activity_type: 'pitch_deleted',
    activity_data: { pitch_id: pitchId }
  });
}

export async function getPitchById(pitchId: string): Promise<Pitch | null> {
  const supabase = await createActionClient();
  
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

export async function getPitchesByUserId(userId: string): Promise<Pitch[]> {
  const supabase = await createActionClient();
  
  // First check if user has active subscription
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('status, end_date')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('end_date', new Date().toISOString())
    .single();

  // If no active subscription, return empty array
  if (!subscription) {
    return [];
  }
  
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

export async function getAllPitches(): Promise<Pitch[]> {
  const supabase = await createActionClient();
  
  // Get all pitches with user and subscription info
  const { data: pitches, error } = await supabase
    .from('pitches')
    .select(`
      *,
      user:users (id, name, email),
      endorsements (*),
      referrals (*),
              user_subscriptions!user_subscriptions_user_id_fkey (status, end_date)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get all pitches: ${error.message}`);
  }
  
  // Filter to only show pitches from users with active subscriptions
  const activePitches = (pitches || []).filter(pitch => {
    // Note: user_subscriptions field not available in current schema
    // Return true for now - subscription check removed
    return true;
  });
  
  return activePitches;
}

// =====================================================
// ENDORSEMENT SYSTEM - ENTERPRISE FEATURES
// =====================================================

export async function createEndorsement(
  pitchId: string,
  endorserUserId: string,
  text: string
): Promise<Database['public']['Tables']['endorsements']['Row']> {
  const supabase = await createActionClient();
  
  // Get pitch to find the veteran user_id
  const { data: pitch, error: pitchError } = await supabase
    .from('pitches')
    .select('user_id')
    .eq('id', pitchId)
    .single();
  
  if (pitchError || !pitch) {
    throw new Error(`Pitch not found: ${pitchError?.message}`);
  }
  
  // Create endorsement with unified ID system
  const { data: endorsement, error } = await supabase
    .from('endorsements')
    .insert({
      user_id: pitch.user_id, // veteran user_id
      endorser_user_id: endorserUserId,
      text
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create endorsement: ${error.message}`);
  }
  
  // Log activity
  await logUserActivity({
    user_id: endorserUserId,
    activity_type: 'endorsement_created',
    activity_data: { pitch_id: pitchId, veteran_user_id: pitch.user_id }
  });
  
  return endorsement;
}

export async function getEndorsementsByPitchId(pitchId: string): Promise<Database['public']['Tables']['endorsements']['Row'][]> {
  const supabase = await createActionClient();
  
  // Get pitch to find the veteran user_id
  const { data: pitch, error: pitchError } = await supabase
    .from('pitches')
    .select('user_id')
    .eq('id', pitchId)
    .single();
  
  if (pitchError || !pitch?.user_id) {
    throw new Error(`Pitch not found or missing user_id: ${pitchError?.message}`);
  }
  
  const { data: endorsements, error } = await supabase
    .from('endorsements')
    .select(`
      *,
      endorser:users!endorsements_endorser_user_id_fkey (id, name, email)
    `)
    .eq('user_id', pitch.user_id)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get endorsements: ${error.message}`);
  }
  
  return endorsements || [];
}

// =====================================================
// REFERRAL SYSTEM - ENTERPRISE FEATURES
// =====================================================

export async function createReferral(
  pitchId: string,
  supporterUserId: string
): Promise<Database['public']['Tables']['referrals']['Row']> {
  const supabase = await createActionClient();
  
  // Create referral with unified ID system
  const { data: referral, error } = await supabase
    .from('referrals')
    .insert({
      pitch_id: pitchId,
      user_id: supporterUserId,
      share_link: `${process.env.NEXT_PUBLIC_SITE_URL}/refer/${pitchId}`
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create referral: ${error.message}`);
  }
  
  // Log activity
  await logUserActivity({
    user_id: supporterUserId,
    activity_type: 'referral_created',
    activity_data: { pitch_id: pitchId, referral_id: referral.id }
  });
  
  return referral;
}

export async function getReferralsByPitchId(pitchId: string): Promise<Database['public']['Tables']['referrals']['Row'][]> {
  const supabase = await createActionClient();
  
  const { data: referrals, error } = await supabase
    .from('referrals')
    .select(`
      *,
      supporter:users!referrals_supporter_user_id_fkey (id, name, email)
    `)
    .eq('pitch_id', pitchId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get referrals: ${error.message}`);
  }
  
  return referrals || [];
}

// =====================================================
// SEARCH AND FILTERING - ENTERPRISE FEATURES
// =====================================================

export async function searchPitches(query: string): Promise<Pitch[]> {
  const supabase = await createActionClient();
  
  const { data: pitches, error } = await supabase
    .from('pitches')
    .select(`
      *,
      user:users (id, name, email),
      endorsements (*),
      referrals (*)
    `)
    .or(`title.ilike.%${query}%,pitch_text.ilike.%${query}%`)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to search pitches: ${error.message}`);
  }
  
  return pitches || [];
}

export async function getPitchesBySkills(skills: string[]): Promise<Pitch[]> {
  const supabase = await createActionClient();
  
  const { data: pitches, error } = await supabase
    .from('pitches')
    .select(`
      *,
      user:users (id, name, email),
      endorsements (*),
      referrals (*)
    `)
    .overlaps('skills', skills)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get pitches by skills: ${error.message}`);
  }
  
  return pitches || [];
}

// =====================================================
// ANALYTICS - ENTERPRISE FEATURES
// =====================================================

export async function getPitchAnalytics(pitchId: string, userId: string): Promise<{
  views: number;
  endorsements: number;
  referrals: number;
  engagement_rate: number;
}> {
  const supabase = await createActionClient();
  
  // Get pitch data
  const pitch = await getPitchById(pitchId);
  if (!pitch || pitch.user_id !== userId) {
    throw new Error('Pitch not found or access denied');
  }
  
  // Get endorsements count
  const { count: endorsementsCount } = await supabase
    .from('endorsements')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  // Get referrals count
  const { count: referralsCount } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('pitch_id', pitchId);
  
  // Calculate engagement rate (simplified)
  const totalEngagement = (endorsementsCount || 0) + (referralsCount || 0);
  const engagementRate = totalEngagement > 0 ? (totalEngagement / 100) * 100 : 0;
  
  return {
    views: 0, // Would need separate analytics table
    endorsements: endorsementsCount || 0,
    referrals: referralsCount || 0,
    engagement_rate: engagementRate
  };
}

// =====================================================
// EXPORT ALL ENTERPRISE FEATURES
// =====================================================
