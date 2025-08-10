import { first } from '@/lib/db'
import type { PitchCardData } from '@/types/domain'

export type RawPitchRow = {
  id: string;
  title: string | null;
  summary: string | null;
  skills: string[] | null;
  city: string | null;
  job_type: string | null;
  availability: string | null;
  likes: number | null;
  veteran_id: string;
  veteran?: any; // array or object depending on relationship
};

export function toPitchCardData(r: RawPitchRow): PitchCardData {
  const v = Array.isArray(r.veteran) ? first(r.veteran) : r.veteran ?? null;

  return {
    id: r.id,
    title: r.title ?? '',
    pitch: r.summary ?? '',
    skills: r.skills ?? [],
    city: r.city ?? null,
    job_type: (r.job_type ?? 'Full-Time') as PitchCardData['job_type'],
    availability: (r.availability ?? 'Immediate') as PitchCardData['availability'],
    likes: r.likes ?? 0,
    veteran: {
      id: (v?.id ?? r.veteran_id) as string,
      full_name: v?.full_name ?? null,
      rank: v?.rank ?? null,
      service_branch: v?.service_branch ?? null,
      years_experience: (v?.years_experience ?? null) as number | null,
      photo_url: v?.photo_url ?? null,
      is_community_verified: Boolean(v?.is_community_verified),
    },
  };
}
