#!/usr/bin/env node

/**
 * TEST AUTH DEBUG SCRIPT
 * 
 * This script tests the authentication flow to identify
 * where the disconnect is happening.
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, anonKey)

async function testAuthFlow() {
  console.log('🔐 Testing Authentication Flow...')
  console.log('=====================================')
  
  try {
    // Test 1: Check current session
    console.log('\n📡 Test 1: Checking current session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError)
    } else if (session) {
      console.log('✅ User is authenticated:', session.user.email)
      
      // Test 2: Try to query users table
      console.log('\n👥 Test 2: Testing users table query...')
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, name')
        .eq('id', session.user.id)
        .single()
      
      if (userError) {
        console.error('❌ Users table query failed:', userError)
        console.error('Error details:', {
          code: userError.code,
          message: userError.message,
          details: userError.details,
          hint: userError.hint
        })
      } else {
        console.log('✅ Users table query successful:', userData)
      }
      
      // Test 3: Try to query users table with different approach
      console.log('\n🔍 Test 3: Testing users table with count...')
      const { data: countData, error: countError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (countError) {
        console.error('❌ Users count query failed:', countError)
      } else {
        console.log('✅ Users count query successful:', countData)
      }
      
    } else {
      console.log('ℹ️  No active session')
    }
    
    // Test 4: Check OAuth providers
    console.log('\n🔗 Test 4: OAuth providers check skipped (method not available)')
    console.log('ℹ️  OAuth providers are configured in Supabase dashboard')
    
    // Test 5: Test OAuth sign-in URL generation
    console.log('\n🌐 Test 5: Testing OAuth URL generation...')
    const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3001/auth/callback',
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    })
    
    if (oauthError) {
      console.error('❌ OAuth URL generation failed:', oauthError)
    } else {
      console.log('✅ OAuth URL generated successfully')
      console.log('🔗 URL:', oauthData.url)
    }
    
    // Test 6: Check environment variables
    console.log('\n⚙️  Test 6: Environment variables check...')
    console.log('Site URL:', process.env.NEXT_PUBLIC_SITE_URL)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Key (first 10 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10))
    
  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

testAuthFlow()
