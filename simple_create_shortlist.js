import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Initialize Supabase admin client
const supabase = createClient(supabaseUrl, serviceRoleKey)

async function createShortlistTable() {
  try {
    console.log('🔧 Creating shortlist table using alternative method...')
    
    // First, let's check if we can access the database at all
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (usersError) {
      console.error('❌ Cannot access users table:', usersError)
      return
    }
    
    console.log('✅ Can access users table')
    
    // Check if we can access pitches table
    const { data: pitches, error: pitchesError } = await supabase
      .from('pitches')
      .select('id')
      .limit(1)
    
    if (pitchesError) {
      console.error('❌ Cannot access pitches table:', pitchesError)
      return
    }
    
    console.log('✅ Can access pitches table')
    
    // Now let's try to create the shortlist table by attempting to insert
    // This will fail, but it might give us more information
    const { error: insertError } = await supabase
      .from('shortlist')
      .insert({
        recruiter_user_id: users[0].id,
        pitch_id: pitches[0].id
      })
    
    console.log('Insert error (expected):', insertError)
    
    // Since we can't create the table directly, let's modify our API to handle the missing table
    console.log('🔄 Since we cannot create the table directly, let\'s modify the API to handle missing table gracefully')
    
    // Test the current API endpoint
    console.log('🔍 Testing current API endpoint...')
    const { data: testData, error: testError } = await supabase
      .from('shortlist')
      .select('*')
      .limit(1)
    
    console.log('Test result:', { data: testData, error: testError })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createShortlistTable()
