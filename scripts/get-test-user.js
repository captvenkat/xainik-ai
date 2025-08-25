const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, serviceRole)

async function getTestUser() {
  console.log('🔍 Getting Test User Credentials...')
  console.log('==================================')
  
  const testEmail = 'test-veteran@xainik.com'
  const testPassword = 'TestPassword123!'
  
  try {
    // Get the existing user
    const { data: existingUser, error: getError } = await supabase.auth.admin.listUsers()
    
    // Find the user by email
    const user = existingUser?.users?.find(u => u.email === testEmail)
    
    if (getError) {
      console.log(`❌ Error getting user: ${getError.message}`)
      return
    }
    
    if (user) {
      console.log(`✅ Found existing auth user:`, user.id)
      
      // Check if user exists in public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (userError) {
        console.log(`❌ User not found in public.users: ${userError.message}`)
      } else {
        console.log(`✅ User found in public.users:`, userData.name)
      }
      
      console.log('\n🎉 Test User Credentials:')
      console.log('========================')
      console.log(`📧 Email: ${testEmail}`)
      console.log(`🔑 Password: ${testPassword}`)
              console.log(`🆔 User ID: ${user.id}`)
      console.log('\n🔗 Login URLs:')
      console.log(`   - Auth page: http://localhost:3001/auth`)
      console.log(`   - Main dashboard: http://localhost:3001/dashboard/veteran`)
      console.log(`   - Unified Progress: http://localhost:3001/dashboard/veteran/unified-progress`)
      console.log('\n💡 Note: Use these credentials to test the Unified Progress Dashboard!')
      
    } else {
      console.log('❌ No user found with that email')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

getTestUser()
