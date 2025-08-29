import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    // Validate inputs
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification parameters' },
        { status: 400 }
      )
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex')

    if (signature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Update donation status
    const { data: donation, error: updateError } = await supabaseAdmin
      .from('donations')
      .update({
        status: 'paid',
        payment_id: razorpay_payment_id
      })
      .eq('order_id', razorpay_order_id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating donation:', updateError)
      return NextResponse.json(
        { error: 'Failed to update donation status' },
        { status: 500 }
      )
    }

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    // Get donor information for response
    const { data: donor } = await supabaseAdmin
      .from('donors')
      .select('name, email')
      .eq('id', donation.donor_id)
      .single()

    return NextResponse.json({
      success: true,
      donation: {
        id: donation.id,
        amount: donation.amount,
        display_name: donation.display_name,
        is_anonymous: donation.is_anonymous
      },
      donor: donor ? {
        name: donor.name,
        email: donor.email
      } : null
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
