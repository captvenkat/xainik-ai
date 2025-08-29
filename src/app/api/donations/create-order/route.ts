import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { razorpay } from '@/lib/razorpay'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const { name, email, amount, isAnonymous, displayName } = await request.json()

    // Validate inputs
    if (!name || !email || !amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid input parameters' },
        { status: 400 }
      )
    }

    // Convert amount to paise (Razorpay expects paise)
    const amountInPaise = Math.round(amount * 100)

    // Create or get donor
    let { data: donor, error: donorError } = await supabaseAdmin
      .from('donors')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (donorError && donorError.code !== 'PGRST116') {
      console.error('Error fetching donor:', donorError)
      return NextResponse.json(
        { error: 'Failed to process donor information' },
        { status: 500 }
      )
    }

    let donorId: string

    if (!donor) {
      // Create new donor
      const { data: newDonor, error: createError } = await supabaseAdmin
        .from('donors')
        .insert({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          is_public: !isAnonymous
        })
        .select('id')
        .single()

      if (createError) {
        console.error('Error creating donor:', createError)
        return NextResponse.json(
          { error: 'Failed to create donor record' },
          { status: 500 }
        )
      }

      donorId = newDonor.id
    } else {
      donorId = donor.id
    }

    // Create Razorpay order
    const orderId = uuidv4()
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderId,
      notes: {
        donor_id: donorId,
        display_name: displayName || (isAnonymous ? 'Friend of Veterans' : name)
      }
    })

    // Create donation record
    const { error: donationError } = await supabaseAdmin
      .from('donations')
      .insert({
        donor_id: donorId,
        amount: amount, // Store in rupees
        order_id: razorpayOrder.id,
        status: 'created',
        is_anonymous: isAnonymous,
        display_name: displayName || (isAnonymous ? 'Friend of Veterans' : name)
      })

    if (donationError) {
      console.error('Error creating donation record:', donationError)
      return NextResponse.json(
        { error: 'Failed to create donation record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      order_id: razorpayOrder.id,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: 'INR',
      name: 'Xainik - Veteran Success Foundation',
      description: 'Supporting veteran career transitions',
      prefill: {
        name: name,
        email: email
      }
    })
  } catch (error) {
    console.error('Create order API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
