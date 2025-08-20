import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

interface ShareData {
  platform: string
  position: number
  email?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerOnly()
    const body: ShareData = await request.json()

    if (!body.platform || !body.position) {
      return NextResponse.json(
        { error: 'Platform and position are required' },
        { status: 400 }
      )
    }

    // Log the share event for analytics
    await supabase
      .from('activity_log')
      .insert({
        event: 'waitlist_shared',
        meta: {
          platform: body.platform,
          position: body.position
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Share tracked successfully'
    })

  } catch (error) {
    console.error('Waitlist share error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
