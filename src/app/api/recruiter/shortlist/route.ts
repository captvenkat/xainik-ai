import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { createAdminClient } from '@/lib/supabaseAdmin'

// GET: Retrieve recruiter's shortlist
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Shortlist API: Starting authentication check...')
    
    // Get user ID from headers
    const userId = request.headers.get('X-User-ID')
    console.log('🔍 Shortlist API: User ID from headers:', userId)
    
    if (!userId) {
      console.log('🔍 Shortlist API: No user ID in headers')
      return NextResponse.json({ error: 'Unauthorized - No user ID' }, { status: 401 })
    }
    
    // Use admin client to verify user and role
    const adminSupabase = createAdminClient()
    
    // Check if user exists and is a recruiter
    const { data: profile, error: profileError } = await adminSupabase
      .from('users')
      .select('role, name')
      .eq('id', userId)
      .single()
    
    console.log('🔍 Shortlist API: Profile result:', { profile, error: profileError?.message })

    if (profileError || !profile) {
      console.log('🔍 Shortlist API: User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (profile.role !== 'recruiter') {
      console.log('🔍 Shortlist API: User is not a recruiter')
      return NextResponse.json({ error: 'Forbidden - Not a recruiter' }, { status: 403 })
    }

    // Fetch shortlisted pitches with veteran details
    const { data: shortlist, error } = await adminSupabase
      .from('shortlist')
      .select(`
        *,
        pitch:pitch_id (
          *,
          veteran:user_id (
            name,
            email
          )
        )
      `)
      .eq('recruiter_user_id', userId)
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
    // Get user ID from headers
    const userId = request.headers.get('X-User-ID')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - No user ID' }, { status: 401 })
    }
    
    // Use admin client to verify user and role
    const adminSupabase = createAdminClient()
    
    // Check if user exists and is a recruiter
    const { data: profile, error: profileError } = await adminSupabase
      .from('users')
      .select('role, name')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (profile.role !== 'recruiter') {
      return NextResponse.json({ error: 'Forbidden - Not a recruiter' }, { status: 403 })
    }

    const { pitch_id, notes, priority } = await request.json()

    if (!pitch_id) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }

    // Add to shortlist
    const { data, error } = await adminSupabase
      .from('shortlist')
      .insert({
        recruiter_user_id: userId,
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
    await adminSupabase
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
    // Get user ID from headers
    const userId = request.headers.get('X-User-ID')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - No user ID' }, { status: 401 })
    }
    
    // Use admin client to verify user and role
    const adminSupabase = createAdminClient()
    
    // Check if user exists and is a recruiter
    const { data: profile, error: profileError } = await adminSupabase
      .from('users')
      .select('role, name')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (profile.role !== 'recruiter') {
      return NextResponse.json({ error: 'Forbidden - Not a recruiter' }, { status: 403 })
    }

    const { id, status, notes, priority } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Shortlist item ID is required' }, { status: 400 })
    }

    // Update shortlist item - for now just update the timestamp
    const { data, error } = await adminSupabase
      .from('shortlist')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('recruiter_user_id', userId)
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
