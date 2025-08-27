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
    const { pitch_id, bullets } = body

    // Validate required fields
    if (!pitch_id || !bullets || !Array.isArray(bullets)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user owns this pitch
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select('id, user_id')
      .eq('id', pitch_id)
      .single()

    if (pitchError || !pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
    }

    if (pitch.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Prepare bullets for insertion
    const bulletsToInsert = bullets.map((bullet: any) => ({
      pitch_id,
      text: bullet.text,
      competency: bullet.competency,
      metrics_present: bullet.metrics_present || false,
      used_military_term: bullet.used_military_term || false
    }))

    // Insert bullets
    const { data: insertedBullets, error: insertError } = await supabase
      .from('corporate_bullets')
      .insert(bulletsToInsert)
      .select('id')

    if (insertError) {
      console.error('Corporate bullets insertion error:', insertError)
      return NextResponse.json({ error: 'Failed to save bullets' }, { status: 500 })
    }

    return NextResponse.json({ 
      ok: true, 
      count: insertedBullets.length 
    })

  } catch (error) {
    console.error('Error in corporate bullets save:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
