require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function demoTracking() {
  console.log('🚀 DEMO: Real Tracking System in Action\n')

  try {
    // Get an existing pitch and user
    const { data: pitches } = await supabase
      .from('pitches')
      .select('id, user_id, title')
      .limit(1)

    if (!pitches || pitches.length === 0) {
      console.log('❌ No pitches found. Please create a pitch first.')
      return
    }

    const pitchId = pitches[0].id
    const userId = pitches[0].user_id
    const pitchTitle = pitches[0].title

    console.log(`📊 Demo Pitch: "${pitchTitle}"`)
    console.log(`👤 User ID: ${userId}`)
    console.log(`🎯 Pitch ID: ${pitchId}\n`)

    // 1. Show current state
    console.log('1️⃣ CURRENT STATE:')
    const { data: currentPitch } = await supabase
      .from('pitches')
      .select('views_count, calls_count, emails_count, shares_count')
      .eq('id', pitchId)
      .single()

    console.log(`   Views: ${currentPitch?.views_count || 0}`)
    console.log(`   Calls: ${currentPitch?.calls_count || 0}`)
    console.log(`   Emails: ${currentPitch?.emails_count || 0}`)
    console.log(`   Shares: ${currentPitch?.shares_count || 0}\n`)

    // 2. Simulate tracking events
    console.log('2️⃣ SIMULATING TRACKING EVENTS:')

    const trackingEvents = [
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'whatsapp',
        user_agent: 'Demo Agent',
        ip_hash: '127.0.0.1',
        session_id: 'demo-session-001',
        metadata: { source: 'demo-tracking', supporter: 'General Vikram Malhotra' },
        occurred_at: new Date().toISOString()
      },
      {
        event_type: 'CALL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'whatsapp',
        user_agent: 'Demo Agent',
        ip_hash: '127.0.0.1',
        session_id: 'demo-session-001',
        metadata: { source: 'demo-tracking', supporter: 'General Vikram Malhotra' },
        occurred_at: new Date().toISOString()
      },
      {
        event_type: 'EMAIL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'linkedin',
        user_agent: 'Demo Agent',
        ip_hash: '127.0.0.1',
        session_id: 'demo-session-002',
        metadata: { source: 'demo-tracking', supporter: 'Colonel Rajesh Kumar' },
        occurred_at: new Date().toISOString()
      },
      {
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'facebook',
        user_agent: 'Demo Agent',
        ip_hash: '127.0.0.1',
        session_id: 'demo-session-003',
        metadata: { source: 'demo-tracking', supporter: 'Major Priya Singh' },
        occurred_at: new Date().toISOString()
      }
    ]

    for (const event of trackingEvents) {
      const { error } = await supabase
        .from('tracking_events')
        .insert(event)

      if (error) {
        console.log(`   ❌ ${event.event_type}: ${error.message}`)
      } else {
        console.log(`   ✅ ${event.event_type} (${event.platform})`)
      }
    }

    // 3. Show updated state
    console.log('\n3️⃣ UPDATED STATE (Real-time):')
    const { data: updatedPitch } = await supabase
      .from('pitches')
      .select('views_count, calls_count, emails_count, shares_count')
      .eq('id', pitchId)
      .single()

    console.log(`   Views: ${updatedPitch?.views_count || 0} (+${(updatedPitch?.views_count || 0) - (currentPitch?.views_count || 0)})`)
    console.log(`   Calls: ${updatedPitch?.calls_count || 0} (+${(updatedPitch?.calls_count || 0) - (currentPitch?.calls_count || 0)})`)
    console.log(`   Emails: ${updatedPitch?.emails_count || 0} (+${(updatedPitch?.emails_count || 0) - (currentPitch?.emails_count || 0)})`)
    console.log(`   Shares: ${updatedPitch?.shares_count || 0} (+${(updatedPitch?.shares_count || 0) - (currentPitch?.shares_count || 0)})\n`)

    // 4. Show veteran dashboard data
    console.log('4️⃣ VETERAN DASHBOARD DATA:')
    const { data: dashboardData } = await supabase
      .from('veteran_dashboard_summary')
      .select('*')
      .eq('user_id', userId)
      .eq('pitch_id', pitchId)
      .single()

    if (dashboardData) {
      console.log(`   Engagement Rate: ${dashboardData.engagement_rate}%`)
      console.log(`   Deep Engagement: ${dashboardData.deep_engagement_rate}%`)
      console.log(`   Last Activity: ${new Date(dashboardData.last_activity_at).toLocaleString()}`)
    }

    // 5. Show recent activity
    console.log('\n5️⃣ RECENT ACTIVITY:')
    const { data: recentActivity } = await supabase
      .from('recent_activity')
      .select('display_text, created_at')
      .limit(5)

    if (recentActivity) {
      recentActivity.forEach((activity, index) => {
        console.log(`   ${index + 1}. ${activity.display_text}`)
      })
    }

    console.log('\n🎉 DEMO COMPLETE!')
    console.log('📊 Your veteran dashboard will now show this real data!')
    console.log('🚀 Every pitch view, call, email, and share is tracked automatically!')

  } catch (error) {
    console.error('❌ Demo failed:', error)
  }
}

demoTracking()
