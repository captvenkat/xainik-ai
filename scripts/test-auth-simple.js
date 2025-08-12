import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Environment check:')
console.log('URL:', url ? 'Set' : 'Missing')
console.log('Key:', anonKey ? 'Set' : 'Missing')

if (!url || !anonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, anonKey)

async function testAuth() {
  console.log('\n🔐 Testing Authentication...')
  
  try {
    // Test 1: Check session
    console.log('\n1. Checking session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError)
    } else if (session) {
      console.log('✅ Session found:', session.user.email)
      
      // Test 2: Query users table
      console.log('\n2. Testing users table query...')
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, name')
        .eq('id', session.user.id)
        .single()
      
      if (userError) {
        console.error('❌ Users query failed:', userError)
        console.error('Error code:', userError.code)
        console.error('Error message:', userError.message)
      } else {
        console.log('✅ Users query successful:', userData)
      }
      
    } else {
      console.log('ℹ️  No session found')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testAuth()
