import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔄 Testing Callback Flow...')
console.log('==========================')

if (!url || !anonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, anonKey)

async function testCallbackFlow() {
  try {
    // Test 1: Check if we can create a Supabase client
    console.log('\n1️⃣ Testing Supabase client creation...')
    console.log('✅ Supabase client created successfully')
    
    // Test 2: Check current session
    console.log('\n2️⃣ Checking current session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError)
    } else if (session) {
      console.log('✅ Session found:', session.user.email)
      
      // Test 3: Test user table access
      console.log('\n3️⃣ Testing user table access...')
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      if (userError) {
        console.error('❌ User table access failed:', userError)
        console.log('💡 This might be causing the 500 error in callback')
      } else {
        console.log('✅ User table access successful:', userData)
      }
      
      // Test 4: Test user upsert operation (what the modal does)
      console.log('\n4️⃣ Testing user upsert operation...')
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || 
                 session.user.user_metadata?.name || 
                 session.user.email?.split('@')[0] || 'User',
          role: 'veteran'
        }, {
          onConflict: 'id'
        })
      
      if (upsertError) {
        console.error('❌ User upsert failed:', upsertError)
        console.log('💡 This is likely causing the 500 error')
      } else {
        console.log('✅ User upsert successful')
      }
      
    } else {
      console.log('ℹ️  No active session')
      console.log('💡 To test the callback flow:')
      console.log('   1. Go to the website and sign in with Google')
      console.log('   2. Check the browser console for errors')
      console.log('   3. Look for 500 errors in the network tab')
    }
    
    // Test 5: Check OAuth URL generation
    console.log('\n5️⃣ Testing OAuth URL generation...')
    const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    })
    
    if (oauthError) {
      console.error('❌ OAuth URL generation failed:', oauthError)
    } else {
      console.log('✅ OAuth URL generated successfully')
      console.log('🔗 URL:', oauthData.url)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testCallbackFlow()
