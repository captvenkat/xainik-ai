/**
 * Domain types for UI components aligned with database schema
 */

export interface PitchCardData {
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
  id: string;
  user_id: string; // Changed from veteran_id
  endorser_user_id: string | null; // Changed from endorser_id
  text: string;
  created_at: string;
  endorser?: {
    name: string;
    role: string;
  };
}

export interface ResumeRequest {
  id: string;
  pitch_id: string | null;
  user_id: string; // Changed from veteran_id
  recruiter_user_id: string; // Changed from recruiter_id
  job_role: string | null;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  responded_at: string | null;
  created_at: string;
  pitch?: {
    title: string;
    user: {
      name: string;
      role: string;
    };
  };
  recruiter?: {
    name: string;
    role: string;
  };
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
  id: string;
  email: string;
  name: string; // Changed from full_name
  phone: string | null;
  role: 'veteran' | 'recruiter' | 'supporter' | 'admin';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    profile_type: string;
    profile_data: Record<string, any>;
  };
}
