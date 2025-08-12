import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, anonKey)

async function checkDatabaseSchema() {
  console.log('🔍 Checking Database Schema...')
  
  try {
    // Test 1: Check if users table exists and get its structure
    console.log('\n1. Checking users table...')
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.error('❌ Users table error:', usersError)
      console.error('Error code:', usersError.code)
      console.error('Error message:', usersError.message)
    } else {
      console.log('✅ Users table accessible')
      if (usersData && usersData.length > 0) {
        console.log('Sample user data:', Object.keys(usersData[0]))
      }
    }
    
    // Test 2: Check if profiles table exists (compatibility)
    console.log('\n2. Checking profiles table...')
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError)
    } else {
      console.log('✅ Profiles table accessible')
      if (profilesData && profilesData.length > 0) {
        console.log('Sample profile data:', Object.keys(profilesData[0]))
      }
    }
    
    // Test 3: Check RLS policies
    console.log('\n3. Testing RLS policies...')
    const { data: rlsTest, error: rlsError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (rlsError) {
      console.error('❌ RLS test failed:', rlsError)
    } else {
      console.log('✅ RLS policies allow basic access')
    }
    
    // Test 4: Check specific user query (this is what's failing in the browser)
    console.log('\n4. Testing specific user query...')
    const testUserId = '4c5a525f-77d7-4350-b4e3-eb6459abecdc' // From the error
    const { data: specificUser, error: specificError } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', testUserId)
      .single()
    
    if (specificError) {
      console.error('❌ Specific user query failed:', specificError)
      console.error('Error code:', specificError.code)
      console.error('Error message:', specificError.message)
      console.error('Error details:', specificError.details)
      console.error('Error hint:', specificError.hint)
    } else {
      console.log('✅ Specific user query successful:', specificUser)
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error)
  }
}

checkDatabaseSchema()
