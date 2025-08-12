export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
          id: string
          email: string
          name: string
          phone?: string | null
          role: 'veteran' | 'recruiter' | 'supporter' | 'admin'
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
          profile_data: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_type: 'veteran' | 'recruiter' | 'supporter' | 'admin'
          profile_data?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_type?: 'veteran' | 'recruiter' | 'supporter' | 'admin'
          profile_data?: Json
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
          job_type: 'full-time' | 'part-time' | 'freelance' | 'consulting' | 'hybrid' | 'project-based' | 'remote' | 'on-site'
          location: string
          availability: 'Immediate' | '30' | '60' | '90'
          experience_years: number | null
          photo_url: string | null
          phone: string | null
          linkedin_url: string | null
          resume_url: string | null
          resume_share_enabled: boolean
          plan_tier: 'trial_14' | 'plan_30' | 'plan_60' | 'plan_90' | null
          plan_expires_at: string | null
          is_active: boolean
          likes_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          pitch_text: string
          skills?: string[]
          job_type: 'full-time' | 'part-time' | 'freelance' | 'consulting' | 'hybrid' | 'project-based' | 'remote' | 'on-site'
          location: string
          availability: 'Immediate' | '30' | '60' | '90'
          experience_years?: number | null
          photo_url?: string | null
          phone?: string | null
          linkedin_url?: string | null
          resume_url?: string | null
          resume_share_enabled?: boolean
          plan_tier?: 'trial_14' | 'plan_30' | 'plan_60' | 'plan_90' | null
          plan_expires_at?: string | null
          is_active?: boolean
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          pitch_text?: string
          skills?: string[]
          job_type?: 'full-time' | 'part-time' | 'freelance' | 'consulting' | 'hybrid' | 'project-based' | 'remote' | 'on-site'
          location?: string
          availability?: 'Immediate' | '30' | '60' | '90'
          experience_years?: number | null
          photo_url?: string | null
          phone?: string | null
          linkedin_url?: string | null
          resume_url?: string | null
          resume_share_enabled?: boolean
          plan_tier?: 'trial_14' | 'plan_30' | 'plan_60' | 'plan_90' | null
          plan_expires_at?: string | null
          is_active?: boolean
          likes_count?: number
          created_at?: string
          updated_at?: string
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
          event_type: 'LINK_OPENED' | 'PITCH_VIEWED' | 'CALL_CLICKED' | 'EMAIL_CLICKED' | 'SHARE_RESHARED' | 'SIGNUP_FROM_REFERRAL'
          platform: 'whatsapp' | 'linkedin' | 'email' | 'copy' | 'other' | null
          user_agent: string | null
          country: string | null
          ip_hash: string | null
          feedback: string | null
          feedback_comment: string | null
          feedback_at: string | null
          debounce_key: string | null
          occurred_at: string
        }
        Insert: {
          id?: string
          referral_id: string
          event_type: 'LINK_OPENED' | 'PITCH_VIEWED' | 'CALL_CLICKED' | 'EMAIL_CLICKED' | 'SHARE_RESHARED' | 'SIGNUP_FROM_REFERRAL'
          platform?: 'whatsapp' | 'linkedin' | 'email' | 'copy' | 'other' | null
          user_agent?: string | null
          country?: string | null
          ip_hash?: string | null
          feedback?: string | null
          feedback_comment?: string | null
          feedback_at?: string | null
          debounce_key?: string | null
          occurred_at?: string
        }
        Update: {
          id?: string
          referral_id?: string
          event_type?: 'LINK_OPENED' | 'PITCH_VIEWED' | 'CALL_CLICKED' | 'EMAIL_CLICKED' | 'SHARE_RESHARED' | 'SIGNUP_FROM_REFERRAL'
          platform?: 'whatsapp' | 'linkedin' | 'email' | 'copy' | 'other' | null
          user_agent?: string | null
          country?: string | null
          ip_hash?: string | null
          feedback?: string | null
          feedback_comment?: string | null
          feedback_at?: string | null
          debounce_key?: string | null
          occurred_at?: string
        }
      }
      resume_requests: {
        Row: {
          id: string
          pitch_id: string | null
          user_id: string
          recruiter_user_id: string
          job_role: string | null
          status: 'PENDING' | 'APPROVED' | 'DECLINED'
          responded_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pitch_id?: string | null
          user_id: string
          recruiter_user_id: string
          job_role?: string | null
          status?: 'PENDING' | 'APPROVED' | 'DECLINED'
          responded_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pitch_id?: string | null
          user_id?: string
          recruiter_user_id?: string
          job_role?: string | null
          status?: 'PENDING' | 'APPROVED' | 'DECLINED'
          responded_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'referral_accepted' | 'pitch_viewed' | 'call_clicked' | 'email_clicked' | 'endorsement_added' | 'resume_requested' | 'plan_expiry'
          payload_json: Json | null
          channel: 'IN_APP' | 'EMAIL'
          status: 'PENDING' | 'SENT' | 'FAILED'
          created_at: string
          sent_at: string | null
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'referral_accepted' | 'pitch_viewed' | 'call_clicked' | 'email_clicked' | 'endorsement_added' | 'resume_requested' | 'plan_expiry'
          payload_json?: Json | null
          channel?: 'IN_APP' | 'EMAIL'
          status?: 'PENDING' | 'SENT' | 'FAILED'
          created_at?: string
          sent_at?: string | null
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'referral_accepted' | 'pitch_viewed' | 'call_clicked' | 'email_clicked' | 'endorsement_added' | 'resume_requested' | 'plan_expiry'
          payload_json?: Json | null
          channel?: 'IN_APP' | 'EMAIL'
          status?: 'PENDING' | 'SENT' | 'FAILED'
          created_at?: string
          sent_at?: string | null
          read_at?: string | null
        }
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
          email_enabled?: boolean
          in_app_enabled?: boolean
          referral_notifications?: boolean
          pitch_notifications?: boolean
          endorsement_notifications?: boolean
          resume_request_notifications?: boolean
          plan_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          email_enabled?: boolean
          in_app_enabled?: boolean
          referral_notifications?: boolean
          pitch_notifications?: boolean
          endorsement_notifications?: boolean
          resume_request_notifications?: boolean
          plan_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      shared_pitches: {
        Row: {
          user_id: string
          pitch_id: string
          share_link: string
          click_count: number
          created_at: string
        }
        Insert: {
          user_id: string
          pitch_id: string
          share_link: string
          click_count?: number
          created_at?: string
        }
        Update: {
          user_id?: string
          pitch_id?: string
          share_link?: string
          click_count?: number
          created_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          user_id: string | null
          amount_cents: number
          currency: 'INR' | 'USD' | 'EUR'
          is_anonymous: boolean
          donor_name: string | null
          donor_email: string | null
          donor_phone: string | null
          message: string | null
          razorpay_payment_id: string | null
          receipt_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          amount_cents: number
          currency?: 'INR' | 'USD' | 'EUR'
          is_anonymous?: boolean
          donor_name?: string | null
          donor_email?: string | null
          donor_phone?: string | null
          message?: string | null
          razorpay_payment_id?: string | null
          receipt_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          amount_cents?: number
          currency?: 'INR' | 'USD' | 'EUR'
          is_anonymous?: boolean
          donor_name?: string | null
          donor_email?: string | null
          donor_phone?: string | null
          message?: string | null
          razorpay_payment_id?: string | null
          receipt_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      service_plans: {
        Row: {
          id: string
          name: string
          description: string
          price_cents: number
          currency: string
          duration_days: number
          features: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price_cents: number
          currency: string
          duration_days: number
          features?: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price_cents?: number
          currency?: string
          duration_days?: number
          features?: Json
          is_active?: boolean
          created_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: 'active' | 'expired' | 'cancelled' | 'suspended'
          start_date: string
          end_date: string
          auto_renew: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: 'active' | 'expired' | 'cancelled' | 'suspended'
          start_date: string
          end_date: string
          auto_renew?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: 'active' | 'expired' | 'cancelled' | 'suspended'
          start_date?: string
          end_date?: string
          auto_renew?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          user_id: string
          subscription_id: string | null
          plan_id: string | null
          amount_cents: number
          currency: string
          tax_amount_cents: number
          total_amount_cents: number
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          due_date: string | null
          paid_at: string | null
          payment_method: string | null
          razorpay_payment_id: string | null
          notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          user_id: string
          subscription_id?: string | null
          plan_id?: string | null
          amount_cents: number
          currency?: string
          tax_amount_cents?: number
          total_amount_cents: number
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          due_date?: string | null
          paid_at?: string | null
          payment_method?: string | null
          razorpay_payment_id?: string | null
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          user_id?: string
          subscription_id?: string | null
          plan_id?: string | null
          amount_cents?: number
          currency?: string
          tax_amount_cents?: number
          total_amount_cents?: number
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          due_date?: string | null
          paid_at?: string | null
          payment_method?: string | null
          razorpay_payment_id?: string | null
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      receipts: {
        Row: {
          id: string
          receipt_number: string
          invoice_id: string | null
          user_id: string
          amount_cents: number
          currency: string
          payment_method: string | null
          razorpay_payment_id: string | null
          transaction_id: string | null
          payment_date: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          receipt_number: string
          invoice_id?: string | null
          user_id: string
          amount_cents: number
          currency?: string
          payment_method?: string | null
          razorpay_payment_id?: string | null
          transaction_id?: string | null
          payment_date?: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          receipt_number?: string
          invoice_id?: string | null
          user_id?: string
          amount_cents?: number
          currency?: string
          payment_method?: string | null
          razorpay_payment_id?: string | null
          transaction_id?: string | null
          payment_date?: string
          metadata?: Json
          created_at?: string
        }
      }
      payment_events: {
        Row: {
          id: string
          event_id: string
          payment_id: string | null
          invoice_id: string | null
          event_type: string
          amount_cents: number | null
          currency: string | null
          status: string | null
          payment_method: string | null
          metadata: Json
          processed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          payment_id?: string | null
          invoice_id?: string | null
          event_type: string
          amount_cents?: number | null
          currency?: string | null
          status?: string | null
          payment_method?: string | null
          metadata?: Json
          processed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          payment_id?: string | null
          invoice_id?: string | null
          event_type?: string
          amount_cents?: number | null
          currency?: string | null
          status?: string | null
          payment_method?: string | null
          metadata?: Json
          processed_at?: string
          created_at?: string
        }
      }
      recruiter_notes: {
        Row: {
          id: string
          user_id: string
          pitch_id: string
          note_text: string
          is_private: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pitch_id: string
          note_text: string
          is_private?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pitch_id?: string
          note_text?: string
          is_private?: boolean
          created_at?: string
        }
      }
      recruiter_saved_filters: {
        Row: {
          id: string
          user_id: string
          name: string
          filter_criteria: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          filter_criteria: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          filter_criteria?: Json
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
