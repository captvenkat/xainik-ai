#!/usr/bin/env node

/**
 * DEBUG AUTH FLOW SCRIPT
 * 
 * This script helps debug the authentication flow to see why users
 * are being redirected to homepage instead of role-aware dashboards.
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

async function debugAuthFlow() {
  console.log('🔍 DEBUGGING AUTH FLOW');
  console.log('=' .repeat(50));
  
  try {
    // 1. Check current auth state
    console.log('\n1️⃣ Checking current auth state...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
      return;
    }
    
    if (!user) {
      console.log('❌ No authenticated user found');
      console.log('💡 Try signing in first, then run this script again');
      return;
    }
    
    console.log('✅ User authenticated:', user.email);
    console.log('   User ID:', user.id);
    
    // 2. Check if user exists in public.users table
    console.log('\n2️⃣ Checking public.users table...');
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userError) {
      console.log('❌ Error fetching user record:', userError.message);
      console.log('   Error code:', userError.code);
      
      if (userError.code === 'PGRST116') {
        console.log('💡 User record not found in public.users table');
        console.log('   This means the auth callback didn\'t create the user record');
      }
      return;
    }
    
    console.log('✅ User record found in public.users:');
    console.log('   Role:', userRecord.role);
    console.log('   Name:', userRecord.name);
    console.log('   Email:', userRecord.email);
    console.log('   Created:', userRecord.created_at);
    
    // 3. Check role-specific profile
    if (userRecord.role) {
      console.log('\n3️⃣ Checking role-specific profile...');
      
      let profileTable = '';
      switch (userRecord.role) {
        case 'veteran':
          profileTable = 'veterans';
          break;
        case 'recruiter':
          profileTable = 'recruiters';
          break;
        case 'supporter':
          profileTable = 'supporters';
          break;
        default:
          console.log('❌ Unknown role:', userRecord.role);
          return;
      }
      
      const { data: profile, error: profileError } = await supabase
        .from(profileTable)
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) {
        console.log('❌ Error fetching profile:', profileError.message);
        console.log('   Error code:', profileError.code);
        
        if (profileError.code === 'PGRST116') {
          console.log('💡 Profile not found in', profileTable, 'table');
          console.log('   User needs to complete profile setup');
        }
      } else {
        console.log('✅ Profile found in', profileTable, 'table:');
        console.log('   Profile data:', profile);
      }
    } else {
      console.log('\n3️⃣ User has no role assigned');
      console.log('💡 User needs to select a role');
    }
    
    // 4. Test RLS policies
    console.log('\n4️⃣ Testing RLS policies...');
    
    // Test if user can read their own user record
    const { data: ownUser, error: ownUserError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (ownUserError) {
      console.log('❌ RLS issue: Cannot read own user record');
      console.log('   Error:', ownUserError.message);
    } else {
      console.log('✅ RLS working: Can read own user record');
    }
    
    // 5. Test dashboard access
    if (userRecord.role) {
      console.log('\n5️⃣ Testing dashboard access...');
      console.log('   Expected dashboard URL: /dashboard/' + userRecord.role);
      
      // Test if user can access role-specific data
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
          console.log('❌ RLS issue: Cannot access', testTable);
          console.log('   Error:', testError.message);
        } else {
          console.log('✅ RLS working: Can access', testTable);
          console.log('   Records found:', testData.length);
        }
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 DEBUG SUMMARY');
    console.log('='.repeat(50));
    
    if (!userRecord.role) {
      console.log('❌ ISSUE: User has no role assigned');
      console.log('💡 SOLUTION: User needs to select a role on /auth page');
    } else if (userRecord.role) {
      console.log('✅ User has role:', userRecord.role);
      console.log('💡 Should redirect to: /dashboard/' + userRecord.role);
      console.log('💡 Check browser console for redirect errors');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run debug
debugAuthFlow().catch(err => {
  console.error('❌ Debug failed:', err.message);
  process.exit(1);
});
