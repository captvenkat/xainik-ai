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

async function checkTables() {
  console.log('🔍 Checking supporter dashboard tables...\n');
  
  const tables = [
    'ai_suggestions',
    'supporter_celebrations', 
    'supporter_badges',
    'user_goals',
    'goal_progress',
    'behavioral_nudges',
    'user_behavior_analytics',
    'supporter_impact'
  ];
  
  const views = [
    'unified_supporters_aggregated',
    'supporter_impact_summary'
  ];
  
  console.log('📋 Checking Tables:');
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`  ❌ ${table}: ${error.message}`);
      } else {
        console.log(`  ✅ ${table}: OK`);
      }
    } catch (error) {
      console.log(`  ❌ ${table}: ${error.message}`);
    }
  }
  
  console.log('\n📊 Checking Views:');
  for (const view of views) {
    try {
      const { data, error } = await supabase
        .from(view)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`  ❌ ${view}: ${error.message}`);
      } else {
        console.log(`  ✅ ${view}: OK`);
      }
    } catch (error) {
      console.log(`  ❌ ${view}: ${error.message}`);
    }
  }
  
  console.log('\n🔍 Checking existing tables:');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`  ❌ users table: ${error.message}`);
    } else {
      console.log(`  ✅ users table: OK`);
    }
  } catch (error) {
    console.log(`  ❌ users table: ${error.message}`);
  }
  
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`  ❌ donations table: ${error.message}`);
    } else {
      console.log(`  ✅ donations table: OK`);
    }
  } catch (error) {
    console.log(`  ❌ donations table: ${error.message}`);
  }
  
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`  ❌ referrals table: ${error.message}`);
    } else {
      console.log(`  ✅ referrals table: OK`);
    }
  } catch (error) {
    console.log(`  ❌ referrals table: ${error.message}`);
  }
  
  try {
    const { data, error } = await supabase
      .from('endorsements')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`  ❌ endorsements table: ${error.message}`);
    } else {
      console.log(`  ✅ endorsements table: OK`);
    }
  } catch (error) {
    console.log(`  ❌ endorsements table: ${error.message}`);
  }
}

checkTables().catch(console.error);
