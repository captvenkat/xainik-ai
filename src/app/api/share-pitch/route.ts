import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

export async function POST(request: NextRequest) {
  try {
    const { pitchId, shareType, message, customFields } = await request.json()
    
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

    // Note: shared_pitches table has incomplete schema in live database
    // Skip creating share record until table is properly migrated
    const shareRecord = null
    const shareError = null

    if (shareError) {
      console.error('Share record creation error:', shareError)
      return NextResponse.json({ error: 'Failed to record share' }, { status: 500 })
    }

    // Note: user_activity_log table doesn't exist in live schema
    // Skip activity logging until table is created

    return NextResponse.json({ 
      success: true, 
      shareId: 'temp-id',
      message: 'Smart share generated successfully (share tracking disabled - table not migrated)',
      shareData: {
        pitchId,
        shareType,
        messageLength: message?.length || 0,
        customFieldsCount: Object.keys(customFields || {}).length
      }
    })

  } catch (error) {
    console.error('Share pitch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Create supabase client with the token
    const supabase = createSupabaseBrowser()
    
    // Set the session manually
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user's pitches that can be shared with enhanced data
    const { data: pitches, error: pitchesError } = await supabase
      .from('pitches')
      .select('id, title, pitch_text, skills, job_type, availability, created_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
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
