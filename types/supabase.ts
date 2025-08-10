export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'veteran' | 'recruiter' | 'supporter' | 'admin';
          avatar_url?: string;
          phone?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role: 'veteran' | 'recruiter' | 'supporter' | 'admin';
          avatar_url?: string;
          phone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'veteran' | 'recruiter' | 'supporter' | 'admin';
          avatar_url?: string;
          phone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      pitches: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          pitch_text: string;
          skills: string[];
          location: string;
          availability: string;
          experience_years: number;
          plan_tier?: string;
          likes_count: number;
          phone?: string;
          linkedin_url?: string;
          resume_url?: string;
          resume_share_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          pitch_text: string;
          skills: string[];
          location: string;
          availability: string;
          experience_years: number;
          plan_tier?: string;
          likes_count?: number;
          phone?: string;
          linkedin_url?: string;
          resume_url?: string;
          resume_share_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          pitch_text?: string;
          skills?: string[];
          location?: string;
          availability?: string;
          experience_years?: number;
          plan_tier?: string;
          likes_count?: number;
          phone?: string;
          linkedin_url?: string;
          resume_url?: string;
          resume_share_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      endorsements: {
        Row: {
          id: string;
          veteran_id: string;
          endorser_id: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          veteran_id: string;
          endorser_id: string;
          text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          veteran_id?: string;
          endorser_id?: string;
          text?: string;
          created_at?: string;
        };
      };
      referral_events: {
        Row: {
          id: string;
          referral_id: string;
          event_type: string;
          platform: string;
          occurred_at: string;
          feedback?: string;
          feedback_comment?: string;
          feedback_at?: string;
          debounce_key?: string;
        };
        Insert: {
          id?: string;
          referral_id: string;
          event_type: string;
          platform: string;
          occurred_at?: string;
          feedback?: string;
          feedback_comment?: string;
          feedback_at?: string;
          debounce_key?: string;
        };
        Update: {
          id?: string;
          referral_id?: string;
          event_type?: string;
          platform?: string;
          occurred_at?: string;
          feedback?: string;
          feedback_comment?: string;
          feedback_at?: string;
          debounce_key?: string;
        };
      };
      resume_requests: {
        Row: {
          id: string;
          pitch_id: string;
          recruiter_id: string;
          status: 'pending' | 'approved' | 'declined';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pitch_id: string;
          recruiter_id: string;
          status?: 'pending' | 'approved' | 'declined';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pitch_id?: string;
          recruiter_id?: string;
          status?: 'pending' | 'approved' | 'declined';
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_log: {
        Row: {
          id: string;
          user_id?: string;
          event_type: string;
          event_data: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          event_type: string;
          event_data: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          event_data?: Record<string, unknown>;
          created_at?: string;
        };
      };
      payment_events: {
        Row: {
          id: string;
          payment_id: string;
          event_type: string;
          event_data: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_id: string;
          event_type: string;
          event_data: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          payment_id?: string;
          event_type?: string;
          event_data?: Record<string, unknown>;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          number: string;
          user_id: string;
          payment_event_id: string;
          amount_paise: number;
          plan_name: string;
          plan_days: number;
          buyer_name: string;
          buyer_email: string;
          buyer_phone?: string;
          storage_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          number: string;
          user_id: string;
          payment_event_id: string;
          amount_paise: number;
          plan_name: string;
          plan_days: number;
          buyer_name: string;
          buyer_email: string;
          buyer_phone?: string;
          storage_key: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          number?: string;
          user_id?: string;
          payment_event_id?: string;
          amount_paise?: number;
          plan_name?: string;
          plan_days?: number;
          buyer_name?: string;
          buyer_email?: string;
          buyer_phone?: string;
          storage_key?: string;
          created_at?: string;
        };
      };
      receipts: {
        Row: {
          id: string;
          number: string;
          payment_event_id: string;
          user_id?: string;
          amount_paise: number;
          donor_name: string;
          donor_email: string;
          donor_phone?: string;
          anonymous: boolean;
          storage_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          number: string;
          payment_event_id: string;
          user_id?: string;
          amount_paise: number;
          donor_name: string;
          donor_email: string;
          donor_phone?: string;
          anonymous: boolean;
          storage_key: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          number?: string;
          payment_event_id?: string;
          user_id?: string;
          amount_paise?: number;
          donor_name?: string;
          donor_email?: string;
          donor_phone?: string;
          anonymous?: boolean;
          storage_key?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type DB = Database;
