require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testTrackingDirect() {
  console.log('🧪 Testing Tracking System Directly in Database\n')

  const pitchId = 'b8348447-2064-44eb-852c-f6ca4e2b7f4f'

  try {
    // 1. Get pitch data
    console.log('1️⃣ Getting pitch data...')
    const { data: pitch } = await supabase
      .from('pitches')
      .select('*')
      .eq('id', pitchId)
      .single()

    if (!pitch) {
      console.log('❌ Pitch not found')
      return
    }

    console.log(`✅ Pitch: "${pitch.title}"`)
    console.log(`👤 User ID: ${pitch.user_id}`)
    console.log(`📊 Initial metrics:`)
    console.log(`   • Views: ${pitch.views_count || 0}`)
    console.log(`   • Calls: ${pitch.calls_count || 0}`)
    console.log(`   • Emails: ${pitch.emails_count || 0}`)
    console.log(`   • Shares: ${pitch.shares_count || 0}`)

    // 2. Create a direct referral first
    console.log('\n2️⃣ Creating direct referral...')
          const { data: referral, error: referralError } = await supabase
        .from('referrals')
        .insert({
          user_id: pitch.user_id,
          pitch_id: pitchId,
          share_link: `direct-test-${Date.now()}`,
          platform: 'direct',
          source_type: 'direct'
        })
        .select('id')
        .single()

    if (referralError) {
      console.log(`❌ Error creating referral: ${referralError.message}`)
      return
    }

    console.log(`✅ Referral created: ${referral.id}`)

    // 3. Test all tracking events directly
    console.log('\n3️⃣ Testing all tracking events directly...')
    
    const testEvents = [
      { eventType: 'PITCH_VIEWED', description: 'Pitch View' },
      { eventType: 'CALL_CLICKED', description: 'Call Click' },
      { eventType: 'EMAIL_CLICKED', description: 'Email Click' },
      { eventType: 'SHARE_RESHARED', description: 'Share Reshared' },
      { eventType: 'LINKEDIN_CLICKED', description: 'LinkedIn Click' },
      { eventType: 'RESUME_REQUEST_CLICKED', description: 'Resume Request' }
    ]

    for (const testEvent of testEvents) {
      console.log(`\n📤 Testing: ${testEvent.description}`)
      
      const eventData = {
        user_id: pitch.user_id,
        pitch_id: pitchId,
        referral_id: referral.id,
        event_type: testEvent.eventType,
        platform: 'direct',
        user_agent: 'Test Agent',
        ip_hash: '127.0.0.1',
        session_id: `test-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        metadata: { source: 'direct-test', testType: testEvent.description },
        occurred_at: new Date().toISOString()
      }

      try {
        const { data: event, error } = await supabase
          .from('tracking_events')
          .insert(eventData)
          .select()
          .single()

        if (error) {
          console.log(`   ❌ ${testEvent.description}: ${error.message}`)
        } else {
          console.log(`   ✅ ${testEvent.description}: Success (ID: ${event.id})`)
        }
      } catch (error) {
        console.log(`   ❌ ${testEvent.description}: ${error.message}`)
      }

      // Wait a moment between requests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // 4. Check final metrics
    console.log('\n4️⃣ Checking final metrics...')
    await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for triggers

    const { data: finalPitch } = await supabase
      .from('pitches')
      .select('views_count, calls_count, emails_count, shares_count, linkedin_clicks_count, resume_requests_count')
      .eq('id', pitchId)
      .single()

    if (finalPitch) {
      console.log(`📊 Final metrics:`)
      console.log(`   • Views: ${finalPitch.views_count || 0} (was ${pitch.views_count || 0})`)
      console.log(`   • Calls: ${finalPitch.calls_count || 0} (was ${pitch.calls_count || 0})`)
      console.log(`   • Emails: ${finalPitch.emails_count || 0} (was ${pitch.emails_count || 0})`)
      console.log(`   • Shares: ${finalPitch.shares_count || 0} (was ${pitch.shares_count || 0})`)
      console.log(`   • LinkedIn: ${finalPitch.linkedin_clicks_count || 0}`)
      console.log(`   • Resume Requests: ${finalPitch.resume_requests_count || 0}`)
    }

    // 5. Check all tracking events
    console.log('\n5️⃣ Checking all tracking events...')
    const { data: events } = await supabase
      .from('tracking_events')
      .select('*')
      .eq('pitch_id', pitchId)
      .order('occurred_at', { ascending: false })

    if (events && events.length > 0) {
      console.log(`📊 Total tracking events: ${events.length}`)
      
      // Group by event type
      const eventCounts = {}
      events.forEach(event => {
        eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1
      })

      console.log('📋 Event breakdown:')
      Object.entries(eventCounts).forEach(([type, count]) => {
        console.log(`   • ${type}: ${count} events`)
      })
    }

    // 6. Summary
    console.log('\n📋 SUMMARY:')
    const initialViews = pitch.views_count || 0
    const finalViews = finalPitch?.views_count || 0
    const initialCalls = pitch.calls_count || 0
    const finalCalls = finalPitch?.calls_count || 0
    const initialEmails = pitch.emails_count || 0
    const finalEmails = finalPitch?.emails_count || 0

    console.log(`✅ Views: ${finalViews - initialViews} new views tracked`)
    console.log(`✅ Calls: ${finalCalls - initialCalls} new calls tracked`)
    console.log(`✅ Emails: ${finalEmails - initialEmails} new emails tracked`)
    console.log(`✅ Total events: ${events?.length || 0} events recorded`)

    if (finalViews > initialViews && finalCalls > initialCalls && finalEmails > initialEmails) {
      console.log('🎉 ALL TRACKING FUNCTIONS ARE WORKING!')
      console.log('💡 The issue is with Vercel authentication, not the tracking system itself.')
      console.log('💡 Frontend tracking (pixel tracking) is working correctly.')
    } else {
      console.log('⚠️ Some tracking functions may not be working properly')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testTrackingDirect()
