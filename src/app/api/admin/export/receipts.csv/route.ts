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

    // Get receipts with payment details
    const { data: receipts, error } = await supabase
                 .from('receipts')
           .select(`
             number,
             amount,
             currency,
             donor_name,
             donor_email,
             is_anonymous,
             created_at,
             payment_events(payment_id)
           `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch receipts: ${error.message}`)
    }

    // Generate CSV
    const csvHeaders = [
      'Receipt Number',
      'Date',
      'Amount (INR)',
      'Donor Name',
      'Donor Email',
      'Anonymous',
      'Payment ID'
    ]

    const csvRows = receipts.map(receipt => [
      receipt.number,
      new Date(receipt.created_at).toLocaleDateString('en-IN'),
      (receipt.amount / 100).toFixed(2),
      receipt.is_anonymous ? 'Anonymous' : (receipt.donor_name || 'Not Provided'),
      receipt.is_anonymous ? 'Anonymous' : (receipt.donor_email || 'Not Provided'),
                   receipt.is_anonymous ? 'Yes' : 'No',
             receipt.payment_events?.[0]?.payment_id || ''
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="receipts-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Receipt export error:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}
