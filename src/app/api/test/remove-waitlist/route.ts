import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerOnly()
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    console.log(`🔍 Looking for waitlist entries with email: ${email}`)
    
    // Find waitlist entries in activity_log
    const { data: waitlistEntries, error: searchError } = await supabase
      .from('activity_log')
      .select('*')
      .eq('event', 'waitlist_joined')
      .contains('meta', { email: email })
    
    if (searchError) {
      console.error('Error searching for waitlist entries:', searchError)
      return NextResponse.json(
        { error: 'Failed to search for waitlist entries', details: searchError.message },
        { status: 500 }
      )
    }
    
    if (!waitlistEntries || waitlistEntries.length === 0) {
      console.log('No waitlist entries found for this email')
      return NextResponse.json({ 
        message: 'No waitlist entries found for this email',
        deleted: false 
      })
    }
    
    console.log(`Found ${waitlistEntries.length} waitlist entries`)
    
    // Delete all waitlist entries for this email
    const entryIds = waitlistEntries.map(entry => entry.id)
    const { error: deleteError } = await supabase
      .from('activity_log')
      .delete()
      .in('id', entryIds)
    
    if (deleteError) {
      console.error('Error deleting waitlist entries:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete waitlist entries', details: deleteError.message },
        { status: 500 }
      )
    }
    
    console.log(`✅ Successfully deleted ${waitlistEntries.length} waitlist entries`)
    
    return NextResponse.json({ 
      message: `Successfully removed ${waitlistEntries.length} waitlist entries`,
      deleted: true,
      entriesRemoved: waitlistEntries.length
    })
    
  } catch (error) {
    console.error('❌ Error removing waitlist entries:', error)
    return NextResponse.json(
      { error: 'Failed to remove waitlist entries', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
