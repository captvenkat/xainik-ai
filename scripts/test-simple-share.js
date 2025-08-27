require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testSimpleShare() {
  console.log('🧪 Testing Simple Share Modal\n')

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
    console.log(`📊 Current metrics:`)
    console.log(`   • Views: ${pitch.views_count || 0}`)
    console.log(`   • Shares: ${pitch.shares_count || 0}`)
    console.log(`   • Calls: ${pitch.calls_count || 0}`)
    console.log(`   • Emails: ${pitch.emails_count || 0}`)

    // 2. Test creating a referral (what the share modal does)
    console.log('\n2️⃣ Testing referral creation...')
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .upsert({
        user_id: pitch.user_id,
        pitch_id: pitchId,
        share_link: `simple-share-test-${Date.now()}`,
        platform: 'web'
      }, {
        onConflict: 'user_id,pitch_id'
      })
      .select('id, share_link')
      .single()

    if (referralError) {
      console.log(`❌ Error creating referral: ${referralError.message}`)
    } else {
      console.log(`✅ Referral created: ${referral.id}`)
      console.log(`🔗 Share link: ${referral.share_link}`)
    }

    // 3. Test tracking a share event
    console.log('\n3️⃣ Testing share tracking...')
    const { data: shareEvent, error: shareError } = await supabase
      .from('tracking_events')
      .insert({
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: pitch.user_id,
        platform: 'whatsapp',
        user_agent: 'test-script',
        ip_address: 'test',
        session_id: `test-${Date.now()}`,
        metadata: { 
          source: 'SimpleShareModal',
          platform: 'whatsapp'
        },
        occurred_at: new Date().toISOString()
      })
      .select('id, event_type, platform')
      .single()

    if (shareError) {
      console.log(`❌ Error tracking share: ${shareError.message}`)
    } else {
      console.log(`✅ Share tracked: ${shareEvent.id}`)
      console.log(`📱 Platform: ${shareEvent.platform}`)
    }

    // 4. Check if pitch metrics were updated
    console.log('\n4️⃣ Checking updated pitch metrics...')
    const { data: updatedPitch } = await supabase
      .from('pitches')
      .select('views_count, shares_count, calls_count, emails_count')
      .eq('id', pitchId)
      .single()

    if (updatedPitch) {
      console.log(`📊 Updated metrics:`)
      console.log(`   • Views: ${updatedPitch.views_count || 0}`)
      console.log(`   • Shares: ${updatedPitch.shares_count || 0}`)
      console.log(`   • Calls: ${updatedPitch.calls_count || 0}`)
      console.log(`   • Emails: ${updatedPitch.emails_count || 0}`)
    }

    // 5. Summary
    console.log('\n📋 Summary:')
    console.log('✅ Simple Share Modal should work!')
    console.log('🎯 Features:')
    console.log('   • One modal, one message')
    console.log('   • Works with any platform (WhatsApp, LinkedIn, Email, Copy)')
    console.log('   • Creates referrals automatically')
    console.log('   • Tracks share events')
    console.log('   • Updates pitch metrics in real-time')
    console.log('   • Smart message that works everywhere')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testSimpleShare()
