import type { Database } from '@/types/live-schema'

export type RawPitchRow = Database['public']['Tables']['pitches']['Row'] & {
  user?: Database['public']['Tables']['users']['Row']
  endorsements?: Database['public']['Tables']['endorsements']['Row'][]
  user_subscriptions?: Database['public']['Tables']['user_subscriptions']['Row'][]
}

export interface PitchCardData {
  id: string
  title: string
  pitch_text: string
  skills: string[]
  experience_years: number | null
  linkedin_url: string | null
  resume_url: string | null
  created_at: string
  user: {
    id: string
    name: string | null
    email: string
  } | null
  endorsements_count: number
  is_subscription_active: boolean
}

export function toPitchCardData(pitch: RawPitchRow): PitchCardData {
  return {
    id: pitch.id,
    title: pitch.title,
    pitch_text: pitch.pitch_text,
    skills: pitch.skills || [],
    experience_years: pitch.experience_years,
    linkedin_url: pitch.linkedin_url,
    resume_url: pitch.resume_url,
    created_at: pitch.created_at || new Date().toISOString(),
    user: pitch.user ? {
      id: pitch.user.id,
      name: pitch.user.name,
      email: pitch.user.email
    } : null,
    endorsements_count: pitch.endorsements?.length || 0,
    is_subscription_active: pitch.user_subscriptions?.some(sub => 
      sub.status === 'active' && new Date(sub.end_date) > new Date()
    ) || false
  }
}

export function toPitchCardDataArray(pitches: RawPitchRow[]): PitchCardData[] {
  return pitches.map(toPitchCardData)
}
