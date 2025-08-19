#!/usr/bin/env node

/**
 * Quick Migration Verification
 * Checks if the migration was applied successfully
 */

const { createClient } = require('@supabase/supabase-js');

async function quickVerify() {
  console.log('🔍 Quick migration verification...');
  
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const checks = {
    critical_fields: [],
    new_tables: [],
    overall: true
  };
  
  try {
    console.log('\n📋 Checking critical fields...');
    
    // Test pitches table new fields
    try {
      const { error } = await supabase
        .from('pitches')
        .select('allow_resume_requests, user_id, photo_url')
        .limit(1);
      
      if (error) {
        console.log(`❌ Pitches new fields: ${error.message}`);
        checks.critical_fields.push({ table: 'pitches', status: 'fail', error: error.message });
        checks.overall = false;
      } else {
        console.log('✅ Pitches new fields: accessible');
        checks.critical_fields.push({ table: 'pitches', status: 'pass' });
      }
    } catch (e) {
      console.log(`❌ Pitches new fields: ${e.message}`);
      checks.critical_fields.push({ table: 'pitches', status: 'fail', error: e.message });
      checks.overall = false;
    }
    
    // Test endorsements table new fields
    try {
      const { error } = await supabase
        .from('endorsements')
        .select('text, pitch_id, endorser_user_id')
        .limit(1);
      
      if (error) {
        console.log(`❌ Endorsements new fields: ${error.message}`);
        checks.critical_fields.push({ table: 'endorsements', status: 'fail', error: error.message });
        checks.overall = false;
      } else {
        console.log('✅ Endorsements new fields: accessible');
        checks.critical_fields.push({ table: 'endorsements', status: 'pass' });
      }
    } catch (e) {
      console.log(`❌ Endorsements new fields: ${e.message}`);
      checks.critical_fields.push({ table: 'endorsements', status: 'fail', error: e.message });
      checks.overall = false;
    }
    
    // Test notifications table new fields
    try {
      const { error } = await supabase
        .from('notifications')
        .select('read_at, user_id, type')
        .limit(1);
      
      if (error) {
        console.log(`❌ Notifications new fields: ${error.message}`);
        checks.critical_fields.push({ table: 'notifications', status: 'fail', error: error.message });
        checks.overall = false;
      } else {
        console.log('✅ Notifications new fields: accessible');
        checks.critical_fields.push({ table: 'notifications', status: 'pass' });
      }
    } catch (e) {
      console.log(`❌ Notifications new fields: ${e.message}`);
      checks.critical_fields.push({ table: 'notifications', status: 'fail', error: e.message });
      checks.overall = false;
    }
    
    // Test donations table new fields
    try {
      const { error } = await supabase
        .from('donations')
        .select('amount_cents, currency, is_anonymous')
        .limit(1);
      
      if (error) {
        console.log(`❌ Donations new fields: ${error.message}`);
        checks.critical_fields.push({ table: 'donations', status: 'fail', error: error.message });
        checks.overall = false;
      } else {
        console.log('✅ Donations new fields: accessible');
        checks.critical_fields.push({ table: 'donations', status: 'pass' });
      }
    } catch (e) {
      console.log(`❌ Donations new fields: ${e.message}`);
      checks.critical_fields.push({ table: 'donations', status: 'fail', error: e.message });
      checks.overall = false;
    }
    
    console.log('\n📋 Checking new tables...');
    
    // Test new tables
    const newTables = ['user_activity_log', 'likes', 'shares'];
    
    for (const table of newTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
          checks.new_tables.push({ table, status: 'fail', error: error.message });
          checks.overall = false;
        } else {
          console.log(`✅ ${table}: accessible`);
          checks.new_tables.push({ table, status: 'pass' });
        }
      } catch (e) {
        console.log(`❌ ${table}: ${e.message}`);
        checks.new_tables.push({ table, status: 'fail', error: e.message });
        checks.overall = false;
      }
    }
    
    // Summary
    console.log('\n📊 Verification Summary');
    console.log('======================');
    
    const fieldsPassed = checks.critical_fields.filter(f => f.status === 'pass').length;
    const tablesPassed = checks.new_tables.filter(t => t.status === 'pass').length;
    
    console.log(`📋 Critical Fields: ${fieldsPassed}/${checks.critical_fields.length} passed`);
    console.log(`📋 New Tables: ${tablesPassed}/${checks.new_tables.length} passed`);
    
    if (checks.overall) {
      console.log('\n🎉 Migration verification PASSED!');
      console.log('✅ Your application should now have full functionality');
      console.log('🔄 Next: Remove workarounds from application code');
    } else {
      console.log('\n⚠️  Migration verification completed with issues');
      console.log('🔧 Some features may not work until issues are resolved');
    }
    
    return checks;
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    return { overall: false };
  }
}

if (require.main === module) {
  quickVerify()
    .then((result) => {
      process.exit(result.overall ? 0 : 1);
    })
    .catch((error) => {
      console.error('Verification error:', error);
      process.exit(1);
    });
}

module.exports = { quickVerify };
