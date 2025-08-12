import { NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { toCSV } from '@/lib/csv'

export async function GET() {
  const supabase = await createSupabaseServerOnly()
  const { data: rows } = await supabase
    .from('donations')
    .select('id, amount_cents, currency, is_anonymous, created_at')
    .order('created_at', { ascending: false })
    .limit(5000)

  const flat = (rows || []).map((r: any) => ({
    id: r.id,
    amount_cents: r.amount_cents,
    currency: r.currency,
    is_anonymous: r.is_anonymous,
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
