#!/usr/bin/env node

/**
 * TEST SESSION FLOW SCRIPT
 * 
 * This script tests the authentication session flow to identify
 * where the disconnect is happening between auth and client.
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

async function testSessionFlow() {
  console.log('🧪 TESTING SESSION FLOW');
  console.log('=' .repeat(50));
  
  try {
    // 1. Check current session
    console.log('\n1️⃣ Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
      return;
    }
    
    if (session) {
      console.log('✅ Session found:');
      console.log('   User ID:', session.user.id);
      console.log('   User Email:', session.user.email);
      console.log('   Access Token:', session.access_token ? 'Present' : 'Missing');
      console.log('   Refresh Token:', session.refresh_token ? 'Present' : 'Missing');
      console.log('   Expires At:', session.expires_at);
      console.log('   Token Type:', session.token_type);
    } else {
      console.log('❌ No session found');
    }
    
    // 2. Check current user
    console.log('\n2️⃣ Checking current user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ User error:', userError.message);
      return;
    }
    
    if (user) {
      console.log('✅ User found:');
      console.log('   User ID:', user.id);
      console.log('   User Email:', user.email);
      console.log('   Email Confirmed:', user.email_confirmed_at ? 'Yes' : 'No');
      console.log('   Phone Confirmed:', user.phone_confirmed_at ? 'Yes' : 'No');
      console.log('   Last Sign In:', user.last_sign_in_at);
      console.log('   Created At:', user.created_at);
      console.log('   Updated At:', user.updated_at);
    } else {
      console.log('❌ No user found');
    }
    
    // 3. Check auth state
    console.log('\n3️⃣ Checking auth state...');
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else if (authUser) {
      console.log('✅ Auth user found:', authUser.email);
    } else {
      console.log('❌ No auth user found');
    }
    
    // 4. Test database access
    if (user) {
      console.log('\n4️⃣ Testing database access...');
      
      try {
        const { data: userRecord, error: dbError } = await supabase
          .from('users')
          .select('role, name, created_at')
          .eq('id', user.id)
          .single();
        
        if (dbError) {
          console.log('❌ Database access error:', dbError.message);
          console.log('   Error code:', dbError.code);
          
          if (dbError.code === 'PGRST116') {
            console.log('💡 User record not found in database');
          } else if (dbError.code === 'PGRST301') {
            console.log('💡 RLS policy blocking access');
          }
        } else {
          console.log('✅ Database access successful:');
          console.log('   Role:', userRecord.role);
          console.log('   Name:', userRecord.name);
          console.log('   Created:', userRecord.created_at);
        }
      } catch (err) {
        console.log('❌ Database test failed:', err.message);
      }
    }
    
    // 5. Check for common issues
    console.log('\n5️⃣ Checking for common issues...');
    
    if (!session && !user) {
      console.log('💡 Issue: No session and no user');
      console.log('   - User might not be signed in');
      console.log('   - Session might have expired');
      console.log('   - Auth callback might have failed');
    } else if (session && !user) {
      console.log('💡 Issue: Session exists but no user');
      console.log('   - Session might be corrupted');
      console.log('   - User data might be missing');
    } else if (session && user) {
      console.log('💡 Issue: Session and user exist but auth page shows no user');
      console.log('   - Client-side session detection issue');
      console.log('   - Component mounting before session is ready');
      console.log('   - Race condition in useEffect');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 SESSION FLOW SUMMARY');
    console.log('='.repeat(50));
    
    if (session && user) {
      console.log('✅ Session and user both exist');
      console.log('💡 The issue is likely in the React component timing');
      console.log('💡 Try adding a delay before checking auth in useEffect');
    } else if (session && !user) {
      console.log('⚠️  Session exists but no user');
      console.log('💡 Session might be corrupted or expired');
    } else if (!session && !user) {
      console.log('❌ No session and no user');
      console.log('💡 User needs to sign in again');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testSessionFlow().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
