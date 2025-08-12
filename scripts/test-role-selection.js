import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🎯 Testing Role Selection System...')
console.log('===================================')

if (!url || !anonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, anonKey)

async function testRoleSelection() {
  try {
    // Test 1: Check current session
    console.log('\n1️⃣ Checking current session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError)
    } else if (session) {
      console.log('✅ Session found:', session.user.email)
      
      // Test 2: Check current role
      console.log('\n2️⃣ Checking current role...')
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, name')
        .eq('id', session.user.id)
        .single()
      
      if (userError) {
        console.error('❌ User query failed:', userError)
        console.log('💡 User needs to select a role')
      } else {
        console.log('✅ User has role:', userData.role)
        console.log('✅ User name:', userData.name)
      }
      
      // Test 3: Test role update functionality
      console.log('\n3️⃣ Testing role update...')
      const testRole = 'supporter' // Test with supporter role
      const { error: updateError } = await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          email: session.user.email || '',
          name: userData?.name || session.user.email?.split('@')[0] || 'User',
          role: testRole
        }, {
          onConflict: 'id'
        })
      
      if (updateError) {
        console.error('❌ Role update failed:', updateError)
      } else {
        console.log('✅ Role updated to:', testRole)
        
        // Test 4: Verify role update
        console.log('\n4️⃣ Verifying role update...')
        const { data: updatedUser, error: verifyError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (verifyError) {
          console.error('❌ Role verification failed:', verifyError)
        } else {
          console.log('✅ Role verified:', updatedUser.role)
        }
      }
      
    } else {
      console.log('ℹ️  No active session - user needs to authenticate')
      console.log('💡 To test the complete flow:')
      console.log('   1. Go to the website and sign in with Google')
      console.log('   2. You should see the role selection modal')
      console.log('   3. Select a role to continue')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testRoleSelection()
