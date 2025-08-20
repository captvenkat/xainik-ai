// =====================================================
// LIVE SCHEMA TYPES - BASIC DEFINITION
// This is a minimal schema to fix import errors
// =====================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string
          role: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name?: string | null
          email: string
          role?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          role?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      pitches: {
        Row: {
          id: string
          title: string
          pitch_text: string | null
          user_id: string | null
          skills: string[] | null
          location: string | null
          job_type: string | null
          availability: string | null
          photo_url: string | null
          experience_years: number | null
          linkedin_url: string | null
          resume_url: string | null
          created_at: string | null
          updated_at: string | null
          resume_share_enabled: boolean | null
          plan_tier: string | null
          plan_expires_at: string | null
        }
        Insert: {
          id?: string
          title: string
          pitch_text?: string | null
          user_id?: string | null
          skills?: string[] | null
          location?: string | null
          job_type?: string | null
          availability?: string | null
          photo_url?: string | null
          experience_years?: number | null
          linkedin_url?: string | null
          resume_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          resume_share_enabled?: boolean | null
          plan_tier?: string | null
          plan_expires_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          pitch_text?: string | null
          user_id?: string | null
          skills?: string[] | null
          location?: string | null
          job_type?: string | null
          availability?: string | null
          photo_url?: string | null
          experience_years?: number | null
          linkedin_url?: string | null
          resume_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          resume_share_enabled?: boolean | null
          plan_tier?: string | null
          plan_expires_at?: string | null
        }
      }
      endorsements: {
        Row: {
          id: string
          pitch_id: string | null
          endorser_user_id: string | null
          text: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          pitch_id?: string | null
          endorser_user_id?: string | null
          text?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          pitch_id?: string | null
          endorser_user_id?: string | null
          text?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      referrals: {
        Row: {
          id: string
          pitch_id: string | null
          supporter_id: string | null
          share_link: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          pitch_id?: string | null
          supporter_id?: string | null
          share_link?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          pitch_id?: string | null
          supporter_id?: string | null
          share_link?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      resume_requests: {
        Row: {
          id: string
          pitch_id: string | null
          recruiter_user_id: string | null
          user_id: string | null
          message: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          pitch_id?: string | null
          recruiter_user_id?: string | null
          user_id?: string | null
          message?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          pitch_id?: string | null
          recruiter_user_id?: string | null
          user_id?: string | null
          message?: string | null
          status?: string | null
          created_at?: string | null
        }
      }
      donations: {
        Row: {
          id: string
          user_id: string | null
          amount: number | null
          currency: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          amount?: number | null
          currency?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          amount?: number | null
          currency?: string | null
          status?: string | null
          created_at?: string | null
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string | null
          amount: number | null
          currency: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          amount?: number | null
          currency?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          amount?: number | null
          currency?: string | null
          status?: string | null
          created_at?: string | null
        }
      }
      receipts: {
        Row: {
          id: string
          invoice_id: string | null
          amount: number | null
          currency: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          invoice_id?: string | null
          amount?: number | null
          currency?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          invoice_id?: string | null
          amount?: number | null
          currency?: string | null
          created_at?: string | null
        }
      }
      community_suggestions: {
        Row: {
          id: string
          title: string | null
          description: string | null
          user_id: string | null
          status: string | null
          priority: string | null
          votes: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title?: string | null
          description?: string | null
          user_id?: string | null
          status?: string | null
          priority?: string | null
          votes?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string | null
          description?: string | null
          user_id?: string | null
          status?: string | null
          priority?: string | null
          votes?: number | null
          created_at?: string | null
        }
      }
      community_suggestion_votes: {
        Row: {
          id: string
          suggestion_id: string | null
          user_id: string | null
          vote_type: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          suggestion_id?: string | null
          user_id?: string | null
          vote_type?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          suggestion_id?: string | null
          user_id?: string | null
          vote_type?: string | null
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
          user_id: string | null
          status: string | null
          priority: string | null
          votes: number | null
          created_at: string | null
          avg_votes: number | null
        }
      }
      community_suggestions_summary: {
        Row: {
          total_suggestions: number | null
          pending_suggestions: number | null
          approved_suggestions: number | null
          total_votes: number | null
        }
      }
    }
  }
}
