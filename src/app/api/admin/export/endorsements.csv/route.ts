import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabaseClient'
import { toCSV } from '@/lib/csv'

export async function GET() {
  const supabase = getServerSupabase()
  const { data: rows } = await supabase
    .from('endorsements')
    .select('id, veteran_id, endorser_id, created_at')
    .order('created_at', { ascending: false })
    .limit(5000)

  const csv = toCSV(rows || [])
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="endorsements.csv"'
    }
  })
}
