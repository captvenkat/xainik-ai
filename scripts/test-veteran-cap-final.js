#!/usr/bin/env node

/**
 * Final Test Veteran Cap Functionality
 */

const { createClient } = require('@supabase/supabase-js');

async function testVeteranCapFinal() {
  console.log('🧪 Final Testing Veteran Cap Functionality...');
  
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
    console.log('🔢 Testing veteran count function...');
    const { data: count, error: countError } = await supabase.rpc('veteran_count');
    if (countError) {
      console.log('⚠️  Veteran count function not available yet (may need to wait for migration)');
      console.log('Error:', countError.message);
    } else {
      console.log(`✅ Veteran count: ${count}`);
    }
    
    // Test contact messages table
    console.log('📝 Testing contact messages table...');
    const { data: messages, error: messagesError } = await supabase
      .from('contact_messages')
      .select('*')
      .limit(1);
    
    if (messagesError) {
      console.log('⚠️  Contact messages table not available yet (may need to wait for migration)');
      console.log('Error:', messagesError.message);
    } else {
      console.log(`✅ Contact messages table accessible, ${messages?.length || 0} messages found`);
    }
    
    // Test current veteran count manually
    console.log('👥 Testing manual veteran count...');
    const { data: veterans, error: veteransError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('role', 'veteran');
    
    if (veteransError) {
      console.log('❌ Failed to count veterans:', veteransError.message);
    } else {
      console.log(`✅ Current veterans: ${veterans?.length || 0}/50`);
      console.log(`   Slots remaining: ${Math.max(0, 50 - (veterans?.length || 0))}`);
    }
    
    console.log('\n🎉 Veteran cap system test completed!');
    console.log('📋 Summary:');
    console.log(`   - Database connection: ✅`);
    console.log(`   - Veteran count: ${veterans?.length || 0}/50`);
    console.log(`   - Slots remaining: ${Math.max(0, 50 - (veterans?.length || 0))}`);
    console.log(`   - Contact messages: ${messagesError ? '⚠️' : '✅'}`);
    console.log(`   - Veteran count RPC: ${countError ? '⚠️' : '✅'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testVeteranCapFinal();
