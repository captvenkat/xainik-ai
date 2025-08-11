import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, anonKey)

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...')
  console.log('=====================================')
  
  try {
    // Test basic connection
    console.log('📡 Testing basic connection...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error)
      return
    }
    
    console.log('✅ Database connection successful')
    
    // Test tables existence
    console.log('\n📋 Testing table existence...')
    const tables = ['users', 'pitches', 'veterans', 'recruiters', 'supporters']
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`)
        } else {
          console.log(`✅ Table ${table}: exists`)
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err}`)
      }
    }
    
    // Test pitches query with joins
    console.log('\n🔗 Testing pitches query with joins...')
    const { data: pitches, error: pitchesError } = await supabase
      .from('pitches')
      .select(`
        id,
        title,
        pitch_text,
        skills,
        location,
        job_type,
        availability,
        likes_count,
        veteran_id,
        veteran:users!pitches_veteran_id_fkey (
          id,
          name,
          email,
          phone,
          veterans!veterans_user_id_fkey (
            rank,
            service_branch,
            years_experience,
            location_current
          )
        )
      `)
      .eq('is_active', true)
      .limit(1)
    
    if (pitchesError) {
      console.error('❌ Pitches query failed:', pitchesError)
    } else {
      console.log('✅ Pitches query successful')
      console.log('📊 Sample pitch data:', pitches?.[0] ? 'Found' : 'No data')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testDatabaseConnection()
