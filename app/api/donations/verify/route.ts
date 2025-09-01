import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseService } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    if (signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Get order details from Razorpay to confirm amount
    const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.RAZORPAY_KEY_ID + ':' + process.env.RAZORPAY_KEY_SECRET).toString('base64')}`
      }
    });

    if (!orderResponse.ok) {
      throw new Error('Failed to fetch order details');
    }

    const orderData = await orderResponse.json();
    const amount = Math.round(orderData.amount / 100); // Convert from paise

    // Save donation to database
    const sb = supabaseService();
    const { error: dbError } = await sb.from('donations').insert([{
      amount_int: amount,
      currency: 'INR',
      razorpay_order_id,
      status: 'paid',
      donor_name: 'Anonymous',
      donor_email: 'anonymous@xainik.com'
    }]);

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't fail the verification if DB save fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment verified successfully',
      amount,
      orderId: razorpay_order_id
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
