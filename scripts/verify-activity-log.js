#!/usr/bin/env node

/**
 * Verify Activity Log Table Script
 * Checks if the activity_log table exists and is accessible
 */

const { createClient } = require('@supabase/supabase-js');

async function verifyActivityLog() {
  console.log('🔍 Verifying activity_log table...');
  
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🔍 Testing activity_log table access...');
    
    // Try to query the activity_log table
    const { data, error } = await supabase.from('activity_log').select('*').limit(1);
    
    if (error) {
      console.log(`❌ Error accessing activity_log: ${error.message}`);
      
      // Try to check if the table exists by looking at the schema
      console.log('\n🔍 Checking table schema...');
      const { data: schemaData, error: schemaError } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'activity_log';
        `
      });
      
      if (schemaError) {
        console.log(`❌ Schema check failed: ${schemaError.message}`);
      } else {
        console.log('📋 Schema check result:', schemaData);
      }
    } else {
      console.log('✅ activity_log table is accessible');
      console.log(`📊 Found ${data.length} records`);
    }
    
    // Also check the activity_recent view
    console.log('\n🔍 Testing activity_recent view...');
    const { data: viewData, error: viewError } = await supabase.from('activity_recent').select('*').limit(1);
    
    if (viewError) {
      console.log(`❌ Error accessing activity_recent view: ${viewError.message}`);
    } else {
      console.log('✅ activity_recent view is accessible');
      console.log(`📊 Found ${viewData.length} records`);
    }
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
  }
}

if (require.main === module) {
  verifyActivityLog().catch(console.error);
}

module.exports = { verifyActivityLog };
