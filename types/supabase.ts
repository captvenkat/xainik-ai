export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      // Core user tables
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          phone: string | null
          role: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          phone?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          phone?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      
      // Profile tables
      veterans: {
        Row: {
          user_id: string
          rank: string | null
          service_branch: string | null
          years_experience: number | null
          location_current: string | null
          locations_preferred: string[] | null
          created_at: string | null
        }
        Insert: {
          user_id: string
          rank?: string | null
          service_branch?: string | null
          years_experience?: number | null
          location_current?: string | null
          locations_preferred?: string[] | null
          created_at?: string | null
        }
        Update: {
          user_id?: string
          rank?: string | null
          service_branch?: string | null
          years_experience?: number | null
          location_current?: string | null
          locations_preferred?: string[] | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "veterans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      
      recruiters: {
        Row: {
          user_id: string
          company_name: string | null
          industry: string | null
          created_at: string | null
        }
        Insert: {
          user_id: string
          company_name?: string | null
          industry?: string | null
          created_at?: string | null
        }
        Update: {
          user_id?: string
          company_name?: string | null
          industry?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recruiters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      
      supporters: {
        Row: {
          user_id: string
          intro: string | null
          created_at: string | null
        }
        Insert: {
          user_id: string
          intro?: string | null
          created_at?: string | null
        }
        Update: {
          user_id?: string
          intro?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supporters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // Core feature tables
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
          photo_url: string | null
          phone: string
          likes_count: number
          is_active: boolean
          plan_tier: string | null
          plan_expires_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          pitch_text: string
          skills: string[]
          job_type: string
          location: string
          availability: string
          photo_url?: string | null
          phone: string
          likes_count?: number
          is_active?: boolean
          plan_tier?: string | null
          plan_expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
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
          photo_url?: string | null
          phone?: string
          likes_count?: number
          is_active?: boolean
          plan_tier?: string | null
          plan_expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pitches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      
      endorsements: {
        Row: {
          id: string
          user_id: string
          endorser_user_id: string
          text: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          endorser_user_id: string
          text?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          endorser_user_id?: string
          text?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "endorsements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "endorsements_endorser_user_id_fkey"
            columns: ["endorser_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      
      likes: {
        Row: {
          id: string
          user_id: string
          pitch_id: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          pitch_id: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          pitch_id?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          }
        ]
      }
      
      shares: {
        Row: {
          id: string
          user_id: string
          pitch_id: string
          platform: string | null
          share_link: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          pitch_id: string
          platform?: string | null
          share_link?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          pitch_id?: string
          platform?: string | null
          share_link?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shares_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          }
        ]
      }
      
      referrals: {
        Row: {
          id: string
          supporter_id: string
          pitch_id: string
          share_link: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          supporter_id: string
          pitch_id: string
          share_link?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          supporter_id?: string
          pitch_id?: string
          share_link?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_supporter_id_fkey"
            columns: ["supporter_id"]
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
          }
        ]
      }
      
      community_suggestions: {
        Row: {
          id: string
          user_id: string
          suggestion_type: string
          title: string
          description: string | null
          status: string | null
          priority: string | null
          votes: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          suggestion_type: string
          title: string
          description?: string | null
          status?: string | null
          priority?: string | null
          votes?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          suggestion_type?: string
          title?: string
          description?: string | null
          status?: string | null
          priority?: string | null
          votes?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      
      mission_invitation_summary: {
        Row: {
          id: string
          user_id: string
          inviter_id: string | null
          total_invitations_sent: number | null
          total_invitations_accepted: number | null
          total_invitations_declined: number | null
          total_invitations_pending: number | null
          last_invitation_sent: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          inviter_id?: string | null
          total_invitations_sent?: number | null
          total_invitations_accepted?: number | null
          total_invitations_declined?: number | null
          total_invitations_pending?: number | null
          last_invitation_sent?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          inviter_id?: string | null
          total_invitations_sent?: number | null
          total_invitations_accepted?: number | null
          total_invitations_declined?: number | null
          total_invitations_pending?: number | null
          last_invitation_sent?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_invitation_summary_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // Existing tables (keeping current structure)
      donations: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          is_anonymous: boolean
          razorpay_payment_id: string | null
          user_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          is_anonymous?: boolean
          razorpay_payment_id?: string | null
          user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          is_anonymous?: boolean
          razorpay_payment_id?: string | null
          user_id?: string | null
          updated_at?: string | null
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
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
          }
        ]
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
          updated_at: string | null
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
          updated_at?: string | null
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
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      community_suggestions_summary: {
        Row: {
          id: string | null
          title: string | null
          description: string | null
          suggestion_type: string | null
          status: string | null
          priority: string | null
          votes: number | null
          user_name: string | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
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