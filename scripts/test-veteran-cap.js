#!/usr/bin/env node

/**
 * Test Veteran Cap Functionality
 */

const { createClient } = require('@supabase/supabase-js');

async function testVeteranCap() {
  console.log('🧪 Testing Veteran Cap Functionality...');
  
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
    console.log('\n📊 Testing veteran count function...');
    try {
      const { data: count, error: countError } = await supabase.rpc('veteran_count');
      if (countError) {
        console.log(`⚠️  Veteran count error: ${countError.message}`);
      } else {
        console.log(`✅ Veteran count: ${count}`);
      }
    } catch (e) {
      console.log(`⚠️  Veteran count exception: ${e.message}`);
    }
    
    // Test direct count query
    console.log('\n📊 Testing direct veteran count...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('role')
      .eq('role', 'veteran');
    
    if (profilesError) {
      console.log(`⚠️  Direct count error: ${profilesError.message}`);
    } else {
      console.log(`✅ Direct veteran count: ${profiles?.length || 0}`);
    }
    
    // Test contact messages table
    console.log('\n📝 Testing contact messages table...');
    const { data: contactMessages, error: contactError } = await supabase
      .from('contact_messages')
      .select('*')
      .limit(1);
    
    if (contactError) {
      console.log(`⚠️  Contact messages error: ${contactError.message}`);
    } else {
      console.log(`✅ Contact messages table accessible: ${contactMessages?.length || 0} messages`);
    }
    
    console.log('\n🎉 Veteran Cap Testing completed!');
    
  } catch (error) {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  }
}

testVeteranCap();
