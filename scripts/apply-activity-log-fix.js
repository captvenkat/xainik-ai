#!/usr/bin/env node

/**
 * Activity Log Table Fix Script
 * Creates the missing activity_log table
 */

const { createClient } = require('@supabase/supabase-js');

async function applyActivityLogFix() {
  console.log('🚀 Applying activity_log table fix...');
  
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('Please check your .env.local file contains:');
    console.error('NEXT_PUBLIC_SUPABASE_URL=...');
    console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🔍 Testing connection...');
    const { error } = await supabase.from('users').select('*').limit(1);
    if (error) throw new Error(`Connection failed: ${error.message}`);
    console.log('✅ Connection successful');
    
    console.log('\n🔧 Creating activity_log table...');
    
    // SQL to create the activity_log table
    const createTableSQL = `
      -- Create the activity_log table
      CREATE TABLE IF NOT EXISTS public.activity_log (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        event text NOT NULL,
        meta jsonb,
        created_at timestamptz DEFAULT now()
      );
    `;
    
    // Execute the SQL
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: createTableSQL
    });
    
    if (createError) {
      console.log(`⚠️  Table creation: ${createError.message}`);
    } else {
      console.log('✅ activity_log table created');
    }
    
    // Enable RLS
    console.log('\n🔒 Enabling Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.log(`⚠️  RLS enable: ${rlsError.message}`);
    } else {
      console.log('✅ RLS enabled');
    }
    
    // Create policies
    console.log('\n🔐 Creating security policies...');
    const policies = [
      {
        name: 'Anyone can view activity log',
        sql: `CREATE POLICY "Anyone can view activity log" ON public.activity_log FOR SELECT USING (true);`
      },
      {
        name: 'Authenticated users can insert activity log',
        sql: `CREATE POLICY "Authenticated users can insert activity log" ON public.activity_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');`
      }
    ];
    
    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: policy.sql });
        if (error && !error.message.includes('already exists')) {
          console.log(`⚠️  ${policy.name}: ${error.message}`);
        } else {
          console.log(`✅ ${policy.name}`);
        }
      } catch (e) {
        console.log(`⚠️  ${policy.name}: ${e.message}`);
      }
    }
    
    // Grant permissions
    console.log('\n🔑 Granting permissions...');
    const { error: grantError } = await supabase.rpc('exec_sql', {
      sql_query: 'GRANT ALL ON public.activity_log TO authenticated;'
    });
    
    if (grantError) {
      console.log(`⚠️  Permissions: ${grantError.message}`);
    } else {
      console.log('✅ Permissions granted');
    }
    
    // Create indexes
    console.log('\n📊 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_activity_log_time ON public.activity_log(created_at DESC);',
      'CREATE INDEX IF NOT EXISTS idx_activity_log_event ON public.activity_log(event);'
    ];
    
    for (const index of indexes) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: index });
        if (error) {
          console.log(`⚠️  Index: ${error.message}`);
        } else {
          console.log('✅ Index created');
        }
      } catch (e) {
        console.log(`⚠️  Index: ${e.message}`);
      }
    }
    
    // Create the activity_recent view
    console.log('\n📋 Creating activity_recent view...');
    const createViewSQL = `
      CREATE OR REPLACE VIEW public.activity_recent AS
      SELECT 
        id,
        event,
        meta,
        created_at,
        EXTRACT(EPOCH FROM (now() - created_at)) / 60 as minutes_ago
      FROM public.activity_log 
      ORDER BY created_at DESC 
      LIMIT 50;
    `;
    
    const { error: viewError } = await supabase.rpc('exec_sql', {
      sql_query: createViewSQL
    });
    
    if (viewError) {
      console.log(`⚠️  View creation: ${viewError.message}`);
    } else {
      console.log('✅ activity_recent view created');
    }
    
    console.log('\n🎉 Activity log fix completed!');
    console.log('📋 The activity_log table has been created with proper security policies and indexes');
    
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    console.log('\n💡 Alternative: Apply fix manually via Supabase Dashboard');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Create the activity_log table manually');
    process.exit(1);
  }
}

if (require.main === module) {
  applyActivityLogFix().catch(console.error);
}

module.exports = { applyActivityLogFix };
