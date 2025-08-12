import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export async function POST(request: NextRequest) {
  try {
    // Verify admin API key
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // NOTE: payment_events table doesn't exist in current schema
    // This cron job is disabled until billing system is fully implemented
    return NextResponse.json({ 
      message: 'Archive cron job disabled - payment_events table not found',
      archived: 0,
      note: 'Enable when billing system is implemented'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Archive failed' },
      { status: 500 }
    )
  }
}
