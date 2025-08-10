import { createAdminClient } from '../src/lib/supabaseAdmin'

async function checkInvoicesSchema() {
  console.log('🔍 Checking Invoices Table Schema...')
  console.log('=====================================')
  
  const adminClient = createAdminClient()

  try {
    // Try to get the table schema by attempting to insert a test record
    const testInvoice = {
      number: 'TEST/2025-2026/0001',
      user_id: '00000000-0000-0000-0000-000000000000',
      payment_event_id: '00000000-0000-0000-0000-000000000000',
      amount: 1000,
      plan_tier: 'test',
      plan_meta: { test: true },
      buyer_name: 'Test Buyer',
      buyer_email: 'test@example.com',
      buyer_phone: '+919876543210',
      storage_key: 'test/invoice.pdf'
    }

    console.log('📋 Attempting to insert test invoice to check schema...')
    const { error } = await adminClient.from('invoices').insert(testInvoice)
    
    if (error) {
      console.log('❌ Insert failed - this shows us the schema requirements:')
      console.log('Error:', error.message)
      console.log('Code:', error.code)
      console.log('Details:', error.details)
    } else {
      console.log('✅ Test insert succeeded')
      // Clean up the test record
      await adminClient.from('invoices').delete().eq('number', 'TEST/2025-2026/0001')
    }

  } catch (error) {
    console.log('❌ Error checking invoices schema:', error)
  }

  console.log('\n🏁 Invoices schema check completed!')
}

checkInvoicesSchema().catch(console.error)
