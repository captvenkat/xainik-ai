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
    } else {
      console.log('ℹ️  No active session')
    }
    
    // Test 2: Check OAuth providers
    console.log('\n🔗 Test 2: Checking OAuth providers...')
    const { data: { providers }, error: providersError } = await supabase.auth.listIdentities()
    
    if (providersError) {
      console.error('❌ Providers check failed:', providersError)
    } else {
      console.log('✅ Available providers:', providers?.length || 0)
    }
    
    // Test 3: Test OAuth sign-in URL generation
    console.log('\n🌐 Test 3: Testing OAuth URL generation...')
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
    
    // Test 4: Check environment variables
    console.log('\n⚙️  Test 4: Environment variables check...')
    console.log('Site URL:', process.env.NEXT_PUBLIC_SITE_URL)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Key (first 10 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...')
    
    // Test 5: Check database connection for auth
    console.log('\n🗄️  Test 5: Database auth connection...')
    const { data: authData, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('❌ Auth user check failed:', authError)
    } else {
      console.log('✅ Auth connection successful')
      console.log('User:', authData.user ? 'Found' : 'None')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testAuthFlow()
