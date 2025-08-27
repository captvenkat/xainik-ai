require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function listPitches() {
  console.log('📋 Listing All Pitches\n')

  try {
    const { data: pitches, error } = await supabase
      .from('pitches')
      .select('id, title, user_id, created_at, is_active')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.log(`❌ Error: ${error.message}`)
      return
    }

    if (!pitches || pitches.length === 0) {
      console.log('❌ No pitches found')
      return
    }

    console.log(`📊 Found ${pitches.length} pitches:`)
    pitches.forEach((pitch, index) => {
      console.log(`   ${index + 1}. ${pitch.title}`)
      console.log(`      • ID: ${pitch.id}`)
      console.log(`      • User: ${pitch.user_id}`)
      console.log(`      • Active: ${pitch.is_active}`)
      console.log(`      • Created: ${new Date(pitch.created_at).toLocaleDateString()}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

listPitches()
