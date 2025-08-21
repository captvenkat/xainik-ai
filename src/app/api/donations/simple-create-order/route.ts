import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/payments/razorpay'

export async function POST(request: NextRequest) {
  try {
    const { amount, donationId, donor_name, email } = await request.json()
    
    console.log('Simple API: Creating order for:', { amount, donationId, donor_name, email })
    
    // Validate basic requirements
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

    // Create Razorpay order using existing function
    const order = await createOrder({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `donation_${donationId}`,
      notes: {
        type: 'donation',
        donation_id: donationId,
        donor_name: donor_name || 'Anonymous',
        donor_email: email
      }
    })
    
    console.log('Simple API: Order created successfully:', order.id)

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    })

  } catch (error) {
    console.error('Simple API: Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
}
