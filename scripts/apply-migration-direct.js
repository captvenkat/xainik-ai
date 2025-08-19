#!/usr/bin/env node

/**
 * Direct Migration Application Script
 * Applies schema updates directly via Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyMigrationDirect() {
  console.log('🚀 Starting direct schema migration...');
  
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
    
    console.log('\n🔧 Applying critical schema updates...');
    
    // 1. Add critical missing fields to pitches table
    console.log('📝 Adding fields to pitches table...');
    const pitchFields = [
      'user_id uuid',
      'photo_url text',
      'resume_url text', 
      'resume_share_enabled boolean DEFAULT false',
      'linkedin_url text',
      'likes_count integer DEFAULT 0',
      'shares_count integer DEFAULT 0',
      'views_count integer DEFAULT 0',
      'endorsements_count integer DEFAULT 0',
      'plan_tier text DEFAULT \'free\'',
      'experience_years text DEFAULT \'\'',
      'allow_resume_requests boolean DEFAULT false',
      'is_active boolean DEFAULT true',
      'location_preferred text[]'
    ];
    
    for (const field of pitchFields) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: `ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS ${field};`
        });
        if (error && !error.message.includes('already exists')) {
          console.log(`⚠️  ${field}: ${error.message}`);
        } else {
          console.log(`✅ ${field}`);
        }
      } catch (e) {
        console.log(`⚠️  ${field}: ${e.message}`);
      }
    }
    
    // 2. Add critical missing fields to endorsements table
    console.log('\n📝 Adding fields to endorsements table...');
    const endorsementFields = [
      'user_id uuid',
      'endorser_user_id uuid',
      'text text',
      'pitch_id uuid',
      'endorser_name text',
      'endorser_email text',
      'is_anonymous boolean DEFAULT false'
    ];
    
    for (const field of endorsementFields) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: `ALTER TABLE public.endorsements ADD COLUMN IF NOT EXISTS ${field};`
        });
        if (error && !error.message.includes('already exists')) {
          console.log(`⚠️  ${field}: ${error.message}`);
        } else {
          console.log(`✅ ${field}`);
        }
      } catch (e) {
        console.log(`⚠️  ${field}: ${e.message}`);
      }
    }
    
    // 3. Add critical missing fields to notifications table
    console.log('\n📝 Adding fields to notifications table...');
    const notificationFields = [
      'user_id uuid',
      'type text',
      'payload_json jsonb',
      'channel text',
      'read_at timestamptz'
    ];
    
    for (const field of notificationFields) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: `ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS ${field};`
        });
        if (error && !error.message.includes('already exists')) {
          console.log(`⚠️  ${field}: ${error.message}`);
        } else {
          console.log(`✅ ${field}`);
        }
      } catch (e) {
        console.log(`⚠️  ${field}: ${e.message}`);
      }
    }
    
    // 4. Add critical missing fields to donations table
    console.log('\n📝 Adding fields to donations table...');
    const donationFields = [
      'user_id uuid',
      'amount_cents integer',
      'currency text DEFAULT \'INR\'',
      'is_anonymous boolean DEFAULT false'
    ];
    
    for (const field of donationFields) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: `ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS ${field};`
        });
        if (error && !error.message.includes('already exists')) {
          console.log(`⚠️  ${field}: ${error.message}`);
        } else {
          console.log(`✅ ${field}`);
        }
      } catch (e) {
        console.log(`⚠️  ${field}: ${e.message}`);
      }
    }
    
    // 5. Create critical missing tables
    console.log('\n📝 Creating missing tables...');
    
    const criticalTables = [
      {
        name: 'user_activity_log',
        sql: `
          CREATE TABLE IF NOT EXISTS public.user_activity_log (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
            activity_type text NOT NULL,
            activity_data jsonb,
            created_at timestamptz DEFAULT now()
          );
        `
      },
      {
        name: 'likes',
        sql: `
          CREATE TABLE IF NOT EXISTS public.likes (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
            pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
            created_at timestamptz DEFAULT now(),
            UNIQUE(user_id, pitch_id)
          );
        `
      },
      {
        name: 'shares',
        sql: `
          CREATE TABLE IF NOT EXISTS public.shares (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
            pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
            platform text,
            created_at timestamptz DEFAULT now()
          );
        `
      }
    ];
    
    for (const table of criticalTables) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: table.sql });
        if (error && !error.message.includes('already exists')) {
          console.log(`⚠️  ${table.name}: ${error.message}`);
        } else {
          console.log(`✅ ${table.name}`);
        }
      } catch (e) {
        console.log(`⚠️  ${table.name}: ${e.message}`);
      }
    }
    
    console.log('\n🎉 Direct migration completed!');
    console.log('📋 Next: Run verification script to check results');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\n💡 Alternative: Apply migration manually via Supabase Dashboard');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Copy contents of migrations/20250127_safe_schema_update.sql');
    console.log('   3. Paste and execute');
    process.exit(1);
  }
}

if (require.main === module) {
  applyMigrationDirect().catch(console.error);
}

module.exports = { applyMigrationDirect };
