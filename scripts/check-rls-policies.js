const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRLSPolicies() {
  console.log('🔍 Checking RLS policies on pitches table...\n')

  try {
    // Check if RLS is enabled
    const { data: rlsEnabled, error: rlsError } = await supabase
      .rpc('check_rls_enabled', { table_name: 'pitches' })

    if (rlsError) {
      console.log('⚠️ Could not check RLS status via RPC')
    } else {
      console.log('📋 RLS enabled:', rlsEnabled)
    }

    // Try to get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ Error getting user:', userError)
      return
    }

    console.log('👤 Current user:', user?.id)

    // Check if user can insert into pitches
    console.log('\n🧪 Testing pitch creation with authenticated user...')
    
    const testPitch = {
      user_id: user.id,
      title: 'RLS Test Pitch',
      pitch_text: 'Testing RLS policies',
      skills: ['test'],
      job_type: 'full-time',
      availability: 'Immediate',
      location: 'Test Location',
      is_active: true
    }

    console.log('📋 Test pitch data:', testPitch)

    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .insert(testPitch)
      .select()
      .single()

    if (pitchError) {
      console.error('❌ Pitch creation failed:', pitchError)
      
      // Check if it's an RLS issue
      if (pitchError.message.includes('row-level security policy')) {
        console.log('\n🔒 RLS Policy Issue Detected!')
        console.log('The user does not have permission to insert into pitches table.')
        console.log('This could be due to:')
        console.log('1. Missing RLS policy for INSERT operations')
        console.log('2. RLS policy condition not met')
        console.log('3. User role not having insert permissions')
      }
    } else {
      console.log('✅ Pitch created successfully:', pitch)
      
      // Clean up
      await supabase
        .from('pitches')
        .delete()
        .eq('id', pitch.id)
      
      console.log('🧹 Test pitch cleaned up')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkRLSPolicies()
