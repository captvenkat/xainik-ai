import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const pitchId = id

    if (!pitchId) {
      return NextResponse.json(
        { error: 'Pitch ID is required' },
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

    // Group stories by status
    const published = stories?.filter(s => s.status === 'published') || []
    const queued = stories?.filter(s => s.status === 'queued') || []
    const drafts = stories?.filter(s => s.status === 'draft') || []

    return NextResponse.json({
      stories: stories || [],
      published,
      queued,
      drafts,
      counts: {
        total: stories?.length || 0,
        published: published.length,
        queued: queued.length,
        drafts: drafts.length
      }
    })

  } catch (error) {
    console.error('Error in stories list:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
