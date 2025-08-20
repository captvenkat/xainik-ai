import type { Database } from '@/types/live-schema'
import type { FullPitchData, PitchCardData } from '@/types/domain'

export type RawPitchRow = Database['public']['Tables']['pitches']['Row'] & {
  users?: Database['public']['Tables']['users']['Row']
  endorsements?: Database['public']['Tables']['endorsements']['Row'][]
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
    photo_url: pitch.photo_url,
    experience_years: pitch.experience_years,
    linkedin_url: pitch.linkedin_url,
    resume_url: pitch.resume_url,
    phone: null, // Not available in current schema
    bio: null, // Not available in current schema
    likes_count: pitch.likes_count || 0,
    views_count: 0, // Not available in current schema
    created_at: pitch.created_at || new Date().toISOString(),
    user: pitch.users ? {
      id: pitch.users.id,
      name: pitch.users.name,
      email: pitch.users.email
    } : null,
    endorsements_count: pitch.endorsements?.length || 0,
    supporters_count: 0, // TODO: Implement supporters count
    is_subscription_active: false // Not available in current schema
  }
}

export function toPitchCardDataArray(pitches: RawPitchRow[]): PitchCardData[] {
  return pitches.map(toPitchCardData)
}

export function toFullPitchData(pitch: RawPitchRow): FullPitchData {
  return {
    ...toPitchCardData(pitch),
    bio: null, // Not available in current schema
    supporters_count: 0, // Not available in current schema
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
