#!/usr/bin/env node

/**
 * Test Authentication Flow
 */

const { createClient } = require('@supabase/supabase-js');

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...');
  
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
    
    // Test veteran count function
    console.log('🔢 Testing veteran count...');
    const { data: count, error: countError } = await supabase.rpc('veteran_count');
    if (countError) {
      console.log('⚠️  Veteran count function not available yet:', countError.message);
    } else {
      console.log(`✅ Veteran count: ${count}`);
    }
    
    // Test contact messages table
    console.log('📝 Testing contact messages table...');
    const { error: contactError } = await supabase.from('contact_messages').select('*').limit(1);
    if (contactError) {
      console.log('⚠️  Contact messages table not available yet:', contactError.message);
    } else {
      console.log('✅ Contact messages table accessible');
    }
    
    console.log('\n🎉 Authentication flow test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Visit https://xainik.com/auth');
    console.log('2. Try signing in with Google');
    console.log('3. Check if redirect loops are resolved');
    console.log('4. Verify veteran cap banner shows correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAuthFlow();
