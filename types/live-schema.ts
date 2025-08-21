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
          avatar_url: string | null
          role: 'veteran' | 'recruiter' | 'supporter' | 'admin'
          is_active: boolean
          email_verified: boolean
          phone_verified: boolean
          created_at: string
          updated_at: string
          last_login_at: string | null
          metadata: any
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'veteran' | 'recruiter' | 'supporter' | 'admin'
          is_active?: boolean
          email_verified?: boolean
          phone_verified?: boolean
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          metadata?: any
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'veteran' | 'recruiter' | 'supporter' | 'admin'
          is_active?: boolean
          email_verified?: boolean
          phone_verified?: boolean
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          metadata?: any
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
          metadata: any
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
          metadata?: any
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
          metadata?: any
        }
      }
      referrals: {
        Row: {
          id: string
          supporter_id: string
          pitch_id: string
          share_link: string
          created_at: string
        }
        Insert: {
          id?: string
          supporter_id: string
          pitch_id: string
          share_link: string
          created_at?: string
        }
        Update: {
          id?: string
          supporter_id?: string
          pitch_id?: string
          share_link?: string
          created_at?: string
        }
      }
      referral_events: {
        Row: {
          id: string
          referral_id: string
          event_type: 'LINK_OPENED' | 'PITCH_VIEWED' | 'CALL_CLICKED' | 'EMAIL_CLICKED' | 'SHARE_RESHARED' | 'SIGNUP_FROM_REFERRAL'
          platform: string | null
          user_agent: string | null
          country: string | null
          ip_hash: string | null
          occurred_at: string
        }
        Insert: {
          id?: string
          referral_id: string
          event_type: 'LINK_OPENED' | 'PITCH_VIEWED' | 'CALL_CLICKED' | 'EMAIL_CLICKED' | 'SHARE_RESHARED' | 'SIGNUP_FROM_REFERRAL'
          platform?: string | null
          user_agent?: string | null
          country?: string | null
          ip_hash?: string | null
          occurred_at?: string
        }
        Update: {
          id?: string
          referral_id?: string
          event_type?: 'LINK_OPENED' | 'PITCH_VIEWED' | 'CALL_CLICKED' | 'EMAIL_CLICKED' | 'SHARE_RESHARED' | 'SIGNUP_FROM_REFERRAL'
          platform?: string | null
          user_agent?: string | null
          country?: string | null
          ip_hash?: string | null
          occurred_at?: string
        }
      }
      endorsements: {
        Row: {
          id: string
          user_id: string
          endorser_user_id: string | null
          text: string
          rating: number | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endorser_user_id?: string | null
          text: string
          rating?: number | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endorser_user_id?: string | null
          text?: string
          rating?: number | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          donor_name: string | null
          amount: number
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          donor_name?: string | null
          amount: number
          currency?: string
          created_at?: string
        }
        Update: {
          id?: string
          donor_name?: string | null
          amount?: number
          currency?: string
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          user_id: string
          amount: number
          currency: string
          status: string
          due_date: string
          created_at: string
          paid_at: string | null
        }
        Insert: {
          id?: string
          invoice_number: string
          user_id: string
          amount: number
          currency?: string
          status?: string
          due_date: string
          created_at?: string
          paid_at?: string | null
        }
        Update: {
          id?: string
          invoice_number?: string
          user_id?: string
          amount?: number
          currency?: string
          status?: string
          due_date?: string
          created_at?: string
          paid_at?: string | null
        }
      }
      receipts: {
        Row: {
          id: string
          receipt_number: string
          user_id: string
          amount: number
          currency: string
          payment_method: string
          created_at: string
        }
        Insert: {
          id?: string
          receipt_number: string
          user_id: string
          amount: number
          currency?: string
          payment_method: string
          created_at?: string
        }
        Update: {
          id?: string
          receipt_number?: string
          user_id?: string
          amount?: number
          currency?: string
          payment_method?: string
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
