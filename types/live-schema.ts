// =====================================================
// LIVE DATABASE SCHEMA TYPES
// Generated from Supabase Database
// Generated at: 2025-08-19T11:10:31.117Z
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string
          role: string
          created_at: string
          updated_at: string
          location: string
          military_branch: string
          military_rank: string
          years_of_service: number
          discharge_date: string
          education_level: string
          certifications: string | null
          bio: string
          avatar_url: string | null
          is_active: boolean
          email_verified: boolean
          phone_verified: boolean
          last_login_at: string | null
          metadata: any
        }
        Insert: {
          id?: string | undefined
          email: string
          name: string
          phone: string
          role: string
          created_at?: string | undefined
          updated_at?: string | undefined
          location: string
          military_branch: string
          military_rank: string
          years_of_service: number
          discharge_date: string
          education_level: string
          certifications: string | null
          bio: string
          avatar_url: string | null
          is_active: boolean
          email_verified: boolean
          phone_verified: boolean
          last_login_at?: string | null | undefined
          metadata: any
        }
        Update: {
          id?: string | undefined
          email?: string | undefined
          name?: string | undefined
          phone?: string | undefined
          role?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
          location?: string | undefined
          military_branch?: string | undefined
          military_rank?: string | undefined
          years_of_service?: number | undefined
          discharge_date?: string | undefined
          education_level?: string | undefined
          certifications?: string | null | undefined
          bio?: string | undefined
          avatar_url?: string | null | undefined
          is_active?: boolean | undefined
          email_verified?: boolean | undefined
          phone_verified?: boolean | undefined
          last_login_at?: string | null | undefined
          metadata?: any | undefined
        }
        Relationships: []
      }
      pitches: {
        Row: {
          id: string
          user_id: string
          title: string
          pitch_text: string
          skills: any[]
          job_type: string
          location: string
          availability: string
          phone: string
          photo_url: string
          linkedin_url: string
          likes_count: number
          shares_count: number
          views_count: number
          endorsements_count: number
          is_active: boolean
          plan_tier: string | null
          plan_expires_at: string | null
          created_at: string
          updated_at: string
          experience_years: string | null
          allow_resume_requests: boolean
        }
        Insert: {
          id?: string | undefined
          user_id: string
          title: string
          pitch_text: string
          skills: any[]
          job_type: string
          location: string
          availability: string
          phone: string
          photo_url: string
          linkedin_url: string
          likes_count: number
          shares_count: number
          views_count: number
          endorsements_count: number
          is_active: boolean
          plan_tier: string | null
          plan_expires_at?: string | null | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
          experience_years: string | null
          allow_resume_requests: boolean
        }
        Update: {
          id?: string | undefined
          user_id?: string | undefined
          title?: string | undefined
          pitch_text?: string | undefined
          skills?: any[] | undefined
          job_type?: string | undefined
          location?: string | undefined
          availability?: string | undefined
          phone?: string | undefined
          photo_url?: string | undefined
          linkedin_url?: string | undefined
          likes_count?: number | undefined
          shares_count?: number | undefined
          views_count?: number | undefined
          endorsements_count?: number | undefined
          is_active?: boolean | undefined
          plan_tier?: string | null | undefined
          plan_expires_at?: string | null | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
          experience_years?: string | null | undefined
          allow_resume_requests?: boolean | undefined
        }
        Relationships: []
      }
      veterans: {
        Row: {
          user_id: string
          rank: string
          service_branch: string
          years_experience: number
          location_current: string
          locations_preferred: any[]
          created_at: string
          updated_at: string
          bio: string
          military_rank: string
          web_links: any[]
          location_current_city: string
          location_current_country: string
          locations_preferred_structured: any[]
          retirement_date: string | null
        }
        Insert: {
          user_id: string
          rank: string
          service_branch: string
          years_experience: number
          location_current: string
          locations_preferred: any[]
          created_at?: string | undefined
          updated_at?: string | undefined
          bio: string
          military_rank: string
          web_links: any[]
          location_current_city: string
          location_current_country: string
          locations_preferred_structured: any[]
          retirement_date: string | null
        }
        Update: {
          user_id?: string | undefined
          rank?: string | undefined
          service_branch?: string | undefined
          years_experience?: number | undefined
          location_current?: string | undefined
          locations_preferred?: any[] | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
          bio?: string | undefined
          military_rank?: string | undefined
          web_links?: any[] | undefined
          location_current_city?: string | undefined
          location_current_country?: string | undefined
          locations_preferred_structured?: any[] | undefined
          retirement_date?: string | null | undefined
        }
        Relationships: []
      }
      recruiters: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Update: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      supporters: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Update: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      endorsements: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Update: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      referrals: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Update: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      referral_events: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Update: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      shared_pitches: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Update: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      donations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Update: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      resume_requests: {
        Row: {
          id: string
          recruiter_id: string
          veteran_id: string
          pitch_id: string
          status: string
          job_role: string | null
          message: string | null
          created_at: string
          responded_at: string | null
        }
        Insert: {
          id?: string | undefined
          recruiter_id: string
          veteran_id: string
          pitch_id: string
          status: string
          job_role: string | null
          message: string | null
          created_at?: string | undefined
          responded_at?: string | null | undefined
        }
        Update: {
          id?: string | undefined
          recruiter_id?: string | undefined
          veteran_id?: string | undefined
          pitch_id?: string | undefined
          status?: string | undefined
          job_role?: string | null | undefined
          message?: string | null | undefined
          created_at?: string | undefined
          responded_at?: string | null | undefined
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Update: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      notification_prefs: {
        Row: {
          user_id: string
          email_enabled: boolean
          in_app_enabled: boolean
          referral_notifications: boolean
          pitch_notifications: boolean
          endorsement_notifications: boolean
          resume_request_notifications: boolean
          plan_notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          email_enabled: boolean
          in_app_enabled: boolean
          referral_notifications: boolean
          pitch_notifications: boolean
          endorsement_notifications: boolean
          resume_request_notifications: boolean
          plan_notifications: boolean
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Update: {
          user_id?: string | undefined
          email_enabled?: boolean | undefined
          in_app_enabled?: boolean | undefined
          referral_notifications?: boolean | undefined
          pitch_notifications?: boolean | undefined
          endorsement_notifications?: boolean | undefined
          resume_request_notifications?: boolean | undefined
          plan_notifications?: boolean | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Update: {
          id?: string | undefined
          created_at?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// =====================================================
// CONVENIENCE TYPE EXPORTS
// =====================================================

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

// =====================================================
// SPECIFIC TABLE TYPE EXPORTS FOR CONVENIENCE
// =====================================================

export type Users = Tables<'users'>
export type UsersInsert = TablesInsert<'users'>
export type UsersUpdate = TablesUpdate<'users'>

export type Pitches = Tables<'pitches'>
export type PitchesInsert = TablesInsert<'pitches'>
export type PitchesUpdate = TablesUpdate<'pitches'>

export type Veterans = Tables<'veterans'>
export type VeteransInsert = TablesInsert<'veterans'>
export type VeteransUpdate = TablesUpdate<'veterans'>

export type Recruiters = Tables<'recruiters'>
export type RecruitersInsert = TablesInsert<'recruiters'>
export type RecruitersUpdate = TablesUpdate<'recruiters'>

export type Supporters = Tables<'supporters'>
export type SupportersInsert = TablesInsert<'supporters'>
export type SupportersUpdate = TablesUpdate<'supporters'>

export type Endorsements = Tables<'endorsements'>
export type EndorsementsInsert = TablesInsert<'endorsements'>
export type EndorsementsUpdate = TablesUpdate<'endorsements'>

export type Referrals = Tables<'referrals'>
export type ReferralsInsert = TablesInsert<'referrals'>
export type ReferralsUpdate = TablesUpdate<'referrals'>

export type Referral_events = Tables<'referral_events'>
export type Referral_eventsInsert = TablesInsert<'referral_events'>
export type Referral_eventsUpdate = TablesUpdate<'referral_events'>

export type Shared_pitches = Tables<'shared_pitches'>
export type Shared_pitchesInsert = TablesInsert<'shared_pitches'>
export type Shared_pitchesUpdate = TablesUpdate<'shared_pitches'>

export type Donations = Tables<'donations'>
export type DonationsInsert = TablesInsert<'donations'>
export type DonationsUpdate = TablesUpdate<'donations'>

export type Resume_requests = Tables<'resume_requests'>
export type Resume_requestsInsert = TablesInsert<'resume_requests'>
export type Resume_requestsUpdate = TablesUpdate<'resume_requests'>

export type Notifications = Tables<'notifications'>
export type NotificationsInsert = TablesInsert<'notifications'>
export type NotificationsUpdate = TablesUpdate<'notifications'>

export type Notification_prefs = Tables<'notification_prefs'>
export type Notification_prefsInsert = TablesInsert<'notification_prefs'>
export type Notification_prefsUpdate = TablesUpdate<'notification_prefs'>

export type Email_logs = Tables<'email_logs'>
export type Email_logsInsert = TablesInsert<'email_logs'>
export type Email_logsUpdate = TablesUpdate<'email_logs'>

