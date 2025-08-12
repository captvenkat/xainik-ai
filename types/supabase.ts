export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      donations: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          is_anonymous: boolean
          razorpay_payment_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          is_anonymous?: boolean
          razorpay_payment_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          is_anonymous?: boolean
          razorpay_payment_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          content: string | null
          created_at: string | null
          email_type: string
          id: string
          recipient_email: string
          sent_at: string | null
          status: string | null
          subject: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          email_type: string
          id?: string
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          email_type?: string
          id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      endorsements: {
        Row: {
          created_at: string
          endorser_user_id: string | null
          id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          endorser_user_id?: string | null
          id?: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          endorser_user_id?: string | null
          id?: string
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number | null
          amount_cents: number
          created_at: string | null
          currency: string | null
          due_date: string | null
          id: string
          invoice_number: string
          metadata: Json | null
          notes: string | null
          number: string | null
          paid_at: string | null
          payment_method: string | null
          plan_id: string | null
          plan_tier: string | null
          razorpay_payment_id: string | null
          status: string | null
          subscription_id: string | null
          tax_amount_cents: number | null
          total_amount_cents: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          metadata?: Json | null
          notes?: string | null
          number?: string | null
          paid_at?: string | null
          payment_method?: string | null
          plan_id?: string | null
          plan_tier?: string | null
          razorpay_payment_id?: string | null
          status?: string | null
          subscription_id?: string | null
          tax_amount_cents?: number | null
          total_amount_cents: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          metadata?: Json | null
          notes?: string | null
          number?: string | null
          paid_at?: string | null
          payment_method?: string | null
          plan_id?: string | null
          plan_tier?: string | null
          razorpay_payment_id?: string | null
          status?: string | null
          subscription_id?: string | null
          tax_amount_cents?: number | null
          total_amount_cents?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_audit: {
        Row: {
          created_at: string | null
          id: string
          migration_name: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          migration_name: string
          status: string
        }
        Update: {
          created_at?: string | null
          id?: string
          migration_name?: string
          status?: string
        }
        Relationships: []
      }
      numbering_state: {
        Row: {
          created_at: string | null
          current_number: number
          id: string
          prefix: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_number: number
          id?: string
          prefix: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_number?: number
          id?: string
          prefix?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          amount_cents: number
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          razorpay_payment_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          razorpay_payment_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          razorpay_payment_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events_archive: {
        Row: {
          amount_cents: number
          archived_at: string | null
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          original_id: string
          razorpay_payment_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          archived_at?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          original_id: string
          razorpay_payment_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          archived_at?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          original_id?: string
          razorpay_payment_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_archive_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pitches: {
        Row: {
          created_at: string | null
          experience_years: number | null
          id: string
          linkedin_url: string | null
          pitch_text: string
          resume_url: string | null
          skills: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          experience_years?: number | null
          id?: string
          linkedin_url?: string | null
          pitch_text: string
          resume_url?: string | null
          skills?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          experience_years?: number | null
          id?: string
          linkedin_url?: string | null
          pitch_text?: string
          resume_url?: string | null
          skills?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pitches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          receipt_number: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          receipt_number: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          receipt_number?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recruiter_notes: {
        Row: {
          created_at: string | null
          id: string
          note_text: string
          pitch_id: string
          recruiter_user_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          note_text: string
          pitch_id: string
          recruiter_user_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          note_text?: string
          pitch_id?: string
          recruiter_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recruiter_notes_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruiter_notes_recruiter_user_id_fkey"
            columns: ["recruiter_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          pitch_id: string
          share_link: string | null
          supporter_user_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pitch_id: string
          share_link?: string | null
          supporter_user_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pitch_id?: string
          share_link?: string | null
          supporter_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_supporter_user_id_fkey"
            columns: ["supporter_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          platform: string | null
          referral_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          platform?: string | null
          referral_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          platform?: string | null
          referral_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_events_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_requests: {
        Row: {
          created_at: string | null
          id: string
          job_role: string | null
          pitch_id: string
          recruiter_user_id: string
          responded_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_role?: string | null
          pitch_id: string
          recruiter_user_id: string
          responded_at?: string | null
          status: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_role?: string | null
          pitch_id?: string
          recruiter_user_id?: string
          responded_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_requests_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_requests_recruiter_user_id_fkey"
            columns: ["recruiter_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      service_plans: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          price_cents: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price_cents: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price_cents?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      shared_pitches: {
        Row: {
          created_at: string | null
          id: string
          pitch_id: string
          share_token: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pitch_id: string
          share_token: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pitch_id?: string
          share_token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_pitches_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          id: string
          profile_data: Json | null
          profile_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_data?: Json | null
          profile_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_data?: Json | null
          profile_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          plan_expires_at: string | null
          plan_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          plan_expires_at?: string | null
          plan_id: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          plan_expires_at?: string | null
          plan_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
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
