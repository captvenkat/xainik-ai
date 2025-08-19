import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { logUserActivity } from '@/lib/actions/activity-server'
import { notifySubscriptionExpiry, notifySubscriptionExpired } from '@/lib/actions/notifications-server'

export async function POST(request: NextRequest) {
  try {
    // Verify API key for security
    const authHeader = request.headers.get('authorization')
    const expectedKey = process.env.CRON_API_KEY
    
    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    // Note: user_subscriptions table doesn't exist in live schema
    // Skip subscription expiration check until table is created
    const expiredSubscriptions: any[] = []
    const selectError = new Error('user_subscriptions table not in live schema')
    const expiringSoonSubscriptions: any[] = []

    if (selectError) {
      console.error('Error fetching expired subscriptions:', selectError)
      return NextResponse.json({ error: 'Failed to fetch expired subscriptions' }, { status: 500 })
    }

    // Send warnings for subscriptions expiring soon
    let warningsSent = 0
    if (expiringSoonSubscriptions && expiringSoonSubscriptions.length > 0) {
      for (const subscription of expiringSoonSubscriptions) {
        if (subscription.end_date) {
          await notifySubscriptionExpiry(subscription.user_id, subscription.end_date)
        }
        warningsSent++
      }
    }

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      return NextResponse.json({ 
        message: 'No expired subscriptions found',
        warnings_sent: warningsSent
      })
    }

    // Skip subscription update - table doesn't exist in live schema
    const updateError = null

    if (updateError) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Log activity and send notifications for each expired subscription
    for (const subscription of expiredSubscriptions) {
      await logUserActivity({
        user_id: subscription.user_id,
        activity_type: 'plan_expired',
        activity_data: {
          subscription_id: subscription.id,
          end_date: subscription.end_date
        }
      })
      
      // Send notification to veteran about expired subscription
      await notifySubscriptionExpired(subscription.user_id, {
        subscription_id: subscription.id,
        end_date: subscription.end_date
      })
    }

    return NextResponse.json({
      message: 'Successfully processed expired subscriptions',
      processed: expiredSubscriptions.length,
      warnings_sent: warningsSent
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET method for manual testing (remove in production)
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    // Note: user_subscriptions table doesn't exist in live schema
    const expiredSubscriptions: any[] = []
    const selectError = new Error('user_subscriptions table not in live schema')

    if (selectError) {
      console.error('Error fetching expired subscriptions:', selectError)
      return NextResponse.json({ error: 'Failed to fetch expired subscriptions' }, { status: 500 })
    }

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      return NextResponse.json({ message: 'No expired subscriptions found' })
    }

    return NextResponse.json({
      message: 'Found expired subscriptions',
      expiredSubscriptions,
      count: expiredSubscriptions.length
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
