import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabaseClient'
import { toCSV } from '@/lib/csv'

export async function GET() {
  const supabase = getServerSupabase()
  const { data: rows } = await supabase
    .from('pitches')
    .select('id, title, is_active, plan_tier, plan_expires_at, veteran_id, created_at')
    .order('created_at', { ascending: false })
    .limit(5000)

  const csv = toCSV(rows || [])
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="pitches.csv"'
    }
  })
}
