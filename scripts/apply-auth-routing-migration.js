#!/usr/bin/env node

/**
 * Apply Auth Routing Migration
 * Creates profiles table and related triggers for auth routing
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyAuthRoutingMigration() {
  console.log('🚀 Applying auth routing migration...');
  
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
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', '20250827_auth_routing.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Applying auth routing migration...');
    
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
          if (error) {
            console.log(`⚠️  Statement failed: ${error.message}`);
            console.log(`SQL: ${statement.substring(0, 100)}...`);
          } else {
            console.log(`✅ Applied statement`);
          }
        } catch (e) {
          console.log(`⚠️  Statement error: ${e.message}`);
        }
      }
    }
    
    console.log('🎉 Auth routing migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

applyAuthRoutingMigration();
