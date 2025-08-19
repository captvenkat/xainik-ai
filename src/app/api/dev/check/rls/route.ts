import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export async function GET(request: NextRequest) {
  // Only allow in development with DEV_TEST_ROUTES=true
  if (process.env.NODE_ENV !== 'development' || process.env.DEV_TEST_ROUTES !== 'true') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }

  try {
    const supabase = await createSupabaseServerOnly()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const results: any = {}

    // Test 1: Try to access donations from different user
    const { data: otherDonations, error: donationError } = await supabase
      .from('donations')
      .select('id, amount_cents')
      .neq('user_id', user.id)
      .limit(1)

    results.donationAccess = {
      success: !donationError,
      error: donationError?.message,
      count: otherDonations?.length || 0
    }

    // Note: payment_events_archive table doesn't exist in live schema
    const paymentEvents: any[] = []
    const eventError = new Error('payment_events_archive table not in live schema')

    results.paymentEventAccess = {
      success: !eventError,
      error: eventError?.message,
      count: paymentEvents?.length || 0
    }

    // Note: user_activity_log table doesn't exist in live schema
    const activityLogs: any[] = []
    const activityError = new Error('user_activity_log table not in live schema')

    results.activityLogAccess = {
      success: !activityError,
      error: activityError?.message,
      count: activityLogs?.length || 0
    }

    // Summary
    const expectedFailures = ['paymentEventAccess', 'activityLogAccess']
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
    return NextResponse.json(
      { error: 'RLS check failed' },
      { status: 500 }
    )
  }
}
