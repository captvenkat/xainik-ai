import { createAdminClient } from '../src/lib/supabaseAdmin'

async function testWebhookDirect() {
  console.log('🧪 Testing Webhook Directly...')
  console.log('===============================')
  
  const adminClient = createAdminClient()

  // Create a fresh test payment event
  const testEventId = 'evt_test_' + Date.now()
  const testPaymentId = 'pay_test_' + Date.now()
  
  const testPaymentEvent = {
    event_id: testEventId,
    payment_id: testPaymentId,
    event_type: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: testPaymentId,
          amount: 29900,
          currency: 'INR',
          order_id: 'order_test_' + Date.now()
        }
      },
      order: {
        entity: {
          notes: {
            type: 'service',
            plan_id: 'premium',
            name: 'Direct Test User',
            email: 'direct@test.com',
            phone: '+919876543216',
            user_id: 'test-user-direct'
          }
        }
      }
    },
    processed_at: new Date().toISOString()
  }

  console.log('📋 Creating test payment event...')
  console.log('Event ID:', testEventId)
  console.log('Payment ID:', testPaymentId)

  try {
    // Insert the payment event
    const { error: insertError } = await adminClient.from('payment_events').insert(testPaymentEvent)
    if (insertError) {
      console.log('❌ Error inserting payment event:', insertError)
      return
    }
    console.log('✅ Payment event created successfully')

    // Now try to manually trigger the invoice generation
    console.log('📄 Attempting to generate invoice...')
    
    // Check if the payment event exists
    const { data: event, error: eventError } = await adminClient
      .from('payment_events')
      .select('*')
      .eq('event_id', testEventId)
      .single()

    if (eventError) {
      console.log('❌ Error fetching payment event:', eventError)
      return
    }

    console.log('✅ Payment event found:', event.event_id)

    // Try to generate invoice manually
    const { data: invoice, error: invoiceError } = await adminClient
      .from('invoices')
      .select('*')
      .eq('payment_event_id', testEventId)
      .single()

    if (invoiceError) {
      console.log('❌ Error checking for invoice:', invoiceError)
    } else if (invoice) {
      console.log('✅ Invoice found:', invoice.invoice_number)
    } else {
      console.log('❌ No invoice found for this payment event')
    }

    // Check for activity log
    const { data: activity, error: activityError } = await adminClient
      .from('activity_log')
      .select('*')
      .eq('meta->payment_id', testPaymentId)
      .single()

    if (activityError) {
      console.log('❌ Error checking for activity log:', activityError)
    } else if (activity) {
      console.log('✅ Activity log found:', activity.event)
    } else {
      console.log('❌ No activity log found for this payment')

      // Try to manually create an activity log
      console.log('📝 Attempting to create activity log manually...')
      const { error: logError } = await adminClient.from('activity_log').insert({
        event: 'test_activity',
        meta: { payment_id: testPaymentId, test: true },
        created_at: new Date().toISOString()
      })

      if (logError) {
        console.log('❌ Error creating activity log manually:', logError)
      } else {
        console.log('✅ Activity log created manually')
      }
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error)
  }

  console.log('\n🏁 Direct webhook test completed!')
}

testWebhookDirect().catch(console.error)
