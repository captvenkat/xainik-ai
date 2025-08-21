// =====================================================
// PROFESSIONAL RAZORPAY WEBHOOK HANDLER
// Xainik Platform - Professional Rewrite
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { Database } from '@/types/live-schema';
import { sendDonationReceipt } from '@/lib/email';

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

    // Store webhook event for idempotency
    const { error: insertError } = await supabaseAdmin
      .from('payment_events')
      .insert({
        event_id: event.id,
        payment_id: event.payload?.payment?.id || event.payload?.subscription?.id || 'unknown',
        order_id: event.payload?.payment?.order_id || event.payload?.subscription?.id || 'unknown',
        amount: event.payload?.payment?.amount || event.payload?.subscription?.amount || 0,
        currency: event.payload?.payment?.currency || event.payload?.subscription?.currency || 'INR',
        status: event.payload?.payment?.status || event.payload?.subscription?.status || 'unknown',
        event_type: event.event,
        notes: event.payload
      });

    if (insertError) {
      console.error('Failed to store payment event:', insertError);
      // Continue processing even if event storage fails
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
  
  const payment = payload.payment;
  const notes = payment?.notes || {};
  
  try {
    // Record donation if this is a donation payment
    if (notes.type === 'donation') {
      const { data: donation, error } = await supabaseAdmin
        .from('donations')
        .insert({
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
          amount: payment.amount,
          currency: payment.currency,
          user_id: notes.user_id || null, // Can be anonymous
          is_anonymous: notes.is_anonymous === 'true',
          status: 'completed',
          payment_method: payment.method,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to record donation:', error);
        throw new Error('Failed to record donation');
      }

      // Generate donation receipt
      if (donation) {
        await generateDonationReceipt(donation, notes);
      }

      // Send donation receipt email (non-blocking)
      if (donation && notes.donor_email) {
        try {
          await sendDonationReceipt(
            notes.donor_email,
            notes.donor_name || 'Anonymous Donor',
            payment.amount / 100, // Convert paise to rupees
            payment.id
          );
        } catch (emailError) {
          console.error('Failed to send donation receipt email:', emailError);
          // Don't fail the webhook if email fails
        }
      }
    }
    
    // Record service payment if this is a service payment
    else if (notes.type === 'service') {
      const { data: invoice, error } = await supabaseAdmin
        .from('invoices')
        .insert({
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
          user_id: notes.user_id,
          amount: payment.amount,
          currency: payment.currency,
          status: 'paid',
          buyer_name: notes.buyer_name,
          buyer_email: notes.buyer_email,
          buyer_phone: notes.buyer_phone,
          plan_tier: notes.plan_tier,
          plan_meta: notes.plan_meta,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to record invoice:', error);
        throw new Error('Failed to record invoice');
      }

      // Generate service invoice
      if (invoice) {
        await generateServiceInvoice(invoice, notes);
      }
    }
    
  } catch (error) {
    console.error('Error handling payment captured:', error);
    throw error;
  }
}

async function generateDonationReceipt(donation: any, notes: any): Promise<void> {
  try {
    // Import receipt generation function
    const { generateDonationReceipt } = await import('@/lib/billing/receipts');
    
    const receiptData = {
      amount_cents: donation.amount,
      user_id: donation.user_id || 'anonymous',
      currency: donation.currency,
      payment_method: donation.payment_method,
      razorpay_payment_id: donation.razorpay_payment_id,
      donor_name: notes.donor_name,
      is_anonymous: donation.is_anonymous,
      metadata: notes
    };

    const receipt = await generateDonationReceipt(receiptData);
    console.log('✅ Donation receipt generated:', receipt.receipt_number);
    
    // Send receipt email
    await sendReceiptEmail(receipt, notes.donor_email);
    
  } catch (error) {
    console.error('Error generating donation receipt:', error);
  }
}

async function generateServiceInvoice(invoice: any, notes: any): Promise<void> {
  try {
    // Import invoice generation function
    const { generateServiceInvoice } = await import('@/lib/billing/invoices');
    
    const invoiceData = {
      amount: invoice.amount,
      user_id: invoice.user_id,
      currency: invoice.currency,
      plan_tier: invoice.plan_tier,
      plan_meta: invoice.plan_meta,
      buyer_name: invoice.buyer_name,
      buyer_email: invoice.buyer_email,
      buyer_phone: invoice.buyer_phone,
      razorpay_payment_id: invoice.razorpay_payment_id,
      metadata: notes
    };

    const generatedInvoice = await generateServiceInvoice(invoiceData);
    console.log('✅ Service invoice generated:', generatedInvoice.invoice_number);
    
    // Send invoice email
    await sendInvoiceEmail(generatedInvoice, invoice.buyer_email);
    
  } catch (error) {
    console.error('Error generating service invoice:', error);
  }
}

async function sendReceiptEmail(receipt: any, email: string): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: `Donation Receipt - ${receipt.receipt_number}`,
        template: 'receipt',
        data: { receipt }
      })
    });
    
    if (response.ok) {
      console.log('✅ Receipt email sent to:', email);
    }
  } catch (error) {
    console.error('Error sending receipt email:', error);
  }
}

async function sendInvoiceEmail(invoice: any, email: string): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: `Invoice - ${invoice.invoice_number}`,
        template: 'invoice',
        data: { invoice }
      })
    });
    
    if (response.ok) {
      console.log('✅ Invoice email sent to:', email);
    }
  } catch (error) {
    console.error('Error sending invoice email:', error);
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


