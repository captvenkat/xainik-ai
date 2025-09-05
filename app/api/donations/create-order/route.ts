import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { z } from 'zod';

// Only create Razorpay instance if environment variables are available
const createRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured');
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const CreateOrderSchema = z.object({
  amount: z.number().int().positive().max(1000000), // Max 10 lakh
  tier: z.enum(['1000', '2500', '5000', '7500', '10000', 'custom']).optional(),
  donorName: z.string().min(1).max(100).optional(),
  donorEmail: z.string().email().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: parsed.error.issues 
      }, { status: 400 });
    }
    
    const { amount } = parsed.data;

    const razorpay = createRazorpayInstance();

    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `donation_${Date.now()}`,
      notes: {
        purpose: 'Veteran Support',
        source: 'Xainik Website'
      }
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
  }
}
