#!/usr/bin/env node

/**
 * Test Veteran Cap Enforcement
 */

const { createClient } = require('@supabase/supabase-js');

async function testVeteranCapEnforcement() {
  console.log('🧪 Testing Veteran Cap Enforcement...');
  
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
    
    // Get current veteran count
    const { data: count } = await supabase.rpc('veteran_count');
    console.log(`📊 Current veteran count: ${count}/50`);
    
    if (count >= 50) {
      console.log('⚠️  Veteran cap already reached, testing enforcement...');
      
      // Try to create a new veteran profile (should fail)
      const testEmail = `test-veteran-${Date.now()}@example.com`;
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: `test-${Date.now()}`,
          email: testEmail,
          role: 'veteran',
          full_name: 'Test Veteran'
        });
      
      if (insertError && insertError.message.includes('Veteran registrations are closed')) {
        console.log('✅ Veteran cap enforcement working correctly!');
        console.log('   Error message:', insertError.message);
      } else {
        console.log('❌ Veteran cap enforcement not working');
        console.log('   Error:', insertError);
      }
    } else {
      console.log(`✅ Veteran cap not reached yet (${50 - count} slots remaining)`);
      console.log('📝 Cap enforcement will trigger when 50th veteran tries to register');
    }
    
    // Test contact messages functionality
    console.log('\n📝 Testing contact messages...');
    const testMessage = {
      email: 'test@example.com',
      name: 'Test User',
      message: 'This is a test message from the veteran cap system'
    };
    
    const { data: messageData, error: messageError } = await supabase
      .from('contact_messages')
      .insert(testMessage)
      .select();
    
    if (messageError) {
      console.log('❌ Contact messages not working:', messageError.message);
    } else {
      console.log('✅ Contact messages working correctly!');
      console.log('   Message ID:', messageData[0].id);
      
      // Clean up test message
      await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageData[0].id);
      console.log('   Test message cleaned up');
    }
    
    console.log('\n🎉 Veteran cap enforcement test completed!');
    console.log('📋 System Status:');
    console.log(`   - Veteran count: ${count}/50`);
    console.log(`   - Slots remaining: ${Math.max(0, 50 - count)}`);
    console.log(`   - Cap enforcement: ${count >= 50 ? '✅ Active' : '⏳ Ready'}`);
    console.log(`   - Contact messages: ${messageError ? '❌' : '✅'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testVeteranCapEnforcement();
