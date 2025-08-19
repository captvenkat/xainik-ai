import { NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import type { Database } from '@/types/live-schema'
import { toCSV } from '@/lib/csv'

export async function GET() {
  const supabase = await createSupabaseServerOnly()
  // Note: user_activity_log table doesn't exist in live schema
  const rows: any[] = []

  const flat = rows.map((r: any) => ({
    id: r.id,
    activity_type: r.activity_type,
    created_at: r.created_at,
    metadata: r.metadata ? JSON.stringify(r.metadata) : ''
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
