import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔒 Checking RLS Policies...')
console.log('==========================')

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

async function checkRLSPolicies() {
  try {
    // Test 1: Check if we can access the users table with service role
    console.log('\n1️⃣ Testing users table access with service role...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.error('❌ Users table access failed:', usersError)
    } else {
      console.log('✅ Users table accessible with service role')
    }
    
    // Test 2: Try to create a user record with service role
    console.log('\n2️⃣ Testing user creation with service role...')
    const testUserId = '713e1683-8089-4dfc-ac29-b0f1b2d6c787'
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .upsert({
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'veteran'
      }, {
        onConflict: 'id'
      })
      .select()
    
    if (createError) {
      console.error('❌ User creation failed:', createError)
    } else {
      console.log('✅ User created successfully:', newUser)
    }
    
    // Test 3: Check current RLS policies
    console.log('\n3️⃣ Checking current RLS policies...')
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.policies')
      .select('*')
      .eq('table_name', 'users')
    
    if (policiesError) {
      console.error('❌ Failed to check policies:', policiesError)
    } else {
      console.log('✅ Current policies for users table:')
      policies?.forEach(policy => {
        console.log(`   - ${policy.policy_name}: ${policy.cmd} ${policy.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'}`)
      })
    }
    
    // Test 4: Test user query with the created user
    console.log('\n4️⃣ Testing user query...')
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
    
  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

checkRLSPolicies()
