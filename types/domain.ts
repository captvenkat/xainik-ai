/**
 * Domain types for UI components aligned with database schema
 */

export type PitchCardData = {
  id: string;
  title: string;
  pitch: string; // 300-char summary
  skills: string[]; // 0..3
  city: string | null;
  job_type: 'Full-Time' | 'Part-Time' | 'Freelance' | 'Consulting' | 'Hybrid' | 'Project-Based' | 'Remote' | 'On-Site';
  availability: 'Immediate' | '30 Days' | '60 Days' | '90 Days' | 'Negotiable';
  likes: number;
  veteran: {
    id: string; // user/veteran id
    full_name: string | null;
    rank: string | null;
    service_branch: string | null;
    years_experience: number | null;
    photo_url: string | null;
    is_community_verified: boolean;
  };
};

export interface PitchDetailData extends PitchCardData {
  created_at: string
  updated_at: string
  plan_tier?: string | null
  linkedin_url?: string | null
  resume_url?: string | null
  resume_share_enabled: boolean
  phone?: string | null
  endorsement_count?: number | null
}

export interface EndorsementItem {
  id: string
  veteran_id: string
  endorser_id: string
  text: string
  created_at: string
  endorser?: {
    name: string
    role: string
  } | null
}

export interface ResumeRequestItem {
  id: string
  pitch_id: string
  recruiter_id: string
  status: 'pending' | 'approved' | 'declined'
  created_at: string
  updated_at: string
  recruiter?: {
    name: string
    email: string
    company_name?: string | null
  } | null
  pitch?: {
    id: string
    title: string
    profiles?: {
      full_name: string
      phone: string | null
      email: string
    } | null
  } | null
}

export interface ReferralEventItem {
  id: string
  referral_id: string
  event_type: string
  platform: string
  occurred_at: string
  feedback?: string | null
  feedback_comment?: string | null
  feedback_at?: string | null
  debounce_key?: string | null
}

export interface DonationKPI {
  total_amount: number
  total_count: number
  anonymous_count: number
  recent_donations: Array<{
    id: string
    amount: number
    donor_name: string | null
    anonymous: boolean
    created_at: string
  }>
}

export interface InvoiceDoc {
  id: string
  number: string
  user_id: string
  payment_event_id: string
  amount_paise: number
  plan_name: string
  plan_days: number
  buyer_name: string
  buyer_email: string
  buyer_phone?: string | null
  storage_key: string
  created_at: string
}

export interface ReceiptDoc {
  id: string
  number: string
  payment_event_id: string
  user_id?: string | null
  amount_paise: number
  donor_name: string
  donor_email: string
  donor_phone?: string | null
  anonymous: boolean
  storage_key: string
  created_at: string
}

export interface ActivityItem {
  id: string
  user_id?: string | null
  event_type: string
  event_data: Record<string, unknown>
  created_at: string
  display_text?: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'veteran' | 'recruiter' | 'supporter' | 'admin'
  avatar_url?: string | null
  phone?: string | null
  created_at: string
  updated_at: string
}
