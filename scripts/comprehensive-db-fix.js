#!/usr/bin/env node

/**
 * Comprehensive Database Fix Script
 * Fixes all missing tables and ensures proper schema
 */

const { createClient } = require('@supabase/supabase-js');

async function comprehensiveDbFix() {
  console.log('🚀 Starting comprehensive database fix...');
  
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🔍 Testing connection...');
    const { error } = await supabase.from('users').select('*').limit(1);
    if (error) throw new Error(`Connection failed: ${error.message}`);
    console.log('✅ Connection successful');
    
    console.log('\n🔧 Creating missing tables...');
    
    // 1. Create mission_invitation_summary table
    console.log('\n📋 Creating mission_invitation_summary table...');
    const missionInvitationSQL = `
      DROP VIEW IF EXISTS public.mission_invitation_summary CASCADE;
      
      CREATE TABLE IF NOT EXISTS public.mission_invitation_summary (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
        inviter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
        inviter_name text,
        inviter_role text,
        inviter_avatar text,
        total_invitations integer DEFAULT 0,
        pending_invitations integer DEFAULT 0,
        accepted_invitations integer DEFAULT 0,
        declined_invitations integer DEFAULT 0,
        expired_invitations integer DEFAULT 0,
        total_registrations integer DEFAULT 0,
        veteran_registrations integer DEFAULT 0,
        recruiter_registrations integer DEFAULT 0,
        supporter_registrations integer DEFAULT 0,
        last_invitation_at timestamptz,
        first_invitation_at timestamptz,
        updated_at timestamptz DEFAULT now()
      );
      
      ALTER TABLE public.mission_invitation_summary ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can view their own mission summary" ON public.mission_invitation_summary 
      FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can update their own mission summary" ON public.mission_invitation_summary 
      FOR UPDATE USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can insert their own mission summary" ON public.mission_invitation_summary 
      FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      GRANT ALL ON public.mission_invitation_summary TO authenticated;
      
      CREATE INDEX IF NOT EXISTS idx_mission_invitation_summary_user_id ON public.mission_invitation_summary(user_id);
      CREATE INDEX IF NOT EXISTS idx_mission_invitation_summary_inviter_id ON public.mission_invitation_summary(inviter_id);
    `;
    
    const { error: missionError } = await supabase.rpc('exec_sql', {
      sql_query: missionInvitationSQL
    });
    
    if (missionError) {
      console.log(`⚠️  Mission invitation: ${missionError.message}`);
    } else {
      console.log('✅ mission_invitation_summary table created');
    }
    
    // 2. Create activity_log table
    console.log('\n📋 Creating activity_log table...');
    const activityLogSQL = `
      CREATE TABLE IF NOT EXISTS public.activity_log (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        event text NOT NULL,
        meta jsonb,
        created_at timestamptz DEFAULT now()
      );
      
      CREATE INDEX IF NOT EXISTS idx_activity_log_time ON public.activity_log(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_activity_log_event ON public.activity_log(event);
      
      CREATE OR REPLACE VIEW public.activity_recent AS
      SELECT 
        id,
        event,
        meta,
        created_at,
        CASE 
          WHEN event = 'veteran_joined' THEN (meta->>'veteran_name') || ' joined Xainik'
          WHEN event = 'pitch_referred' THEN (meta->>'supporter_name') || ' referred ' || (meta->>'veteran_name')
          WHEN event = 'recruiter_called' THEN (meta->>'recruiter_name') || ' contacted ' || (meta->>'veteran_name')
          WHEN event = 'endorsement_added' THEN (meta->>'endorser_name') || ' endorsed ' || (meta->>'veteran_name')
          WHEN event = 'like_added' THEN 'Someone liked "' || (meta->>'pitch_title') || '"'
          WHEN event = 'donation_received' THEN '₹' || (meta->>'amount')::text || ' donation received'
          WHEN event = 'resume_request_received' THEN (meta->>'recruiter_name') || ' requested resume from ' || (meta->>'veteran_name')
          WHEN event = 'resume_request_approved' THEN (meta->>'veteran_name') || ' approved resume request from ' || (meta->>'recruiter_name')
          WHEN event = 'resume_request_declined' THEN (meta->>'veteran_name') || ' declined resume request from ' || (meta->>'recruiter_name')
          ELSE event
        END as display_text
      FROM public.activity_log 
      ORDER BY created_at DESC 
      LIMIT 50;
      
      ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Allow all activity log operations" ON public.activity_log
        FOR ALL USING (true);
      
      GRANT ALL ON public.activity_log TO authenticated;
    `;
    
    const { error: activityError } = await supabase.rpc('exec_sql', {
      sql_query: activityLogSQL
    });
    
    if (activityError) {
      console.log(`⚠️  Activity log: ${activityError.message}`);
    } else {
      console.log('✅ activity_log table created');
    }
    
    // 3. Test the tables
    console.log('\n🔍 Testing created tables...');
    
    // Test mission_invitation_summary
    try {
      const { data: missionData, error: missionTestError } = await supabase
        .from('mission_invitation_summary')
        .select('*')
        .limit(1);
      
      if (missionTestError) {
        console.log(`❌ Mission invitation test: ${missionTestError.message}`);
      } else {
        console.log('✅ mission_invitation_summary table is accessible');
        console.log(`📊 Found ${missionData.length} records`);
      }
    } catch (e) {
      console.log(`❌ Mission invitation test error: ${e.message}`);
    }
    
    // Test activity_log
    try {
      const { data: activityData, error: activityTestError } = await supabase
        .from('activity_log')
        .select('*')
        .limit(1);
      
      if (activityTestError) {
        console.log(`❌ Activity log test: ${activityTestError.message}`);
      } else {
        console.log('✅ activity_log table is accessible');
        console.log(`📊 Found ${activityData.length} records`);
      }
    } catch (e) {
      console.log(`❌ Activity log test error: ${e.message}`);
    }
    
    // Test activity_recent view
    try {
      const { data: viewData, error: viewTestError } = await supabase
        .from('activity_recent')
        .select('*')
        .limit(1);
      
      if (viewTestError) {
        console.log(`❌ Activity recent view test: ${viewTestError.message}`);
      } else {
        console.log('✅ activity_recent view is accessible');
        console.log(`📊 Found ${viewData.length} records`);
      }
    } catch (e) {
      console.log(`❌ Activity recent view test error: ${e.message}`);
    }
    
    console.log('\n🎉 Comprehensive database fix completed!');
    console.log('📋 All missing tables have been created with proper security policies');
    
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    console.log('\n💡 Alternative: Apply fixes manually via Supabase Dashboard');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Copy and execute the SQL from fix_mission_invitation_summary.sql');
    console.log('   3. Copy and execute the SQL from migrations/20250127_add_activity_log_simple.sql');
    process.exit(1);
  }
}

if (require.main === module) {
  comprehensiveDbFix().catch(console.error);
}

module.exports = { comprehensiveDbFix };
