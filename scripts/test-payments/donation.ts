import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface DonationTestParams {
  amount: number
  donorName?: string
  donorEmail?: string
  donorPhone?: string
  isAnonymous: boolean
}

export async function testDonation(params: DonationTestParams) {
  console.log('🧪 Testing Donation...', params)

  const eventId = `evt_test_${Date.now()}`
  const paymentId = `pay_test_${Date.now()}`
  const orderId = `order_test_${Date.now()}`

  // Create fixture payload
  const payload = {
    event: 'payment.captured',
    id: eventId,
    created_at: Math.floor(Date.now() / 1000),
    payload: {
      payment: {
        entity: {
          id: paymentId,
          order_id: orderId,
          amount: params.amount,
          currency: 'INR',
          status: 'captured',
          notes: {
            type: 'donation',
            donor_name: params.donorName,
            donor_email: params.donorEmail,
            donor_phone: params.donorPhone,
            is_anonymous: params.isAnonymous.toString()
          }
        }
      }
    }
  }

  // Calculate HMAC signature
  const body = JSON.stringify(payload)
  const signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')

  // Call webhook endpoint
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/razorpay/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': signature
    },
    body
  })

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
  }

  const result = await response.json()
  console.log('✅ Webhook response:', result)

  // Wait a moment for async operations
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Verify payment_events insert once
  const { data: paymentEvent, error: eventError } = await supabase
    .from('payment_events')
    .select('*')
    .eq('event_id', eventId)
    .single()

  if (eventError || !paymentEvent) {
    throw new Error(`Payment event not found: ${eventError?.message}`)
  }

  console.log('✅ Payment event created:', paymentEvent.id)

  // Verify receipt row exists
  const { data: receipt, error: receiptError } = await supabase
    .from('receipts')
    .select('*')
    .eq('payment_event_id', paymentEvent.id)
    .single()

  if (receiptError || !receipt) {
    throw new Error(`Receipt not found: ${receiptError?.message}`)
  }

  console.log('✅ Receipt created:', receipt.number)

  // Verify PDF uploaded to docs bucket
  const { data: storageFile, error: storageError } = await supabase.storage
    .from('docs')
    .list(receipt.storage_key.split('/').slice(0, -1).join('/'))

  if (storageError) {
    throw new Error(`Storage check failed: ${storageError.message}`)
  }

  const pdfExists = storageFile.some(file => file.name === receipt.storage_key.split('/').pop())
  if (!pdfExists) {
    throw new Error('PDF not found in storage')
  }

  console.log('✅ PDF uploaded to storage')

  // Check email_logs (only if not anonymous and email provided)
  if (!params.isAnonymous && params.donorEmail) {
    const { data: emailLog, error: emailError } = await supabase
      .from('email_logs')
      .select('*')
      .eq('document_type', 'receipt')
      .eq('document_id', receipt.id)
      .single()

    if (emailError || !emailLog) {
      throw new Error(`Email log not found: ${emailError?.message}`)
    }

    if (!emailLog.message_id) {
      throw new Error('Email message ID not recorded')
    }

    console.log('✅ Email sent with message ID:', emailLog.message_id)
  } else {
    console.log('ℹ️  No email sent (anonymous donation or no email)')
  }

  // Verify activity log entry
  const { data: activityLog, error: activityError } = await supabase
    .from('activity_log')
    .select('*')
    .eq('event', 'donation_received')
    .eq('meta->amount', params.amount)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (activityError || !activityLog) {
    throw new Error(`Activity log not found: ${activityError?.message}`)
  }

  console.log('✅ Activity log created:', activityLog.id)

  return {
    paymentEvent,
    receipt,
    activityLog,
    success: true
  }
}

// CLI execution
if (require.main === module) {
  const testParams: DonationTestParams = {
    amount: parseInt(process.argv[2]) || 50000,
    donorName: process.argv[3] || 'Test Donor',
    donorEmail: process.argv[4] || 'donor@example.com',
    donorPhone: process.argv[5] || '+919876543210',
    isAnonymous: process.argv[6] === 'true'
  }

  testDonation(testParams)
    .then(result => {
      console.log('🎉 Donation test completed successfully!')
      console.log('Receipt Number:', result.receipt.number)
      console.log('Payment Event ID:', result.paymentEvent.id)
      console.log('Anonymous:', result.receipt.is_anonymous)
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Donation test failed:', error.message)
      process.exit(1)
    })
}
