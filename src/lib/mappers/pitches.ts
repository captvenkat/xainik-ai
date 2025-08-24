import type { Database } from '@/types/live-schema'
import type { FullPitchData, PitchCardData } from '@/types/domain'

export type RawPitchRow = Database['public']['Tables']['pitches']['Row'] & {
  users?: Database['public']['Tables']['users']['Row']
  endorsements?: Database['public']['Tables']['endorsements']['Row'][]
  // New fields from pitch_cards_view
  user_name?: string
  user_email?: string
  user_avatar_url?: string
  user_role?: string
  user_profile_data?: any
  endorsements_count?: number
  shares_count?: number
  allow_resume_requests?: boolean
}

export function toPitchCardData(pitch: RawPitchRow): PitchCardData {
  return {
    id: pitch.id,
    title: pitch.title,
    pitch_text: pitch.pitch_text || '',
    skills: pitch.skills || [],
    location: pitch.location,
    job_type: pitch.job_type,
    availability: pitch.availability,
    photo_url: pitch.photo_url || pitch.user_avatar_url || null,
    experience_years: pitch.experience_years,
    linkedin_url: pitch.linkedin_url,
    resume_url: pitch.resume_url,
    phone: pitch.phone,
    bio: pitch.user_profile_data?.bio || null,
    likes_count: pitch.likes_count || 0,
    views_count: pitch.views_count || 0,
    created_at: pitch.created_at || new Date().toISOString(),
    user: {
      id: pitch.user_id,
      name: pitch.user_name || 'Veteran',
      email: pitch.user_email || ''
    },
    endorsements_count: pitch.endorsements_count || 0,
    supporters_count: pitch.shares_count || 0,
    is_subscription_active: Boolean(pitch.plan_tier && 
                           pitch.plan_tier !== 'free' && 
                           pitch.plan_expires_at && 
                           new Date(pitch.plan_expires_at) > new Date())
  }
}

export function toPitchCardDataArray(pitches: RawPitchRow[]): PitchCardData[] {
  return pitches.map(toPitchCardData)
}

export function toFullPitchData(pitch: RawPitchRow): FullPitchData {
  return {
    ...toPitchCardData(pitch),
    bio: pitch.user_profile_data?.bio || null,
    supporters_count: pitch.shares_count || 0,
    resume_share_enabled: pitch.resume_share_enabled || false,
    plan_tier: pitch.plan_tier,
    plan_expires_at: pitch.plan_expires_at,
    updated_at: pitch.updated_at || new Date().toISOString(),
    endorsements: pitch.endorsements?.filter((endorsement: any) => endorsement.endorser_user_id).map((endorsement: any) => ({
      ...endorsement,
      endorser_user_id: endorsement.endorser_user_id!, // Ensure it's not null
      updated_at: (endorsement as any).updated_at || endorsement.created_at || new Date().toISOString(),
      endorser: {
        id: endorsement.endorser_user_id!,
        email: '', // Would need to fetch endorser user data
        name: '',
        phone: null,
        role: '',
        created_at: null,
        updated_at: null,
        avatar_url: null,
        bio: null,
        certifications: null,
        discharge_date: null,
        education_level: null,
        github_url: null,
        linkedin_url: null,
        location: null,
        military_rank: null,
        service_branch: null,
        twitter_url: null,
        website_url: null,
        years_of_service: null,
        email_verified: null,
        is_active: null,
        last_login_at: null,
        metadata: null,
        onboarding_completed: null,
        preferences: null,
        military_branch: null,
        phone_verified: null
      }
    })) || [],
    veterans: (pitch as any).veterans || [],
    metadata: (pitch as any).metadata || {}
  }
}
