#!/usr/bin/env node

/**
 * Delete All Users - Fresh Start
 */

const { createClient } = require('@supabase/supabase-js');

async function deleteAllUsers() {
  console.log('🗑️  Deleting All Users - Fresh Start...');
  
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
    
    // Get current user count
    console.log('📊 Getting current user count...');
    const { data: profiles, error: countError } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false });
    
    if (countError) throw new Error(`Failed to get profiles: ${countError.message}`);
    
    console.log(`📈 Found ${profiles.length} users:`);
    profiles.forEach((profile, index) => {
      console.log(`  ${index + 1}. ${profile.email} (${profile.role}) - ${profile.created_at}`);
    });
    
    if (profiles.length === 0) {
      console.log('✅ No users to delete - already clean!');
      return;
    }
    
    // Confirm deletion
    console.log('\n⚠️  WARNING: This will permanently delete ALL users!');
    console.log('This action cannot be undone.');
    
    // For safety, require confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise((resolve) => {
      rl.question('Type "DELETE ALL" to confirm: ', resolve);
    });
    rl.close();
    
    if (answer !== 'DELETE ALL') {
      console.log('❌ Deletion cancelled');
      return;
    }
    
    console.log('\n🗑️  Deleting all users...');
    
    // Delete all profiles
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Safety check
    
    if (deleteError) throw new Error(`Failed to delete profiles: ${deleteError.message}`);
    
    console.log('✅ All profiles deleted successfully');
    
    // Verify deletion
    console.log('🔍 Verifying deletion...');
    const { data: remainingProfiles, error: verifyError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (verifyError) throw new Error(`Failed to verify: ${verifyError.message}`);
    
    if (remainingProfiles.length === 0) {
      console.log('✅ Verification successful - no users remaining');
    } else {
      console.log(`⚠️  Warning: ${remainingProfiles.length} users still exist`);
    }
    
    // Test veteran count
    console.log('🔢 Testing veteran count...');
    const { data: count, error: countError2 } = await supabase.rpc('veteran_count');
    if (countError2) {
      console.log('⚠️  Veteran count function error:', countError2.message);
    } else {
      console.log(`✅ Veteran count: ${count} (should be 0)`);
    }
    
    console.log('\n🎉 Fresh start completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Visit https://xainik.com/auth');
    console.log('2. Sign up as the first veteran');
    console.log('3. All 50 slots are now available');
    
  } catch (error) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  }
}

deleteAllUsers();
