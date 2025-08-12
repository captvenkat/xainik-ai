import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔓 Temporarily Disabling RLS...')
console.log('===============================')

if (!url || !serviceRole) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, serviceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function disableRLSTemporarily() {
  try {
    // Test 1: Check if we can access the users table
    console.log('\n1️⃣ Testing users table access...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.error('❌ Users table access failed:', usersError)
    } else {
      console.log('✅ Users table accessible')
    }
    
    // Test 2: Try to create a user record for the failing user
    console.log('\n2️⃣ Creating user record for failing user...')
    const testUserId = '713e1683-8089-4dfc-ac29-b0f1b2d6c787'
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .upsert({
        id: testUserId,
        email: 'venkat@example.com',
        name: 'Captain Venkat',
        role: 'veteran'
      }, {
        onConflict: 'id'
      })
      .select()
    
    if (createError) {
      console.error('❌ User creation failed:', createError)
    } else {
      console.log('✅ User created/updated successfully:', newUser)
    }
    
    // Test 3: Test user query
    console.log('\n3️⃣ Testing user query...')
    const { data: userData, error: queryError } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', testUserId)
      .single()
    
    if (queryError) {
      console.error('❌ User query failed:', queryError)
    } else {
      console.log('✅ User query successful:', userData)
    }
    
    // Test 4: Test with anon key (simulating client-side access)
    console.log('\n4️⃣ Testing with anon key...')
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (anonKey) {
      const anonSupabase = createClient(url, anonKey)
      
      const { data: anonUserData, error: anonQueryError } = await anonSupabase
        .from('users')
        .select('role, name')
        .eq('id', testUserId)
        .single()
      
      if (anonQueryError) {
        console.error('❌ Anon key query failed:', anonQueryError)
        console.log('💡 This confirms RLS is blocking access')
      } else {
        console.log('✅ Anon key query successful:', anonUserData)
      }
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

disableRLSTemporarily()
