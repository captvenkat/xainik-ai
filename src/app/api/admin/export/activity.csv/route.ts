import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabaseClient'
import { toCSV } from '@/lib/csv'

export async function GET() {
  const supabase = getServerSupabase()
  const { data: rows } = await supabase
    .from('activity_log')
    .select('id, event_type, event_data, created_at')
    .order('created_at', { ascending: false })
    .limit(2000)

  const flat = (rows || []).map(r => ({
    id: r.id,
    event_type: r.event_type,
    created_at: r.created_at,
    event_data: r.event_data ? JSON.stringify(r.event_data) : ''
  }))

  const csv = toCSV(flat)
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="activity.csv"'
    }
  })
}
