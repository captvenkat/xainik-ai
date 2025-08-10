import { createAdminClient } from '../src/lib/supabaseAdmin'

async function debugWebhook() {
  console.log('🔍 Debugging Webhook Functions...')
  console.log('==================================')
  
  const adminClient = createAdminClient()

  // Test 1: Check if we can insert a payment event
  try {
    console.log('📝 Testing payment event insertion...')
    const testEvent = {
      event_id: 'evt_debug_test_' + Date.now(),
      payment_id: 'pay_debug_test_' + Date.now(),
      order_id: 'order_debug_test_' + Date.now(),
      amount: 29900,
      currency: 'INR',
      status: 'captured',
      notes: {
        type: 'service',
        userId: 'debug-user',
        buyerName: 'Debug User',
        buyerEmail: 'debug@test.com',
        buyerPhone: '+919876543210',
        planTier: 'premium',
        planName: 'Premium Plan',
        planDays: '30'
      },
      processed_at: new Date().toISOString()
    }

    const { data: paymentEvent, error } = await adminClient
      .from('payment_events')
      .insert(testEvent)
      .select('id')
      .single()

    if (error) {
      console.log('❌ Payment event insertion failed:', error)
    } else {
      console.log('✅ Payment event inserted successfully:', paymentEvent.id)
      
      // Test 2: Try to generate invoice
      try {
        console.log('📄 Testing invoice generation...')
        const { generateServiceInvoice } = await import('../src/lib/billing/invoices')
        
        await generateServiceInvoice({
          userId: 'debug-user',
          paymentEventId: paymentEvent.id,
          amount: 29900,
          planTier: 'premium',
          planMeta: {
            plan_name: 'Premium Plan',
            duration_days: 30
          },
          buyerName: 'Debug User',
          buyerEmail: 'debug@test.com',
          buyerPhone: '+919876543210'
        })
        
        console.log('✅ Invoice generation successful')
      } catch (invoiceError) {
        console.log('❌ Invoice generation failed:', invoiceError)
      }
    }
  } catch (error) {
    console.log('❌ Payment event test failed:', error)
  }

  // Test 3: Test donation receipt
  try {
    console.log('🧾 Testing donation receipt...')
    const { generateDonationReceipt } = await import('../src/lib/billing/receipts')
    
    await generateDonationReceipt({
      paymentEventId: '00000000-0000-0000-0000-000000000000', // Use a dummy UUID
      amount: 50000,
      donorName: 'Debug Donor',
      donorEmail: 'donor@test.com',
      donorPhone: '+919876543211',
      isAnonymous: false
    })
    
    console.log('✅ Donation receipt generation successful')
  } catch (receiptError) {
    console.log('❌ Donation receipt generation failed:', receiptError)
  }

  // Test 4: Test activity logging
  try {
    console.log('📝 Testing activity logging...')
    const { logActivity } = await import('../src/lib/activity')
    
    await logActivity('test_event', { debug: true, message: 'Debug test' })
    console.log('✅ Activity logging successful')
  } catch (activityError) {
    console.log('❌ Activity logging failed:', activityError)
  }

  console.log('\n🏁 Debug testing completed!')
}

debugWebhook().catch(console.error)
