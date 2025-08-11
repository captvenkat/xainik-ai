import { first } from '@/lib/db'
import type { PitchCardData } from '@/types/domain'

export type RawPitchRow = {
  id: string;
  title: string | null;
  pitch_text: string | null;
  skills: string[] | null;
  location: string | null;
  job_type: string | null;
  availability: string | null;
  likes_count: number | null;
  user_id: string;
  user?: any; // array or object depending on relationship
  user_profile?: any; // array or object depending on relationship
};

export interface PitchWithVeteran {
  id: string;
  title: string;
  pitch_text: string;
  skills: string[];
  job_type: string;
  location: string;
  availability: string;
  experience_years: number | null;
  photo_url: string | null;
  phone: string | null;
  linkedin_url: string | null;
  resume_url: string | null;
  resume_share_enabled: boolean;
  plan_tier: string | null;
  plan_expires_at: string | null;
  is_active: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user_id: string; // Changed from veteran_id
  user: {
    name: string;
    role: string;
  };
}

export function toPitchCardData(r: RawPitchRow): PitchCardData {
  const v = Array.isArray(r.user) ? first(r.user) : r.user ?? null;
  const vp = v?.users ? (Array.isArray(v.users) ? first(v.users) : v.users) : null;

  return {
    id: v.id,
    title: v.title,
    pitch_text: v.pitch_text,
    skills: v.skills,
    job_type: v.job_type,
    location: v.location,
    availability: v.availability,
    experience_years: v.experience_years,
    photo_url: v.photo_url,
    phone: v.phone,
    linkedin_url: v.linkedin_url,
    resume_url: v.resume_url,
    resume_share_enabled: v.resume_share_enabled,
    plan_tier: v.plan_tier,
    plan_expires_at: v.plan_expires_at,
    is_active: v.is_active,
    likes_count: v.likes_count,
    created_at: v.created_at,
    updated_at: v.updated_at,
    user_id: (v?.id ?? r.user_id) as string, // Changed from veteran_id
    user: {
      name: r.user?.name || 'Unknown',
      role: r.user?.role || 'veteran'
    }
  };
}
