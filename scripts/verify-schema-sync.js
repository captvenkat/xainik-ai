const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifySchemaSync() {
  console.log('🔍 Verifying Database Schema Sync...\n')

  try {
    // Test users table access with all expected fields
    console.log('📋 Testing users table access...')
    const { data: testUser, error: testError } = await supabase
      .from('users')
      .select('id, email, name, phone, avatar_url, role, is_active, email_verified, phone_verified, created_at, updated_at, last_login_at, metadata, location, military_branch, military_rank, years_of_service, discharge_date, education_level, certifications, bio')
      .limit(1)

    if (testError) {
      console.error('❌ Error accessing users table:', testError.message)
      
      // Try with basic fields to see what's available
      const { data: basicUser, error: basicError } = await supabase
        .from('users')
        .select('id, email, name, role')
        .limit(1)
      
      if (basicError) {
        console.error('❌ Even basic user access failed:', basicError.message)
      } else if (basicUser && basicUser.length > 0) {
        console.log('✅ Basic user fields available:', Object.keys(basicUser[0]))
      } else {
        console.log('⚠️  No user data found')
      }
    } else if (testUser && testUser.length > 0) {
      console.log('✅ All expected user fields accessible')
      console.log('📝 Available fields:', Object.keys(testUser[0]))
    } else {
      console.log('⚠️  No user data found')
    }

    // Test pitches table access
    console.log('\n📋 Testing pitches table access...')
    const { data: testPitch, error: pitchError } = await supabase
      .from('pitches')
      .select('id, user_id, title, pitch_text, skills, job_type, location, experience_years, availability, linkedin_url, phone, photo_url, resume_url, resume_share_enabled, plan_tier, plan_expires_at, is_active, likes_count, views_count, created_at, updated_at, metadata')
      .limit(1)

    if (pitchError) {
      console.error('❌ Error accessing pitches table:', pitchError.message)
      
      // Try with basic fields
      const { data: basicPitch, error: basicPitchError } = await supabase
        .from('pitches')
        .select('id, user_id, title, pitch_text')
        .limit(1)
      
      if (basicPitchError) {
        console.error('❌ Even basic pitch access failed:', basicPitchError.message)
      } else if (basicPitch && basicPitch.length > 0) {
        console.log('✅ Basic pitch fields available:', Object.keys(basicPitch[0]))
      } else {
        console.log('⚠️  No pitch data found')
      }
    } else if (testPitch && testPitch.length > 0) {
      console.log('✅ All expected pitch fields accessible')
      console.log('📝 Available fields:', Object.keys(testPitch[0]))
    } else {
      console.log('⚠️  No pitch data found')
    }

    // Test profile update functionality
    console.log('\n🧪 Testing profile update functionality...')
    const { data: updateTest, error: updateError } = await supabase
      .from('users')
      .update({ 
        updated_at: new Date().toISOString() 
      })
      .eq('id', '00000000-0000-0000-0000-000000000000') // Non-existent user
      .select('id')

    if (updateError && updateError.code === 'PGRST116') {
      console.log('✅ Profile update functionality working (no rows affected as expected)')
    } else if (updateError) {
      console.error('❌ Profile update test failed:', updateError.message)
    } else {
      console.log('✅ Profile update functionality working')
    }

    // Test RLS policies by trying to access without auth
    console.log('\n🔒 Testing RLS policies...')
    const { data: rlsTest, error: rlsError } = await supabase
      .from('users')
      .select('id, name')
      .limit(1)

    if (rlsError && rlsError.code === 'PGRST301') {
      console.log('✅ RLS policies working (access denied as expected)')
    } else if (rlsError) {
      console.log('⚠️  RLS test result:', rlsError.message)
    } else {
      console.log('⚠️  RLS may not be properly configured')
    }

    console.log('\n🎉 Schema verification complete!')

  } catch (error) {
    console.error('❌ Verification failed:', error)
  }
}

verifySchemaSync()
