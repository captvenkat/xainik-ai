import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  // Only allow in development with DEV_TEST_ROUTES=true
  if (process.env.NODE_ENV !== 'development' || process.env.DEV_TEST_ROUTES !== 'true') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }

  try {
    const supabase = getServerSupabase()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const results: any = {}

    // Test 1: Try to access invoices from different user
    const { data: otherInvoices, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, number')
      .neq('user_id', user.id)
      .limit(1)

    results.invoiceAccess = {
      success: !invoiceError,
      error: invoiceError?.message,
      count: otherInvoices?.length || 0
    }

    // Test 2: Try to access receipts from different email
    const { data: otherReceipts, error: receiptError } = await supabase
      .from('receipts')
      .select('id, number')
      .neq('donor_email', user.email)
      .limit(1)

    results.receiptAccess = {
      success: !receiptError,
      error: receiptError?.message,
      count: otherReceipts?.length || 0
    }

    // Test 3: Try to access payment events (admin only)
    const { data: paymentEvents, error: eventError } = await supabase
      .from('payment_events')
      .select('id, event_id')
      .limit(1)

    results.paymentEventAccess = {
      success: !eventError,
      error: eventError?.message,
      count: paymentEvents?.length || 0
    }

    // Test 4: Try to access email logs (admin only)
    const { data: emailLogs, error: emailError } = await supabase
      .from('email_logs')
      .select('id, document_type')
      .limit(1)

    results.emailLogAccess = {
      success: !emailError,
      error: emailError?.message,
      count: emailLogs?.length || 0
    }

    // Test 5: Try to access numbering state (admin only)
    const { data: numberingState, error: numberingError } = await supabase
      .from('numbering_state')
      .select('id, fy')
      .limit(1)

    results.numberingAccess = {
      success: !numberingError,
      error: numberingError?.message,
      count: numberingState?.length || 0
    }

    // Summary
    const expectedFailures = ['paymentEventAccess', 'emailLogAccess', 'numberingAccess']
    const actualFailures = Object.entries(results)
      .filter(([key, value]) => expectedFailures.includes(key) && (value as any).success)
      .map(([key]) => key)

    const rlsWorking = actualFailures.length === 0

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role
      },
      rlsWorking,
      expectedFailures,
      actualFailures,
      results
    })

  } catch (error) {
    console.error('RLS check error:', error)
    return NextResponse.json(
      { error: 'RLS check failed' },
      { status: 500 }
    )
  }
}
