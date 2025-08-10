import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ServicePurchaseTestParams {
  userId: string
  planTier: string
  amount: number
  buyerName: string
  buyerEmail: string
  buyerPhone?: string
  pitchData?: any
}

export async function testServicePurchase(params: ServicePurchaseTestParams) {
  console.log('🧪 Testing Service Purchase...', params)

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
            type: 'service',
            user_id: params.userId,
            plan_id: params.planTier,
            email: params.buyerEmail,
            phone: params.buyerPhone,
            pitch_data: JSON.stringify(params.pitchData || {
              title: 'Test Pitch',
              pitch: 'Test pitch content',
              skills: ['Leadership', 'Management'],
              job_type: 'Full-time',
              location_current: 'Mumbai',
              location_preferred: 'Mumbai',
              availability: 'Immediate',
              name: params.buyerName
            })
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

  // Verify invoice row exists
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('payment_event_id', paymentEvent.id)
    .single()

  if (invoiceError || !invoice) {
    throw new Error(`Invoice not found: ${invoiceError?.message}`)
  }

  console.log('✅ Invoice created:', invoice.number)

  // Verify PDF uploaded to docs bucket
  const { data: storageFile, error: storageError } = await supabase.storage
    .from('docs')
    .list(invoice.storage_key.split('/').slice(0, -1).join('/'))

  if (storageError) {
    throw new Error(`Storage check failed: ${storageError.message}`)
  }

  const pdfExists = storageFile.some(file => file.name === invoice.storage_key.split('/').pop())
  if (!pdfExists) {
    throw new Error('PDF not found in storage')
  }

  console.log('✅ PDF uploaded to storage')

  // Verify email_logs has a message id
  const { data: emailLog, error: emailError } = await supabase
    .from('email_logs')
    .select('*')
    .eq('document_type', 'invoice')
    .eq('document_id', invoice.id)
    .single()

  if (emailError || !emailLog) {
    throw new Error(`Email log not found: ${emailError?.message}`)
  }

  if (!emailLog.message_id) {
    throw new Error('Email message ID not recorded')
  }

  console.log('✅ Email sent with message ID:', emailLog.message_id)

  return {
    paymentEvent,
    invoice,
    emailLog,
    success: true
  }
}

// CLI execution
if (require.main === module) {
  const testParams: ServicePurchaseTestParams = {
    userId: process.argv[2] || 'test-user-id',
    planTier: process.argv[3] || 'premium',
    amount: parseInt(process.argv[4]) || 29900,
    buyerName: process.argv[5] || 'Test User',
    buyerEmail: process.argv[6] || 'test@example.com',
    buyerPhone: process.argv[7] || '+919876543210'
  }

  testServicePurchase(testParams)
    .then(result => {
      console.log('🎉 Service purchase test completed successfully!')
      console.log('Invoice Number:', result.invoice.number)
      console.log('Payment Event ID:', result.paymentEvent.id)
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Service purchase test failed:', error.message)
      process.exit(1)
    })
}
