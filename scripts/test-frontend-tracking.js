require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testFrontendTracking() {
  console.log('🌐 Testing Frontend Tracking\n')

  const pitchId = 'b8348447-2064-44eb-852c-f6ca4e2b7f4f'

  try {
    // 1. Get current tracking count
    console.log('1️⃣ Getting current tracking count...')
    const { data: pitch } = await supabase
      .from('pitches')
      .select('views_count, calls_count, emails_count, shares_count')
      .eq('id', pitchId)
      .single()

    const initialViews = pitch?.views_count || 0
    console.log(`📊 Initial views: ${initialViews}`)

    // 2. Simulate a frontend visit by calling the pitch page
    console.log('\n2️⃣ Simulating frontend visit...')
    const response = await fetch(`https://xainik-6rm1adah0-venkats-projects-596bb496.vercel.app/pitch/${pitchId}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (response.ok) {
      console.log('✅ Pitch page loaded successfully')
      console.log(`📄 Response status: ${response.status}`)
    } else {
      console.log(`❌ Failed to load pitch page: ${response.status}`)
    }

    // 3. Wait a moment for tracking to process
    console.log('\n3️⃣ Waiting for tracking to process...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 4. Check if tracking count increased
    console.log('\n4️⃣ Checking updated tracking count...')
    const { data: updatedPitch } = await supabase
      .from('pitches')
      .select('views_count, calls_count, emails_count, shares_count')
      .eq('id', pitchId)
      .single()

    const finalViews = updatedPitch?.views_count || 0
    console.log(`📊 Final views: ${finalViews}`)
    console.log(`📈 Views change: ${finalViews - initialViews}`)

    // 5. Check tracking events
    console.log('\n5️⃣ Checking tracking events...')
    const { data: events } = await supabase
      .from('tracking_events')
      .select('*')
      .eq('pitch_id', pitchId)
      .order('occurred_at', { ascending: false })

    console.log(`📊 Total tracking events: ${events?.length || 0}`)
    if (events && events.length > 0) {
      console.log('📋 Recent events:')
      events.slice(0, 3).forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.event_type} (${event.platform}) - ${new Date(event.occurred_at).toLocaleString()}`)
      })
    }

    // 6. Summary
    console.log('\n📋 Summary:')
    if (finalViews > initialViews) {
      console.log('✅ Frontend tracking is working!')
      console.log(`📈 Views increased from ${initialViews} to ${finalViews}`)
    } else {
      console.log('⚠️ Frontend tracking may not be working')
      console.log('📊 Views remained the same')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testFrontendTracking()
