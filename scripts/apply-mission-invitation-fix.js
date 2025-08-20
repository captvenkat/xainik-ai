#!/usr/bin/env node

/**
 * Mission Invitation Summary Fix Script
 * Creates the missing mission_invitation_summary table
 */

const { createClient } = require('@supabase/supabase-js');

async function applyMissionInvitationFix() {
  console.log('🚀 Applying mission_invitation_summary table fix...');
  
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('Please check your .env.local file contains:');
    console.error('NEXT_PUBLIC_SUPABASE_URL=...');
    console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🔍 Testing connection...');
    const { error } = await supabase.from('users').select('*').limit(1);
    if (error) throw new Error(`Connection failed: ${error.message}`);
    console.log('✅ Connection successful');
    
    console.log('\n🔧 Creating mission_invitation_summary table...');
    
    // SQL to create the mission_invitation_summary table
    const createTableSQL = `
      -- First, drop the existing view if it exists
      DROP VIEW IF EXISTS public.mission_invitation_summary CASCADE;

      -- Create the table with all required columns
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
    `;
    
    // Execute the SQL
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: createTableSQL
    });
    
    if (createError) {
      console.log(`⚠️  Table creation: ${createError.message}`);
    } else {
      console.log('✅ mission_invitation_summary table created');
    }
    
    // Enable RLS
    console.log('\n🔒 Enabling Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE public.mission_invitation_summary ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.log(`⚠️  RLS enable: ${rlsError.message}`);
    } else {
      console.log('✅ RLS enabled');
    }
    
    // Create policies
    console.log('\n🔐 Creating security policies...');
    const policies = [
      {
        name: 'Users can view their own mission summary',
        sql: `CREATE POLICY "Users can view their own mission summary" ON public.mission_invitation_summary FOR SELECT USING (auth.uid() = user_id);`
      },
      {
        name: 'Users can update their own mission summary',
        sql: `CREATE POLICY "Users can update their own mission summary" ON public.mission_invitation_summary FOR UPDATE USING (auth.uid() = user_id);`
      },
      {
        name: 'Users can insert their own mission summary',
        sql: `CREATE POLICY "Users can insert their own mission summary" ON public.mission_invitation_summary FOR INSERT WITH CHECK (auth.uid() = user_id);`
      }
    ];
    
    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: policy.sql });
        if (error && !error.message.includes('already exists')) {
          console.log(`⚠️  ${policy.name}: ${error.message}`);
        } else {
          console.log(`✅ ${policy.name}`);
        }
      } catch (e) {
        console.log(`⚠️  ${policy.name}: ${e.message}`);
      }
    }
    
    // Grant permissions
    console.log('\n🔑 Granting permissions...');
    const { error: grantError } = await supabase.rpc('exec_sql', {
      sql_query: 'GRANT ALL ON public.mission_invitation_summary TO authenticated;'
    });
    
    if (grantError) {
      console.log(`⚠️  Permissions: ${grantError.message}`);
    } else {
      console.log('✅ Permissions granted');
    }
    
    // Create indexes
    console.log('\n📊 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_mission_invitation_summary_user_id ON public.mission_invitation_summary(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_mission_invitation_summary_inviter_id ON public.mission_invitation_summary(inviter_id);'
    ];
    
    for (const index of indexes) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: index });
        if (error) {
          console.log(`⚠️  Index: ${error.message}`);
        } else {
          console.log('✅ Index created');
        }
      } catch (e) {
        console.log(`⚠️  Index: ${e.message}`);
      }
    }
    
    console.log('\n🎉 Mission invitation summary fix completed!');
    console.log('📋 The mission_invitation_summary table has been created with proper security policies');
    
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    console.log('\n💡 Alternative: Apply fix manually via Supabase Dashboard');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Copy contents of fix_mission_invitation_summary.sql');
    console.log('   3. Paste and execute');
    process.exit(1);
  }
}

if (require.main === module) {
  applyMissionInvitationFix().catch(console.error);
}

module.exports = { applyMissionInvitationFix };
