#!/usr/bin/env node

/**
 * Apply Simple Activity Log Migration
 * Applies the simplified activity_log table migration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyActivityLogSimple() {
  console.log('🚀 Applying simple activity_log migration...');
  
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
    
    console.log('\n📄 Reading migration file...');
    const migrationPath = path.join(__dirname, '../migrations/20250127_add_activity_log_simple.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🔧 Applying migration...');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', {
            sql_query: statement + ';'
          });
          
          if (error && !error.message.includes('already exists')) {
            console.log(`⚠️  Statement: ${error.message}`);
          } else {
            console.log('✅ Statement executed');
          }
        } catch (e) {
          console.log(`⚠️  Statement error: ${e.message}`);
        }
      }
    }
    
    console.log('\n🎉 Simple activity_log migration completed!');
    
    // Test the table
    console.log('\n🔍 Testing activity_log table...');
    const { data, error: testError } = await supabase.from('activity_log').select('*').limit(1);
    
    if (testError) {
      console.log(`❌ Test failed: ${testError.message}`);
    } else {
      console.log('✅ activity_log table is working');
      console.log(`📊 Found ${data.length} records`);
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\n💡 Alternative: Apply migration manually via Supabase Dashboard');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Copy contents of migrations/20250127_add_activity_log_simple.sql');
    console.log('   3. Paste and execute');
    process.exit(1);
  }
}

if (require.main === module) {
  applyActivityLogSimple().catch(console.error);
}

module.exports = { applyActivityLogSimple };
