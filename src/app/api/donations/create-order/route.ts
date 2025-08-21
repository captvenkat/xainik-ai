import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { createOrder } from '@/lib/payments/razorpay'

export async function POST(request: NextRequest) {
  console.log('API: Starting POST request')
  try {
    // Check if Razorpay environment variables are configured
    console.log('Checking Razorpay environment variables:', {
      keyId: !!process.env.RAZORPAY_KEY_ID,
      keySecret: !!process.env.RAZORPAY_KEY_SECRET,
      keyIdLength: process.env.RAZORPAY_KEY_ID?.length,
      keySecretLength: process.env.RAZORPAY_KEY_SECRET?.length
    })
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay environment variables missing:', {
        keyId: !!process.env.RAZORPAY_KEY_ID,
        keySecret: !!process.env.RAZORPAY_KEY_SECRET
      })
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    // Get current user (optional for anonymous donations)
    const supabase = await createSupabaseServerOnly()
    const { data: { user } } = await supabase.auth.getUser()

    // Parse request body
    const body = await request.json()
    console.log('API: Received request body:', body)
    const { amount, donationId, donor_name, email } = body

    console.log('API: Parsed values:', { amount, donationId, donor_name, email })

    // Validate required fields
    if (!amount || amount < 10) {
      console.log('API: Invalid amount:', amount)
      return NextResponse.json(
        { error: 'Invalid amount. Minimum donation is ₹10.' },
        { status: 400 }
      )
    }

    if (!donationId) {
      console.log('API: Missing donationId')
      return NextResponse.json(
        { error: 'Donation ID is required' },
        { status: 400 }
      )
    }

    // Create Razorpay order
    const orderParams = {
      amount: amount * 100, // Convert to paise for Razorpay
      currency: 'INR',
      receipt: `donation_${donationId}`,
      notes: {
        type: 'donation',
        donation_id: donationId,
        donor_name: donor_name || 'Anonymous',
        user_id: user?.id || 'anonymous'
      }
    }
    
    console.log('About to create Razorpay order with params:', orderParams)
    console.log('Amount in paise:', amount * 100)
    
    const order = await createOrder(orderParams)
    
    console.log('Razorpay order created successfully:', order.id)

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    })

  } catch (error) {
    console.error('Error creating donation order:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    // Log the full error for debugging
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
}
