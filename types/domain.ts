// =====================================================
// PROFESSIONAL DOMAIN TYPES
// Xainik Platform - Professional Rewrite
// =====================================================

import { Database } from './live-schema';

// Extract table types from Supabase schema
export type Tables = Database['public']['Tables'];
export type Views = Database['public']['Views'];

// =====================================================
// CORE ENTITY TYPES
// =====================================================

export type User = Tables['users']['Row'];
export type UserInsert = Tables['users']['Insert'];
export type UserUpdate = Tables['users']['Update'];

// Note: user_profiles table doesn't exist, using users table instead
export type UserProfile = Tables['users']['Row'];
export type UserProfileInsert = Tables['users']['Insert'];
export type UserProfileUpdate = Tables['users']['Update'];

export type Pitch = Tables['pitches']['Row'];
export type PitchInsert = Tables['pitches']['Insert'];
export type PitchUpdate = Tables['pitches']['Update'];

export type Endorsement = Tables['endorsements']['Row'];
export type EndorsementInsert = Tables['endorsements']['Insert'];
export type EndorsementUpdate = Tables['endorsements']['Update'];

export type Referral = Tables['referrals']['Row'];
export type ReferralInsert = Tables['referrals']['Insert'];
export type ReferralUpdate = Tables['referrals']['Update'];

// Note: resume_requests table doesn't exist
// export type ResumeRequest = Tables['resume_requests']['Row'];
// export type ResumeRequestInsert = Tables['resume_requests']['Insert'];
// export type ResumeRequestUpdate = Tables['resume_requests']['Update'];

// =====================================================
// BILLING SYSTEM TYPES
// =====================================================

// Note: service_plans table doesn't exist
// export type ServicePlan = Tables['service_plans']['Row'];
// export type ServicePlanInsert = Tables['service_plans']['Insert'];
// export type ServicePlanUpdate = Tables['service_plans']['Update'];

// Note: user_subscriptions table doesn't exist
// export type UserSubscription = Tables['user_subscriptions']['Row'];
// export type UserSubscriptionInsert = Tables['user_subscriptions']['Insert'];
// export type UserSubscriptionUpdate = Tables['user_subscriptions']['Update'];

export type Invoice = Tables['invoices']['Row'];
export type InvoiceInsert = Tables['invoices']['Insert'];
export type InvoiceUpdate = Tables['invoices']['Update'];

export type Receipt = Tables['receipts']['Row'];
export type ReceiptInsert = Tables['receipts']['Insert'];
export type ReceiptUpdate = Tables['receipts']['Update'];

// Note: payment_events table doesn't exist
// export type PaymentEvent = Tables['payment_events']['Row'];
// export type PaymentEventInsert = Tables['payment_events']['Insert'];
// export type PaymentEventUpdate = Tables['payment_events']['Update'];

export type Donation = Tables['donations']['Row'];
export type DonationInsert = Tables['donations']['Insert'];
export type DonationUpdate = Tables['donations']['Update'];

// =====================================================
// NOTIFICATION SYSTEM TYPES
// =====================================================

// =====================================================
// RECRUITER FEATURE TYPES
// =====================================================

// Note: recruiter_notes table doesn't exist
// export type RecruiterNote = Tables['recruiter_notes']['Row'];
// export type RecruiterNoteInsert = Tables['recruiter_notes']['Insert'];
// export type RecruiterNoteUpdate = Tables['recruiter_notes']['Update'];

// =====================================================
// ACTIVITY LOGGING TYPES
// =====================================================

// Note: user_activity_log table doesn't exist
// export type UserActivityLog = Tables['user_activity_log']['Row'];
// export type UserActivityLogInsert = Tables['user_activity_log']['Insert'];
// export type UserActivityLogUpdate = Tables['user_activity_log']['Update'];

// =====================================================
// SYSTEM TYPES
// =====================================================

// Note: migration_audit and user_permissions tables don't exist
// export type MigrationAudit = Tables['migration_audit']['Row'];
// export type UserPermission = Tables['user_permissions']['Row'];

// =====================================================
// ENUM TYPES
// =====================================================

export type UserRole = 'veteran' | 'recruiter' | 'supporter' | 'admin';
export type PitchStatus = 'active' | 'inactive' | 'draft';
export type ResumeRequestStatus = 'pending' | 'approved' | 'declined' | 'expired';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'suspended';
export type NotificationStatus = 'unread' | 'read' | 'archived';
export type NotificationChannel = 'email' | 'in_app' | 'both';


// =====================================================
// MISSING TABLE TYPES (Added by sync fix)
// =====================================================

export type Veteran = Tables['veterans']['Row'];
export type VeteranInsert = Tables['veterans']['Insert'];
export type VeteranUpdate = Tables['veterans']['Update'];

export type Recruiter = Tables['recruiters']['Row'];
export type RecruiterInsert = Tables['recruiters']['Insert'];
export type RecruiterUpdate = Tables['recruiters']['Update'];

export type Supporter = Tables['supporters']['Row'];
export type SupporterInsert = Tables['supporters']['Insert'];
export type SupporterUpdate = Tables['supporters']['Update'];

