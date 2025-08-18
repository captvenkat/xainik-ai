import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { pitchId, shareType, targetEmail, message } = await request.json()
    
    if (!pitchId) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get the pitch details
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select('*')
      .eq('id', pitchId)
      .eq('user_id', user.id)
      .single()

    if (pitchError || !pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
    }

    // Create share record
    const { data: shareRecord, error: shareError } = await supabase
      .from('shared_pitches')
      .insert({
        pitch_id: pitchId,
        shared_by: user.id,
        share_type: shareType || 'direct',
        target_email: targetEmail,
        message: message,
        shared_at: new Date().toISOString()
      })
      .select()
      .single()

    if (shareError) {
      console.error('Share record creation error:', shareError)
      return NextResponse.json({ error: 'Failed to record share' }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        activity_type: 'pitch_shared',
        activity_data: {
          pitch_id: pitchId,
          share_type: shareType,
          target_email: targetEmail
        },
        created_at: new Date().toISOString()
      })

    return NextResponse.json({ 
      success: true, 
      shareId: shareRecord.id,
      message: 'Pitch shared successfully' 
    })

  } catch (error) {
    console.error('Share pitch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user's pitches that can be shared
    const { data: pitches, error: pitchesError } = await supabase
      .from('pitches')
      .select('id, title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (pitchesError) {
      console.error('Pitches fetch error:', pitchesError)
      return NextResponse.json({ error: 'Failed to fetch pitches' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      pitches: pitches || [] 
    })

  } catch (error) {
    console.error('Get pitches error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
