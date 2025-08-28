import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function disableAnalyticsQueries() {
  console.log('🔧 Temporarily disabling problematic analytics queries...')
  
  try {
    // Test if we can access the basic tables without complex joins
    console.log('Testing basic table access...')
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(1)
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message)
    } else {
      console.log('✅ Users table accessible')
    }
    
    const { data: pitches, error: pitchesError } = await supabase
      .from('pitches')
      .select('id, user_id, title')
      .limit(1)
    
    if (pitchesError) {
      console.log('❌ Pitches table error:', pitchesError.message)
    } else {
      console.log('✅ Pitches table accessible')
    }
    
    // Test the problematic referral_events query
    console.log('\nTesting referral_events query...')
    
    try {
      const { data, error } = await supabase
        .from('referral_events')
        .select('id, event_type, occurred_at')
        .limit(1)
      
      if (error) {
        console.log('❌ Basic referral_events query failed:', error.message)
      } else {
        console.log('✅ Basic referral_events query works')
      }
    } catch (e) {
      console.log('❌ referral_events query exception:', e.message)
    }
    
    // Test the complex nested query that's failing
    console.log('\nTesting complex nested query...')
    
    try {
      const { data, error } = await supabase
        .from('referral_events')
        .select(`
          id,
          event_type,
          occurred_at,
          referrals!inner (
            id,
            pitch_id
          )
        `)
        .limit(1)
      
      if (error) {
        console.log('❌ Complex nested query failed:', error.message)
        console.log('This is the query causing the 400 errors')
      } else {
        console.log('✅ Complex nested query works')
      }
    } catch (e) {
      console.log('❌ Complex nested query exception:', e.message)
    }
    
  } catch (e) {
    console.error('❌ Unexpected error:', e)
  }
}

disableAnalyticsQueries()
