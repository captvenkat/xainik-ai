import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServer()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id: pitchId } = await params
    const body = await request.json()
    const { targets, ...otherPreferences } = body

    // Verify user owns this pitch
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select('id, user_id')
      .eq('id', pitchId)
      .single()

    if (pitchError || !pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
    }

    if (pitch.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Build update object
    const updateData: any = {}
    
    if (targets) {
      updateData.targets = targets
    }
    
    if (Object.keys(otherPreferences).length > 0) {
      updateData.preferences = otherPreferences
    }

    // Update pitch
    const { error: updateError } = await supabase
      .from('pitches')
      .update({
        preferences: updateData
      })
      .eq('id', pitchId)

    if (updateError) {
      console.error('Pitch update error:', updateError)
      return NextResponse.json({ error: 'Failed to update pitch' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Error in pitch preferences update:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
