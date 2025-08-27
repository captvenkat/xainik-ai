require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function simulateFunnelAndSpotlight() {
  console.log('🎯 Simulating Progress Funnel & Supporter Spotlight Data...\n')

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

    // 1. Simulate Progress Funnel Data - EXACTLY what veteran dashboard expects
    console.log('\n📈 Creating Progress Funnel Data...')
    
    // Create funnel events matching veteran dashboard expectations: shares, views, contacts
    const funnelEvents = [
      // Stage 1: Shares (Effort)
      {
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'linkedin',
        user_agent: 'LinkedIn Funnel Demo',
        ip_hash: '127.0.0.1',
        session_id: 'funnel-session-001',
        metadata: { source: 'funnel-simulation', stage: 'shares', supporter: 'Colonel Rajesh Kumar' },
        occurred_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'whatsapp',
        user_agent: 'WhatsApp Funnel Demo',
        ip_hash: '127.0.0.1',
        session_id: 'funnel-session-002',
        metadata: { source: 'funnel-simulation', stage: 'shares', supporter: 'Major Priya Singh' },
        occurred_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Funnel Demo Browser',
        ip_hash: '127.0.0.1',
        session_id: 'funnel-session-003',
        metadata: { source: 'funnel-simulation', stage: 'shares', supporter: 'Brigadier Amit Patel' },
        occurred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'facebook',
        user_agent: 'Facebook Funnel Demo',
        ip_hash: '127.0.0.1',
        session_id: 'funnel-session-004',
        metadata: { source: 'funnel-simulation', stage: 'shares', supporter: 'Captain Meera Sharma' },
        occurred_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'email',
        user_agent: 'Email Funnel Demo',
        ip_hash: '127.0.0.1',
        session_id: 'funnel-session-005',
        metadata: { source: 'funnel-simulation', stage: 'shares', supporter: 'General Vikram Malhotra' },
        occurred_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },

      // Stage 2: Views (Awareness)
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Funnel Demo Browser',
        ip_hash: '127.0.0.1',
        session_id: 'funnel-session-006',
        metadata: { source: 'funnel-simulation', stage: 'views' },
        occurred_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'linkedin',
        user_agent: 'LinkedIn Funnel Demo',
        ip_hash: '127.0.0.1',
        session_id: 'funnel-session-007',
        metadata: { source: 'funnel-simulation', stage: 'views' },
        occurred_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'whatsapp',
        user_agent: 'WhatsApp Funnel Demo',
        ip_hash: '127.0.0.1',
        session_id: 'funnel-session-008',
        metadata: { source: 'funnel-simulation', stage: 'views' },
        occurred_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Funnel Demo Browser',
        ip_hash: '127.0.0.1',
        session_id: 'funnel-session-009',
        metadata: { source: 'funnel-simulation', stage: 'views' },
        occurred_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'mobile',
        user_agent: 'Mobile Funnel Demo',
        ip_hash: '127.0.0.1',
        session_id: 'funnel-session-010',
        metadata: { source: 'funnel-simulation', stage: 'views' },
        occurred_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Funnel Demo Browser',
        ip_hash: '127.0.0.1',
        session_id: 'funnel-session-011',
        metadata: { source: 'funnel-simulation', stage: 'views' },
        occurred_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'PITCH_VIEWED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'linkedin',
        user_agent: 'LinkedIn Funnel Demo',
        ip_hash: '127.0.0.1',
        session_id: 'funnel-session-012',
        metadata: { source: 'funnel-simulation', stage: 'views' },
        occurred_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },

      // Stage 3: Contacts (Intent)
      {
        event_type: 'CALL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Funnel Demo Browser',
        ip_hash: '127.0.0.1',
        session_id: 'funnel-session-013',
        metadata: { source: 'funnel-simulation', stage: 'contacts', supporter: 'Brigadier Amit Patel' },
        occurred_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'EMAIL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'web',
        user_agent: 'Funnel Demo Browser',
        ip_hash: '127.0.0.1',
        session_id: 'funnel-session-014',
        metadata: { source: 'funnel-simulation', stage: 'contacts', supporter: 'Captain Meera Sharma' },
        occurred_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        event_type: 'CALL_CLICKED',
        pitch_id: pitchId,
        user_id: userId,
        platform: 'mobile',
        user_agent: 'Mobile Funnel Demo',
        ip_hash: '127.0.0.1',
        session_id: 'funnel-session-015',
        metadata: { source: 'funnel-simulation', stage: 'contacts', supporter: 'General Vikram Malhotra' },
        occurred_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ]

    // Insert funnel events
    const { data: insertedFunnelEvents, error: funnelError } = await supabase
      .from('tracking_events')
      .insert(funnelEvents)
      .select()

    if (funnelError) {
      console.error('❌ Error inserting funnel events:', funnelError)
    } else {
      console.log(`✅ Successfully inserted ${insertedFunnelEvents.length} funnel events`)
    }

    // 2. Simulate Supporter Spotlight Data
    console.log('\n🌟 Creating Supporter Spotlight Data...')
    
    // Create supporter performance data with proper UUIDs
    const supporterData = [
      {
        user_id: userId,
        pitch_id: pitchId,
        supporter_id: '550e8400-e29b-41d4-a716-446655440001',
        total_referrals_created: 8,
        total_attributed_views: 24,
        total_attributed_calls: 2,
        total_attributed_emails: 1,
        total_attributed_shares: 8,
        total_attributed_conversions: 3,
        conversion_rate: 12.5,
        engagement_rate: 33.3,
        attribution_value: 1500.00,
        last_activity_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: userId,
        pitch_id: pitchId,
        supporter_id: '550e8400-e29b-41d4-a716-446655440002',
        total_referrals_created: 5,
        total_attributed_views: 18,
        total_attributed_calls: 1,
        total_attributed_emails: 1,
        total_attributed_shares: 5,
        total_attributed_conversions: 2,
        conversion_rate: 11.1,
        engagement_rate: 27.8,
        attribution_value: 1200.00,
        last_activity_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: userId,
        pitch_id: pitchId,
        supporter_id: '550e8400-e29b-41d4-a716-446655440003',
        total_referrals_created: 12,
        total_attributed_views: 42,
        total_attributed_calls: 4,
        total_attributed_emails: 2,
        total_attributed_shares: 12,
        total_attributed_conversions: 6,
        conversion_rate: 14.3,
        engagement_rate: 38.1,
        attribution_value: 2800.00,
        last_activity_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: userId,
        pitch_id: pitchId,
        supporter_id: '550e8400-e29b-41d4-a716-446655440004',
        total_referrals_created: 3,
        total_attributed_views: 12,
        total_attributed_calls: 1,
        total_attributed_emails: 0,
        total_attributed_shares: 3,
        total_attributed_conversions: 1,
        conversion_rate: 8.3,
        engagement_rate: 25.0,
        attribution_value: 800.00,
        last_activity_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: userId,
        pitch_id: pitchId,
        supporter_id: '550e8400-e29b-41d4-a716-446655440005',
        total_referrals_created: 15,
        total_attributed_views: 67,
        total_attributed_calls: 5,
        total_attributed_emails: 3,
        total_attributed_shares: 15,
        total_attributed_conversions: 8,
        conversion_rate: 11.9,
        engagement_rate: 41.8,
        attribution_value: 3500.00,
        last_activity_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]

    // Insert supporter performance data
    const { data: insertedSupporterData, error: supporterError } = await supabase
      .from('supporter_performance')
      .insert(supporterData)
      .select()

    if (supporterError) {
      console.error('❌ Error inserting supporter data:', supporterError)
    } else {
      console.log(`✅ Successfully inserted ${insertedSupporterData.length} supporter records`)
    }

    // 3. Display Funnel Analysis - EXACTLY matching veteran dashboard expectations
    console.log('\n📊 Progress Funnel Analysis (Veteran Dashboard Format):')
    console.log('┌─────────────────────────────────────────────────────────┐')
    console.log('│                    PROGRESS FUNNEL                     │')
    console.log('├─────────────────────────────────────────────────────────┤')
    console.log('│ Stage 1: Shares (Effort)        │ 5 shares │ 100%    │')
    console.log('│ Stage 2: Views (Awareness)      │ 7 views  │ 140%    │')
    console.log('│ Stage 3: Contacts (Intent)      │ 3 clicks │  43%    │')
    console.log('└─────────────────────────────────────────────────────────┘')

    // 4. Display Supporter Spotlight
    console.log('\n🌟 Supporter Spotlight - Top Performers:')
    console.log('┌─────────────────────────────────────────────────────────────────────────┐')
    console.log('│ RANK  │ NAME                    │ SHARES │ VIEWS │ CONTACTS │ VALUE │')
    console.log('├─────────────────────────────────────────────────────────────────────────┤')
    console.log('│ #1    │ General Vikram Malhotra │   15   │   67  │    8     │ ₹3500 │')
    console.log('│ #2    │ Brigadier Amit Patel    │   12   │   42  │    6     │ ₹2800 │')
    console.log('│ #3    │ Colonel Rajesh Kumar    │    8   │   24  │    3     │ ₹1500 │')
    console.log('│ #4    │ Major Priya Singh       │    5   │   18  │    2     │ ₹1200 │')
    console.log('│ #5    │ Captain Meera Sharma    │    3   │   12  │    1     │  ₹800 │')
    console.log('└─────────────────────────────────────────────────────────────────────────┘')

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

    // Get recent supporter activity
    const { data: recentSupporterActivity, error: activityError } = await supabase
      .from('tracking_events')
      .select('event_type, platform, occurred_at, metadata')
      .eq('pitch_id', pitchId)
      .not('metadata->supporter', 'is', null)
      .order('occurred_at', { ascending: false })
      .limit(5)

    if (!activityError && recentSupporterActivity) {
      console.log('\n🔄 Recent Supporter Activity:')
      recentSupporterActivity.forEach((activity, index) => {
        const supporter = activity.metadata?.supporter || 'Unknown'
        const timeAgo = getTimeAgo(new Date(activity.occurred_at))
        console.log(`   ${index + 1}. ${supporter} - ${activity.event_type} via ${activity.platform} - ${timeAgo}`)
      })
    }

    console.log('\n🎉 Funnel & Spotlight Simulation Complete!')
    console.log('💡 This data will now appear in your veteran dashboard with:')
    console.log('   • 📊 Progress funnel visualization (Shares → Views → Contacts)')
    console.log('   • 🌟 Supporter spotlight rankings')
    console.log('   • 📈 Real-time conversion metrics')
    console.log('   • 🏆 Top performer highlights')
    console.log('   • 🎯 EXACT funnel stages matching veteran dashboard expectations')

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
simulateFunnelAndSpotlight()
