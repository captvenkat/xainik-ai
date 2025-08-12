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

    // Test 2: Try to access payment events archive (admin only)
    const { data: paymentEvents, error: eventError } = await supabase
      .from('payment_events_archive')
      .select('id, event_id')
      .limit(1)

    results.paymentEventAccess = {
      success: !eventError,
      error: eventError?.message,
      count: paymentEvents?.length || 0
    }

    // Test 3: Try to access user activity log (admin only)
    const { data: activityLogs, error: activityError } = await supabase
      .from('user_activity_log')
      .select('id, activity_type')
      .limit(1)

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
