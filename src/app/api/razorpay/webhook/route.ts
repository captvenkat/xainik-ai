import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { logActivity } from '@/lib/activity'
import { generateServiceInvoice } from '@/lib/billing/invoices'
import { generateDonationReceipt } from '@/lib/billing/receipts'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify HMAC signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const payload = JSON.parse(body)
    
    // Only process payment.captured events
    if (payload.event !== 'payment.captured') {
      return NextResponse.json({ message: 'Event ignored - not payment.captured' })
    }

    // Extract payment data
    const p = payload?.payload?.payment?.entity
    const eventId = payload?.id
    const paymentId = p?.id
    const orderId = p?.order_id
    const notes = p?.notes || {}
    const amount = p?.amount
    const currency = p?.currency
    const status = p?.status

    const supabaseAdmin = createAdminClient()

    // 1) Idempotent insert to payment_events (no event_type column used)
    let paymentEvent: any = null
    const { data: insertResult, error: insertError } = await supabaseAdmin
      .from('payment_events')
      .insert({
        event_id: eventId,
        payment_id: paymentId,
        order_id: orderId,
        amount,
        currency,
        status,
        notes,             // jsonb column you already have
        processed_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (insertError) {
      // If duplicate (unique constraint on event_id), treat as processed
      if (!String(insertError?.message || '').includes('duplicate key')) {
        console.error('Error inserting payment event:', insertError)
        throw insertError
      }
      // For duplicate, fetch the existing record
      const { data: existingEvent } = await supabaseAdmin
        .from('payment_events')
        .select('id')
        .eq('event_id', eventId)
        .single()
      if (existingEvent) {
        paymentEvent = existingEvent
      }
    } else {
      paymentEvent = insertResult
    }

    // 2) Branch on notes.type, generate docs, log activity
    if (notes?.type === 'service') {
      await generateServiceInvoice({
        userId: notes.userId || 'anonymous',
        paymentEventId: paymentEvent.id, // Use the actual UUID from database
        amount: amount,
        planTier: notes.planTier || 'premium',
        planMeta: {
          plan_name: notes.planName || 'Premium Plan',
          duration_days: Number(notes.planDays) || 30
        },
        buyerName: notes.buyerName || 'Unknown',
        buyerEmail: notes.buyerEmail || 'unknown@example.com',
        buyerPhone: notes.buyerPhone
      });
      await logActivity('plan_activated', {
        veteran_name: notes.buyerName || 'Unknown',
        amount: (amount/100).toFixed(0),
        pitch_title: notes.planName || 'Premium Plan'
      });
    } else if (notes?.type === 'donation') {
      await generateDonationReceipt({
        paymentEventId: paymentEvent.id, // Use the actual UUID from database
        amount: amount,
        donorName: notes.donorName || 'Anonymous',
        donorEmail: notes.donorEmail,
        donorPhone: notes.donorPhone,
        isAnonymous: notes.anonymous === 'true'
      });
      await logActivity('donation_received', {
        supporter_name: notes.donorName || 'Anonymous',
        amount: (amount/100).toFixed(0)
      });
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


