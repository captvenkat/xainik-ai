#!/usr/bin/env node

/**
 * Apply Veteran Cap and Contact Messages Migration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyVeteranCapMigration() {
  console.log('🚀 Applying Veteran Cap and Contact Messages Migration...');
  
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
    const { error } = await supabase.from('profiles').select('*').limit(1);
    if (error) throw new Error(`Connection failed: ${error.message}`);
    console.log('✅ Connection successful');
    
    // Read migration files
    const veteranCapSql = fs.readFileSync(path.join(__dirname, '../migrations/20250827_veteran_cap.sql'), 'utf8');
    const contactMessagesSql = fs.readFileSync(path.join(__dirname, '../migrations/20250827_contact_messages.sql'), 'utf8');
    
    console.log('\n🔧 Applying Veteran Cap Migration...');
    
    // Split SQL into individual statements
    const veteranCapStatements = veteranCapSql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of veteranCapStatements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', {
            sql_query: statement.trim() + ';'
          });
          if (error) {
            console.log(`⚠️  Statement failed: ${error.message}`);
          } else {
            console.log(`✅ Applied: ${statement.trim().substring(0, 50)}...`);
          }
        } catch (e) {
          console.log(`⚠️  Statement error: ${e.message}`);
        }
      }
    }
    
    console.log('\n🔧 Applying Contact Messages Migration...');
    
    // Split SQL into individual statements
    const contactMessagesStatements = contactMessagesSql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of contactMessagesStatements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', {
            sql_query: statement.trim() + ';'
          });
          if (error) {
            console.log(`⚠️  Statement failed: ${error.message}`);
          } else {
            console.log(`✅ Applied: ${statement.trim().substring(0, 50)}...`);
          }
        } catch (e) {
          console.log(`⚠️  Statement error: ${e.message}`);
        }
      }
    }
    
    console.log('\n🎉 Veteran Cap and Contact Messages Migration completed!');
    
    // Test the veteran count function
    console.log('\n🧪 Testing veteran count function...');
    const { data: count, error: countError } = await supabase.rpc('veteran_count');
    if (countError) {
      console.log(`⚠️  Veteran count test failed: ${countError.message}`);
    } else {
      console.log(`✅ Veteran count: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyVeteranCapMigration();
