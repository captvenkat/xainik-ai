export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

export type UserRole = 'veteran' | 'recruiter' | 'supporter' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
}

export interface Pitch {
  id: string;
  title: string;
  pitch_text: string;
  skills: string[];
  location: string;
  availability: string;
  experience_years: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  plan_tier?: string;
  likes_count: number;
  phone?: string;
  linkedin_url?: string;
  resume_url?: string;
  resume_share_enabled: boolean;
}

export interface Endorsement {
  id: string;
  veteran_id: string;
  endorser_id: string;
  text: string;
  created_at: string;
}

export interface EndorsementWithUser extends Endorsement {
  endorser: {
    name: string;
    role: string;
  };
}

export interface ReferralEvent {
  id: string;
  referral_id: string;
  event_type: string;
  platform: string;
  occurred_at: string;
}

export interface ResumeRequest {
  id: string;
  pitch_id: string;
  recruiter_id: string;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface ResumeRequestWithUsers extends ResumeRequest {
  recruiter: {
    name: string;
    email: string;
    company_name?: string;
  };
  pitch: {
    id: string;
    title: string;
    profiles: {
      full_name: string;
      phone: string;
      email: string;
    };
  };
}

export type ActivityEvent = 
  | 'pitch_created'
  | 'pitch_updated'
  | 'pitch_liked'
  | 'pitch_viewed'
  | 'resume_requested'
  | 'resume_approved'
  | 'resume_declined'
  | 'endorsement_added'
  | 'referral_created'
  | 'referral_viewed'
  | 'donation_made'
  | 'invoice_generated'
  | 'receipt_generated';
