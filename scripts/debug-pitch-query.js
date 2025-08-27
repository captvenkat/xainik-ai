require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugPitchQuery() {
  console.log('🔍 Debugging Pitch Query\n')

  const pitchId = 'b8348447-2064-44eb-852c-f6ca4e2b7f4f'

  try {
    // 1. Simple query first
    console.log('1️⃣ Simple pitch query...')
    const { data: simplePitch, error: simpleError } = await supabase
      .from('pitches')
      .select('*')
      .eq('id', pitchId)
      .single()

    if (simpleError) {
      console.log(`❌ Simple query error: ${simpleError.message}`)
    } else {
      console.log(`✅ Simple query success: ${simplePitch.title}`)
    }

    // 2. Query with join
    console.log('\n2️⃣ Query with user join...')
    const { data: pitchWithUser, error: joinError } = await supabase
      .from('pitches')
      .select('*, user:users(name)')
      .eq('id', pitchId)
      .single()

    if (joinError) {
      console.log(`❌ Join query error: ${joinError.message}`)
    } else {
      console.log(`✅ Join query success: ${pitchWithUser.title}`)
      console.log(`👤 User: ${pitchWithUser.user?.name || 'No user'}`)
    }

    // 3. Check if pitch exists at all
    console.log('\n3️⃣ Checking if pitch exists...')
    const { data: allPitches, error: allError } = await supabase
      .from('pitches')
      .select('id, title')
      .eq('id', pitchId)

    if (allError) {
      console.log(`❌ All pitches error: ${allError.message}`)
    } else {
      console.log(`✅ Found ${allPitches.length} pitches with this ID`)
      allPitches.forEach(p => console.log(`   • ${p.title}`))
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugPitchQuery()
