const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('Missing Supabase environment variables')
  console.error('Please check your .env.local file contains:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=...')
  console.error('SUPABASE_SERVICE_ROLE_KEY=...')
  process.exit(1)
}

const supabase = createClient(url, serviceRole)

async function checkUserCreation() {
  console.log('🔍 Checking User Creation Process...')
  console.log('=====================================')
  
  try {
    // Check if there are any users in the auth.users table
    console.log('\n👥 Checking auth.users...')
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        console.log(`❌ Error checking auth.users: ${authError.message}`)
      } else {
        console.log(`✅ Found ${authUsers?.users?.length || 0} users in auth.users`)
        if (authUsers?.users && authUsers.users.length > 0) {
          console.log('   - Sample user:', {
            id: authUsers.users[0].id,
            email: authUsers.users[0].email,
            created_at: authUsers.users[0].created_at
          })
        }
      }
    } catch (err) {
      console.log(`❌ Error checking auth.users: ${err}`)
    }
    
    // Check if there are any users in the public.users table
    console.log('\n👤 Checking public.users...')
    try {
      const { data: publicUsers, error: publicError } = await supabase
        .from('users')
        .select('*')
        .limit(5)
      
      if (publicError) {
        console.log(`❌ Error checking public.users: ${publicError.message}`)
      } else {
        console.log(`✅ Found ${publicUsers?.length || 0} users in public.users`)
        if (publicUsers && publicUsers.length > 0) {
          console.log('   - Sample user:', publicUsers[0])
        }
      }
    } catch (err) {
      console.log(`❌ Error checking public.users: ${err}`)
    }
    
    // Check if there's a mismatch between auth.users and public.users
    console.log('\n🔍 Checking for user creation issues...')
    
    // Try to create a test user record
    console.log('\n🧪 Testing user creation...')
    try {
      const testUserId = '00000000-0000-0000-0000-000000000000'
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert({
          id: testUserId,
          email: 'test@example.com',
          name: 'Test User',
          role: 'veteran'
        })
        .select()
      
      if (insertError) {
        console.log(`❌ User creation test failed: ${insertError.message}`)
        
        // Check if it's a foreign key constraint error
        if (insertError.message.includes('foreign key')) {
          console.log('   - This suggests the user needs to exist in auth.users first')
        }
      } else {
        console.log(`✅ User creation test successful`)
        // Clean up the test record
        await supabase.from('users').delete().eq('id', testUserId)
      }
    } catch (err) {
      console.log(`❌ User creation test error: ${err}`)
    }
    
    // Check if there are any database triggers or functions that might be creating profiles
    console.log('\n🔧 Checking for automatic profile creation...')
    try {
      // Check if there are any triggers on the users table
      const { data: triggers, error: triggerError } = await supabase
        .from('information_schema.triggers')
        .select('*')
        .eq('event_object_table', 'users')
      
      if (triggerError) {
        console.log(`❌ Error checking triggers: ${triggerError.message}`)
      } else {
        console.log(`✅ Found ${triggers?.length || 0} triggers on users table`)
        triggers?.forEach(trigger => {
          console.log(`   - ${trigger.trigger_name}: ${trigger.event_manipulation} ${trigger.event_object_table}`)
        })
      }
    } catch (err) {
      console.log(`❌ Error checking triggers: ${err}`)
    }
    
  } catch (error) {
    console.error('❌ User creation check failed:', error)
  }
}

checkUserCreation()
