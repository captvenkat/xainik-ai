import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { createOrder } from '@/lib/payments/razorpay'

export async function POST(request: NextRequest) {
  try {
    // Get current user (optional for anonymous donations)
    const supabase = await createSupabaseServerOnly()
    const { data: { user } } = await supabase.auth.getUser()

    // Parse request body
    const body = await request.json()
    const { amount, donationId, donor_name, email } = body

    // Validate required fields
    if (!amount || amount < 10) {
      return NextResponse.json(
        { error: 'Invalid amount. Minimum donation is ₹10.' },
        { status: 400 }
      )
    }

    if (!donationId) {
      return NextResponse.json(
        { error: 'Donation ID is required' },
        { status: 400 }
      )
    }

    // Create Razorpay order
    const order = await createOrder({
      amount: amount,
      currency: 'INR',
      receipt: `donation_${donationId}`,
      notes: {
        type: 'donation',
        donation_id: donationId,
        donor_name: donor_name || 'Anonymous',
        user_id: user?.id || 'anonymous'
      }
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    })

  } catch (error) {
    console.error('Error creating donation order:', error)
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
}
