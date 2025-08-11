#!/usr/bin/env node

/**
 * TEST AUTH DEBUG SCRIPT
 * 
 * This script tests the authentication flow to identify
 * where the disconnect is happening.
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

async function testAuthDebug() {
  console.log('🧪 TESTING AUTH DEBUG FLOW');
  console.log('=' .repeat(50));
  
  try {
    // 1. Check if we can connect to Supabase
    console.log('\n1️⃣ Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    
    // 2. Check current session
    console.log('\n2️⃣ Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (session) {
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
    
    // 3. Check current user
    console.log('\n3️⃣ Checking current user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ User error:', userError.message);
    } else if (user) {
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
    
    // 4. Test auth state change subscription
    console.log('\n4️⃣ Testing auth state change subscription...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state change event:', event);
      if (session?.user) {
        console.log('   User in event:', session.user.email);
      } else {
        console.log('   No user in event');
      }
    });
    
    // Wait a bit to see if any events fire
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Cleanup subscription
    subscription.unsubscribe();
    
    // 5. Test database access if user exists
    if (user) {
      console.log('\n5️⃣ Testing database access...');
      
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
    
    // 6. Summary and recommendations
    console.log('\n' + '='.repeat(50));
    console.log('🎯 AUTH DEBUG SUMMARY');
    console.log('='.repeat(50));
    
    if (session && user) {
      console.log('✅ Session and user both exist');
      console.log('💡 The issue is likely in the React component');
      console.log('💡 Check browser console for the debug logs we added');
    } else if (session && !user) {
      console.log('⚠️  Session exists but no user');
      console.log('💡 Session might be corrupted or expired');
    } else if (!session && !user) {
      console.log('❌ No session and no user');
      console.log('💡 User needs to sign in again');
      console.log('💡 Check if OAuth callback is working');
    }
    
    console.log('\n🔍 Next steps:');
    console.log('1. Check browser console for debug logs');
    console.log('2. Look for "AuthPage wrapper rendered" message');
    console.log('3. Check for "useEffect triggered" message');
    console.log('4. Look for session check attempts');
    console.log('5. Check for any error messages');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testAuthDebug().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
