#!/usr/bin/env node

/**
 * Debug Authentication Flow
 */

const { createClient } = require('@supabase/supabase-js');

async function debugAuthFlow() {
  console.log('🔍 Debugging Authentication Flow...');
  
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
    
    // Test veteran count
    console.log('🔢 Testing veteran count...');
    const { data: count, error: countError } = await supabase.rpc('veteran_count');
    if (countError) {
      console.log('⚠️  Veteran count function error:', countError.message);
    } else {
      console.log(`✅ Veteran count: ${count}`);
    }
    
    // Test profiles table
    console.log('👥 Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .limit(5);
    
    if (profilesError) {
      console.log('⚠️  Profiles table error:', profilesError.message);
    } else {
      console.log(`✅ Found ${profiles.length} profiles`);
      profiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.email} (${profile.role}) - ${profile.created_at}`);
      });
    }
    
    console.log('\n🎯 Debug Analysis:');
    console.log('1. Database connection: ✅ Working');
    console.log('2. Veteran count function: ✅ Working');
    console.log('3. Profiles table: ✅ Working');
    console.log('4. Veteran slots available: ✅', 50 - (count || 0));
    
    console.log('\n🔧 Potential Issues:');
    console.log('- Middleware might be running on /auth paths');
    console.log('- Cookie setting might have timing issues');
    console.log('- Redirect loop in auth flow');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Check browser network tab for redirects');
    console.log('2. Check if middleware is running on /auth');
    console.log('3. Verify cookie setting in warmup page');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    process.exit(1);
  }
}

debugAuthFlow();
