import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function GET() {
  try {
    // Fetch stats from the view
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('v_stats')
      .select('*')
      .single()

    if (statsError) {
      console.error('Error fetching stats:', statsError)
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      )
    }

    // Fetch recent donations for live feed
    const { data: feed, error: feedError } = await supabaseAdmin
      .from('v_public_feed')
      .select('*')
      .limit(10)

    if (feedError) {
      console.error('Error fetching feed:', feedError)
      // Don't fail the entire request if feed fails
    }

    return NextResponse.json({
      ...stats,
      recent_donations: feed || []
    })
  } catch (error) {
    console.error('Metrics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
