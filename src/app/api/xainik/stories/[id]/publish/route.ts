import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const storyId = id

    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServer()

    // Get story details
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Verify user owns the pitch
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select('user_id')
      .eq('id', story.pitch_id)
      .single()

    if (pitchError || !pitch) {
      return NextResponse.json(
        { error: 'Pitch not found' },
        { status: 404 }
      )
    }

    // Check if another story was already published today for this pitch
    const today = new Date().toISOString().split('T')[0]
    const { data: todayStories, error: todayError } = await supabase
      .from('stories')
      .select('id')
      .eq('pitch_id', story.pitch_id)
      .eq('status', 'published')
      .gte('published_at', `${today}T00:00:00`)
      .lt('published_at', `${today}T23:59:59`)

    if (todayError) {
      console.error('Error checking today stories:', todayError)
      return NextResponse.json(
        { error: 'Failed to check publication status' },
        { status: 500 }
      )
    }

    if (todayStories && todayStories.length > 0) {
      // Queue for tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowDate = tomorrow.toISOString().split('T')[0]

      const { error: queueError } = await supabase
        .from('stories')
        .update({
          status: 'queued',
          scheduled_for: tomorrowDate
        })
        .eq('id', storyId)

      if (queueError) {
        console.error('Error queuing story:', queueError)
        return NextResponse.json(
          { error: 'Failed to queue story' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        status: 'queued',
        message: 'Story queued for tomorrow 12:00 AM IST',
        scheduled_for: tomorrowDate
      })
    } else {
      // Publish immediately
      const { error: publishError } = await supabase
        .from('stories')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', storyId)

      if (publishError) {
        console.error('Error publishing story:', publishError)
        return NextResponse.json(
          { error: 'Failed to publish story' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        status: 'published',
        message: 'Story published successfully',
        published_at: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Error in story publish:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
