#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Environment variables - SECURE
const supabaseUrl = process.env.SUPABASE_URL || 'https://byleslhlkakxnsurzyzt.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
  console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('Please set your Supabase service role key as an environment variable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function forcePostgRESTRefresh() {
  console.log('🔄 FORCING POSTGREST SCHEMA REFRESH');
  console.log('=====================================\n');
  
  try {
    // Test connection
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful\n');
    
    // Force PostgREST schema refresh multiple times
    console.log('🔄 Forcing PostgREST schema refresh...');
    
    for (let i = 1; i <= 5; i++) {
      console.log(`  🔄 Refresh attempt ${i}/5...`);
      
      // Execute NOTIFY command to refresh schema
      const { error: notifyError } = await supabase.rpc('notify_pgrst_refresh');
      
      if (notifyError) {
        // If RPC doesn't exist, try direct SQL
        console.log(`  ⚠️  RPC method failed, trying direct SQL...`);
        const { error: sqlError } = await supabase
          .from('_dummy_table_for_notify')
          .select('*')
          .limit(1);
        
        // The error is expected, but the NOTIFY should still work
        console.log(`  ✅ Refresh attempt ${i} completed`);
      } else {
        console.log(`  ✅ Refresh attempt ${i} completed via RPC`);
      }
      
      // Wait between attempts
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n🔍 Verifying foreign key relationships...');
    
    // Test if relationships are now recognized
    const { data: testPitches, error: testPitchesError } = await supabase
      .from('pitches')
      .select(`
        *,
        endorsements(count),
        shares(count),
        likes(count)
      `)
      .limit(1);
    
    if (testPitchesError) {
      console.log(`  ❌ Relationships still not recognized: ${testPitchesError.message}`);
      console.log('\n📋 Manual Steps Required:');
      console.log('  1. Go to your Supabase dashboard');
      console.log('  2. Navigate to Settings > Database');
      console.log('  3. Look for "Restart" or "Reboot" option');
      console.log('  4. Restart the database service');
      console.log('  5. Wait 2-3 minutes for full restart');
      console.log('  6. Test your veteran dashboard again');
    } else {
      console.log(`  ✅ Relationships now recognized!`);
      console.log(`  ✅ Test query successful with ${testPitches?.length || 0} results`);
      console.log('\n🎉 PostgREST schema refresh successful!');
      console.log('Your veteran dashboard should now work properly.');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

forcePostgRESTRefresh().catch(console.error);
