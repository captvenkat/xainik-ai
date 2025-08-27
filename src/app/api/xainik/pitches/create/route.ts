import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { objective, preferences, title, summary } = body

    // Validate required fields
    if (!objective || !title || !summary) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create pitch
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .insert({
        user_id: user.id,
        objective,
        preferences: preferences || {},
        title: title.trim(),
        pitch_text: summary.trim(),
        skills: [],
        job_type: preferences?.jobType?.[0] || '',
        location: preferences?.location?.[0] || '',
        availability: preferences?.availability?.[0] || '',
        phone: '',
        linkedin_url: '',
        photo_url: null,
        resume_url: null,
        resume_share_enabled: false,
        plan_tier: '',
        plan_expires_at: null,
        is_active: true,
        likes_count: 0,
        views_count: 0,
        shares_count: 0,
        endorsements_count: 0,
        experience_years: 0,
        allow_resume_requests: false
      })
      .select('id')
      .single()

    if (pitchError) {
      console.error('Pitch creation error:', pitchError)
      return NextResponse.json({ error: 'Failed to create pitch' }, { status: 500 })
    }

    return NextResponse.json({ id: pitch.id })

  } catch (error) {
    console.error('Error in pitch creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
