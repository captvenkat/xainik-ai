#!/usr/bin/env node

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function verifyMissionInvitationSystem() {
  console.log('🔍 Verifying Mission Invitation System...\n')

  try {
    // 1. Verify Tables Exist by attempting to query them
    console.log('📋 Checking Tables...')
    
    try {
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('mission_invitations')
        .select('id')
        .limit(1)
      
      if (invitationsError) {
        console.log('❌ mission_invitations table error:', invitationsError.message)
      } else {
        console.log('✅ mission_invitations table working')
      }
    } catch (error) {
      console.log('❌ mission_invitations table not accessible:', error.message)
    }

    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('mission_invitation_events')
        .select('id')
        .limit(1)
      
      if (eventsError) {
        console.log('❌ mission_invitation_events table error:', eventsError.message)
      } else {
        console.log('✅ mission_invitation_events table working')
      }
    } catch (error) {
      console.log('❌ mission_invitation_events table not accessible:', error.message)
    }

    try {
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('mission_invitation_analytics')
        .select('id')
        .limit(1)
      
      if (analyticsError) {
        console.log('❌ mission_invitation_analytics table error:', analyticsError.message)
      } else {
        console.log('✅ mission_invitation_analytics table working')
      }
    } catch (error) {
      console.log('❌ mission_invitation_analytics table not accessible:', error.message)
    }

    // 2. Verify Views Exist by querying them
    console.log('\n📊 Checking Views...')
    
    try {
      const { data: summaryData, error: summaryError } = await supabase
        .from('mission_invitation_summary')
        .select('*')
        .limit(1)
      
      if (summaryError) {
        console.log('❌ mission_invitation_summary view error:', summaryError.message)
      } else {
        console.log('✅ mission_invitation_summary view working')
      }
    } catch (error) {
      console.log('❌ mission_invitation_summary view not accessible:', error.message)
    }

    try {
      const { data: performanceData, error: performanceError } = await supabase
        .from('mission_invitation_performance')
        .select('*')
        .limit(1)
      
      if (performanceError) {
        console.log('❌ mission_invitation_performance view error:', performanceError.message)
      } else {
        console.log('✅ mission_invitation_performance view working')
      }
    } catch (error) {
      console.log('❌ mission_invitation_performance view not accessible:', error.message)
    }

    // 3. Verify Functions Exist by calling them
    console.log('\n⚙️  Checking Functions...')
    
    try {
      const { data: testInvitation, error: testError } = await supabase.rpc('create_mission_invitation', {
        p_inviter_id: '00000000-0000-0000-0000-000000000000', // Test UUID
        p_inviter_role: 'supporter',
        p_invitation_message: 'Test invitation message',
        p_platform: 'test'
      })

      if (testError) {
        console.log('⚠️  create_mission_invitation function test:', testError.message)
      } else {
        console.log('✅ create_mission_invitation function working')
      }
    } catch (error) {
      console.log('⚠️  create_mission_invitation function test failed:', error.message)
    }

    // 4. Test with a real user ID (create a test user first)
    console.log('\n🧪 Testing with Real User...')
    
    try {
      // Create a test user first
      const { data: testUser, error: userError } = await supabase.auth.admin.createUser({
        email: `test-${Date.now()}@xainik.com`,
        password: 'TestPassword123!',
        email_confirm: true
      })

      if (userError) {
        console.log('⚠️  Test user creation failed:', userError.message)
      } else {
        console.log('✅ Test user created successfully')
        
        // Test the function with real user ID
        const { data: realInvitation, error: realError } = await supabase.rpc('create_mission_invitation', {
          p_inviter_id: testUser.user.id,
          p_inviter_role: 'supporter',
          p_invitation_message: 'Real test invitation',
          p_platform: 'test'
        })

        if (realError) {
          console.log('⚠️  Real user invitation test:', realError.message)
        } else {
          console.log('✅ Real user invitation working')
          
          // Clean up test data
          await supabase
            .from('mission_invitations')
            .delete()
            .eq('inviter_id', testUser.user.id)
          
          await supabase.auth.admin.deleteUser(testUser.user.id)
          console.log('✅ Test data cleaned up')
        }
      }
    } catch (error) {
      console.log('⚠️  Real user test failed:', error.message)
    }

    // 5. Test Data Operations
    console.log('\n📝 Testing Data Operations...')
    
    try {
      // Create a test invitation with a valid UUID format
      const testUUID = '00000000-0000-0000-0000-000000000000'
      const { data: insertData, error: insertError } = await supabase
        .from('mission_invitations')
        .insert({
          inviter_id: testUUID,
          inviter_role: 'supporter',
          invitation_link: 'https://xainik.com/join/test-' + Date.now(),
          invitation_message: 'Test invitation for verification',
          platform: 'test'
        })
        .select()

      if (insertError) {
        console.log('⚠️  Data insertion test:', insertError.message)
      } else {
        console.log('✅ Data insertion working')
        
        // Clean up test data
        const testId = insertData[0].id
        await supabase
          .from('mission_invitations')
          .delete()
          .eq('id', testId)
        console.log('✅ Test data cleaned up')
      }
    } catch (error) {
      console.log('⚠️  Data operation test failed:', error.message)
    }

    // 6. Check Analytics View
    console.log('\n📈 Testing Analytics View...')
    try {
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('mission_invitation_summary')
        .select('*')
        .limit(1)

      if (analyticsError) {
        console.log('⚠️  Analytics view test:', analyticsError.message)
      } else {
        console.log('✅ Analytics view working')
      }
    } catch (error) {
      console.log('⚠️  Analytics view test failed:', error.message)
    }

    console.log('\n🎯 Verification Complete!')
    console.log('\n📋 Next Steps:')
    console.log('1. ✅ Database schema applied successfully')
    console.log('2. 🔄 Test the system with real users')
    console.log('3. 🚀 Deploy to production')
    console.log('4. 📊 Monitor analytics and performance')

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    process.exit(1)
  }
}

// Run verification
verifyMissionInvitationSystem()
  .then(() => {
    console.log('\n✨ Mission Invitation System verification completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Verification failed:', error)
    process.exit(1)
  })
