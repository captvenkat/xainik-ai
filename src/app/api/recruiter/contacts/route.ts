import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

// GET: Retrieve recruiter's contact history
export async function GET() {
  try {
    const supabase = await createSupabaseServerOnly()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a recruiter
    const { data: profile } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'recruiter') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // For now, return empty array since recruiter_contacts table doesn't exist yet
    const contacts: any[] = []
    const error = null

    if (error) {
      console.error('Contacts fetch error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(contacts || [])
  } catch (error) {
    console.error('Contacts API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Log a new contact
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerOnly()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a recruiter
    const { data: profile } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'recruiter') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { pitch_id, contact_type, outcome, notes, follow_up_date } = await request.json()

    if (!pitch_id || !contact_type) {
      return NextResponse.json({ error: 'Pitch ID and contact type are required' }, { status: 400 })
    }

    // For now, just log the activity since recruiter_contacts table doesn't exist yet
    const data = { id: 'temp', contact_type, pitch_id }
    const error = null

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        event: 'recruiter_contacted',
        meta: {
          recruiter_name: profile.name || 'Recruiter',
          pitch_id,
          contact_type,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Contacts API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
