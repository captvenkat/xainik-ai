export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          role: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          profile_type: string
          profile_data: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_type: string
          profile_data?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_type?: string
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
          job_type: string
          location: string
          availability: string
          experience_years: number | null
          photo_url: string | null
          phone: string | null
          linkedin_url: string | null
          resume_url: string | null
          resume_share_enabled: boolean
          plan_tier: string | null
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
          job_type: string
          location: string
          availability: string
          experience_years?: number | null
          photo_url?: string | null
          phone?: string | null
          linkedin_url?: string | null
          resume_url?: string | null
          resume_share_enabled?: boolean
          plan_tier?: string | null
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
          job_type?: string
          location?: string
          availability?: string
          experience_years?: number | null
          photo_url?: string | null
          phone?: string | null
          linkedin_url?: string | null
          resume_url?: string | null
          resume_share_enabled?: boolean
          plan_tier?: string | null
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
          event_type: string
          platform: string | null
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
          event_type: string
          platform?: string | null
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
          event_type?: string
          platform?: string | null
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
          status: string
          responded_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pitch_id?: string | null
          user_id: string
          recruiter_user_id: string
          job_role?: string | null
          status?: string
          responded_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pitch_id?: string | null
          user_id?: string
          recruiter_user_id?: string
          job_role?: string | null
          status?: string
          responded_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          payload_json: Json | null
          channel: string
          status: string
          created_at: string
          sent_at: string | null
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          payload_json?: Json | null
          channel?: string
          status?: string
          created_at?: string
          sent_at?: string | null
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          payload_json?: Json | null
          channel?: string
          status?: string
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
          user_id: string | null
          pitch_id: string | null
          share_link: string
          click_count: number
          created_at: string
        }
        Insert: {
          user_id?: string | null
          pitch_id?: string | null
          share_link: string
          click_count?: number
          created_at?: string
        }
        Update: {
          user_id?: string | null
          pitch_id?: string | null
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
      recruiter_notes: {
        Row: {
          id: string
          user_id: string
          pitch_id: string
          note_text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pitch_id: string
          note_text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pitch_id?: string
          note_text?: string
          created_at?: string
          updated_at?: string
        }
      }
      recruiter_saved_filters: {
        Row: {
          id: string
          user_id: string
          name: string
          filters: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          filters: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          filters?: Json
          created_at?: string
        }
      }
      payment_events_archive: {
        Row: {
          id: string
          user_id: string | null
          event_id: string
          payment_id: string | null
          order_id: string | null
          event_type: string
          event_data: Json
          created_at: string
          archived_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_id: string
          payment_id?: string | null
          order_id?: string | null
          event_type: string
          event_data: Json
          created_at: string
          archived_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_id?: string
          payment_id?: string | null
          order_id?: string | null
          event_type?: string
          event_data?: Json
          created_at?: string
          archived_at?: string
        }
      }
      user_activity_log: {
        Row: {
          id: string
          user_id: string | null
          activity_type: string
          activity_data: Json
          ip_address: unknown | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          activity_type: string
          activity_data?: Json
          ip_address?: unknown | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          activity_type?: string
          activity_data?: Json
          ip_address?: unknown | null
          user_agent?: string | null
          created_at?: string
        }
      }
      user_permissions: {
        Row: {
          id: string
          user_id: string
          permission_type: string
          permission_data: Json
          granted_at: string
          granted_by: string | null
          expires_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          permission_type: string
          permission_data?: Json
          granted_at?: string
          granted_by?: string | null
          expires_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          permission_type?: string
          permission_data?: Json
          granted_at?: string
          granted_by?: string | null
          expires_at?: string | null
          is_active?: boolean
        }
      }
    }
    Views: {
      donations_aggregates: {
        Row: {
          total_cents: number | null
          today_cents: number | null
          last_cents: number | null
          max_cents: number | null
        }
        Insert: {
          total_cents?: number | null
          today_cents?: number | null
          last_cents?: number | null
          max_cents?: number | null
        }
        Update: {
          total_cents?: number | null
          today_cents?: number | null
          last_cents?: number | null
          max_cents?: number | null
        }
      }
      activity_recent: {
        Row: {
          event_type: string | null
          occurred_at: string | null
          event_title: string | null
          user_name: string | null
          user_role: string | null
        }
        Insert: {
          event_type?: string | null
          occurred_at?: string | null
          event_title?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Update: {
          event_type?: string | null
          occurred_at?: string | null
          event_title?: string | null
          user_name?: string | null
          user_role?: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type DB = Database;
