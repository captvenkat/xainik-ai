#!/usr/bin/env node

/**
 * Migration Verification Script
 * Checks that the migration was applied successfully
 */

const { createClient } = require('@supabase/supabase-js');

async function verifyMigration() {
  console.log('🔍 Verifying migration status...');
  
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const checks = {
    tables: [],
    columns: [],
    functions: [],
    overall: true
  };
  
  try {
    // 1. Check critical tables exist
    const criticalTables = [
      'users', 'pitches', 'veterans', 'recruiters', 'supporters',
      'endorsements', 'notifications', 'notification_prefs',
      'resume_requests', 'referral_events', 'donations',
      'user_activity_log', 'likes', 'shares'
    ];
    
    console.log('\n📋 Checking tables...');
    for (const table of criticalTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count(*)')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
          checks.tables.push({ table, status: 'fail', error: error.message });
          checks.overall = false;
        } else {
          console.log(`✅ ${table}: accessible`);
          checks.tables.push({ table, status: 'pass' });
        }
      } catch (e) {
        console.log(`❌ ${table}: ${e.message}`);
        checks.tables.push({ table, status: 'fail', error: e.message });
        checks.overall = false;
      }
    }
    
    // 2. Check critical columns exist
    console.log('\n📋 Checking critical columns...');
    
    const criticalColumns = [
      { table: 'pitches', column: 'user_id' },
      { table: 'pitches', column: 'allow_resume_requests' },
      { table: 'endorsements', column: 'pitch_id' },
      { table: 'notifications', column: 'user_id' },
      { table: 'notifications', column: 'read_at' },
      { table: 'donations', column: 'amount_cents' }
    ];
    
    for (const { table, column } of criticalColumns) {
      try {
        // Try to select the column
        const { error } = await supabase
          .from(table)
          .select(column)
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}.${column}: ${error.message}`);
          checks.columns.push({ table, column, status: 'fail', error: error.message });
          checks.overall = false;
        } else {
          console.log(`✅ ${table}.${column}: exists`);
          checks.columns.push({ table, column, status: 'pass' });
        }
      } catch (e) {
        console.log(`❌ ${table}.${column}: ${e.message}`);
        checks.columns.push({ table, column, status: 'fail', error: e.message });
        checks.overall = false;
      }
    }
    
    // 3. Check functions exist
    console.log('\n📋 Checking functions...');
    
    try {
      const { error } = await supabase.rpc('create_mission_invitation', {
        p_inviter_id: '00000000-0000-0000-0000-000000000000',
        p_inviter_role: 'test',
        p_invitation_message: 'test',
        p_platform: 'test'
      });
      
      if (error && !error.message.includes('violates foreign key constraint')) {
        console.log(`❌ create_mission_invitation: ${error.message}`);
        checks.functions.push({ func: 'create_mission_invitation', status: 'fail', error: error.message });
        checks.overall = false;
      } else {
        console.log(`✅ create_mission_invitation: available`);
        checks.functions.push({ func: 'create_mission_invitation', status: 'pass' });
      }
    } catch (e) {
      console.log(`❌ create_mission_invitation: ${e.message}`);
      checks.functions.push({ func: 'create_mission_invitation', status: 'fail', error: e.message });
      checks.overall = false;
    }
    
    // 4. Test application compatibility
    console.log('\n📋 Testing application compatibility...');
    
    try {
      // Test resume requests query
      const { error: resumeError } = await supabase
        .from('resume_requests')
        .select('id, recruiter_id, veteran_id, pitch_id, status, job_role, message, created_at, responded_at')
        .limit(1);
      
      if (resumeError) {
        console.log(`⚠️  Resume requests compatibility: ${resumeError.message}`);
      } else {
        console.log(`✅ Resume requests: compatible`);
      }
      
      // Test endorsements query
      const { error: endorseError } = await supabase
        .from('endorsements')
        .select('id, user_id, endorser_user_id, text, pitch_id, created_at')
        .limit(1);
      
      if (endorseError) {
        console.log(`⚠️  Endorsements compatibility: ${endorseError.message}`);
      } else {
        console.log(`✅ Endorsements: compatible`);
      }
      
    } catch (e) {
      console.log(`⚠️  Application compatibility test error: ${e.message}`);
    }
    
    // 5. Summary
    console.log('\n📊 Migration Verification Summary');
    console.log('================================');
    
    const tablesPassed = checks.tables.filter(t => t.status === 'pass').length;
    const columnsPassed = checks.columns.filter(c => c.status === 'pass').length;
    const functionsPassed = checks.functions.filter(f => f.status === 'pass').length;
    
    console.log(`📋 Tables: ${tablesPassed}/${checks.tables.length} passed`);
    console.log(`📋 Columns: ${columnsPassed}/${checks.columns.length} passed`);
    console.log(`📋 Functions: ${functionsPassed}/${checks.functions.length} passed`);
    
    if (checks.overall) {
      console.log('\n🎉 Migration verification PASSED!');
      console.log('✅ Your application should now have full functionality');
      console.log('🔄 Next: Remove workarounds from application code');
    } else {
      console.log('\n⚠️  Migration verification completed with issues');
      console.log('🔧 Some features may not work until issues are resolved');
      console.log('📋 Check the details above for specific problems');
    }
    
    return checks;
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    checks.overall = false;
    return checks;
  }
}

// Handle command line execution
if (require.main === module) {
  verifyMigration()
    .then((result) => {
      process.exit(result.overall ? 0 : 1);
    })
    .catch((error) => {
      console.error('Verification error:', error);
      process.exit(1);
    });
}

module.exports = { verifyMigration };
