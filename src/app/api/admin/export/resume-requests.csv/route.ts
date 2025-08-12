import { NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { toCSV } from '@/lib/csv'

export async function GET() {
  const supabase = await createSupabaseServerOnly()
  const { data: rows } = await supabase
    .from('resume_requests')
    .select('id, recruiter_user_id, user_id, pitch_id, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5000)

  const csv = toCSV(rows || [])
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="resume-requests.csv"'
    }
  })
}
