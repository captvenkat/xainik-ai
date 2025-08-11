import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabaseClient'
import { toCSV } from '@/lib/csv'

export async function GET() {
  const supabase = getServerSupabase()
  const { data: rows } = await supabase
    .from('receipts')
    .select('id, amount_paise, donor_name, donor_email, anonymous, created_at')
    .order('created_at', { ascending: false })
    .limit(5000)

  const flat = (rows || []).map(r => ({
    id: r.id,
    amount_paise: r.amount_paise,
    donor_name: r.anonymous ? 'Anonymous' : r.donor_name,
    donor_email: r.anonymous ? '' : r.donor_email,
    anonymous: r.anonymous,
    created_at: r.created_at
  }))

  const csv = toCSV(flat)
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="donations.csv"'
    }
  })
}
