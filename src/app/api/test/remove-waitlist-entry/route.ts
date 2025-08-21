import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerOnly()
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    console.log(`🔍 Removing waitlist entry for email: ${email}`)
    
    // Delete waitlist entry from activity_log
    const { data: deletedEntry, error: deleteError } = await supabase
      .from('activity_log')
      .delete()
      .eq('event_type', 'waitlist_signup')
      .eq('metadata->>email', email)
      .select()
    
    if (deleteError) {
      console.error('Error deleting waitlist entry:', deleteError)
      return NextResponse.json(
        { error: 'Failed to remove waitlist entry', details: deleteError.message },
        { status: 500 }
      )
    }
    
    if (deletedEntry && deletedEntry.length > 0) {
      console.log('Successfully removed waitlist entry:', deletedEntry[0].id)
      return NextResponse.json({ 
        message: 'Waitlist entry removed successfully',
        removedEntry: deletedEntry[0]
      })
    } else {
      console.log('No waitlist entry found for email:', email)
      return NextResponse.json({ 
        message: 'No waitlist entry found for this email'
      })
    }
    
  } catch (error) {
    console.error('Unexpected error in remove waitlist entry API:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
