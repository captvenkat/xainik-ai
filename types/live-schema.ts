export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      community_suggestion_votes: {
        Row: {
          created_at: string | null
          id: string
          suggestion_id: string | null
          updated_at: string | null
          user_id: string | null
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          suggestion_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          suggestion_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_suggestion_votes_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "community_suggestions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_suggestion_votes_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "community_suggestions_with_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_suggestion_votes_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "community_suggestions_with_votes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_suggestion_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_suggestions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          priority: string | null
          status: string | null
          suggestion_type: string
          title: string
          updated_at: string | null
          user_id: string | null
          votes: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          suggestion_type: string
          title: string
          updated_at?: string | null
          user_id?: string | null
          votes?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          suggestion_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          is_anonymous: boolean
          razorpay_payment_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          is_anonymous?: boolean
          razorpay_payment_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          is_anonymous?: boolean
          razorpay_payment_id?: string | null
          updated_at?: string | null
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
          updated_at: string | null
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
          updated_at?: string | null
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
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      endorsements: {
        Row: {
          created_at: string | null
          endorsement_text: string | null
          endorser_email: string | null
          endorser_name: string | null
          endorser_user_id: string | null
          id: string
          is_anonymous: boolean | null
          pitch_id: string | null
          text: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          endorsement_text?: string | null
          endorser_email?: string | null
          endorser_name?: string | null
          endorser_user_id?: string | null
          id?: string
          is_anonymous?: boolean | null
          pitch_id?: string | null
          text?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          endorsement_text?: string | null
          endorser_email?: string | null
          endorser_name?: string | null
          endorser_user_id?: string | null
          id?: string
          is_anonymous?: boolean | null
          pitch_id?: string | null
          text?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "endorsements_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "endorsements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_endorsements_pitch_id"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_endorsements_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_calls: {
        Row: {
          call_date: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          outcome: string | null
          pitch_id: string
          supporter_id: string
          updated_at: string | null
        }
        Insert: {
          call_date?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          outcome?: string | null
          pitch_id: string
          supporter_id: string
          updated_at?: string | null
        }
        Update: {
          call_date?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          outcome?: string | null
          pitch_id?: string
          supporter_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      impact_channel_stats: {
        Row: {
          channel_name: string
          created_at: string | null
          id: string
          performance_score: number | null
          total_conversions: number | null
          total_shares: number | null
          total_views: number | null
          updated_at: string | null
        }
        Insert: {
          channel_name: string
          created_at?: string | null
          id?: string
          performance_score?: number | null
          total_conversions?: number | null
          total_shares?: number | null
          total_views?: number | null
          updated_at?: string | null
        }
        Update: {
          channel_name?: string
          created_at?: string | null
          id?: string
          performance_score?: number | null
          total_conversions?: number | null
          total_shares?: number | null
          total_views?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      impact_funnel: {
        Row: {
          conversion_rate: number | null
          created_at: string | null
          funnel_stage: string
          id: string
          successful_conversions: number | null
          total_entries: number | null
          updated_at: string | null
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string | null
          funnel_stage: string
          id?: string
          successful_conversions?: number | null
          total_entries?: number | null
          updated_at?: string | null
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string | null
          funnel_stage?: string
          id?: string
          successful_conversions?: number | null
          total_entries?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      impact_keywords: {
        Row: {
          applied_date: string | null
          applied_to_headline: boolean | null
          created_at: string | null
          id: string
          keyword_phrase: string
          pitch_id: string
        }
        Insert: {
          applied_date?: string | null
          applied_to_headline?: boolean | null
          created_at?: string | null
          id?: string
          keyword_phrase: string
          pitch_id: string
        }
        Update: {
          applied_date?: string | null
          applied_to_headline?: boolean | null
          created_at?: string | null
          id?: string
          keyword_phrase?: string
          pitch_id?: string
        }
        Relationships: []
      }
      impact_nudges: {
        Row: {
          action_url: string | null
          actioned: boolean | null
          actioned_at: string | null
          created_at: string | null
          description: string
          expires_at: string | null
          id: string
          nudge_type: string
          pitch_id: string
          priority: number | null
          title: string
        }
        Insert: {
          action_url?: string | null
          actioned?: boolean | null
          actioned_at?: string | null
          created_at?: string | null
          description: string
          expires_at?: string | null
          id?: string
          nudge_type: string
          pitch_id: string
          priority?: number | null
          title: string
        }
        Update: {
          action_url?: string | null
          actioned?: boolean | null
          actioned_at?: string | null
          created_at?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          nudge_type?: string
          pitch_id?: string
          priority?: number | null
          title?: string
        }
        Relationships: []
      }
      impact_outcomes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          outcome_date: string | null
          outcome_type: string
          pitch_id: string
          supporter_id: string
          updated_at: string | null
          value_usd: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          outcome_date?: string | null
          outcome_type: string
          pitch_id: string
          supporter_id: string
          updated_at?: string | null
          value_usd?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          outcome_date?: string | null
          outcome_type?: string
          pitch_id?: string
          supporter_id?: string
          updated_at?: string | null
          value_usd?: number | null
        }
        Relationships: []
      }
      impact_supporter_stats: {
        Row: {
          created_at: string | null
          id: string
          impact_score: number | null
          supporter_id: string | null
          total_donations: number | null
          total_endorsements: number | null
          total_referrals: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          impact_score?: number | null
          supporter_id?: string | null
          total_donations?: number | null
          total_endorsements?: number | null
          total_referrals?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          impact_score?: number | null
          supporter_id?: string | null
          total_donations?: number | null
          total_endorsements?: number | null
          total_referrals?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_supporter_stats_supporter_id_fkey"
            columns: ["supporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          pitch_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pitch_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pitch_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_audit: {
        Row: {
          details: Json | null
          executed_at: string
          id: string
          migration_name: string
          status: string
        }
        Insert: {
          details?: Json | null
          executed_at?: string
          id?: string
          migration_name: string
          status?: string
        }
        Update: {
          details?: Json | null
          executed_at?: string
          id?: string
          migration_name?: string
          status?: string
        }
        Relationships: []
      }
      mission_invitation_analytics: {
        Row: {
          accepted_invitations: number | null
          created_at: string | null
          declined_invitations: number | null
          expired_invitations: number | null
          first_invitation_at: string | null
          id: string
          inviter_id: string
          last_invitation_at: string | null
          pending_invitations: number | null
          recruiter_registrations: number | null
          supporter_registrations: number | null
          total_invitations: number | null
          total_registrations: number | null
          updated_at: string | null
          veteran_registrations: number | null
        }
        Insert: {
          accepted_invitations?: number | null
          created_at?: string | null
          declined_invitations?: number | null
          expired_invitations?: number | null
          first_invitation_at?: string | null
          id?: string
          inviter_id: string
          last_invitation_at?: string | null
          pending_invitations?: number | null
          recruiter_registrations?: number | null
          supporter_registrations?: number | null
          total_invitations?: number | null
          total_registrations?: number | null
          updated_at?: string | null
          veteran_registrations?: number | null
        }
        Update: {
          accepted_invitations?: number | null
          created_at?: string | null
          declined_invitations?: number | null
          expired_invitations?: number | null
          first_invitation_at?: string | null
          id?: string
          inviter_id?: string
          last_invitation_at?: string | null
          pending_invitations?: number | null
          recruiter_registrations?: number | null
          supporter_registrations?: number | null
          total_invitations?: number | null
          total_registrations?: number | null
          updated_at?: string | null
          veteran_registrations?: number | null
        }
        Relationships: []
      }
      mission_invitation_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          invitation_id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          invitation_id: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          invitation_id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_invitation_events_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "mission_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_invitation_summary: {
        Row: {
          accepted_invitations: number | null
          declined_invitations: number | null
          expired_invitations: number | null
          first_invitation_at: string | null
          id: string
          inviter_avatar: string | null
          inviter_id: string | null
          inviter_name: string | null
          inviter_role: string | null
          last_invitation_at: string | null
          pending_invitations: number | null
          recruiter_registrations: number | null
          supporter_registrations: number | null
          total_invitations: number | null
          total_registrations: number | null
          updated_at: string | null
          user_id: string | null
          veteran_registrations: number | null
        }
        Insert: {
          accepted_invitations?: number | null
          declined_invitations?: number | null
          expired_invitations?: number | null
          first_invitation_at?: string | null
          id?: string
          inviter_avatar?: string | null
          inviter_id?: string | null
          inviter_name?: string | null
          inviter_role?: string | null
          last_invitation_at?: string | null
          pending_invitations?: number | null
          recruiter_registrations?: number | null
          supporter_registrations?: number | null
          total_invitations?: number | null
          total_registrations?: number | null
          updated_at?: string | null
          user_id?: string | null
          veteran_registrations?: number | null
        }
        Update: {
          accepted_invitations?: number | null
          declined_invitations?: number | null
          expired_invitations?: number | null
          first_invitation_at?: string | null
          id?: string
          inviter_avatar?: string | null
          inviter_id?: string | null
          inviter_name?: string | null
          inviter_role?: string | null
          last_invitation_at?: string | null
          pending_invitations?: number | null
          recruiter_registrations?: number | null
          supporter_registrations?: number | null
          total_invitations?: number | null
          total_registrations?: number | null
          updated_at?: string | null
          user_id?: string | null
          veteran_registrations?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_invitation_summary_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_invitation_summary_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_invitations: {
        Row: {
          accepted_at: string | null
          accepted_user_id: string | null
          accepted_user_role: string | null
          created_at: string | null
          declined_at: string | null
          expired_at: string | null
          expires_at: string | null
          id: string
          invitation_link: string
          invitation_message: string | null
          invited_role: string | null
          inviter_id: string
          inviter_role: string
          platform: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          accepted_user_role?: string | null
          created_at?: string | null
          declined_at?: string | null
          expired_at?: string | null
          expires_at?: string | null
          id?: string
          invitation_link: string
          invitation_message?: string | null
          invited_role?: string | null
          inviter_id: string
          inviter_role: string
          platform?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          accepted_user_role?: string | null
          created_at?: string | null
          declined_at?: string | null
          expired_at?: string | null
          expires_at?: string | null
          id?: string
          invitation_link?: string
          invitation_message?: string | null
          invited_role?: string | null
          inviter_id?: string
          inviter_role?: string
          platform?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_prefs: {
        Row: {
          created_at: string
          digest_enabled: boolean | null
          email_enabled: boolean
          endorsement_notifications: boolean
          in_app_enabled: boolean
          pitch_notifications: boolean
          plan_notifications: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          referral_notifications: boolean
          resume_request_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          digest_enabled?: boolean | null
          email_enabled?: boolean
          endorsement_notifications?: boolean
          in_app_enabled?: boolean
          pitch_notifications?: boolean
          plan_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          referral_notifications?: boolean
          resume_request_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          digest_enabled?: boolean | null
          email_enabled?: boolean
          endorsement_notifications?: boolean
          in_app_enabled?: boolean
          pitch_notifications?: boolean
          plan_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          referral_notifications?: boolean
          resume_request_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          channel: string
          created_at: string
          id: string
          payload_json: Json | null
          read_at: string | null
          sent_at: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          payload_json?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          payload_json?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      numbering_state: {
        Row: {
          created_at: string | null
          current_number: number
          entity_type: string
          id: string
          prefix: string | null
          suffix: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_number?: number
          entity_type: string
          id?: string
          prefix?: string | null
          suffix?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_number?: number
          entity_type?: string
          id?: string
          prefix?: string | null
          suffix?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          amount_cents: number | null
          created_at: string | null
          currency: string | null
          event_id: string
          event_type: string
          id: string
          invoice_id: string | null
          metadata: Json | null
          payment_id: string | null
          payment_method: string | null
          processed_at: string | null
          status: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          event_id: string
          event_type: string
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          processed_at?: string | null
          status?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          event_id?: string
          event_type?: string
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          processed_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events_archive: {
        Row: {
          archived_at: string
          created_at: string
          event_data: Json
          event_id: string
          event_type: string
          id: string
          order_id: string | null
          payment_id: string | null
          user_id: string | null
        }
        Insert: {
          archived_at?: string
          created_at: string
          event_data: Json
          event_id: string
          event_type: string
          id?: string
          order_id?: string | null
          payment_id?: string | null
          user_id?: string | null
        }
        Update: {
          archived_at?: string
          created_at?: string
          event_data?: Json
          event_id?: string
          event_type?: string
          id?: string
          order_id?: string | null
          payment_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pitches: {
        Row: {
          allow_resume_requests: boolean | null
          availability: string
          created_at: string | null
          endorsements_count: number | null
          experience_years: number | null
          id: string
          is_active: boolean | null
          job_type: string
          likes_count: number | null
          linkedin_url: string | null
          location: string
          location_preferred: string[] | null
          phone: string
          photo_url: string | null
          pitch_text: string
          plan_expires_at: string | null
          plan_tier: string | null
          resume_share_enabled: boolean | null
          resume_url: string | null
          shares_count: number | null
          skills: string[]
          title: string
          updated_at: string | null
          user_id: string | null
          views_count: number | null
        }
        Insert: {
          allow_resume_requests?: boolean | null
          availability: string
          created_at?: string | null
          endorsements_count?: number | null
          experience_years?: number | null
          id?: string
          is_active?: boolean | null
          job_type: string
          likes_count?: number | null
          linkedin_url?: string | null
          location: string
          location_preferred?: string[] | null
          phone: string
          photo_url?: string | null
          pitch_text: string
          plan_expires_at?: string | null
          plan_tier?: string | null
          resume_share_enabled?: boolean | null
          resume_url?: string | null
          shares_count?: number | null
          skills: string[]
          title: string
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
        }
        Update: {
          allow_resume_requests?: boolean | null
          availability?: string
          created_at?: string | null
          endorsements_count?: number | null
          experience_years?: number | null
          id?: string
          is_active?: boolean | null
          job_type?: string
          likes_count?: number | null
          linkedin_url?: string | null
          location?: string
          location_preferred?: string[] | null
          phone?: string
          photo_url?: string | null
          pitch_text?: string
          plan_expires_at?: string | null
          plan_tier?: string | null
          resume_share_enabled?: boolean | null
          resume_url?: string | null
          shares_count?: number | null
          skills?: string[]
          title?: string
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pitches_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
          amount: number | null
          amount_cents: number
          created_at: string | null
          currency: string | null
          donor_email: string | null
          donor_name: string | null
          donor_phone: string | null
          id: string
          invoice_id: string | null
          is_anonymous: boolean | null
          metadata: Json | null
          number: string | null
          payment_date: string | null
          payment_method: string | null
          razorpay_payment_id: string | null
          receipt_number: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          id?: string
          invoice_id?: string | null
          is_anonymous?: boolean | null
          metadata?: Json | null
          number?: string | null
          payment_date?: string | null
          payment_method?: string | null
          razorpay_payment_id?: string | null
          receipt_number: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          id?: string
          invoice_id?: string | null
          is_anonymous?: boolean | null
          metadata?: Json | null
          number?: string | null
          payment_date?: string | null
          payment_method?: string | null
          razorpay_payment_id?: string | null
          receipt_number?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      recruiter_notes: {
        Row: {
          created_at: string
          id: string
          note_text: string
          pitch_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note_text: string
          pitch_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note_text?: string
          pitch_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recruiter_saved_filters: {
        Row: {
          created_at: string
          filters: Json
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters: Json
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      recruiters: {
        Row: {
          company_name: string | null
          created_at: string | null
          industry: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          industry?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          industry?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruiters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_events: {
        Row: {
          created_at: string | null
          event_type: string
          feedback: string | null
          feedback_at: string | null
          feedback_comment: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          occurred_at: string | null
          platform: string | null
          referral_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          feedback?: string | null
          feedback_at?: string | null
          feedback_comment?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          occurred_at?: string | null
          platform?: string | null
          referral_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          feedback?: string | null
          feedback_at?: string | null
          feedback_comment?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          occurred_at?: string | null
          platform?: string | null
          referral_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_events_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_events_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          pitch_id: string | null
          referral_text: string | null
          share_link: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pitch_id?: string | null
          referral_text?: string | null
          share_link?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pitch_id?: string | null
          referral_text?: string | null
          share_link?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
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
            foreignKeyName: "referrals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_requests: {
        Row: {
          created_at: string
          id: string
          job_role: string | null
          message: string | null
          pitch_id: string | null
          recruiter_user_id: string
          responded_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_role?: string | null
          message?: string | null
          pitch_id?: string | null
          recruiter_user_id: string
          responded_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_role?: string | null
          message?: string | null
          pitch_id?: string | null
          recruiter_user_id?: string
          responded_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      service_plans: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          duration_days: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          plan_code: string
          plan_name: string
          price_cents: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_days?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          plan_code: string
          plan_name: string
          price_cents: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_days?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          plan_code?: string
          plan_name?: string
          price_cents?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      shared_pitches: {
        Row: {
          click_count: number | null
          created_at: string
          pitch_id: string
          share_link: string
          user_id: string
        }
        Insert: {
          click_count?: number | null
          created_at?: string
          pitch_id: string
          share_link: string
          user_id: string
        }
        Update: {
          click_count?: number | null
          created_at?: string
          pitch_id?: string
          share_link?: string
          user_id?: string
        }
        Relationships: []
      }
      shares: {
        Row: {
          created_at: string | null
          id: string
          pitch_id: string | null
          platform: string | null
          share_link: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pitch_id?: string | null
          platform?: string | null
          share_link?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pitch_id?: string | null
          platform?: string | null
          share_link?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shares_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      supporters: {
        Row: {
          created_at: string | null
          intro: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          intro?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          intro?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supporters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          activity_data: Json
          activity_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_data?: Json
          activity_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_data?: Json
          activity_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          permission_data: Json | null
          permission_type: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          permission_data?: Json | null
          permission_type: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          permission_data?: Json | null
          permission_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          profile_data: Json
          profile_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          profile_data?: Json
          profile_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          profile_data?: Json
          profile_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          end_date: string
          id: string
          plan_id: string
          start_date: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date: string
          id?: string
          plan_id: string
          start_date: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date?: string
          id?: string
          plan_id?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_subscriptions_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          certifications: string[] | null
          created_at: string | null
          discharge_date: string | null
          education_level: string | null
          email: string
          email_verified: boolean | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          location: string | null
          metadata: Json | null
          military_branch: string | null
          military_rank: string | null
          name: string
          phone: string | null
          phone_verified: boolean | null
          role: string
          updated_at: string | null
          years_of_service: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          discharge_date?: string | null
          education_level?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          location?: string | null
          metadata?: Json | null
          military_branch?: string | null
          military_rank?: string | null
          name: string
          phone?: string | null
          phone_verified?: boolean | null
          role: string
          updated_at?: string | null
          years_of_service?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          discharge_date?: string | null
          education_level?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          location?: string | null
          metadata?: Json | null
          military_branch?: string | null
          military_rank?: string | null
          name?: string
          phone?: string | null
          phone_verified?: boolean | null
          role?: string
          updated_at?: string | null
          years_of_service?: number | null
        }
        Relationships: []
      }
      veterans: {
        Row: {
          bio: string | null
          created_at: string | null
          location_current: string | null
          location_current_city: string | null
          location_current_country: string | null
          locations_preferred: string[] | null
          locations_preferred_structured: Json | null
          military_rank: string | null
          rank: string | null
          retirement_date: string | null
          service_branch: string | null
          updated_at: string | null
          user_id: string
          web_links: Json | null
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          location_current?: string | null
          location_current_city?: string | null
          location_current_country?: string | null
          locations_preferred?: string[] | null
          locations_preferred_structured?: Json | null
          military_rank?: string | null
          rank?: string | null
          retirement_date?: string | null
          service_branch?: string | null
          updated_at?: string | null
          user_id: string
          web_links?: Json | null
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          location_current?: string | null
          location_current_city?: string | null
          location_current_country?: string | null
          locations_preferred?: string[] | null
          locations_preferred_structured?: Json | null
          military_rank?: string | null
          rank?: string | null
          retirement_date?: string | null
          service_branch?: string | null
          updated_at?: string | null
          user_id?: string
          web_links?: Json | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "veterans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      community_suggestions_summary: {
        Row: {
          active_suggestions: number | null
          avg_votes: number | null
          implemented_suggestions: number | null
          rejected_suggestions: number | null
          total_suggestions: number | null
          unique_suggesters: number | null
        }
        Relationships: []
      }
      community_suggestions_with_users: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          priority: string | null
          status: string | null
          suggestion_type: string | null
          title: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
          votes: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_suggestions_with_votes: {
        Row: {
          created_at: string | null
          description: string | null
          downvote_count: number | null
          id: string | null
          priority: string | null
          status: string | null
          suggestion_type: string | null
          title: string | null
          updated_at: string | null
          upvote_count: number | null
          user_id: string | null
          user_name: string | null
          user_vote: string | null
          votes: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      donations_aggregates: {
        Row: {
          last_cents: number | null
          max_cents: number | null
          today_cents: number | null
          total_cents: number | null
        }
        Relationships: []
      }
      mission_invitation_performance: {
        Row: {
          acceptance_rate: number | null
          accepted_count: number | null
          avg_response_hours: number | null
          inviter_id: string | null
          inviter_role: string | null
          registration_rate: number | null
          total_invitations: number | null
          total_registrations: number | null
        }
        Relationships: []
      }
      referrals_with_details: {
        Row: {
          created_at: string | null
          id: string | null
          pitch_id: string | null
          pitch_title: string | null
          pitch_user_id: string | null
          referral_text: string | null
          status: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pitches_user_id"
            columns: ["pitch_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pitches_user_id_fkey"
            columns: ["pitch_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      veteran_profiles_enhanced: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string | null
          legacy_rank: string | null
          location_current: string | null
          location_current_city: string | null
          location_current_country: string | null
          locations_preferred: string[] | null
          locations_preferred_structured: Json | null
          military_rank: string | null
          name: string | null
          phone: string | null
          retirement_date: string | null
          service_branch: string | null
          updated_at: string | null
          user_id: string | null
          web_links: Json | null
          years_experience: number | null
        }
        Relationships: [
          {
            foreignKeyName: "veterans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_mission_invitation: {
        Args: {
          p_accepted_user_id: string
          p_accepted_user_role: string
          p_invitation_link: string
        }
        Returns: boolean
      }
      check_billing_env: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      create_mission_invitation: {
        Args: {
          p_invitation_message: string
          p_inviter_id: string
          p_inviter_role: string
          p_platform?: string
        }
        Returns: string
      }
      exec_sql: {
        Args: { sql_query: string }
        Returns: string
      }
      expire_old_mission_invitations: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      fy_label: {
        Args: { ts?: string }
        Returns: string
      }
      get_user_vote_on_suggestion: {
        Args: { p_suggestion_id: string }
        Returns: string
      }
      increment_pitch_shares: {
        Args: { pitch_id: string }
        Returns: undefined
      }
      lock_numbering_and_next: {
        Args: { fy: string; prefix: string }
        Returns: number
      }
      parse_location: {
        Args: { location_text: string }
        Returns: Json
      }
      validate_web_link: {
        Args: { link_data: Json }
        Returns: boolean
      }
      vote_on_suggestion: {
        Args: { p_suggestion_id: string; p_vote_type: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
