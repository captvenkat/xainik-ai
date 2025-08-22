const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('Missing Supabase environment variables')
  console.error('Please check your .env.local file contains:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=...')
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here')
  process.exit(1)
}

const supabase = createClient(url, serviceRole)

async function createRecruiterUser() {
  console.log('🔧 Creating Recruiter User...')
  console.log('============================')
  
  try {
    // The user ID from the error logs
    const userId = '151d25b6-d70b-495b-b21d-4b44efb47acd'
    
    console.log(`👤 Creating user record for ID: ${userId}`)
    
    // Create the user record in public.users
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: 'test@example.com', // You can update this
        name: 'Test Recruiter',
        role: 'recruiter'
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
          .eq('id', userId)
          .single()
        
        if (getError) {
          console.log(`❌ Error getting existing user: ${getError.message}`)
        } else {
          console.log(`✅ Found existing user:`, existingUser)
          
          // Update the role to recruiter if needed
          if (existingUser.role !== 'recruiter') {
            const { data: updatedUser, error: updateError } = await supabase
              .from('users')
              .update({ role: 'recruiter' })
              .eq('id', userId)
              .select()
              .single()
            
            if (updateError) {
              console.log(`❌ Error updating user role: ${updateError.message}`)
            } else {
              console.log(`✅ Updated user role to recruiter:`, updatedUser)
            }
          }
        }
      }
    } else {
      console.log(`✅ User created successfully:`, data)
    }
    
    // Now create the recruiter profile
    console.log('\n🏢 Creating recruiter profile...')
    const { data: recruiterData, error: recruiterError } = await supabase
      .from('recruiters')
      .insert({
        user_id: userId,
        company_name: '',
        industry: ''
      })
      .select()
    
    if (recruiterError) {
      console.log(`❌ Error creating recruiter profile: ${recruiterError.message}`)
      
      if (recruiterError.message.includes('duplicate key')) {
        console.log('   - Recruiter profile already exists')
      }
    } else {
      console.log(`✅ Recruiter profile created successfully:`, recruiterData)
    }
    
    console.log('\n🎉 Setup complete! The recruiter dashboard should now work.')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createRecruiterUser()
