require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function simulateTrackingEvents() {
  console.log('🎯 Simulating Tracking Events for Dashboard Demo...\n')

  try {
    // 1. First, let's check if we have any existing pitches to work with
    const { data: pitches, error: pitchesError } = await supabase
      .from('pitches')
      .select('id, user_id, title')
      .limit(1)

    if (pitchesError) {
      console.error('❌ Error fetching pitches:', pitchesError)
      return
    }

    if (!pitches || pitches.length === 0) {
      console.log('⚠️  No pitches found. Creating a demo pitch first...')
      
      // Create a demo pitch
      const { data: demoPitch, error: createError } = await supabase
        .from('pitches')
        .insert({
          id: 'demo-pitch-123',
          user_id: 'demo-user-456',
          title: 'Demo Veteran Pitch',
          pitch: 'Experienced military professional seeking opportunities...',
          skills: ['Leadership', 'Project Management', 'Strategic Planning'],
          location_preferred: ['Remote', 'Hybrid'],
          availability: 'Immediate',
          phone: '+1234567890',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ Error creating demo pitch:', createError)
        return
      }

      console.log('✅ Created demo pitch:', demoPitch.title)
    }

    const pitchId = pitches?.[0]?.id || 'demo-pitch-123'
    const userId = pitches?.[0]?.user_id || 'demo-user-456'

    console.log(`📊 Using pitch: ${pitchId} (User: ${userId})`)

    // 2. Simulate various tracking events
    const events = [
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Mozilla/5.0 (Demo Browser)',
        ip_hash: '127.0.0.1',
        session_id: 'demo-session-001',
        metadata: { source: 'simulation', demo: true },
        occurred_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'mobile',
        user_agent: 'Mobile Demo Browser',
        ip_hash: '127.0.0.1',
        session_id: 'demo-session-002',
        metadata: { source: 'simulation', demo: true },
        occurred_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
      },
      {
        event_type: 'CALL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Mozilla/5.0 (Demo Browser)',
        ip_hash: '127.0.0.1',
        session_id: 'demo-session-003',
        metadata: { source: 'simulation', demo: true },
        occurred_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
      },
      {
        event_type: 'EMAIL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Mozilla/5.0 (Demo Browser)',
        ip_hash: '127.0.0.1',
        session_id: 'demo-session-004',
        metadata: { source: 'simulation', demo: true },
        occurred_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
      },
      {
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'linkedin',
        user_agent: 'LinkedIn Demo',
        ip_hash: '127.0.0.1',
        session_id: 'demo-session-005',
        metadata: { source: 'simulation', demo: true, platform: 'linkedin' },
        occurred_at: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 minutes ago
      },
      {
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'whatsapp',
        user_agent: 'WhatsApp Demo',
        ip_hash: '127.0.0.1',
        session_id: 'demo-session-006',
        metadata: { source: 'simulation', demo: true, platform: 'whatsapp' },
        occurred_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
      }
    ]

    // 3. Insert the tracking events
    const { data: insertedEvents, error: insertError } = await supabase
      .from('tracking_events')
      .insert(events)
      .select()

    if (insertError) {
      console.error('❌ Error inserting tracking events:', insertError)
      return
    }

    console.log(`✅ Successfully inserted ${insertedEvents.length} tracking events`)

    // 4. Show what the events look like
    console.log('\n📋 Inserted Events:')
    insertedEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.event_type} (${event.platform}) - ${new Date(event.occurred_at).toLocaleString()}`)
    })

    // 5. Query the aggregated metrics to show dashboard data
    console.log('\n📊 Dashboard Metrics (Real-time):')
    
    // Get pitch metrics
    const { data: pitchMetrics, error: metricsError } = await supabase
      .from('pitch_metrics')
      .select('*')
      .eq('pitch_id', pitchId)
      .single()

    if (metricsError) {
      console.error('❌ Error fetching pitch metrics:', metricsError)
    } else if (pitchMetrics) {
      console.log('🎯 Pitch Metrics:')
      console.log(`   • Total Views: ${pitchMetrics.total_views || 0}`)
      console.log(`   • Total Shares: ${pitchMetrics.total_shares || 0}`)
      console.log(`   • Total Contacts: ${pitchMetrics.total_contacts || 0}`)
      console.log(`   • Total Calls: ${pitchMetrics.total_calls || 0}`)
      console.log(`   • Total Emails: ${pitchMetrics.total_emails || 0}`)
    }

    // Get recent tracking events for activity feed
    const { data: recentEvents, error: recentError } = await supabase
      .from('tracking_events')
      .select('event_type, platform, occurred_at, metadata')
      .eq('pitch_id', pitchId)
      .order('occurred_at', { ascending: false })
      .limit(5)

    if (recentError) {
      console.error('❌ Error fetching recent events:', recentError)
    } else if (recentEvents) {
      console.log('\n🔄 Recent Activity Feed:')
      recentEvents.forEach((event, index) => {
        const timeAgo = getTimeAgo(new Date(event.occurred_at))
        console.log(`   ${index + 1}. ${event.event_type} via ${event.platform} - ${timeAgo}`)
      })
    }

    // 6. Show platform breakdown
    const { data: platformEvents, error: platformError } = await supabase
      .from('tracking_events')
      .select('platform, event_type')
      .eq('pitch_id', pitchId)

    if (!platformError && platformEvents) {
      const platformStats = {}
      platformEvents.forEach(event => {
        if (!platformStats[event.platform]) {
          platformStats[event.platform] = { views: 0, shares: 0, contacts: 0 }
        }
        
        if (event.event_type === 'PITCH_VIEWED') platformStats[event.platform].views++
        else if (event.event_type === 'SHARE_RESHARED') platformStats[event.platform].shares++
        else if (['CALL_CLICKED', 'EMAIL_CLICKED'].includes(event.event_type)) platformStats[event.platform].contacts++
      })

      console.log('\n📱 Platform Breakdown:')
      Object.entries(platformStats).forEach(([platform, stats]) => {
        console.log(`   • ${platform}: ${stats.views} views, ${stats.shares} shares, ${stats.contacts} contacts`)
      })
    }

    console.log('\n🎉 Simulation Complete!')
    console.log('💡 This data will now appear in your veteran dashboard in real-time.')
    console.log('🔗 Visit your dashboard to see the live tracking metrics.')

  } catch (error) {
    console.error('❌ Simulation failed:', error)
  }
}

function getTimeAgo(date) {
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  return `${diffDays} days ago`
}

// Run the simulation
simulateTrackingEvents()