export type Like = Tables['likes']['Row'];
export type LikeInsert = Tables['likes']['Insert'];
export type LikeUpdate = Tables['likes']['Update'];

export type Share = Tables['shares']['Row'];
export type ShareInsert = Tables['shares']['Insert'];
export type ShareUpdate = Tables['shares']['Update'];

export type CommunitySuggestion = Tables['community_suggestions']['Row'];
export type CommunitySuggestionInsert = Tables['community_suggestions']['Insert'];
export type CommunitySuggestionUpdate = Tables['community_suggestions']['Update'];

export type MissionInvitationSummary = Tables['mission_invitation_summary']['Row'];
export type MissionInvitationSummaryInsert = Tables['mission_invitation_summary']['Insert'];
export type MissionInvitationSummaryUpdate = Tables['mission_invitation_summary']['Update'];

// =====================================================
// UPDATED COMPOSITE TYPES
// =====================================================

export interface VeteranWithProfile extends User {
  veteran: Veteran;
}

export interface RecruiterWithProfile extends User {
  recruiter: Recruiter;
}

export interface SupporterWithProfile extends User {
  supporter: Supporter;
}

export interface PitchWithLikes extends Pitch {
  likes: Like[];
  shares: Share[];
}

export interface PitchWithCommunity extends Pitch {
  community_suggestions: CommunitySuggestion[];
}

// =====================================================
// COMPOSITE TYPES
// =====================================================

export interface UserWithProfile extends User {
  profiles: UserProfile[];
}

export interface PitchWithUser extends Pitch {
  user: User;
  endorsements: Endorsement[];
  referrals: Referral[];
}

export interface PitchWithDetails extends PitchWithUser {
  endorsements_count: number;
  views_count: number;
  likes_count: number;
}

export interface PitchCardData {
  id: string;
  title: string;
  pitch_text: string;
  skills: string[];
  location: string | null;
  job_type: string | null;
  availability: string | null;
  photo_url: string | null;
  experience_years: number | null;
  linkedin_url: string | null;
  resume_url: string | null;
  phone: string | null;
  likes_count: number;
  views_count: number;
  created_at: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  endorsements_count: number;
  supporters_count: number;
  is_subscription_active: boolean;
}

export interface FullPitchData extends PitchCardData {
  phone: string | null;
  resume_share_enabled: boolean;
  plan_tier: string | null;
  plan_expires_at: string | null;
  updated_at: string;
  endorsements: EndorsementWithUser[];
  metadata: any;
}

export interface EndorsementWithUser extends Endorsement {
  endorser: User;
}

// Note: ResumeRequest type is commented out
// export interface ResumeRequestWithDetails extends ResumeRequest {
//   user: User;
//   recruiter: User;
//   pitch?: Pitch;
// }

export interface InvoiceWithDetails extends Invoice {
  user: User;
  // plan?: ServicePlan; // ServicePlan type is commented out
  // subscription?: UserSubscription; // UserSubscription type is commented out
}

export interface ReceiptWithDetails extends Receipt {
  user: User;
  invoice?: Invoice;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =====================================================
// FILTER AND QUERY TYPES
// =====================================================

export interface PitchFilters {
  skills?: string[];
  location?: string;
  job_type?: string;
  experience_years?: number;
  availability?: string;
  plan_tier?: string;
  is_active?: boolean;
}

export interface UserFilters {
  role?: UserRole;
  is_active?: boolean;
  email_verified?: boolean;
  created_after?: Date;
  created_before?: Date;
}

export interface BillingFilters {
  status?: InvoiceStatus;
  user_id?: string;
  plan_id?: string;
  amount_min?: number;
  amount_max?: number;
  created_after?: Date;
  created_before?: Date;
}

// =====================================================
// FORM TYPES
// =====================================================

export interface PitchFormData {
  title: string;
  pitch_text: string;
  skills: string[];
  job_type: string;
  location: string;
  experience_years: number;
  availability: string;
  linkedin_url?: string;
  phone?: string;
  photo_url?: string;
  resume_url?: string;
  resume_share_enabled: boolean;
}

export interface UserProfileFormData {
  name: string;
  phone?: string;
  avatar_url?: string;
  profile_data: Record<string, any>;
}

export interface DonationFormData {
  amount_cents: number;
  currency: string;
  is_anonymous: boolean;
  donor_name?: string;
  donor_email?: string;
  donor_phone?: string;
  message?: string;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// =====================================================
// CONSTANTS
// =====================================================

export const USER_ROLES: Record<UserRole, string> = {
  veteran: 'Veteran',
  recruiter: 'Recruiter',
  supporter: 'Supporter',
  admin: 'Administrator'
};

export const PITCH_STATUSES: Record<PitchStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  draft: 'Draft'
};

export const RESUME_REQUEST_STATUSES: Record<ResumeRequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  declined: 'Declined',
  expired: 'Expired'
};

export const INVOICE_STATUSES: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled'
};

export const NOTIFICATION_STATUSES: Record<NotificationStatus, string> = {
  unread: 'Unread',
  read: 'Read',
  archived: 'Archived'
};

export const NOTIFICATION_CHANNELS: Record<NotificationChannel, string> = {
  email: 'Email',
  in_app: 'In-App',
  both: 'Both'
};
