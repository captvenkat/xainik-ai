import { NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { toCSV } from '@/lib/csv'

export async function GET() {
  const supabase = await createSupabaseServerOnly()
  // Note: Live database has incomplete endorsements schema
  // Working code expects: id, user_id, endorser_user_id, text, created_at
  // Live database only has: id, created_at, updated_at
  // Using available columns until schema is properly migrated
  const { data: rows } = await supabase
    .from('endorsements')
    .select('id, created_at, text, user_id, endorser_user_id, endorser_name, endorser_email, is_anonymous, pitch_id')
    .order('created_at', { ascending: false })
    .limit(5000)

  // Transform to expected format with actual data
  const transformedRows = (rows || []).map(row => ({
    id: row.id,
    user_id: row.user_id || 'N/A',
    endorser_user_id: row.endorser_user_id || 'N/A',
    text: row.text || 'N/A',
    created_at: row.created_at
  }))

  const csv = toCSV(transformedRows)
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="endorsements.csv"'
    }
  })
}
