import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerOnly()
    
    console.log('🔍 Listing all waitlist entries...')
    
    // Find all waitlist entries in activity_log
    const { data: waitlistEntries, error: searchError } = await supabase
      .from('activity_log')
      .select('*')
      .eq('event', 'veteran_joined_waitlist')
    
    if (searchError) {
      console.error('Error searching for waitlist entries:', searchError)
      return NextResponse.json(
        { error: 'Failed to search for waitlist entries', details: searchError.message },
        { status: 500 }
      )
    }
    
    console.log(`Found ${waitlistEntries?.length || 0} waitlist entries`)
    
    return NextResponse.json({ 
      message: `Found ${waitlistEntries?.length || 0} waitlist entries`,
      entries: waitlistEntries || [],
      count: waitlistEntries?.length || 0
    })
    
  } catch (error) {
    console.error('❌ Error listing waitlist entries:', error)
    return NextResponse.json(
      { error: 'Failed to list waitlist entries', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
