// =====================================================
// LIVE SCHEMA TYPES - COMPREHENSIVE DEFINITION
// Generated based on actual production database structure
// =====================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: string | null
          created_at: string | null
          updated_at: string | null
          avatar_url: string | null
          bio: string | null
          phone: string | null
          location: string | null
          linkedin_url: string | null
          github_url: string | null
          website_url: string | null
          twitter_url: string | null
          certifications: string | null
          education_level: string | null
          military_rank: string | null
          service_branch: string | null
          discharge_date: string | null
          years_of_service: number | null
          email_verified: boolean | null
          phone_verified: boolean | null
          is_active: boolean | null
          last_login_at: string | null
          metadata: any | null
          onboarding_completed: boolean | null
          preferences: any | null
          military_branch: string | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          location?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          website_url?: string | null
          twitter_url?: string | null
          certifications?: string | null
          education_level?: string | null
          military_rank?: string | null
          service_branch?: string | null
          discharge_date?: string | null
          years_of_service?: number | null
          email_verified?: boolean | null
          phone_verified?: boolean | null
          is_active?: boolean | null
          last_login_at?: string | null
          metadata?: any | null
          onboarding_completed?: boolean | null
          preferences?: any | null
          military_branch?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          location?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          website_url?: string | null
          twitter_url?: string | null
          certifications?: string | null
          education_level?: string | null
          military_rank?: string | null
          service_branch?: string | null
          discharge_date?: string | null
          years_of_service?: number | null
          email_verified?: boolean | null
          phone_verified?: boolean | null
          is_active?: boolean | null
          last_login_at?: string | null
          metadata?: any | null
          onboarding_completed?: boolean | null
          preferences?: any | null
          military_branch?: string | null
        }
      }
      pitches: {
        Row: {
          id: string
          user_id: string
          title: string
          pitch_text: string | null
          skills: string[] | null
          location: string | null
          job_type: string | null
          availability: string | null
          photo_url: string | null
          experience_years: number | null
          linkedin_url: string | null
          resume_url: string | null
          resume_share_enabled: boolean | null
          plan_tier: string | null
          plan_expires_at: string | null
          likes_count: number | null
          views_count: number | null
          created_at: string | null
          updated_at: string | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          pitch_text?: string | null
          skills?: string[] | null
          location?: string | null
          job_type?: string | null
          availability?: string | null
          photo_url?: string | null
          experience_years?: number | null
          linkedin_url?: string | null
          resume_url?: string | null
          resume_share_enabled?: boolean | null
          plan_tier?: string | null
          plan_expires_at?: string | null
          likes_count?: number | null
          views_count?: number | null
          created_at?: string | null
          updated_at?: string | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          pitch_text?: string | null
          skills?: string[] | null
          location?: string | null
          job_type?: string | null
          availability?: string | null
          photo_url?: string | null
          experience_years?: number | null
          linkedin_url?: string | null
          resume_url?: string | null
          resume_share_enabled?: boolean | null
          plan_tier?: string | null
          plan_expires_at?: string | null
          likes_count?: number | null
          views_count?: number | null
          created_at?: string | null
          updated_at?: string | null
          is_active?: boolean | null
        }
      }
      endorsements: {
        Row: {
          id: string
          pitch_id: string
          endorser_user_id: string
          message: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          pitch_id: string
          endorser_user_id: string
          message?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          pitch_id?: string
          endorser_user_id?: string
          message?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_user_id: string
          referred_user_id: string | null
          pitch_id: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          referrer_user_id: string
          referred_user_id?: string | null
          pitch_id?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          referrer_user_id?: string
          referred_user_id?: string | null
          pitch_id?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      resume_requests: {
        Row: {
          id: string
          pitch_id: string
          recruiter_user_id: string
          user_id: string
          message: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          pitch_id: string
          recruiter_user_id: string
          user_id: string
          message?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          pitch_id?: string
          recruiter_user_id?: string
          user_id?: string
          message?: string | null
          status?: string | null
          created_at?: string | null
        }
      }
      donations: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string | null
          status: string | null
          payment_method: string | null
          razorpay_payment_id: string | null
          razorpay_order_id: string | null
          is_anonymous: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency?: string | null
          status?: string | null
          payment_method?: string | null
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          is_anonymous?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string | null
          status?: string | null
          payment_method?: string | null
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          is_anonymous?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string | null
          status: string | null
          invoice_number: string | null
          razorpay_payment_id: string | null
          razorpay_order_id: string | null
          buyer_name: string | null
          buyer_email: string | null
          buyer_phone: string | null
          plan_tier: string | null
          plan_meta: any | null
          storage_key: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency?: string | null
          status?: string | null
          invoice_number?: string | null
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          buyer_name?: string | null
          buyer_email?: string | null
          buyer_phone?: string | null
          plan_tier?: string | null
          plan_meta?: any | null
          storage_key?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string | null
          status?: string | null
          invoice_number?: string | null
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          buyer_name?: string | null
          buyer_email?: string | null
          buyer_phone?: string | null
          plan_tier?: string | null
          plan_meta?: any | null
          storage_key?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      receipts: {
        Row: {
          id: string
          user_id: string
          invoice_id: string | null
          amount: number
          currency: string | null
          receipt_number: string | null
          razorpay_payment_id: string | null
          razorpay_order_id: string | null
          donor_name: string | null
          donor_email: string | null
          donor_phone: string | null
          is_anonymous: boolean | null
          storage_key: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          invoice_id?: string | null
          amount: number
          currency?: string | null
          receipt_number?: string | null
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          donor_name?: string | null
          donor_email?: string | null
          donor_phone?: string | null
          is_anonymous?: boolean | null
          storage_key?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          invoice_id?: string | null
          amount?: number
          currency?: string | null
          receipt_number?: string | null
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          donor_name?: string | null
          donor_email?: string | null
          donor_phone?: string | null
          is_anonymous?: boolean | null
          storage_key?: string | null
          created_at?: string | null
        }
      }
      community_suggestions: {
        Row: {
          id: string
          title: string
          description: string | null
          suggestion_type: string | null
          user_id: string
          status: string | null
          priority: string | null
          votes: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          suggestion_type?: string | null
          user_id: string
          status?: string | null
          priority?: string | null
          votes?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          suggestion_type?: string | null
          user_id?: string
          status?: string | null
          priority?: string | null
          votes?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      community_suggestion_votes: {
        Row: {
          id: string
          suggestion_id: string
          user_id: string
          vote_type: string
          created_at: string | null
        }
        Insert: {
          id?: string
          suggestion_id: string
          user_id: string
          vote_type: string
          created_at?: string | null
        }
        Update: {
          id?: string
          suggestion_id?: string
          user_id?: string
          vote_type?: string
          created_at?: string | null
        }
      }
      pitch_connections: {
        Row: {
          id: string
          supporter_id: string
          pitch_id: string
          connection_source: string | null
          source_url: string | null
          user_agent: string | null
          ip_hash: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          supporter_id: string
          pitch_id: string
          connection_source?: string | null
          source_url?: string | null
          user_agent?: string | null
          ip_hash?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          supporter_id?: string
          pitch_id?: string
          connection_source?: string | null
          source_url?: string | null
          user_agent?: string | null
          ip_hash?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      payment_events: {
        Row: {
          id: string
          event_id: string
          payment_id: string
          order_id: string
          amount: number
          currency: string
          status: string
          event_type: string
          notes: any | null
          processed_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          event_id: string
          payment_id: string
          order_id: string
          amount: number
          currency?: string
          status: string
          event_type: string
          notes?: any | null
          processed_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          payment_id?: string
          order_id?: string
          amount?: number
          currency?: string
          status?: string
          event_type?: string
          notes?: any | null
          processed_at?: string | null
          created_at?: string | null
        }
      }
      email_logs: {
        Row: {
          id: string
          document_type: string
          document_id: string
          recipient_email: string
          message_id: string | null
          sent_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          document_type: string
          document_id: string
          recipient_email: string
          message_id?: string | null
          sent_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          document_type?: string
          document_id?: string
          recipient_email?: string
          message_id?: string | null
          sent_at?: string | null
          created_at?: string | null
        }
      }
    }
    Views: {
      community_suggestions_with_votes: {
        Row: {
          id: string | null
          title: string | null
          description: string | null
          suggestion_type: string | null
          user_id: string | null
          status: string | null
          priority: string | null
          votes: number | null
          created_at: string | null
          updated_at: string | null
          avg_votes: number | null
          total_votes: number | null
        }
      }
      community_suggestions_summary: {
        Row: {
          total_suggestions: number | null
          pending_suggestions: number | null
          approved_suggestions: number | null
          rejected_suggestions: number | null
          total_votes: number | null
          avg_votes_per_suggestion: number | null
        }
      }
    }
  }
}
