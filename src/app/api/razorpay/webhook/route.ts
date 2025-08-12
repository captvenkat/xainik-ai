// =====================================================
// PROFESSIONAL RAZORPAY WEBHOOK HANDLER
// Xainik Platform - Professional Rewrite
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { Database } from '@/types/live-schema';

// =====================================================
// SUPABASE CLIENT
// =====================================================

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =====================================================
// WEBHOOK SECURITY VALIDATION
// =====================================================

/**
 * Verify webhook signature for security
 */
function verifyWebhookSignature(payload: string, signature: string): boolean {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

// =====================================================
// WEBHOOK EVENT PROCESSING
// =====================================================

async function processWebhookEvent(event: any): Promise<void> {
  try {
    console.log('Processing webhook event:', event.event, event.id);

    // Store webhook event in database
    const { error: insertError } = await supabaseAdmin
      .from('payment_events_archive')
      .insert({
        event_type: event.event,
        event_data: event.payload,
        event_id: event.id,
        payment_id: event.payload?.payment?.entity?.id || null,
        user_id: 'system', // Use system user for webhook events
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Failed to record webhook event:', insertError);
      throw new Error('Failed to record webhook event');
    }

    // Handle specific event types
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload);
        break;
      case 'subscription.activated':
        await handleSubscriptionActivated(event.payload);
        break;
      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload);
        break;
      default:
        console.log('Unhandled event type:', event.event);
    }

  } catch (error) {
    console.error('Error processing webhook event:', error);
    throw error;
  }
}

async function handlePaymentCaptured(payload: any): Promise<void> {
  console.log('Handling payment captured:', payload.payment?.id);
  
  // Record donation if this is a donation payment
  if (payload.payment?.notes?.type === 'donation') {
    const { error } = await supabaseAdmin
      .from('donations')
      .insert({
        razorpay_payment_id: payload.payment.id,
        amount_cents: payload.payment.amount,
        currency: payload.payment.currency,
        user_id: null, // Anonymous donation
        is_anonymous: payload.payment.notes?.anonymous === 'true',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to record donation:', error);
      throw new Error('Failed to record donation');
    }
  }
}

async function handleSubscriptionActivated(payload: any): Promise<void> {
  console.log('Handling subscription activated:', payload.subscription?.id);
  // TODO: Implement subscription activation logic
}

async function handleSubscriptionCharged(payload: any): Promise<void> {
  console.log('Handling subscription charged:', payload.subscription?.id);
  // TODO: Implement subscription charging logic
}

// =====================================================
// WEBHOOK HANDLER
// =====================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Get request headers and body
    const headersList = await headers();
    const signature = headersList.get('x-razorpay-signature');
    const body = await request.text();

    // 2. Validate webhook signature
    if (!signature || !verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 3. Parse webhook payload
    let webhookData: any;
    try {
      webhookData = JSON.parse(body);
    } catch (error) {
      console.error('Invalid JSON payload:', error);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // 4. Validate webhook data structure
    if (!webhookData.id || !webhookData.event || !webhookData.payload) {
      console.error('Invalid webhook data structure:', webhookData);
      return NextResponse.json(
        { error: 'Invalid webhook data structure' },
        { status: 400 }
      );
    }

    // 5. Process webhook event
    await processWebhookEvent(webhookData);

    // 6. Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Webhook processed successfully',
        event_id: webhookData.id,
        event_type: webhookData.event
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// CORS AND HEALTH CHECK HANDLERS
// =====================================================

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-razorpay-signature',
    },
  });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      status: 'healthy',
      message: 'Razorpay webhook endpoint is operational',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}


