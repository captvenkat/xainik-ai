import { createAdminClient } from '../src/lib/supabaseAdmin'

async function testWebhookSimple() {
  console.log('🧪 Testing Webhook Simple...')
  console.log('=============================')
  
  const adminClient = createAdminClient()

  // Test logActivity function
  try {
    console.log('📝 Testing logActivity function...')
    const { logActivity } = await import('../src/lib/activity')
    await logActivity('donation_received', { test: true, message: 'Hello World' })
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
      paymentEventId: '00000000-0000-0000-0000-000000000000',
      amount: 500,
      donorName: 'Simple Donor',
      donorEmail: 'donor@test.com',
      donorPhone: '+919876543220',
      isAnonymous: false
    })
    console.log('✅ generateDonationReceipt function works')
  } catch (error) {
    console.log('❌ generateDonationReceipt function failed:', error)
  }

  console.log('\n🏁 Simple webhook test completed!')
}

testWebhookSimple().catch(console.error)
