require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkCallTracking() {
  console.log('📞 Checking Call Tracking for Pitch\n')

  const pitchId = 'b8348447-2064-44eb-852c-f6ca4e2b7f4f'

  try {
    // 1. Check pitch data
    console.log('1️⃣ Checking pitch data...')
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
    console.log(`📊 Current metrics:`)
    console.log(`   • Views: ${pitch.views_count || 0}`)
    console.log(`   • Calls: ${pitch.calls_count || 0}`)
    console.log(`   • Emails: ${pitch.emails_count || 0}`)
    console.log(`   • Shares: ${pitch.shares_count || 0}`)

    // 2. Check all tracking events for this pitch
    console.log('\n2️⃣ Checking all tracking events...')
    const { data: events } = await supabase
      .from('tracking_events')
      .select('*')
      .eq('pitch_id', pitchId)
      .order('occurred_at', { ascending: false })

    if (!events || events.length === 0) {
      console.log('❌ No tracking events found')
      return
    }

    console.log(`📊 Total tracking events: ${events.length}`)
    
    // 3. Filter for call-related events
    const callEvents = events.filter(event => 
      event.event_type === 'CALL_CLICKED' || 
      event.event_type === 'PHONE_CLICKED' ||
      event.metadata?.contact_type === 'call'
    )

    console.log(`📞 Call-related events: ${callEvents.length}`)

    if (callEvents.length > 0) {
      console.log('\n📋 Call Events Found:')
      callEvents.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.event_type}`)
        console.log(`      • Platform: ${event.platform}`)
        console.log(`      • Time: ${new Date(event.occurred_at).toLocaleString()}`)
        console.log(`      • Metadata: ${JSON.stringify(event.metadata)}`)
        console.log('')
      })
    } else {
      console.log('❌ No call events found')
    }

    // 4. Check all event types for this pitch
    console.log('\n3️⃣ All event types for this pitch:')
    const eventTypes = [...new Set(events.map(e => e.event_type))]
    eventTypes.forEach((type, index) => {
      const count = events.filter(e => e.event_type === type).length
      console.log(`   ${index + 1}. ${type}: ${count} events`)
    })

    // 5. Check recent events (last 5)
    console.log('\n4️⃣ Recent events (last 5):')
    events.slice(0, 5).forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.event_type} (${event.platform}) - ${new Date(event.occurred_at).toLocaleString()}`)
    })

    // 6. Summary
    console.log('\n📋 Summary:')
    if (callEvents.length > 0) {
      console.log('✅ Call tracking is working!')
      console.log(`📞 ${callEvents.length} call event(s) recorded`)
    } else {
      console.log('❌ No call events found')
      console.log('💡 This could mean:')
      console.log('   • No calls were made to this pitch')
      console.log('   • Call tracking is not working')
      console.log('   • Calls were made but not tracked')
    }

  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkCallTracking()
