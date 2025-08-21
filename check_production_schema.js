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

async function checkProductionSchema() {
  try {
    console.log('🔍 COMPREHENSIVE PRODUCTION DATABASE SCHEMA CHECK')
    console.log('================================================================')
    
    // 1. Check Users table
    console.log('\n1. USERS TABLE CHECK:')
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.error('❌ Users table error:', usersError)
    } else {
      console.log('✅ Users table accessible')
      if (usersData && usersData.length > 0) {
        console.log('Users table structure:', Object.keys(usersData[0]))
        console.log('Sample user:', usersData[0])
      }
    }
    
    // 2. Check Pitches table
    console.log('\n2. PITCHES TABLE CHECK:')
    const { data: pitchesData, error: pitchesError } = await supabase
      .from('pitches')
      .select('*')
      .limit(1)
    
    if (pitchesError) {
      console.error('❌ Pitches table error:', pitchesError)
    } else {
      console.log('✅ Pitches table accessible')
      if (pitchesData && pitchesData.length > 0) {
        console.log('Pitches table structure:', Object.keys(pitchesData[0]))
        console.log('Sample pitch:', pitchesData[0])
      }
    }
    
    // 3. Check if the issue is with field names
    console.log('\n3. FIELD NAME VERIFICATION:')
    const { data: pitchCheck, error: pitchFieldError } = await supabase
      .from('pitches')
      .select('id, title, user_id, veteran_id')
      .limit(1)
    
    if (pitchFieldError) {
      console.log('Pitch field check error:', pitchFieldError)
    } else {
      console.log('✅ Pitch field check successful:', pitchCheck)
    }
    
    // 4. Check Shortlist table
    console.log('\n4. SHORTLIST TABLE CHECK:')
    const { data: shortlistData, error: shortlistError } = await supabase
      .from('shortlist')
      .select('*')
      .limit(1)
    
    if (shortlistError) {
      console.log('❌ Shortlist table error (expected):', shortlistError)
    } else {
      console.log('✅ Shortlist table accessible:', shortlistData)
    }
    
    // 5. Test the exact query from our API
    console.log('\n5. TESTING API QUERY:')
    const testUserId = '151d25b6-d70b-495b-b21d-4b44efb47acd' // From user logs
    
    // Test if this user exists
    const { data: userCheck, error: userCheckError } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('id', testUserId)
      .single()
    
    if (userCheckError) {
      console.log('❌ User check error:', userCheckError)
    } else {
      console.log('✅ User exists:', userCheck)
    }
    
    // 6. Check what tables DO exist
    console.log('\n6. ALTERNATIVE TABLE CHECK:')
    
    // Try common table names that might exist
    const tablesToCheck = [
      'profiles', 'recruiter_shortlist', 'saved_pitches', 
      'favorites', 'bookmarks', 'recruiter_favorites'
    ]
    
    for (const table of tablesToCheck) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (!error) {
        console.log(`✅ Table '${table}' exists:`, data)
      } else {
        console.log(`❌ Table '${table}' does not exist:`, error.message)
      }
    }
    
    // 7. Try to determine the correct join field for pitches
    console.log('\n7. PITCH JOIN FIELD TEST:')
    
    if (pitchesData && pitchesData.length > 0) {
      const pitch = pitchesData[0]
      console.log('Pitch foreign key fields:')
      
      // Check for user_id field
      if (pitch.user_id) {
        console.log(`- user_id: ${pitch.user_id}`)
        
        // Try to join with users
        const { data: joinTest, error: joinError } = await supabase
          .from('pitches')
          .select(`
            id,
            title,
            user_id,
            user:user_id (
              name,
              email
            )
          `)
          .limit(1)
        
        if (joinError) {
          console.log('❌ Join with user_id failed:', joinError)
        } else {
          console.log('✅ Join with user_id successful:', joinTest)
        }
      }
      
      // Check for veteran_id field
      if (pitch.veteran_id) {
        console.log(`- veteran_id: ${pitch.veteran_id}`)
        
        // Try to join with users
        const { data: joinTest2, error: joinError2 } = await supabase
          .from('pitches')
          .select(`
            id,
            title,
            veteran_id,
            veteran:veteran_id (
              name,
              email
            )
          `)
          .limit(1)
        
        if (joinError2) {
          console.log('❌ Join with veteran_id failed:', joinError2)
        } else {
          console.log('✅ Join with veteran_id successful:', joinTest2)
        }
      }
    }
    
    console.log('\n================================================================')
    console.log('✅ PRODUCTION SCHEMA CHECK COMPLETE')
    
  } catch (error) {
    console.error('❌ Schema check failed:', error)
  }
}

checkProductionSchema()
