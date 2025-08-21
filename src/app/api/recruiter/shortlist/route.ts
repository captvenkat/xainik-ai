import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

// GET: Retrieve recruiter's shortlist
export async function GET() {
  try {
    console.log('🔍 Shortlist API: Starting authentication check...')
    
    const supabase = await createSupabaseServerOnly()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('🔍 Shortlist API: Auth result:', { user: user?.id, error: authError?.message })
    
    if (authError || !user) {
      console.log('🔍 Shortlist API: Authentication failed')
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

    // Fetch shortlisted pitches with veteran details
    const { data: shortlist, error } = await supabase
      .from('shortlist')
      .select(`
        *,
        pitch:pitch_id (
          *,
          veteran:veteran_id (
            name,
            email
          )
        )
      `)
      .eq('recruiter_user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Shortlist fetch error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(shortlist || [])
  } catch (error) {
    console.error('Shortlist API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Add pitch to shortlist
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

    const { pitch_id, notes, priority } = await request.json()

    if (!pitch_id) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }

    // Add to shortlist
    const { data, error } = await supabase
      .from('shortlist')
      .insert({
        recruiter_user_id: user.id,
        pitch_id
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Pitch already in shortlist' }, { status: 409 })
      }
      console.error('Shortlist insert error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        event: 'recruiter_shortlisted',
        meta: {
          recruiter_name: profile.name || 'Recruiter',
          pitch_id,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Shortlist API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Update shortlist item
export async function PUT(request: NextRequest) {
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

    const { id, status, notes, priority } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Shortlist item ID is required' }, { status: 400 })
    }

    // Update shortlist item - for now just update the timestamp
    const { data, error } = await supabase
      .from('shortlist')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('recruiter_user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Shortlist update error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Shortlist API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
