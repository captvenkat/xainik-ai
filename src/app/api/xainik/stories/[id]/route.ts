import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'

export async function GET(
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

    const { id: storyId } = await params

    // Get story with pitch ownership check
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select(`
        *,
        pitches(user_id)
      `)
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    if (story.pitches?.[0]?.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ story })

  } catch (error) {
    console.error('Error in story fetch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const { id: storyId } = await params
    const body = await request.json()
    const { summary, body_md, style_seed } = body

    // Validate required fields
    if (!summary || !body_md) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user owns this story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select(`
        id,
        status,
        pitch_id,
        pitches(user_id)
      `)
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    if (story.pitches?.[0]?.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (story.status !== 'draft') {
      return NextResponse.json({ error: 'Can only update draft stories' }, { status: 400 })
    }

    // Update story
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        summary: summary.trim(),
        body_md: body_md.trim(),
        style_seed: style_seed || null
      })
      .eq('id', storyId)
      .eq('status', 'draft')

    if (updateError) {
      console.error('Story update error:', updateError)
      return NextResponse.json({ error: 'Failed to update story' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Error in story update:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
