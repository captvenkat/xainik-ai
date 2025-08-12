import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔐 Testing Complete Authentication Flow...')
console.log('==========================================')

if (!url || !anonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, anonKey)

async function testCompleteAuthFlow() {
  try {
    // Test 1: Check current session
    console.log('\n1️⃣ Checking current session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError)
    } else if (session) {
      console.log('✅ Session found:', session.user.email)
      
      // Test 2: Check if user exists in users table
      console.log('\n2️⃣ Checking user in database...')
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, name')
        .eq('id', session.user.id)
        .single()
      
      if (userError) {
        console.error('❌ User query failed:', userError)
        
        // Test 3: Try to create user if they don't exist
        if (userError.code === 'PGRST116') {
          console.log('\n3️⃣ Creating user record...')
          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || 
                     session.user.user_metadata?.name || 
                     session.user.email?.split('@')[0] || 'User',
              role: 'veteran'
            })
          
          if (createError) {
            console.error('❌ User creation failed:', createError)
          } else {
            console.log('✅ User created successfully')
            
            // Test 4: Verify user was created
            console.log('\n4️⃣ Verifying user creation...')
            const { data: newUserData, error: verifyError } = await supabase
              .from('users')
              .select('role, name')
              .eq('id', session.user.id)
              .single()
            
            if (verifyError) {
              console.error('❌ User verification failed:', verifyError)
            } else {
              console.log('✅ User verified:', newUserData)
            }
          }
        }
      } else {
        console.log('✅ User found in database:', userData)
      }
      
    } else {
      console.log('ℹ️  No active session - user needs to authenticate')
      console.log('💡 To test the complete flow:')
      console.log('   1. Go to the website and sign in with Google')
      console.log('   2. Run this test again to verify user creation')
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

testCompleteAuthFlow()
