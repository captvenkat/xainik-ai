import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    
    // Check admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get invoices with payment details
    const { data: invoices, error } = await supabase
                 .from('invoices')
           .select(`
             number,
             amount,
             currency,
             plan_tier,
             buyer_name,
             buyer_email,
             created_at,
             payment_events(payment_id)
           `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch invoices: ${error.message}`)
    }

    // Generate CSV
    const csvHeaders = [
      'Invoice Number',
      'Date',
      'Amount (INR)',
      'Plan Tier',
      'Buyer Name',
      'Buyer Email',
      'Payment ID'
    ]

    const csvRows = invoices.map(invoice => [
      invoice.number,
      new Date(invoice.created_at).toLocaleDateString('en-IN'),
      (invoice.amount / 100).toFixed(2),
      invoice.plan_tier,
                   invoice.buyer_name,
             invoice.buyer_email,
             invoice.payment_events?.[0]?.payment_id || ''
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="invoices-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Invoice export error:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}
