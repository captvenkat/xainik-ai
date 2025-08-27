require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function simulateRealTracking() {
  console.log('🎯 Simulating Real Tracking Analytics (Who Shared → Who Opened → Who Forwarded → Where)...\n')

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

    // 1. Create Referrals (Who Shared)
    console.log('\n🔗 Creating Referrals (Who Shared)...')
    
    const referrals = [
      {
        supporter_id: '550e8400-e29b-41d4-a716-446655440001', // General Vikram Malhotra
        pitch_id: pitchId,
        share_link: `https://xainik.com/pitch/${pitchId}?ref=ref-001`,
        platform: 'whatsapp',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        supporter_id: '550e8400-e29b-41d4-a716-446655440002', // Brigadier Amit Patel
        pitch_id: pitchId,
        share_link: `https://xainik.com/pitch/${pitchId}?ref=ref-002`,
        platform: 'linkedin',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        supporter_id: '550e8400-e29b-41d4-a716-446655440003', // Colonel Rajesh Kumar
        pitch_id: pitchId,
        share_link: `https://xainik.com/pitch/${pitchId}?ref=ref-003`,
        platform: 'facebook',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        supporter_id: '550e8400-e29b-41d4-a716-446655440004', // Major Priya Singh
        pitch_id: pitchId,
        share_link: `https://xainik.com/pitch/${pitchId}?ref=ref-004`,
        platform: 'email',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        supporter_id: '550e8400-e29b-41d4-a716-446655440005', // Captain Meera Sharma
        pitch_id: pitchId,
        share_link: `https://xainik.com/pitch/${pitchId}?ref=ref-005`,
        platform: 'twitter',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    // Insert referrals
    const { data: insertedReferrals, error: referralsError } = await supabase
      .from('referrals')
      .insert(referrals)
      .select()

    if (referralsError) {
      console.error('❌ Error inserting referrals:', referralsError)
    } else {
      console.log(`✅ Successfully inserted ${insertedReferrals.length} referrals`)
    }

    // 2. Create Tracking Events (Who Opened, Who Forwarded, Where)
    console.log('\n📈 Creating Tracking Events (Who Opened → Who Forwarded → Where)...')
    
    const trackingEvents = [
      // WhatsApp Chain: General Vikram shared → 3 people opened → 1 person forwarded
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        referral_id: insertedReferrals?.[0]?.id,
        platform: 'whatsapp',
        user_agent: 'WhatsApp/2.23.24.76',
        ip_hash: '127.0.0.1',
        session_id: 'session-001',
        metadata: { 
          source: 'real-tracking-simulation',
          supporter: 'General Vikram Malhotra',
          channel: 'whatsapp',
          action: 'opened_shared_link'
        },
        occurred_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        referral_id: insertedReferrals?.[0]?.id,
        platform: 'whatsapp',
        user_agent: 'WhatsApp/2.23.24.76',
        ip_hash: '127.0.0.2',
        session_id: 'session-002',
        metadata: { 
          source: 'real-tracking-simulation',
          supporter: 'General Vikram Malhotra',
          channel: 'whatsapp',
          action: 'opened_shared_link'
        },
        occurred_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        referral_id: insertedReferrals?.[0]?.id,
        platform: 'whatsapp',
        user_agent: 'WhatsApp/2.23.24.76',
        ip_hash: '127.0.0.3',
        session_id: 'session-003',
        metadata: { 
          source: 'real-tracking-simulation',
          supporter: 'General Vikram Malhotra',
          channel: 'whatsapp',
          action: 'opened_shared_link'
        },
        occurred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: userId,
        referral_id: insertedReferrals?.[0]?.id,
        platform: 'whatsapp',
        user_agent: 'WhatsApp/2.23.24.76',
        ip_hash: '127.0.0.3',
        session_id: 'session-003',
        metadata: { 
          source: 'real-tracking-simulation',
          supporter: 'General Vikram Malhotra',
          channel: 'whatsapp',
          action: 'forwarded_to_others',
          forwarded_to: 2
        },
        occurred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },

      // LinkedIn Chain: Brigadier Amit shared → 5 people opened → 2 people forwarded
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        referral_id: insertedReferrals?.[1]?.id,
        platform: 'linkedin',
        user_agent: 'LinkedIn/1.0',
        ip_hash: '127.0.0.4',
        session_id: 'session-004',
        metadata: { 
          source: 'real-tracking-simulation',
          supporter: 'Brigadier Amit Patel',
          channel: 'linkedin',
          action: 'opened_shared_link'
        },
        occurred_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        referral_id: insertedReferrals?.[1]?.id,
        platform: 'linkedin',
        user_agent: 'LinkedIn/1.0',
        ip_hash: '127.0.0.5',
        session_id: 'session-005',
        metadata: { 
          source: 'real-tracking-simulation',
          supporter: 'Brigadier Amit Patel',
          channel: 'linkedin',
          action: 'opened_shared_link'
        },
        occurred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        referral_id: insertedReferrals?.[1]?.id,
        platform: 'linkedin',
        user_agent: 'LinkedIn/1.0',
        ip_hash: '127.0.0.6',
        session_id: 'session-006',
        metadata: { 
          source: 'real-tracking-simulation',
          supporter: 'Brigadier Amit Patel',
          channel: 'linkedin',
          action: 'opened_shared_link'
        },
        occurred_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: userId,
        referral_id: insertedReferrals?.[1]?.id,
        platform: 'linkedin',
        user_agent: 'LinkedIn/1.0',
        ip_hash: '127.0.0.6',
        session_id: 'session-006',
        metadata: { 
          source: 'real-tracking-simulation',
          supporter: 'Brigadier Amit Patel',
          channel: 'linkedin',
          action: 'forwarded_to_others',
          forwarded_to: 3
        },
        occurred_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        referral_id: insertedReferrals?.[1]?.id,
        platform: 'linkedin',
        user_agent: 'LinkedIn/1.0',
        ip_hash: '127.0.0.7',
        session_id: 'session-007',
        metadata: { 
          source: 'real-tracking-simulation',
          supporter: 'Brigadier Amit Patel',
          channel: 'linkedin',
          action: 'opened_shared_link'
        },
        occurred_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: userId,
        referral_id: insertedReferrals?.[1]?.id,
        platform: 'linkedin',
        user_agent: 'LinkedIn/1.0',
        ip_hash: '127.0.0.7',
        session_id: 'session-007',
        metadata: { 
          source: 'real-tracking-simulation',
          supporter: 'Brigadier Amit Patel',
          channel: 'linkedin',
          action: 'forwarded_to_others',
          forwarded_to: 1
        },
        occurred_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },

      // Facebook Chain: Colonel Rajesh shared → 2 people opened → 0 forwarded
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        referral_id: insertedReferrals?.[2]?.id,
        platform: 'facebook',
        user_agent: 'Facebook/1.0',
        ip_hash: '127.0.0.8',
        session_id: 'session-008',
        metadata: { 
          source: 'real-tracking-simulation',
          supporter: 'Colonel Rajesh Kumar',
          channel: 'facebook',
          action: 'opened_shared_link'
        },
        occurred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        referral_id: insertedReferrals?.[2]?.id,
        platform: 'facebook',
        user_agent: 'Facebook/1.0',
        ip_hash: '127.0.0.9',
        session_id: 'session-009',
        metadata: { 
          source: 'real-tracking-simulation',
          supporter: 'Colonel Rajesh Kumar',
          channel: 'facebook',
          action: 'opened_shared_link'
        },
        occurred_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },

      // Email Chain: Major Priya shared → 1 person opened → 0 forwarded
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        referral_id: insertedReferrals?.[3]?.id,
        platform: 'email',
        user_agent: 'Email Client',
        ip_hash: '127.0.0.10',
        session_id: 'session-010',
        metadata: { 
          source: 'real-tracking-simulation',
          supporter: 'Major Priya Singh',
          channel: 'email',
          action: 'opened_shared_link'
        },
        occurred_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },

      // Twitter Chain: Captain Meera shared → 0 people opened → 0 forwarded
      // (No events - shows low engagement)

      // Contact Actions (Who Actually Contacted)
      {
        event_type: 'CALL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        referral_id: insertedReferrals?.[0]?.id,
        platform: 'whatsapp',
        user_agent: 'WhatsApp/2.23.24.76',
        ip_hash: '127.0.0.3',
        session_id: 'session-003',
        metadata: { 
          source: 'real-tracking-simulation',
          supporter: 'General Vikram Malhotra',
          channel: 'whatsapp',
          action: 'contacted_veteran',
          contact_method: 'call'
        },
        occurred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'EMAIL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        referral_id: insertedReferrals?.[1]?.id,
        platform: 'linkedin',
        user_agent: 'LinkedIn/1.0',
        ip_hash: '127.0.0.6',
        session_id: 'session-006',
        metadata: { 
          source: 'real-tracking-simulation',
          supporter: 'Brigadier Amit Patel',
          channel: 'linkedin',
          action: 'contacted_veteran',
          contact_method: 'email'
        },
        occurred_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'CALL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        referral_id: insertedReferrals?.[2]?.id,
        platform: 'facebook',
        user_agent: 'Facebook/1.0',
        ip_hash: '127.0.0.8',
        session_id: 'session-008',
        metadata: { 
          source: 'real-tracking-simulation',
          supporter: 'Colonel Rajesh Kumar',
          channel: 'facebook',
          action: 'contacted_veteran',
          contact_method: 'call'
        },
        occurred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
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

    // 3. Display Real Tracking Analytics Summary
    console.log('\n📊 Real Tracking Analytics Summary:')
    console.log('┌─────────────────────────────────────────────────────────────────┐')
    console.log('│                    REAL TRACKING ANALYTICS                     │')
    console.log('├─────────────────────────────────────────────────────────────────┤')
    console.log('│ 🔗 WHO SHARED (Referrals Created):                             │')
    console.log('│   • General Vikram Malhotra → WhatsApp                         │')
    console.log('│   • Brigadier Amit Patel → LinkedIn                            │')
    console.log('│   • Colonel Rajesh Kumar → Facebook                            │')
    console.log('│   • Major Priya Singh → Email                                  │')
    console.log('│   • Captain Meera Sharma → Twitter                             │')
    console.log('│                                                               │')
    console.log('│ 👀 WHO OPENED (Pitch Views):                                   │')
    console.log('│   • WhatsApp: 3 people opened General Vikram\'s link           │')
    console.log('│   • LinkedIn: 4 people opened Brigadier Amit\'s link           │')
    console.log('│   • Facebook: 2 people opened Colonel Rajesh\'s link           │')
    console.log('│   • Email: 1 person opened Major Priya\'s link                 │')
    console.log('│   • Twitter: 0 people opened Captain Meera\'s link             │')
    console.log('│                                                               │')
    console.log('│ 🔄 WHO FORWARDED (Share Reshared):                             │')
    console.log('│   • WhatsApp: 1 person forwarded (to 2 others)                │')
    console.log('│   • LinkedIn: 2 people forwarded (to 4 others total)          │')
    console.log('│   • Facebook: 0 people forwarded                              │')
    console.log('│   • Email: 0 people forwarded                                 │')
    console.log('│   • Twitter: 0 people forwarded                               │')
    console.log('│                                                               │')
    console.log('│ 📞 WHO CONTACTED (Contact Actions):                            │')
    console.log('│   • WhatsApp: 1 person called (from General Vikram\'s share)   │')
    console.log('│   • LinkedIn: 1 person emailed (from Brigadier Amit\'s share)  │')
    console.log('│   • Facebook: 1 person called (from Colonel Rajesh\'s share)   │')
    console.log('│   • Email: 0 people contacted                                 │')
    console.log('│   • Twitter: 0 people contacted                               │')
    console.log('│                                                               │')
    console.log('│ 📈 CONVERSION METRICS:                                         │')
    console.log('│   • Total Shares: 5 (by 5 supporters)                         │')
    console.log('│   • Total Views: 10 (from shared links)                       │')
    console.log('│   • Total Forwards: 3 (reshared by viewers)                   │')
    console.log('│   • Total Contacts: 3 (actual contact actions)                │')
    console.log('│   • Viral Coefficient: 30% (3 forwards / 10 views)            │')
    console.log('│   • Contact Rate: 30% (3 contacts / 10 views)                 │')
    console.log('│                                                               │')
    console.log('│ 🌟 SUPPORTER PERFORMANCE:                                      │')
    console.log('│   • General Vikram: 3 views, 1 forward, 1 contact (33% rate)  │')
    console.log('│   • Brigadier Amit: 4 views, 2 forwards, 1 contact (25% rate) │')
    console.log('│   • Colonel Rajesh: 2 views, 0 forwards, 1 contact (50% rate) │')
    console.log('│   • Major Priya: 1 view, 0 forwards, 0 contacts (0% rate)     │')
    console.log('│   • Captain Meera: 0 views, 0 forwards, 0 contacts (0% rate)  │')
    console.log('└─────────────────────────────────────────────────────────────────┘')

    // 4. Show Real-time Metrics
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
        const action = activity.metadata?.action || activity.event_type
        const timeAgo = getTimeAgo(new Date(activity.occurred_at))
        const platform = activity.platform || 'unknown'
        console.log(`   ${index + 1}. ${supporter} - ${action} via ${platform} - ${timeAgo}`)
      })
    }

    console.log('\n🎉 Real Tracking Analytics Simulation Complete!')
    console.log('💡 This shows the actual tracking mechanism:')
    console.log('   • 🔗 Who shared (referrals created by supporters)')
    console.log('   • 👀 Who opened (pitch views from shared links)')
    console.log('   • 🔄 Who forwarded (reshares by viewers)')
    console.log('   • 📞 Who contacted (actual contact actions)')
    console.log('   • 📍 Where (platform attribution)')
    console.log('   • 📊 Real conversion metrics (no assumptions)')
    console.log('   • 🌟 Supporter performance tracking')

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
simulateRealTracking()
