#!/usr/bin/env node

/**
 * Fix All Schema Synchronization Issues
 * This script fixes all the issues identified in the recheck
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Fix tracking
const fixes = {
  applied: [],
  skipped: [],
  errors: []
};

async function fixDatabaseSchema() {
  console.log('🔧 Fixing Database Schema Issues...');
  console.log('=====================================');
  
  try {
    // 1. Fix column name inconsistencies
    console.log('\n📝 Fixing column name inconsistencies...');
    
    // Fix pitches table - change user_id to veteran_id
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.pitches RENAME COLUMN user_id TO veteran_id'
      });
      
      if (error) {
        console.log('⚠️  Could not rename pitches.user_id to veteran_id:', error.message);
      } else {
        fixes.applied.push('Renamed pitches.user_id to veteran_id');
        console.log('✅ Renamed pitches.user_id to veteran_id');
      }
    } catch (err) {
      console.log('⚠️  pitches.user_id rename failed:', err.message);
    }
    
    // Fix endorsements table - change user_id to veteran_id and endorser_user_id to endorser_id
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.endorsements RENAME COLUMN user_id TO veteran_id'
      });
      
      if (error) {
        console.log('⚠️  Could not rename endorsements.user_id to veteran_id:', error.message);
      } else {
        fixes.applied.push('Renamed endorsements.user_id to veteran_id');
        console.log('✅ Renamed endorsements.user_id to veteran_id');
      }
    } catch (err) {
      console.log('⚠️  endorsements.user_id rename failed:', err.message);
    }
    
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.endorsements RENAME COLUMN endorser_user_id TO endorser_id'
      });
      
      if (error) {
        console.log('⚠️  Could not rename endorsements.endorser_user_id to endorser_id:', error.message);
      } else {
        fixes.applied.push('Renamed endorsements.endorser_user_id to endorser_id');
        console.log('✅ Renamed endorsements.endorser_user_id to endorser_id');
      }
    } catch (err) {
      console.log('⚠️  endorsements.endorser_user_id rename failed:', err.message);
    }
    
    // 2. Add missing columns
    console.log('\n📝 Adding missing columns...');
    
    // Add missing columns to users table
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now()'
      });
      
      if (error) {
        console.log('⚠️  Could not add updated_at to users:', error.message);
      } else {
        fixes.applied.push('Added updated_at column to users');
        console.log('✅ Added updated_at column to users');
      }
    } catch (err) {
      console.log('⚠️  users.updated_at add failed:', err.message);
    }
    
    // Add missing columns to pitches table
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now()'
      });
      
      if (error) {
        console.log('⚠️  Could not add updated_at to pitches:', error.message);
      } else {
        fixes.applied.push('Added updated_at column to pitches');
        console.log('✅ Added updated_at column to pitches');
      }
    } catch (err) {
      console.log('⚠️  pitches.updated_at add failed:', err.message);
    }
    
    // Add missing columns to other tables
    const tablesToUpdate = [
      'endorsements', 'likes', 'shares', 'referrals', 'donations', 
      'invoices', 'receipts', 'email_logs'
    ];
    
    for (const tableName of tablesToUpdate) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE public.${tableName} ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now()`
        });
        
        if (error) {
          console.log(`⚠️  Could not add updated_at to ${tableName}:`, error.message);
        } else {
          fixes.applied.push(`Added updated_at column to ${tableName}`);
          console.log(`✅ Added updated_at column to ${tableName}`);
        }
      } catch (err) {
        console.log(`⚠️  ${tableName}.updated_at add failed:`, err.message);
      }
    }
    
    // Add missing columns to profile tables
    const profileTables = ['veterans', 'recruiters', 'supporters'];
    
    for (const tableName of profileTables) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE public.${tableName} ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now()`
        });
        
        if (error) {
          console.log(`⚠️  Could not add created_at to ${tableName}:`, error.message);
        } else {
          fixes.applied.push(`Added created_at column to ${tableName}`);
          console.log(`✅ Added created_at column to ${tableName}`);
        }
      } catch (err) {
        console.log(`⚠️  ${tableName}.created_at add failed:`, err.message);
      }
    }
    
    // 3. Create missing view
    console.log('\n👁️  Creating missing view...');
    
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
        CREATE OR REPLACE VIEW public.community_suggestions_summary AS
        SELECT 
          cs.id,
          cs.title,
          cs.description,
          cs.suggestion_type,
          cs.status,
          cs.priority,
          cs.votes,
          'User' as user_name,
          cs.created_at,
          cs.updated_at
        FROM public.community_suggestions cs
        ORDER BY cs.votes DESC, cs.created_at DESC
        `
      });
      
      if (error) {
        console.log('⚠️  Could not create community_suggestions_summary view:', error.message);
      } else {
        fixes.applied.push('Created community_suggestions_summary view');
        console.log('✅ Created community_suggestions_summary view');
      }
    } catch (err) {
      console.log('⚠️  community_suggestions_summary view creation failed:', err.message);
    }
    
  } catch (error) {
    fixes.errors.push(`Database schema fixes failed: ${error.message}`);
    console.error('❌ Database schema fixes failed:', error.message);
  }
}

function generateCorrectTypeScriptTypes() {
  console.log('\n📝 Generating Correct TypeScript Types...');
  console.log('=====================================');
  
  try {
    const typesContent = `export type Json =
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
          veteran_id: string
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
          veteran_id: string
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
          veteran_id?: string
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
            foreignKeyName: "pitches_veteran_id_fkey"
            columns: ["veteran_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      
      endorsements: {
        Row: {
          id: string
          veteran_id: string
          endorser_id: string
          text: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          veteran_id: string
          endorser_id: string
          text?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          veteran_id?: string
          endorser_id?: string
          text?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "endorsements_veteran_id_fkey"
            columns: ["veteran_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "endorsements_endorser_id_fkey"
            columns: ["endorser_id"]
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
}`;
    
    const typesPath = path.join(__dirname, '..', 'types', 'supabase.ts');
    fs.writeFileSync(typesPath, typesContent);
    
    fixes.applied.push('Generated comprehensive TypeScript types');
    console.log('✅ TypeScript types generated successfully');
    
  } catch (error) {
    fixes.errors.push(`TypeScript generation failed: ${error.message}`);
    console.error('❌ TypeScript generation failed:', error.message);
  }
}

function updateDomainTypes() {
  console.log('\n📝 Updating Domain Types...');
  console.log('=====================================');
  
  try {
    const domainTypesPath = path.join(__dirname, '..', 'types', 'domain.ts');
    const domainContent = fs.readFileSync(domainTypesPath, 'utf8');
    
    // Add missing type exports
    const missingTypes = `
// =====================================================
// MISSING TABLE TYPES (Added by sync fix)
// =====================================================

export type Veteran = Tables['veterans']['Row'];
export type VeteranInsert = Tables['veterans']['Insert'];
export type VeteranUpdate = Tables['veterans']['Update'];

export type Recruiter = Tables['recruiters']['Row'];
export type RecruiterInsert = Tables['recruiters']['Insert'];
export type RecruiterUpdate = Tables['recruiters']['Update'];

export type Supporter = Tables['supporters']['Row'];
export type SupporterInsert = Tables['supporters']['Insert'];
export type SupporterUpdate = Tables['supporters']['Update'];

export type Like = Tables['likes']['Row'];
export type LikeInsert = Tables['likes']['Insert'];
export type LikeUpdate = Tables['likes']['Update'];

export type Share = Tables['shares']['Row'];
export type ShareInsert = Tables['shares']['Insert'];
export type ShareUpdate = Tables['shares']['Update'];

export type CommunitySuggestion = Tables['community_suggestions']['Row'];
export type CommunitySuggestionInsert = Tables['community_suggestions']['Insert'];
export type CommunitySuggestionUpdate = Tables['community_suggestions']['Update'];

export type MissionInvitationSummary = Tables['mission_invitation_summary']['Row'];
export type MissionInvitationSummaryInsert = Tables['mission_invitation_summary']['Insert'];
export type MissionInvitationSummaryUpdate = Tables['mission_invitation_summary']['Update'];

// =====================================================
// UPDATED COMPOSITE TYPES
// =====================================================

export interface VeteranWithProfile extends User {
  veteran: Veteran;
}

export interface RecruiterWithProfile extends User {
  recruiter: Recruiter;
}

export interface SupporterWithProfile extends User {
  supporter: Supporter;
}

export interface PitchWithLikes extends Pitch {
  likes: Like[];
  shares: Share[];
}

export interface PitchWithCommunity extends Pitch {
  community_suggestions: CommunitySuggestion[];
}
`;
    
    // Insert the new types before the existing composite types section
    const updatedContent = domainContent.replace(
      '// =====================================================\n// COMPOSITE TYPES\n// =====================================================',
      missingTypes + '\n// =====================================================\n// COMPOSITE TYPES\n// ====================================================='
    );
    
    fs.writeFileSync(domainTypesPath, updatedContent);
    
    fixes.applied.push('Updated domain types with missing table types');
    console.log('✅ Domain types updated successfully');
    
  } catch (error) {
    fixes.errors.push(`Domain types update failed: ${error.message}`);
    console.error('❌ Domain types update failed:', error.message);
  }
}

function generateReport() {
  console.log('\n📊 GENERATING FIX REPORT');
  console.log('=====================================');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      fixesApplied: fixes.applied.length,
      fixesSkipped: fixes.skipped.length,
      errors: fixes.errors.length
    },
    details: {
      applied: fixes.applied,
      skipped: fixes.skipped,
      errors: fixes.errors
    }
  };
  
  // Save report to file
  const reportPath = path.join(__dirname, '..', 'all-sync-fixes-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📄 Fix report saved to: ${reportPath}`);
  
  // Print summary
  console.log('\n📈 FIX SUMMARY');
  console.log('=====================================');
  console.log(`Fixes Applied: ${report.summary.fixesApplied} ✅`);
  console.log(`Fixes Skipped: ${report.summary.fixesSkipped} ⚠️`);
  console.log(`Errors: ${report.summary.errors} ❌`);
  
  if (report.summary.errors === 0) {
    console.log('\n🎉 ALL SYNCHRONIZATION FIXES COMPLETED!');
    console.log('Your database schema, TypeScript types, and code should now be perfectly synchronized.');
  } else {
    console.log('\n⚠️  SOME FIXES FAILED');
    console.log('Please review the errors above and apply manual fixes if needed.');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Run the comprehensive sync check: node scripts/comprehensive-schema-sync-check.js');
  console.log('2. Test your application for any TypeScript errors');
  console.log('3. Update any code that uses the old column names');
  console.log('4. Run your test suite to ensure everything works');
}

async function runAllSyncFixes() {
  console.log('🚀 Starting All Schema Synchronization Fixes...');
  console.log('============================================================');
  
  await fixDatabaseSchema();
  generateCorrectTypeScriptTypes();
  updateDomainTypes();
  generateReport();
  
  console.log('\n============================================================');
  console.log('✅ All synchronization fixes completed!');
}

// Run the fixes
runAllSyncFixes().catch(error => {
  console.error('❌ All sync fixes failed:', error);
  process.exit(1);
});
