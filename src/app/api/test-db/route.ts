import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    console.log('🔍 Test DB: Starting database test...')
    
    const adminSupabase = createAdminClient()
    
    // Test 1: Check if shortlist table exists
    const { data: shortlistTest, error: shortlistError } = await adminSupabase
      .from('shortlist')
      .select('count')
      .limit(1)
    
    console.log('🔍 Test DB: Shortlist table test:', { 
      exists: !shortlistError, 
      error: shortlistError?.message 
    })
    
    // Test 2: Check if pitches table exists and has data
    const { data: pitchesTest, error: pitchesError } = await adminSupabase
      .from('pitches')
      .select('id, title, user_id')
      .limit(5)
    
    console.log('🔍 Test DB: Pitches table test:', { 
      exists: !pitchesError, 
      count: pitchesTest?.length || 0,
      error: pitchesError?.message 
    })
    
    // Test 3: Check if users table exists
    const { data: usersTest, error: usersError } = await adminSupabase
      .from('users')
      .select('id, name, role')
      .limit(5)
    
    console.log('🔍 Test DB: Users table test:', { 
      exists: !usersError, 
      count: usersTest?.length || 0,
      error: usersError?.message 
    })
    
    return NextResponse.json({
      success: true,
      tables: {
        shortlist: { exists: !shortlistError, error: shortlistError?.message },
        pitches: { exists: !pitchesError, count: pitchesTest?.length || 0, error: pitchesError?.message },
        users: { exists: !usersError, count: usersTest?.length || 0, error: usersError?.message }
      }
    })
  } catch (error) {
    console.error('🔍 Test DB: Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
