#!/usr/bin/env node

/**
 * Apply Dual Funnel Dashboard Migration
 * Applies the dual funnel dashboard schema updates directly via Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyDualFunnelMigration() {
  console.log('🚀 Starting dual funnel dashboard migration...');
  
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🔍 Testing connection...');
    const { error } = await supabase.from('users').select('*').limit(1);
    if (error) throw new Error(`Connection failed: ${error.message}`);
    console.log('✅ Connection successful');
    
    console.log('\n🔧 Applying dual funnel dashboard schema updates...');
    
    // 1. Add new event types for richer funnels
    console.log('📝 Adding new event types...');
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          DO $$ BEGIN
              CREATE TYPE referral_event_type AS ENUM (
                  'share', 'view', 'like', 'contact', 'resume', 'hire'
              );
          EXCEPTION
              WHEN duplicate_object THEN null;
          END $$;
        `
      });
      if (error) {
        console.log(`⚠️  Event types: ${error.message}`);
      } else {
        console.log('✅ Event types added');
      }
    } catch (e) {
      console.log(`⚠️  Event types: ${e.message}`);
    }
    
    // 2. Add new columns to referral_events table
    console.log('\n📝 Adding columns to referral_events table...');
    const referralEventColumns = [
      'mode text CHECK (mode IN (\'self\',\'supporter\',\'anonymous\'))',
      'link_token text',
      'parent_share_id bigint REFERENCES referral_events(id)'
    ];
    
    for (const column of referralEventColumns) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: `ALTER TABLE referral_events ADD COLUMN IF NOT EXISTS ${column};`
        });
        if (error && !error.message.includes('already exists')) {
          console.log(`⚠️  ${column}: ${error.message}`);
        } else {
          console.log(`✅ ${column}`);
        }
      } catch (e) {
        console.log(`⚠️  ${column}: ${e.message}`);
      }
    }
    
    // 3. Create indexes for performance
    console.log('\n📝 Creating indexes...');
    const indexes = [
      'idx_ref_ev_mode ON referral_events(mode)',
      'idx_ref_ev_parent ON referral_events(parent_share_id)'
    ];
    
    for (const index of indexes) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: `CREATE INDEX IF NOT EXISTS ${index};`
        });
        if (error && !error.message.includes('already exists')) {
          console.log(`⚠️  ${index}: ${error.message}`);
        } else {
          console.log(`✅ ${index}`);
        }
      } catch (e) {
        console.log(`⚠️  ${index}: ${e.message}`);
      }
    }
    
    // 4. Create views
    console.log('\n📝 Creating views...');
    
    // Inbound funnel view
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE OR REPLACE VIEW vw_inbound_funnel AS
          SELECT 
              r.pitch_id,
              re.platform,
              re.mode,
              COUNT(*) FILTER (WHERE re.event_type = 'share') as shares,
              COUNT(*) FILTER (WHERE re.event_type = 'view') as views,
              DATE_TRUNC('day', re.occurred_at) as date
          FROM referral_events re
          JOIN referrals r ON re.referral_id = r.id
          GROUP BY r.pitch_id, re.platform, re.mode, DATE_TRUNC('day', re.occurred_at);
        `
      });
      if (error) {
        console.log(`⚠️  Inbound funnel view: ${error.message}`);
      } else {
        console.log('✅ Inbound funnel view created');
      }
    } catch (e) {
      console.log(`⚠️  Inbound funnel view: ${e.message}`);
    }
    
    // Conversion funnel view
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE OR REPLACE VIEW vw_conversion_funnel AS
          SELECT 
              r.pitch_id,
              COUNT(*) FILTER (WHERE re.event_type = 'view') as views,
              COUNT(*) FILTER (WHERE re.event_type = 'like') as likes,
              COUNT(*) FILTER (WHERE re.event_type = 'share') as forwards,
              COUNT(*) FILTER (WHERE re.event_type = 'contact') as contacts,
              COUNT(*) FILTER (WHERE re.event_type = 'resume') as resumes,
              COUNT(*) FILTER (WHERE re.event_type = 'hire') as hires
          FROM referral_events re
          JOIN referrals r ON re.referral_id = r.id
          GROUP BY r.pitch_id;
        `
      });
      if (error) {
        console.log(`⚠️  Conversion funnel view: ${error.message}`);
      } else {
        console.log('✅ Conversion funnel view created');
      }
    } catch (e) {
      console.log(`⚠️  Conversion funnel view: ${e.message}`);
    }
    
    // Supporter progress view
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE OR REPLACE VIEW vw_supporter_progress AS
          SELECT 
              r.pitch_id,
              r.user_id as supporter_user_id,
              COUNT(*) FILTER (WHERE re.event_type = 'share') as shares,
              COUNT(*) FILTER (WHERE re.event_type = 'view') as views,
              COUNT(*) FILTER (WHERE re.event_type = 'contact') as contacts,
              COUNT(*) FILTER (WHERE re.event_type = 'hire') as hires
          FROM referral_events re
          JOIN referrals r ON re.referral_id = r.id
          WHERE re.mode = 'supporter'
          GROUP BY r.pitch_id, r.user_id;
        `
      });
      if (error) {
        console.log(`⚠️  Supporter progress view: ${error.message}`);
      } else {
        console.log('✅ Supporter progress view created');
      }
    } catch (e) {
      console.log(`⚠️  Supporter progress view: ${e.message}`);
    }
    
    // 5. Set security and grants
    console.log('\n📝 Setting security and grants...');
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          ALTER VIEW vw_inbound_funnel SET (security_invoker = true);
          ALTER VIEW vw_conversion_funnel SET (security_invoker = true);
          ALTER VIEW vw_supporter_progress SET (security_invoker = true);
          
          GRANT SELECT ON vw_inbound_funnel TO authenticated;
          GRANT SELECT ON vw_conversion_funnel TO authenticated;
          GRANT SELECT ON vw_supporter_progress TO authenticated;
        `
      });
      if (error) {
        console.log(`⚠️  Security and grants: ${error.message}`);
      } else {
        console.log('✅ Security and grants set');
      }
    } catch (e) {
      console.log(`⚠️  Security and grants: ${e.message}`);
    }
    
    console.log('\n🎉 Dual funnel dashboard migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your development server');
    console.log('2. Navigate to /dashboard/veteran');
    console.log('3. The dual funnel dashboard should now be visible');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

applyDualFunnelMigration();
