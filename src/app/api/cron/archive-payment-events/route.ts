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

    const supabase = createSupabaseServerOnly()

    // Calculate cutoff date (180 days ago)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 180)

    console.log(`🔄 Archiving payment events older than ${cutoffDate.toISOString()}`)

    // Get old payment events
    const { data: oldEvents, error: fetchError } = await supabase
      .from('payment_events')
      .select('*')
      .lt('created_at', cutoffDate.toISOString())

    if (fetchError) {
      throw new Error(`Failed to fetch old events: ${fetchError.message}`)
    }

    if (!oldEvents || oldEvents.length === 0) {
      console.log('ℹ️  No old payment events to archive')
      return NextResponse.json({ 
        message: 'No events to archive',
        archived: 0
      })
    }

    console.log(`📦 Found ${oldEvents.length} events to archive`)

    // Insert into archive table
    const eventsToArchive = oldEvents.map(event => ({
      ...event,
      archived_at: new Date().toISOString()
    }))

    const { error: archiveError } = await supabase
      .from('payment_events_archive')
      .insert(eventsToArchive)

    if (archiveError) {
      throw new Error(`Failed to archive events: ${archiveError.message}`)
    }

    // Delete from original table
    const { error: deleteError } = await supabase
      .from('payment_events')
      .delete()
      .lt('created_at', cutoffDate.toISOString())

    if (deleteError) {
      throw new Error(`Failed to delete old events: ${deleteError.message}`)
    }

    console.log(`✅ Successfully archived ${oldEvents.length} payment events`)

    return NextResponse.json({
      message: 'Payment events archived successfully',
      archived: oldEvents.length,
      cutoffDate: cutoffDate.toISOString()
    })

  } catch (error) {
    console.error('Archive payment events error:', error)
    return NextResponse.json(
      { error: 'Archive failed' },
      { status: 500 }
    )
  }
}
