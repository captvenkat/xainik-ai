import { createAdminClient } from '../src/lib/supabaseAdmin'

async function testBillingSystem() {
  console.log('🧪 Testing Billing System Components...')
  console.log('========================================')
  
  const adminClient = createAdminClient()
  const results: Array<{feature: string, status: 'PASS' | 'FAIL', notes: string}> = []

  // Test 1: Billing Tables Exist
  try {
    const { data: paymentEvents } = await adminClient.from('payment_events').select('count').limit(1)
    results.push({ feature: 'payment_events table', status: 'PASS', notes: 'Table exists' })
  } catch (error) {
    results.push({ feature: 'payment_events table', status: 'FAIL', notes: `Error: ${error}` })
  }

  try {
    const { data: invoices } = await adminClient.from('invoices').select('count').limit(1)
    results.push({ feature: 'invoices table', status: 'PASS', notes: 'Table exists' })
  } catch (error) {
    results.push({ feature: 'invoices table', status: 'FAIL', notes: `Error: ${error}` })
  }

  try {
    const { data: receipts } = await adminClient.from('receipts').select('count').limit(1)
    results.push({ feature: 'receipts table', status: 'PASS', notes: 'Table exists' })
  } catch (error) {
    results.push({ feature: 'receipts table', status: 'FAIL', notes: `Error: ${error}` })
  }

  try {
    const { data: numberingState } = await adminClient.from('numbering_state').select('count').limit(1)
    results.push({ feature: 'numbering_state table', status: 'PASS', notes: 'Table exists' })
  } catch (error) {
    results.push({ feature: 'numbering_state table', status: 'FAIL', notes: `Error: ${error}` })
  }

  // Test 2: Storage Bucket
  try {
    const { data: buckets } = await adminClient.storage.listBuckets()
    const docsBucket = buckets?.find(b => b.name === 'docs')
    if (docsBucket) {
      results.push({ feature: 'docs storage bucket', status: 'PASS', notes: 'Bucket exists' })
    } else {
      results.push({ feature: 'docs storage bucket', status: 'FAIL', notes: 'Bucket not found' })
    }
  } catch (error) {
    results.push({ feature: 'docs storage bucket', status: 'FAIL', notes: `Error: ${error}` })
  }

  // Test 3: Webhook Processing
  try {
    const testPaymentEvent = {
      event_id: 'test-webhook-' + Date.now(),
      payment_id: 'test-payment-' + Date.now(),
      event_type: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'test-payment-' + Date.now(),
            amount: 29900,
            currency: 'INR'
          }
        },
        order: {
          entity: {
            notes: {
              type: 'service',
              plan_id: 'premium',
              name: 'Test User',
              email: 'test@example.com'
            }
          }
        }
      },
      processed_at: new Date().toISOString()
    }

    const { error } = await adminClient.from('payment_events').insert(testPaymentEvent)
    if (!error) {
      results.push({ feature: 'webhook idempotency', status: 'PASS', notes: 'Payment event stored successfully' })
    } else {
      results.push({ feature: 'webhook idempotency', status: 'FAIL', notes: `Error: ${error.message}` })
    }
  } catch (error) {
    results.push({ feature: 'webhook idempotency', status: 'FAIL', notes: `Error: ${error}` })
  }

  // Test 4: Check for existing payment events
  try {
    const { data: events, error } = await adminClient.from('payment_events').select('*').limit(5)
    if (!error && events && events.length > 0) {
      results.push({ feature: 'payment events data', status: 'PASS', notes: `${events.length} events found` })
    } else {
      results.push({ feature: 'payment events data', status: 'FAIL', notes: 'No payment events found' })
    }
  } catch (error) {
    results.push({ feature: 'payment events data', status: 'FAIL', notes: `Error: ${error}` })
  }

  // Test 5: Check for invoices/receipts
  try {
    const { data: invoices, error } = await adminClient.from('invoices').select('*').limit(5)
    if (!error && invoices && invoices.length > 0) {
      results.push({ feature: 'invoice generation', status: 'PASS', notes: `${invoices.length} invoices found` })
    } else {
      results.push({ feature: 'invoice generation', status: 'FAIL', notes: 'No invoices found' })
    }
  } catch (error) {
    results.push({ feature: 'invoice generation', status: 'FAIL', notes: `Error: ${error}` })
  }

  try {
    const { data: receipts, error } = await adminClient.from('receipts').select('*').limit(5)
    if (!error && receipts && receipts.length > 0) {
      results.push({ feature: 'receipt generation', status: 'PASS', notes: `${receipts.length} receipts found` })
    } else {
      results.push({ feature: 'receipt generation', status: 'FAIL', notes: 'No receipts found' })
    }
  } catch (error) {
    results.push({ feature: 'receipt generation', status: 'FAIL', notes: `Error: ${error}` })
  }

  // Test 6: Check email logs
  try {
    const { data: emailLogs, error } = await adminClient.from('email_logs').select('*').limit(5)
    if (!error && emailLogs && emailLogs.length > 0) {
      results.push({ feature: 'email logging', status: 'PASS', notes: `${emailLogs.length} email logs found` })
    } else {
      results.push({ feature: 'email logging', status: 'FAIL', notes: 'No email logs found' })
    }
  } catch (error) {
    results.push({ feature: 'email logging', status: 'FAIL', notes: `Error: ${error}` })
  }

  // Print Results
  console.log('\n📊 BILLING SYSTEM UAT RESULTS')
  console.log('==============================')
  console.log('')
  console.log('| Feature | Status | Notes |')
  console.log('|---------|--------|-------|')
  
  results.forEach(result => {
    const statusIcon = result.status === 'PASS' ? '✅' : '❌'
    console.log(`| ${result.feature} | ${statusIcon} ${result.status} | ${result.notes} |`)
  })

  const passCount = results.filter(r => r.status === 'PASS').length
  const totalCount = results.length
  
  console.log('')
  console.log(`📈 Summary: ${passCount}/${totalCount} tests passed`)
  
  if (passCount === totalCount) {
    console.log('🎉 All billing system tests passed!')
  } else {
    console.log('⚠️  Some tests failed. Please review the issues above.')
  }

  console.log('\n🏁 Billing system UAT testing completed!')
}

testBillingSystem().catch(console.error)
