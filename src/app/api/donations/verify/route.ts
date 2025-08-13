import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { verifySignature, getPaymentDetails } from '@/lib/payments/razorpay'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      donationId 
    } = body

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification parameters' },
        { status: 400 }
      )
    }

    // Verify payment signature
    const isValidSignature = verifySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    })

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Get payment details from Razorpay
    const paymentDetails = await getPaymentDetails(razorpay_payment_id)

    // Verify payment status
    if (paymentDetails.status !== 'captured') {
      return NextResponse.json(
        { error: 'Payment not captured' },
        { status: 400 }
      )
    }

    // Update donation record in database
    const supabase = await createSupabaseServerOnly()
    const { error: updateError } = await supabase
      .from('donations')
      .update({
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', donationId)

    if (updateError) {
      console.error('Error updating donation:', updateError)
      return NextResponse.json(
        { error: 'Failed to update donation record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      payment_id: razorpay_payment_id,
      amount: paymentDetails.amount,
      status: paymentDetails.status
    })

  } catch (error) {
    console.error('Error verifying donation payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
