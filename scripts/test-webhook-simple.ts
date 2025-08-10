import { createAdminClient } from '../src/lib/supabaseAdmin'

async function testWebhookSimple() {
  console.log('🧪 Testing Webhook Simple...')
  console.log('=============================')
  
  const adminClient = createAdminClient()

  // Test the logActivity function directly
  try {
    console.log('📝 Testing logActivity function...')
    const { logActivity } = await import('../src/lib/activity')
    await logActivity('test_event', { test: true, message: 'Hello World' })
    console.log('✅ logActivity function works')
  } catch (error) {
    console.log('❌ logActivity function failed:', error)
  }

  // Test the generateServiceInvoice function directly
  try {
    console.log('📄 Testing generateServiceInvoice function...')
    const { generateServiceInvoice } = await import('../src/lib/billing/invoices')
    await generateServiceInvoice({
      userId: 'test-user-simple',
      paymentEventId: 'evt_test_simple',
      amount: 29900,
      planTier: 'premium',
      planMeta: {
        plan_name: 'Premium Plan',
        duration_days: 30
      },
      buyerName: 'Simple Test User',
      buyerEmail: 'simple@test.com',
      buyerPhone: '+919876543219'
    })
    console.log('✅ generateServiceInvoice function works')
  } catch (error) {
    console.log('❌ generateServiceInvoice function failed:', error)
  }

  // Test the generateDonationReceipt function directly
  try {
    console.log('🧾 Testing generateDonationReceipt function...')
    const { generateDonationReceipt } = await import('../src/lib/billing/receipts')
    await generateDonationReceipt({
      userId: null,
      donor: {
        name: 'Simple Donor',
        email: 'donor@test.com',
        phone: '+919876543220'
      },
      amount: 500,
      paymentId: 'pay_test_simple',
      orderId: 'order_test_simple',
      anonymous: false
    })
    console.log('✅ generateDonationReceipt function works')
  } catch (error) {
    console.log('❌ generateDonationReceipt function failed:', error)
  }

  console.log('\n🏁 Simple webhook test completed!')
}

testWebhookSimple().catch(console.error)
