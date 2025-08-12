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
      notification_prefs: {
        Row: {
          created_at: string
          email_enabled: boolean
          endorsement_notifications: boolean
          in_app_enabled: boolean
          pitch_notifications: boolean
          plan_notifications: boolean
          referral_notifications: boolean
          resume_request_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          endorsement_notifications?: boolean
          in_app_enabled?: boolean
          pitch_notifications?: boolean
          plan_notifications?: boolean
          referral_notifications?: boolean
          resume_request_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          endorsement_notifications?: boolean
          in_app_enabled?: boolean
          pitch_notifications?: boolean
          plan_notifications?: boolean
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
          availability: string
          created_at: string
          experience_years: number | null
          id: string
          is_active: boolean
          job_type: string
          likes_count: number
          linkedin_url: string | null
          location: string
          phone: string | null
          photo_url: string | null
          pitch_text: string
          plan_expires_at: string | null
          plan_tier: string | null
          resume_share_enabled: boolean | null
          resume_url: string | null
          skills: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          availability: string
          created_at?: string
          experience_years?: number | null
          id?: string
          is_active?: boolean
          job_type: string
          likes_count?: number
          linkedin_url?: string | null
          location: string
          phone?: string | null
          photo_url?: string | null
          pitch_text: string
          plan_expires_at?: string | null
          plan_tier?: string | null
          resume_share_enabled?: boolean | null
          resume_url?: string | null
          skills?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string
          created_at?: string
          experience_years?: number | null
          id?: string
          is_active?: boolean
          job_type?: string
          likes_count?: number
          linkedin_url?: string | null
          location?: string
          phone?: string | null
          photo_url?: string | null
          pitch_text?: string
          plan_expires_at?: string | null
          plan_tier?: string | null
          resume_share_enabled?: boolean | null
          resume_url?: string | null
          skills?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          amount: number | null
          amount_cents: number
          created_at: string | null
          currency: string | null
          donor_name: string | null
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
          user_id: string
        }
        Insert: {
          amount?: number | null
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          donor_name?: string | null
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
          user_id: string
        }
        Update: {
          amount?: number | null
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          donor_name?: string | null
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
        Relationships: [
          {
            foreignKeyName: "recruiter_notes_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
        ]
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
      referral_events: {
        Row: {
          country: string | null
          debounce_key: string | null
          event_type: string
          feedback: string | null
          feedback_at: string | null
          feedback_comment: string | null
          id: string
          ip_hash: string | null
          occurred_at: string
          platform: string | null
          referral_id: string
          user_agent: string | null
        }
        Insert: {
          country?: string | null
          debounce_key?: string | null
          event_type: string
          feedback?: string | null
          feedback_at?: string | null
          feedback_comment?: string | null
          id?: string
          ip_hash?: string | null
          occurred_at?: string
          platform?: string | null
          referral_id: string
          user_agent?: string | null
        }
        Update: {
          country?: string | null
          debounce_key?: string | null
          event_type?: string
          feedback?: string | null
          feedback_at?: string | null
          feedback_comment?: string | null
          id?: string
          ip_hash?: string | null
          occurred_at?: string
          platform?: string | null
          referral_id?: string
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
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          pitch_id: string
          share_link: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pitch_id: string
          share_link: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pitch_id?: string
          share_link?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_requests: {
        Row: {
          created_at: string
          id: string
          job_role: string | null
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
          pitch_id?: string | null
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
        ]
      }
      service_plans: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          duration_days: number
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
          duration_days: number
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
          duration_days?: number
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
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      activity_recent: {
        Row: {
          event_title: string | null
          event_type: string | null
          occurred_at: string | null
          user_name: string | null
          user_role: string | null
        }
        Relationships: []
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
    }
    Functions: {
      check_billing_env: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      fy_label: {
        Args: { ts?: string }
        Returns: string
      }
      lock_numbering_and_next: {
        Args: { prefix: string; fy: string }
        Returns: number
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
