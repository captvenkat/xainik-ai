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
  veteran_id: string;
  veteran?: any; // array or object depending on relationship
  veteran_profile?: any; // array or object depending on relationship
};

export function toPitchCardData(r: RawPitchRow): PitchCardData {
  const v = Array.isArray(r.veteran) ? first(r.veteran) : r.veteran ?? null;
  const vp = v?.veterans ? (Array.isArray(v.veterans) ? first(v.veterans) : v.veterans) : null;

  return {
    id: r.id,
    title: r.title ?? '',
    pitch: r.pitch_text ?? '',
    skills: r.skills ?? [],
    city: r.location ? r.location.split(',')[0]?.trim() || null : null, // Extract city from "City, Country"
    job_type: (r.job_type ?? 'Full-Time') as PitchCardData['job_type'],
    availability: (r.availability ?? 'Immediate') as PitchCardData['availability'],
    likes: r.likes_count ?? 0,
    veteran: {
      id: (v?.id ?? r.veteran_id) as string,
      full_name: v?.name ?? null,
      rank: vp?.rank ?? null,
      service_branch: vp?.service_branch ?? null,
      years_experience: (vp?.years_experience ?? null) as number | null,
      photo_url: null, // Not available in current schema
      is_community_verified: false, // Not available in current schema
    },
  };
}
