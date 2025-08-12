import { NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { toCSV } from '@/lib/csv'

export async function GET() {
  const supabase = await createSupabaseServerOnly()
  const { data: rows } = await supabase
    .from('user_activity_log')
    .select('id, activity_type, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(2000)

  const flat = (rows || []).map((r: any) => ({
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
