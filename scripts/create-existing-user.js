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

async function createExistingUser() {
  console.log('🔧 Creating Existing User in public.users...')
  console.log('============================================')
  
  try {
    // The existing user ID from auth.users
    const existingUserId = '4c5a525f-77d7-4350-b4e3-eb6459abecdc'
    
    console.log(`👤 Creating user record for ID: ${existingUserId}`)
    
    // Create the user record in public.users
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: existingUserId,
        email: 'venky24aug@gmail.com',
        name: 'Venky', // You can update this name
        role: 'veteran' // Set a default role instead of null
      })
      .select()
    
    if (error) {
      console.log(`❌ Error creating user: ${error.message}`)
      
      // Check if it's a duplicate key error
      if (error.message.includes('duplicate key')) {
        console.log('   - User already exists in public.users')
        
        // Try to get the existing user
        const { data: existingUser, error: getError } = await supabase
          .from('users')
          .select('*')
          .eq('id', existingUserId)
          .single()
        
        if (getError) {
          console.log(`❌ Error getting existing user: ${getError.message}`)
        } else {
          console.log(`✅ Found existing user:`, existingUser)
        }
      }
    } else {
      console.log(`✅ User created successfully:`, data)
    }
    
    // Now test if the profiles view works with this user
    console.log('\n🔍 Testing profiles view with the user...')
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', existingUserId)
      
      if (profilesError) {
        console.log(`❌ Profiles view test failed: ${profilesError.message}`)
      } else {
        console.log(`✅ Profiles view test successful`)
        console.log(`   - Found ${profiles?.length || 0} profiles for this user`)
        if (profiles && profiles.length > 0) {
          console.log(`   - Profile data:`, profiles[0])
        }
      }
    } catch (err) {
      console.log(`❌ Profiles view test error: ${err}`)
    }
    
  } catch (error) {
    console.error('❌ User creation failed:', error)
  }
}

createExistingUser()
