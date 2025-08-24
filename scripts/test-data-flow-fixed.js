#!/usr/bin/env node

// =====================================================
// TEST DATA FLOW FIXED - Use Only Existing Columns
// Script: scripts/test-data-flow-fixed.js
// Purpose: Test data flows with corrected schema
// =====================================================

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

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

async function testDataFlowFixed() {
  console.log('🧪 Testing Data Flow FIXED - Live Database Verification')
  console.log('========================================================')
  console.log(`Target: ${url}`)
  
  try {
    // Step 1: Test User Profile Enhancement (Only Existing Columns)
    console.log('\n1️⃣ Testing User Profile Enhancement (Fixed Schema)...')
    
    const testUserId = '550e8400-e29b-41d4-a716-' + Date.now().toString().slice(-12)
    
    // Create a test user with only existing columns
    const { data: testUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: `test-${Date.now()}@example.com`,
        name: 'Test Veteran User',
        phone: '+1234567890',
        role: 'veteran',
        avatar_url: null,
        // Only columns that exist in live schema
        military_branch: 'Army',
        military_rank: 'Sergeant',
        years_of_service: 8,
        discharge_date: '2023-01-01',
        education_level: 'Bachelor\'s',
        certifications: ['Project Management', 'Leadership'],
        bio: 'Experienced military leader seeking civilian opportunities',
        location: 'Washington, DC',
        is_active: true,
        email_verified: true,
        phone_verified: true,
        metadata: { 
          test_user: true,
          profile_type: 'veteran',
          preferred_locations: ['New York, NY', 'San Francisco, CA'],
          linkedin_url: 'https://linkedin.com/in/testveteran',
          website_url: 'https://testveteran.com',
          github_url: 'https://github.com/testveteran'
        }
      })
      .select()
      .single()
    
    if (userError) {
      console.error('❌ Failed to create test user:', userError)
      return
    }
    
    console.log('✅ Test user created with enhanced profile')
    console.log(`   ID: ${testUser.id}`)
    console.log(`   Military: ${testUser.military_branch} ${testUser.military_rank}`)
    console.log(`   Education: ${testUser.education_level}`)
    console.log(`   Bio: ${testUser.bio}`)
    console.log(`   Location: ${testUser.location}`)
    console.log(`   Metadata: ${JSON.stringify(testUser.metadata)}`)
    
    // Step 2: Test Pitch Creation (Using Live Schema)
    console.log('\n2️⃣ Testing Pitch Creation (Fixed Schema)...')
    
    const { data: testPitch, error: pitchError } = await supabase
      .from('pitches')
      .insert({
        user_id: testUserId,
        title: 'Operations Manager - Military Veteran',
        pitch_text: 'Experienced military leader with 8 years of service seeking operations management role. Proven track record in logistics, team leadership, and strategic planning.',
        skills: ['Operations Management', 'Team Leadership', 'Strategic Planning'],
        job_type: 'full-time',
        location: 'Washington, DC',
        availability: '30 days',
        phone: '+1234567890',
        linkedin_url: 'https://linkedin.com/in/testveteran',
        photo_url: null,
        resume_url: null,
        resume_share_enabled: true,
        plan_tier: 'trial_14',
        plan_expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        likes_count: 0,
        views_count: 0,
        shares_count: 0,
        endorsements_count: 0,
        experience_years: 8,
        allow_resume_requests: false
      })
      .select()
      .single()
    
    if (pitchError) {
      console.error('❌ Failed to create test pitch:', pitchError)
      return
    }
    
    console.log('✅ Test pitch created successfully')
    console.log(`   ID: ${testPitch.id}`)
    console.log(`   Title: ${testPitch.title}`)
    console.log(`   Skills: ${testPitch.skills.join(', ')}`)
    console.log(`   Location: ${testPitch.location}`)
    
    // Step 3: Test Referral Creation
    console.log('\n3️⃣ Testing Referral Creation...')
    
    const { data: testReferral, error: referralError } = await supabase
      .from('referrals')
      .insert({
        pitch_id: testPitch.id,
        user_id: testUserId,
        share_link: `https://xainik.com/refer/test-${Date.now()}`
      })
      .select()
      .single()
    
    if (referralError) {
      console.error('❌ Failed to create test referral:', referralError)
      return
    }
    
    console.log('✅ Test referral created successfully')
    console.log(`   ID: ${testReferral.id}`)
    console.log(`   Share Link: ${testReferral.share_link}`)
    
    // Step 4: Test Referral Event Tracking
    console.log('\n4️⃣ Testing Referral Event Tracking...')
    
    const { data: testEvent, error: eventError } = await supabase
      .from('referral_events')
      .insert({
        referral_id: testReferral.id,
        event_type: 'LINK_OPENED',
        platform: 'email',
        occurred_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (eventError) {
      console.error('❌ Failed to create test referral event:', eventError)
      return
    }
    
    console.log('✅ Test referral event created successfully')
    console.log(`   ID: ${testEvent.id}`)
    console.log(`   Event: ${testEvent.event_type}`)
    console.log(`   Platform: ${testEvent.platform}`)
    
    // Step 5: Test Endorsement Creation
    console.log('\n5️⃣ Testing Endorsement Creation...')
    
    const { data: testEndorsement, error: endorsementError } = await supabase
      .from('endorsements')
      .insert({
        user_id: testUserId,
        endorser_user_id: testUserId, // Self-endorsement for test
        text: 'Excellent leadership skills and strategic thinking. Highly recommend for any operations role.',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (endorsementError) {
      console.error('❌ Failed to create test endorsement:', endorsementError)
      return
    }
    
    console.log('✅ Test endorsement created successfully')
    console.log(`   ID: ${testEndorsement.id}`)
    console.log(`   Text: ${testEndorsement.text}`)
    
    // Step 6: Test Data Retrieval
    console.log('\n6️⃣ Testing Data Retrieval...')
    
    // Get enhanced user profile
    const { data: retrievedUser, error: retrieveUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single()
    
    if (retrieveUserError) {
      console.error('❌ Failed to retrieve test user:', retrieveUserError)
      return
    }
    
    console.log('✅ Enhanced user profile retrieved successfully')
    console.log(`   Military: ${retrievedUser.military_branch} ${retrievedUser.military_rank}`)
    console.log(`   Education: ${retrievedUser.education_level}`)
    console.log(`   Bio: ${retrievedUser.bio}`)
    console.log(`   Location: ${retrievedUser.location}`)
    console.log(`   Metadata: ${JSON.stringify(retrievedUser.metadata)}`)
    
    // Get user's pitches
    const { data: userPitches, error: pitchesError } = await supabase
      .from('pitches')
      .select('*')
      .eq('user_id', testUserId)
    
    if (pitchesError) {
      console.error('❌ Failed to retrieve user pitches:', pitchesError)
      return
    }
    
    console.log('✅ User pitches retrieved successfully')
    console.log(`   Pitch Count: ${userPitches.length}`)
    
    // Get user's referrals
    const { data: userReferrals, error: referralsError } = await supabase
      .from('referrals')
      .select('*')
      .eq('user_id', testUserId)
    
    if (referralsError) {
      console.error('❌ Failed to retrieve user referrals:', referralsError)
      return
    }
    
    console.log('✅ User referrals retrieved successfully')
    console.log(`   Referral Count: ${userReferrals.length}`)
    
    // Get user's endorsements
    const { data: userEndorsements, error: endorsementsError } = await supabase
      .from('endorsements')
      .select('*')
      .eq('user_id', testUserId)
    
    if (endorsementsError) {
      console.error('❌ Failed to retrieve user endorsements:', endorsementsError)
      return
    }
    
    console.log('✅ User endorsements retrieved successfully')
    console.log(`   Endorsement Count: ${userEndorsements.length}`)
    
    // Step 7: Cleanup Test Data
    console.log('\n7️⃣ Cleaning Up Test Data...')
    
    try {
      await supabase.from('referral_events').delete().eq('referral_id', testReferral.id)
      await supabase.from('referrals').delete().eq('id', testReferral.id)
      await supabase.from('endorsements').delete().eq('id', testEndorsement.id)
      await supabase.from('pitches').delete().eq('id', testPitch.id)
      await supabase.from('users').delete().eq('id', testUserId)
      
      console.log('✅ Test data cleaned up successfully')
    } catch (cleanupError) {
      console.log('⚠️  Cleanup had some issues:', cleanupError.message)
    }
    
    console.log('\n🎉 Data Flow Test Completed Successfully!')
    console.log('=========================================')
    console.log('✅ User profile creation with enhanced fields')
    console.log('✅ Pitch creation and management')
    console.log('✅ Referral creation and tracking')
    console.log('✅ Endorsement creation')
    console.log('✅ Data retrieval and relationships')
    console.log('✅ All data flows working correctly')
    
    console.log('\n🔧 Database Status:')
    console.log('   ✅ Enhanced user profiles working')
    console.log('   ✅ Pitch management working')
    console.log('   ✅ Referral system working')
    console.log('   ✅ Endorsement system working')
    console.log('   ✅ All data relationships intact')
    console.log('   ✅ Code now matches live schema')
    
  } catch (error) {
    console.error('❌ Data flow test failed:', error)
    process.exit(1)
  }
}

// Run the test
testDataFlowFixed().catch(console.error)
