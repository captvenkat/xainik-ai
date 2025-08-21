import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, donor_name, email } = body
    
    console.log('Test donation flow - received data:', { amount, donor_name, email })
    
    // Test 1: Check environment variables
    console.log('Environment variables check:', {
      razorpayKeyId: !!process.env.RAZORPAY_KEY_ID,
      razorpayKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
    
    // Test 2: Test Supabase connection
    const supabase = await createSupabaseServerOnly()
    console.log('Supabase connection successful')
    
    // Test 3: Test donation creation
    const { data: donation, error } = await supabase
      .from('donations')
      .insert({
        user_id: null,
        amount_cents: amount,
        currency: 'INR',
        is_anonymous: false,
        razorpay_payment_id: null,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Donation creation failed:', error)
      return NextResponse.json({ error: `Donation creation failed: ${error.message}` }, { status: 500 })
    }
    
    console.log('Donation created successfully:', donation.id)
    
    // Test 4: Test Razorpay order creation
    const { createOrder } = await import('@/lib/payments/razorpay')
    
    const order = await createOrder({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `test_${donation.id}`,
      notes: {
        type: 'test',
        donation_id: donation.id,
        donor_name: donor_name || 'Test User'
      }
    })
    
    console.log('Razorpay order created successfully:', order.id)
    
    return NextResponse.json({
      success: true,
      donationId: donation.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    })
    
  } catch (error) {
    console.error('Test donation flow error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
