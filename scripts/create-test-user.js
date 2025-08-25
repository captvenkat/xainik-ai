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

async function createTestUser() {
  console.log('🔧 Creating Test User for Unified Progress Dashboard...')
  console.log('=====================================================')
  
  try {
    // Create a test user in auth.users first
    const testEmail = 'test-veteran@xainik.com'
    const testPassword = 'TestPassword123!'
    
    console.log(`👤 Creating auth user: ${testEmail}`)
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Test Veteran',
        role: 'veteran'
      }
    })
    
    if (authError) {
      console.log(`❌ Auth user creation failed: ${authError.message}`)
      
      // Check if user already exists
      if (authError.message.includes('already registered')) {
        console.log('   - User already exists in auth.users')
        
        // Try to get the existing user
        const { data: existingUser, error: getError } = await supabase.auth.admin.getUserByEmail(testEmail)
        
        if (getError) {
          console.log(`❌ Error getting existing user: ${getError.message}`)
        } else {
          console.log(`✅ Found existing auth user:`, existingUser.user.id)
          authData = { user: existingUser.user }
        }
      }
    } else {
      console.log(`✅ Auth user created successfully:`, authData.user.id)
    }
    
    // Ensure we have authData
    if (!authData && authError?.message?.includes('already registered')) {
      const { data: existingUser, error: getError } = await supabase.auth.admin.getUserByEmail(testEmail)
      if (!getError && existingUser?.user) {
        authData = { user: existingUser.user }
        console.log(`✅ Retrieved existing auth user:`, authData.user.id)
      }
    }
    
    if (authData?.user?.id) {
      // Create the user record in public.users
      console.log(`👤 Creating user record in public.users...`)
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: testEmail,
          name: 'Test Veteran',
          role: 'veteran'
        })
        .select()
      
      if (userError) {
        console.log(`❌ User record creation failed: ${userError.message}`)
        
        if (userError.message.includes('duplicate key')) {
          console.log('   - User record already exists in public.users')
        }
      } else {
        console.log(`✅ User record created successfully:`, userData)
      }
      
      // Create veteran profile
      console.log(`👤 Creating veteran profile...`)
      
      const { data: veteranData, error: veteranError } = await supabase
        .from('veterans')
        .insert({
          user_id: authData.user.id,
          rank: 'Major',
          service_branch: 'Indian Army',
          years_experience: 15,
          location_current: 'Mumbai, India',
          locations_preferred: ['Mumbai, India', 'Delhi, India', 'Bengaluru, India']
        })
        .select()
      
      if (veteranError) {
        console.log(`❌ Veteran profile creation failed: ${veteranError.message}`)
        
        if (veteranError.message.includes('duplicate key')) {
          console.log('   - Veteran profile already exists')
        }
      } else {
        console.log(`✅ Veteran profile created successfully:`, veteranData)
      }
      
      // Create a test pitch
      console.log(`📝 Creating test pitch...`)
      
      const { data: pitchData, error: pitchError } = await supabase
        .from('pitches')
        .insert({
          veteran_id: authData.user.id,
          title: 'Experienced Military Leader Seeking Leadership Role',
          pitch_text: 'Retired Major with 15 years of military leadership experience. Expert in strategic planning, team management, and crisis response. Seeking leadership opportunities in corporate sector.',
          skills: ['Leadership', 'Strategic Planning', 'Team Management', 'Crisis Response', 'Operations Management'],
          job_type: 'Full-time',
          location: 'Mumbai, India',
          availability: 'Immediate',
          phone: '+91XXXXXXXXXX',
          is_active: true,
          plan_tier: 'premium',
          plan_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
          likes_count: 0
        })
        .select()
      
      if (pitchError) {
        console.log(`❌ Pitch creation failed: ${pitchError.message}`)
      } else {
        console.log(`✅ Test pitch created successfully:`, pitchData)
      }
      
      console.log('\n🎉 Test User Setup Complete!')
      console.log('============================')
      console.log(`📧 Email: ${testEmail}`)
      console.log(`🔑 Password: ${testPassword}`)
      console.log(`🆔 User ID: ${authData.user.id}`)
      console.log('\n🔗 Login URLs:')
      console.log(`   - Auth page: http://localhost:3001/auth`)
      console.log(`   - Main dashboard: http://localhost:3001/dashboard/veteran`)
      console.log(`   - Unified Progress: http://localhost:3001/dashboard/veteran/unified-progress`)
      console.log('\n💡 Note: You can use these credentials to test the Unified Progress Dashboard!')
      
    } else {
      console.log('❌ Failed to get user ID from auth creation')
    }
    
  } catch (error) {
    console.error('❌ Error creating test user:', error)
  }
}

createTestUser()
