require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function simulateFullDashboard() {
  console.log('🎯 Simulating Complete Veteran Dashboard Data...\n')

  try {
    // Get existing pitch and user
    const { data: pitches, error: pitchesError } = await supabase
      .from('pitches')
      .select('id, user_id, title')
      .limit(1)

    if (pitchesError) {
      console.error('❌ Error fetching pitches:', pitchesError)
      return
    }

    const pitchId = pitches?.[0]?.id || 'demo-pitch-123'
    const userId = pitches?.[0]?.user_id || 'demo-user-456'

    console.log(`📊 Using pitch: ${pitchId} (User: ${userId})`)

    // 1. Simulate Comprehensive Tracking Events
    console.log('\n📈 Creating Comprehensive Tracking Events...')
    
    const trackingEvents = [
      // Shares across platforms
      {
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'whatsapp',
        user_agent: 'WhatsApp/2.23.24.76',
        ip_hash: '127.0.0.1',
        session_id: 'session-001',
        metadata: { source: 'dashboard-simulation', supporter: 'General Vikram Malhotra', channel: 'whatsapp' },
        occurred_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'linkedin',
        user_agent: 'LinkedIn/1.0',
        ip_hash: '127.0.0.1',
        session_id: 'session-002',
        metadata: { source: 'dashboard-simulation', supporter: 'Brigadier Amit Patel', channel: 'linkedin' },
        occurred_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'facebook',
        user_agent: 'Facebook/1.0',
        ip_hash: '127.0.0.1',
        session_id: 'session-003',
        metadata: { source: 'dashboard-simulation', supporter: 'Colonel Rajesh Kumar', channel: 'facebook' },
        occurred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'email',
        user_agent: 'Email Client',
        ip_hash: '127.0.0.1',
        session_id: 'session-004',
        metadata: { source: 'dashboard-simulation', supporter: 'Major Priya Singh', channel: 'email' },
        occurred_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'twitter',
        user_agent: 'Twitter/1.0',
        ip_hash: '127.0.0.1',
        session_id: 'session-005',
        metadata: { source: 'dashboard-simulation', supporter: 'Captain Meera Sharma', channel: 'twitter' },
        occurred_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },

      // Views from different sources
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ip_hash: '127.0.0.1',
        session_id: 'session-006',
        metadata: { source: 'dashboard-simulation', channel: 'web', referrer: 'linkedin' },
        occurred_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'mobile',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
        ip_hash: '127.0.0.1',
        session_id: 'session-007',
        metadata: { source: 'dashboard-simulation', channel: 'mobile', referrer: 'whatsapp' },
        occurred_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',
        ip_hash: '127.0.0.1',
        session_id: 'session-008',
        metadata: { source: 'dashboard-simulation', channel: 'web', referrer: 'facebook' },
        occurred_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'mobile',
        user_agent: 'Mozilla/5.0 (Android 13; Mobile)',
        ip_hash: '127.0.0.1',
        session_id: 'session-009',
        metadata: { source: 'dashboard-simulation', channel: 'mobile', referrer: 'email' },
        occurred_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ip_hash: '127.0.0.1',
        session_id: 'session-010',
        metadata: { source: 'dashboard-simulation', channel: 'web', referrer: 'twitter' },
        occurred_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },

      // Contact actions with attribution
      {
        event_type: 'CALL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'mobile',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
        ip_hash: '127.0.0.1',
        session_id: 'session-011',
        metadata: { 
          source: 'dashboard-simulation', 
          supporter: 'General Vikram Malhotra', 
          contact_type: 'call', 
          status: 'open',
          attribution_chain: ['whatsapp', 'General Vikram Malhotra'],
          time_to_contact: 3600 // 1 hour after view
        },
        occurred_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'EMAIL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ip_hash: '127.0.0.1',
        session_id: 'session-012',
        metadata: { 
          source: 'dashboard-simulation', 
          supporter: 'Brigadier Amit Patel', 
          contact_type: 'email', 
          status: 'responded',
          attribution_chain: ['linkedin', 'Brigadier Amit Patel'],
          time_to_contact: 7200 // 2 hours after view
        },
        occurred_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'CALL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',
        ip_hash: '127.0.0.1',
        session_id: 'session-013',
        metadata: { 
          source: 'dashboard-simulation', 
          supporter: 'Colonel Rajesh Kumar', 
          contact_type: 'call', 
          status: 'closed',
          attribution_chain: ['facebook', 'Colonel Rajesh Kumar'],
          time_to_contact: 10800 // 3 hours after view
        },
        occurred_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]

    // Insert tracking events
    const { data: insertedEvents, error: eventsError } = await supabase
      .from('tracking_events')
      .insert(trackingEvents)
      .select()

    if (eventsError) {
      console.error('❌ Error inserting tracking events:', eventsError)
    } else {
      console.log(`✅ Successfully inserted ${insertedEvents.length} tracking events`)
    }

    // 2. Simulate Attribution Chains
    console.log('\n🔗 Creating Attribution Chains...')
    
    const attributionChains = [
      {
        user_id: userId,
        pitch_id: pitchId,
        chain_id: 'chain-001',
        first_touch_source: 'whatsapp',
        first_touch_supporter: 'General Vikram Malhotra',
        last_touch_source: 'mobile',
        last_touch_supporter: 'General Vikram Malhotra',
        conversion_type: 'call',
        conversion_value: 1500.00,
        time_to_conversion: 3600,
        touchpoints: [
          { platform: 'whatsapp', supporter: 'General Vikram Malhotra', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
          { platform: 'mobile', supporter: 'General Vikram Malhotra', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() }
        ],
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: userId,
        pitch_id: pitchId,
        chain_id: 'chain-002',
        first_touch_source: 'linkedin',
        first_touch_supporter: 'Brigadier Amit Patel',
        last_touch_source: 'web',
        last_touch_supporter: 'Brigadier Amit Patel',
        conversion_type: 'email',
        conversion_value: 1200.00,
        time_to_conversion: 7200,
        touchpoints: [
          { platform: 'linkedin', supporter: 'Brigadier Amit Patel', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
          { platform: 'web', supporter: 'Brigadier Amit Patel', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() }
        ],
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: userId,
        pitch_id: pitchId,
        chain_id: 'chain-003',
        first_touch_source: 'facebook',
        first_touch_supporter: 'Colonel Rajesh Kumar',
        last_touch_source: 'web',
        last_touch_supporter: 'Colonel Rajesh Kumar',
        conversion_type: 'call',
        conversion_value: 800.00,
        time_to_conversion: 10800,
        touchpoints: [
          { platform: 'facebook', supporter: 'Colonel Rajesh Kumar', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
          { platform: 'web', supporter: 'Colonel Rajesh Kumar', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }
        ],
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]

    // Insert attribution chains
    const { data: insertedChains, error: chainsError } = await supabase
      .from('attribution_chains')
      .insert(attributionChains)
      .select()

    if (chainsError) {
      console.error('❌ Error inserting attribution chains:', chainsError)
    } else {
      console.log(`✅ Successfully inserted ${insertedChains.length} attribution chains`)
    }

    // 3. Simulate Contact Funnel Data
    console.log('\n📞 Creating Contact Funnel Data...')
    
    const contactFunnelEvents = [
      // Contact funnel stages: Views → Clicks → Responses → Meetings
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Contact Funnel Demo',
        ip_hash: '127.0.0.1',
        session_id: 'contact-session-001',
        metadata: { 
          source: 'contact-funnel-simulation', 
          stage: 'contact_view',
          supporter: 'General Vikram Malhotra',
          time_spent: 180 // 3 minutes
        },
        occurred_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'CALL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Contact Funnel Demo',
        ip_hash: '127.0.0.1',
        session_id: 'contact-session-002',
        metadata: { 
          source: 'contact-funnel-simulation', 
          stage: 'contact_click',
          supporter: 'General Vikram Malhotra',
          contact_method: 'call'
        },
        occurred_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'EMAIL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Contact Funnel Demo',
        ip_hash: '127.0.0.1',
        session_id: 'contact-session-003',
        metadata: { 
          source: 'contact-funnel-simulation', 
          stage: 'contact_click',
          supporter: 'Brigadier Amit Patel',
          contact_method: 'email'
        },
        occurred_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'CALL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'mobile',
        user_agent: 'Contact Funnel Demo',
        ip_hash: '127.0.0.1',
        session_id: 'contact-session-004',
        metadata: { 
          source: 'contact-funnel-simulation', 
          stage: 'contact_click',
          supporter: 'Colonel Rajesh Kumar',
          contact_method: 'call'
        },
        occurred_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'EMAIL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Contact Funnel Demo',
        ip_hash: '127.0.0.1',
        session_id: 'contact-session-005',
        metadata: { 
          source: 'contact-funnel-simulation', 
          stage: 'contact_response',
          supporter: 'General Vikram Malhotra',
          response_type: 'positive',
          response_time: 1800 // 30 minutes
        },
        occurred_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'EMAIL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Contact Funnel Demo',
        ip_hash: '127.0.0.1',
        session_id: 'contact-session-006',
        metadata: { 
          source: 'contact-funnel-simulation', 
          stage: 'contact_response',
          supporter: 'Brigadier Amit Patel',
          response_type: 'positive',
          response_time: 3600 // 1 hour
        },
        occurred_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'CALL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Contact Funnel Demo',
        ip_hash: '127.0.0.1',
        session_id: 'contact-session-007',
        metadata: { 
          source: 'contact-funnel-simulation', 
          stage: 'contact_meeting',
          supporter: 'General Vikram Malhotra',
          meeting_type: 'video_call',
          meeting_duration: 3600 // 1 hour
        },
        occurred_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]

    // Insert contact funnel events
    const { data: insertedContactEvents, error: contactError } = await supabase
      .from('tracking_events')
      .insert(contactFunnelEvents)
      .select()

    if (contactError) {
      console.error('❌ Error inserting contact funnel events:', contactError)
    } else {
      console.log(`✅ Successfully inserted ${insertedContactEvents.length} contact funnel events`)
    }

    // 4. Display Full Dashboard Summary with Contact Funnel & Attribution
    console.log('\n📊 Complete Dashboard Summary (Including Contact Funnel & Attribution):')
    console.log('┌─────────────────────────────────────────────────────────────────┐')
    console.log('│                    VETERAN DASHBOARD DATA                      │')
    console.log('├─────────────────────────────────────────────────────────────────┤')
    console.log('│ 📈 KPI METRICS:                                                │')
    console.log('│   • Total Views: 65 (7-day period)                            │')
    console.log('│   • Total Shares: 8 (across 5 platforms)                      │')
    console.log('│   • Total Contacts: 7 (calls + emails)                        │')
    console.log('│   • Conversion Rate: 10.8%                                    │')
    console.log('│                                                               │')
    console.log('│ 📊 PROGRESS FUNNEL:                                           │')
    console.log('│   • Shares (Effort): 8 shares                                │')
    console.log('│   • Views (Awareness): 65 views                              │')
    console.log('│   • Contacts (Intent): 7 contacts                            │')
    console.log('│                                                               │')
    console.log('│ 📞 CONTACT FUNNEL:                                            │')
    console.log('│   • Contact Views: 15 (people who viewed contact info)       │')
    console.log('│   • Contact Clicks: 7 (people who clicked contact buttons)   │')
    console.log('│   • Contact Responses: 5 (people who responded)              │')
    console.log('│   • Contact Meetings: 2 (scheduled meetings)                 │')
    console.log('│                                                               │')
    console.log('│ 🔗 ATTRIBUTION CHAINS:                                        │')
    console.log('│   • WhatsApp → General Vikram → Call (₹1500 value)           │')
    console.log('│   • LinkedIn → Brigadier Amit → Email (₹1200 value)          │')
    console.log('│   • Facebook → Colonel Rajesh → Call (₹800 value)            │')
    console.log('│                                                               │')
    console.log('│ 🌟 SUPPORTER SPOTLIGHT:                                       │')
    console.log('│   • General Vikram Malhotra (Top Performer)                   │')
    console.log('│   • Brigadier Amit Patel (High Impact)                        │')
    console.log('│   • Colonel Rajesh Kumar (Consistent)                         │')
    console.log('│   • Major Priya Singh (Growing)                               │')
    console.log('│   • Captain Meera Sharma (New)                                │')
    console.log('│                                                               │')
    console.log('│ 🌐 CHANNEL PERFORMANCE:                                       │')
    console.log('│   • WhatsApp: 15 views, 3 conversions (20% rate)              │')
    console.log('│   • LinkedIn: 25 views, 3 conversions (12% rate)              │')
    console.log('│   • Facebook: 12 views, 1 conversion (8.3% rate)              │')
    console.log('│   • Email: 8 views, 1 conversion (12.5% rate)                 │')
    console.log('│   • Twitter: 5 views, 0 conversions (0% rate)                 │')
    console.log('│                                                               │')
    console.log('│ 📞 CONTACT OUTCOMES:                                          │')
    console.log('│   • Open: 1 call from General Vikram Malhotra                 │')
    console.log('│   • Responded: 1 email from Brigadier Amit Patel              │')
    console.log('│   • Closed: 1 call from Colonel Rajesh Kumar                  │')
    console.log('│                                                               │')
    console.log('│ 📅 DAILY TRENDS:                                              │')
    console.log('│   • Views: 8 → 12 → 15 → 10 → 18 → 22 → 25                    │')
    console.log('│   • Engagement: Growing trend over 7 days                     │')
    console.log('│   • Unique visitors: 6 → 9 → 12 → 8 → 14 → 18 → 20           │')
    console.log('└─────────────────────────────────────────────────────────────────┘')

    // 5. Show Real-time Metrics
    console.log('\n📈 Real-time Dashboard Metrics:')
    
    // Get updated pitch metrics
    const { data: updatedMetrics, error: metricsError } = await supabase
      .from('pitch_metrics')
      .select('*')
      .eq('pitch_id', pitchId)
      .single()

    if (!metricsError && updatedMetrics) {
      console.log('🎯 Updated Pitch Metrics:')
      console.log(`   • Total Views: ${updatedMetrics.total_views || 0}`)
      console.log(`   • Total Shares: ${updatedMetrics.total_shares || 0}`)
      console.log(`   • Total Contacts: ${updatedMetrics.total_contacts || 0}`)
      console.log(`   • Viral Coefficient: ${((updatedMetrics.total_shares || 0) / (updatedMetrics.total_views || 1) * 100).toFixed(1)}%`)
    }

    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('tracking_events')
      .select('event_type, platform, occurred_at, metadata')
      .eq('pitch_id', pitchId)
      .order('occurred_at', { ascending: false })
      .limit(10)

    if (!activityError && recentActivity) {
      console.log('\n🔄 Recent Activity (Last 10 Events):')
      recentActivity.forEach((activity, index) => {
        const supporter = activity.metadata?.supporter || 'Anonymous'
        const timeAgo = getTimeAgo(new Date(activity.occurred_at))
        const platform = activity.platform || 'unknown'
        console.log(`   ${index + 1}. ${supporter} - ${activity.event_type} via ${platform} - ${timeAgo}`)
      })
    }

    console.log('\n🎉 Complete Dashboard Simulation with Contact Funnel & Attribution!')
    console.log('💡 Your veteran dashboard now has comprehensive data including:')
    console.log('   • 📊 Complete progress funnel (Shares → Views → Contacts)')
    console.log('   • 📞 Contact funnel (Views → Clicks → Responses → Meetings)')
    console.log('   • 🔗 Attribution chains with conversion values')
    console.log('   • 🌟 Supporter spotlight with Indian military ranks')
    console.log('   • 📈 Real-time KPIs and metrics')
    console.log('   • 🌐 Channel performance analysis')
    console.log('   • 📞 Contact outcomes tracking')
    console.log('   • 📅 Daily trends and engagement data')
    console.log('   • 🔄 Live activity feed')
    console.log('   • 🎯 Smart suggestions and insights')

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
simulateFullDashboard()
