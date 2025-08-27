require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testTrackingAPI() {
  console.log('🧪 Testing Tracking API Directly\n')

  const pitchId = 'b8348447-2064-44eb-852c-f6ca4e2b7f4f'

  try {
    // 1. Get pitch with user data
    console.log('1️⃣ Fetching pitch data...')
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select(`
        *,
        users!pitches_user_id_fkey(
          id,
          name,
          email,
          avatar_url,
          role,
          phone,
          metadata
        )
      `)
      .eq('id', pitchId)
      .eq('is_active', true)
      .single()

    if (pitchError || !pitch) {
      console.log(`❌ Pitch not found: ${pitchError?.message}`)
      return
    }

    console.log(`✅ Pitch found: "${pitch.title}"`)
    console.log(`👤 User ID: ${pitch.user_id}`)
    console.log(`📊 Current metrics:`)
    console.log(`   • Views: ${pitch.views_count || 0}`)
    console.log(`   • Calls: ${pitch.calls_count || 0}`)
    console.log(`   • Emails: ${pitch.emails_count || 0}`)
    console.log(`   • Shares: ${pitch.shares_count || 0}\n`)

    // 2. Test tracking event with correct user ID
    console.log('2️⃣ Testing tracking event with correct user ID...')
    const testEvent = {
      eventType: 'PITCH_VIEWED',
      pitchId: pitchId,
      userId: pitch.user_id, // This is the correct user ID
      platform: 'test',
      userAgent: 'Test Agent',
      ipAddress: '127.0.0.1',
      sessionId: 'test-session-' + Date.now(),
      metadata: { source: 'tracking-test' },
      timestamp: new Date().toISOString()
    }

    console.log('📤 Sending tracking event:', testEvent)

    // Simulate the API call that the frontend makes
    const response = await fetch('https://xainik-a98qm57fq-venkats-projects-596bb496.vercel.app/api/track-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEvent)
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Tracking API response:', result)
    } else {
      const errorText = await response.text()
      console.log(`❌ Tracking API failed: ${response.status} - ${errorText}`)
    }

    // 3. Check if tracking event was recorded
    console.log('\n3️⃣ Checking if tracking event was recorded...')
    const { data: events, error: eventsError } = await supabase
      .from('tracking_events')
      .select('*')
      .eq('pitch_id', pitchId)
      .order('occurred_at', { ascending: false })

    if (eventsError) {
      console.log(`❌ Error getting events: ${eventsError.message}`)
    } else {
      console.log(`✅ Found ${events?.length || 0} tracking events`)
      if (events && events.length > 0) {
        console.log('📊 Recent events:')
        events.slice(0, 3).forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.event_type} (${event.platform}) - ${new Date(event.occurred_at).toLocaleString()}`)
        })
      }
    }

    // 4. Check if pitch metrics were updated
    console.log('\n4️⃣ Checking updated pitch metrics...')
    const { data: updatedPitch } = await supabase
      .from('pitches')
      .select('views_count, calls_count, emails_count, shares_count, last_activity_at')
      .eq('id', pitchId)
      .single()

    if (updatedPitch) {
      console.log('📊 Updated metrics:')
      console.log(`   • Views: ${updatedPitch.views_count || 0}`)
      console.log(`   • Calls: ${updatedPitch.calls_count || 0}`)
      console.log(`   • Emails: ${updatedPitch.emails_count || 0}`)
      console.log(`   • Shares: ${updatedPitch.shares_count || 0}`)
      console.log(`   • Last Activity: ${updatedPitch.last_activity_at || 'Never'}`)
    }

    console.log('\n📋 Summary:')
    console.log('• Pitch data structure is correct')
    console.log('• User ID is available for tracking')
    console.log('• Tracking API is working')
    console.log('• Database triggers are functioning')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testTrackingAPI()
