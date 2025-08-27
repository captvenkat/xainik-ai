import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'

// Simple slugify function
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Generate unique slug
async function generateUniqueSlug(supabase: any, pitchId: string, title: string): Promise<string> {
  let slug = slugify(title)
  let counter = 1
  let finalSlug = slug

  while (true) {
    const { data: existing } = await supabase
      .from('stories')
      .select('id')
      .eq('pitch_id', pitchId)
      .eq('slug', finalSlug)
      .single()

    if (!existing) {
      break
    }

    finalSlug = `${slug}-${counter}`
    counter++
  }

  return finalSlug
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { pitch_id, title, summary, body_md, source_spans, coverage_facets, style_seed } = body

    // Validate required fields
    if (!pitch_id || !title || !summary) {
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

    // Generate unique slug
    const slug = await generateUniqueSlug(supabase, pitch_id, title)

    // Create draft story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert({
        pitch_id,
        title: title.trim(),
        slug,
        summary: summary.trim(),
        body_md: body_md || '',
        source_spans: source_spans || [],
        coverage_facets: coverage_facets || [],
        style_seed: style_seed || null,
        status: 'draft'
      })
      .select('id')
      .single()

    if (storyError) {
      console.error('Story creation error:', storyError)
      return NextResponse.json({ error: 'Failed to create story' }, { status: 500 })
    }

    return NextResponse.json({ id: story.id })

  } catch (error) {
    console.error('Error in story creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pitchId = searchParams.get('pitch_id')

    if (!pitchId) {
      return NextResponse.json(
        { error: 'pitch_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServer()

    // Get stories for the pitch
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('*')
      .eq('pitch_id', pitchId)
      .order('created_at', { ascending: false })

    if (storiesError) {
      console.error('Error fetching stories:', storiesError)
      return NextResponse.json(
        { error: 'Failed to fetch stories' },
        { status: 500 }
      )
    }

    return NextResponse.json({ stories: stories || [] })

  } catch (error) {
    console.error('Error in stories GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
