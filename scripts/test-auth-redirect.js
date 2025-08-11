#!/usr/bin/env node

/**
 * TEST AUTH REDIRECT SCRIPT
 * 
 * This script simulates the authentication flow to test redirects
 * and identify where users are being sent to homepage instead of dashboard.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuthRedirect() {
  console.log('🧪 TESTING AUTH REDIRECT FLOW');
  console.log('=' .repeat(50));
  
  try {
    // 1. Check if user is authenticated
    console.log('\n1️⃣ Checking authentication status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
      return;
    }
    
    if (!user) {
      console.log('❌ No authenticated user found');
      console.log('💡 Please sign in first, then run this script');
      return;
    }
    
    console.log('✅ User authenticated:', user.email);
    console.log('   User ID:', user.id);
    
    // 2. Check user role
    console.log('\n2️⃣ Checking user role...');
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (userError) {
      console.log('❌ Error fetching user role:', userError.message);
      return;
    }
    
    console.log('📋 User role:', userRecord.role);
    
    // 3. Simulate the redirect logic
    console.log('\n3️⃣ Simulating redirect logic...');
    
    if (!userRecord.role) {
      console.log('🔄 User has no role - should redirect to /auth for role selection');
      console.log('💡 Expected behavior: Show role selection page');
    } else {
      console.log('✅ User has role - should redirect to dashboard');
      console.log('💡 Expected redirect: /dashboard/' + userRecord.role);
      
      // 4. Test if dashboard route exists
      console.log('\n4️⃣ Testing dashboard access...');
      const dashboardUrl = `/dashboard/${userRecord.role}`;
      console.log('   Testing URL:', dashboardUrl);
      
      // This would normally be a Next.js route test
      // For now, just check if the user can access role-specific data
      let testTable = '';
      switch (userRecord.role) {
        case 'veteran':
          testTable = 'pitches';
          break;
        case 'recruiter':
          testTable = 'recruiter_notes';
          break;
        case 'supporter':
          testTable = 'referrals';
          break;
      }
      
      if (testTable) {
        const { data: testData, error: testError } = await supabase
          .from(testTable)
          .select('*')
          .limit(1);
        
        if (testError) {
          console.log('❌ Cannot access', testTable, ':', testError.message);
          console.log('💡 This might be an RLS policy issue');
        } else {
          console.log('✅ Can access', testTable, 'table');
          console.log('   Records found:', testData.length);
        }
      }
    }
    
    // 5. Check for any redirect loops
    console.log('\n5️⃣ Checking for redirect issues...');
    console.log('💡 Common issues:');
    console.log('   - User has role but gets redirected to homepage');
    console.log('   - Role selection doesn\'t persist');
    console.log('   - RLS policies blocking access');
    console.log('   - Middleware interfering with redirects');
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 TEST SUMMARY');
    console.log('='.repeat(50));
    
    if (!userRecord.role) {
      console.log('❌ ISSUE: User has no role assigned');
      console.log('💡 SOLUTION: Complete role selection on /auth page');
    } else {
      console.log('✅ User has role:', userRecord.role);
      console.log('💡 Should access: /dashboard/' + userRecord.role);
      console.log('💡 If still going to homepage, check:');
      console.log('   1. Browser console for errors');
      console.log('   2. Network tab for redirects');
      console.log('   3. RLS policies in Supabase');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testAuthRedirect().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
