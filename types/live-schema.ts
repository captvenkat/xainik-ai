// =====================================================
// LIVE DATABASE SCHEMA TYPES
// Generated from actual database schema
// =====================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          role: 'veteran' | 'recruiter' | 'supporter' | 'admin'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          role?: 'veteran' | 'recruiter' | 'supporter' | 'admin'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          role?: 'veteran' | 'recruiter' | 'supporter' | 'admin'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          profile_type: 'veteran' | 'recruiter' | 'supporter' | 'admin'
          profile_data: any
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_type: 'veteran' | 'recruiter' | 'supporter' | 'admin'
          profile_data?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_type?: 'veteran' | 'recruiter' | 'supporter' | 'admin'
          profile_data?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pitches: {
        Row: {
          id: string
          user_id: string
          title: string
          pitch_text: string
          skills: string[]
          job_type: string
          location: string
          experience_years: number | null
          availability: string
          linkedin_url: string | null
          phone: string | null
          photo_url: string | null
          resume_url: string | null
          resume_share_enabled: boolean
          plan_tier: string
          plan_expires_at: string | null
          is_active: boolean
          likes_count: number
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          pitch_text: string
          skills?: string[]
          job_type: string
          location: string
          experience_years?: number | null
          availability: string
          linkedin_url?: string | null
          phone?: string | null
          photo_url?: string | null
          resume_url?: string | null
          resume_share_enabled?: boolean
          plan_tier?: string
          plan_expires_at?: string | null
          is_active?: boolean
          likes_count?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          pitch_text?: string
          skills?: string[]
          job_type?: string
          location?: string
          experience_years?: number | null
          availability?: string
          linkedin_url?: string | null
          phone?: string | null
          photo_url?: string | null
          resume_url?: string | null
          resume_share_enabled?: boolean
          plan_tier?: string
          plan_expires_at?: string | null
          is_active?: boolean
          likes_count?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          pitch_id: string
          user_id: string
          share_link: string
          created_at: string
        }
        Insert: {
          id?: string
          pitch_id: string
          user_id: string
          share_link: string
          created_at?: string
        }
        Update: {
          id?: string
          pitch_id?: string
          user_id?: string
          share_link?: string
          created_at?: string
        }
      }
      referral_events: {
        Row: {
          id: string
          referral_id: string
          event_type: string
          platform: string
          occurred_at: string
        }
        Insert: {
          id?: string
          referral_id: string
          event_type: string
          platform: string
          occurred_at?: string
        }
        Update: {
          id?: string
          referral_id?: string
          event_type?: string
          platform?: string
          occurred_at?: string
        }
      }
      endorsements: {
        Row: {
          id: string
          user_id: string
          endorser_user_id: string | null
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endorser_user_id?: string | null
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endorser_user_id?: string | null
          text?: string
          created_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          user_id: string | null
          amount_cents: number
          currency: string
          is_anonymous: boolean
          razorpay_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          amount_cents: number
          currency?: string
          is_anonymous?: boolean
          razorpay_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          amount_cents?: number
          currency?: string
          is_anonymous?: boolean
          razorpay_payment_id?: string | null
          created_at?: string
        }
      }
      receipts: {
        Row: {
          id: string
          receipt_number: string
          donation_date: string
          donor_name: string
          amount: number
          currency: string
          payment_id: string | null
          is_anonymous: boolean
          created_at: string
        }
        Insert: {
          id?: string
          receipt_number: string
          donation_date: string
          donor_name: string
          amount: number
          currency?: string
          payment_id?: string | null
          is_anonymous?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          receipt_number?: string
          donation_date?: string
          donor_name?: string
          amount?: number
          currency?: string
          payment_id?: string | null
          is_anonymous?: boolean
          created_at?: string
        }
      }
      resume_requests: {
        Row: {
          id: string
          recruiter_user_id: string
          user_id: string
          pitch_id: string | null
          job_role: string | null
          status: 'PENDING' | 'APPROVED' | 'DECLINED'
          created_at: string
          responded_at: string | null
        }
        Insert: {
          id?: string
          recruiter_user_id: string
          user_id: string
          pitch_id?: string | null
          job_role?: string | null
          status?: 'PENDING' | 'APPROVED' | 'DECLINED'
          created_at?: string
          responded_at?: string | null
        }
        Update: {
          id?: string
          recruiter_user_id?: string
          user_id?: string
          pitch_id?: string | null
          job_role?: string | null
          status?: 'PENDING' | 'APPROVED' | 'DECLINED'
          created_at?: string
          responded_at?: string | null
        }
      }
      activity_log: {
        Row: {
          id: string
          event: string
          meta: any
          created_at: string
        }
        Insert: {
          id?: string
          event: string
          meta?: any
          created_at?: string
        }
        Update: {
          id?: string
          event?: string
          meta?: any
          created_at?: string
        }
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
  }
}
