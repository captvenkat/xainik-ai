#!/usr/bin/env node

/**
 * Verify Tables and Force Cache Refresh
 * Checks if tables exist and forces a cache refresh
 */

const { createClient } = require('@supabase/supabase-js');

async function verifyAndRefreshCache() {
  console.log('🔍 Verifying tables and forcing cache refresh...');
  
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
    
    // 1. Check if tables exist in the database
    console.log('\n📋 Checking if tables exist in database...');
    
    const tablesToCheck = [
      'community_suggestions',
      'community_suggestions_with_votes',
      'community_suggestions_summary',
      'mission_invitation_summary',
      'activity_log'
    ];
    
    for (const table of tablesToCheck) {
      try {
        // Use raw SQL to check if table exists
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: `
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = '${table}'
            ) as exists;
          `
        });
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          const exists = data && data[0] && data[0].exists;
          console.log(`${exists ? '✅' : '❌'} ${table}: ${exists ? 'exists' : 'missing'}`);
        }
      } catch (e) {
        console.log(`❌ ${table}: ${e.message}`);
      }
    }
    
    // 2. Force cache refresh by querying each table
    console.log('\n🔄 Forcing cache refresh...');
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Cache refresh ${table}: ${error.message}`);
        } else {
          console.log(`✅ Cache refresh ${table}: success (${data.length} records)`);
        }
      } catch (e) {
        console.log(`❌ Cache refresh ${table}: ${e.message}`);
      }
    }
    
    // 3. Check views specifically
    console.log('\n📋 Checking views...');
    
    const viewsToCheck = [
      'community_suggestions_summary',
      'activity_recent'
    ];
    
    for (const view of viewsToCheck) {
      try {
        const { data, error } = await supabase.from(view).select('*').limit(1);
        if (error) {
          console.log(`❌ View ${view}: ${error.message}`);
        } else {
          console.log(`✅ View ${view}: success (${data.length} records)`);
        }
      } catch (e) {
        console.log(`❌ View ${view}: ${e.message}`);
      }
    }
    
    // 4. Force a schema refresh by creating a dummy table and dropping it
    console.log('\n🔄 Forcing schema refresh...');
    
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS temp_schema_refresh (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            created_at timestamptz DEFAULT now()
          );
          DROP TABLE IF EXISTS temp_schema_refresh;
        `
      });
      
      if (error) {
        console.log(`⚠️  Schema refresh: ${error.message}`);
      } else {
        console.log('✅ Schema refresh: success');
      }
    } catch (e) {
      console.log(`⚠️  Schema refresh: ${e.message}`);
    }
    
    // 5. Final verification
    console.log('\n🔍 Final verification...');
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Final check ${table}: ${error.message}`);
        } else {
          console.log(`✅ Final check ${table}: accessible (${data.length} records)`);
        }
      } catch (e) {
        console.log(`❌ Final check ${table}: ${e.message}`);
      }
    }
    
    console.log('\n🎉 Verification and cache refresh completed!');
    console.log('💡 If tables still show as missing, try:');
    console.log('   1. Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)');
    console.log('   2. Clear browser cache');
    console.log('   3. Wait 1-2 minutes for Supabase cache to update');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
  }
}

if (require.main === module) {
  verifyAndRefreshCache().catch(console.error);
}

module.exports = { verifyAndRefreshCache };
