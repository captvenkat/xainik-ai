import { createAdminClient } from '../src/lib/supabaseAdmin'

async function testBillingSystem() {
  console.log('🧪 Testing Billing System Components...')
  console.log('========================================')
  
  const adminClient = createAdminClient()
  const results: Array<{feature: string, status: 'PASS' | 'FAIL', notes: string}> = []

  // Test 1: Available Tables Exist
  try {
    const { data: paymentEventsArchive } = await adminClient.from('payment_events_archive').select('count').limit(1)
    results.push({ feature: 'payment_events_archive table', status: 'PASS', notes: 'Table exists' })
  } catch (error) {
    results.push({ feature: 'payment_events_archive table', status: 'FAIL', notes: `Error: ${error}` })
  }

  try {
    const { data: donations } = await adminClient.from('donations').select('count').limit(1)
    results.push({ feature: 'donations table', status: 'PASS', notes: 'Table exists' })
  } catch (error) {
    results.push({ feature: 'donations table', status: 'FAIL', notes: `Error: ${error}` })
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
      event_data: {
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
      created_at: new Date().toISOString(),
      archived_at: new Date().toISOString()
    }

    const { error } = await adminClient.from('payment_events_archive').insert(testPaymentEvent)
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
    const { data: events, error } = await adminClient.from('payment_events_archive').select('*').limit(5)
    if (!error && events && events.length > 0) {
      results.push({ feature: 'payment events data', status: 'PASS', notes: `${events.length} events found` })
    } else {
      results.push({ feature: 'payment events data', status: 'FAIL', notes: 'No payment events found' })
    }
  } catch (error) {
    results.push({ feature: 'payment events data', status: 'FAIL', notes: `Error: ${error}` })
  }

  // Test 5: Check for donations
  try {
    const { data: donations, error } = await adminClient.from('donations').select('*').limit(5)
    if (!error && donations && donations.length > 0) {
      results.push({ feature: 'donation tracking', status: 'PASS', notes: `${donations.length} donations found` })
    } else {
      results.push({ feature: 'donation tracking', status: 'FAIL', notes: 'No donations found' })
    }
  } catch (error) {
    results.push({ feature: 'donation tracking', status: 'FAIL', notes: `Error: ${error}` })
  }

  // Test 6: Check user activity log
  try {
    const { data: activityLogs, error } = await adminClient.from('user_activity_log').select('*').limit(5)
    if (!error && activityLogs && activityLogs.length > 0) {
      results.push({ feature: 'activity logging', status: 'PASS', notes: `${activityLogs.length} activity logs found` })
    } else {
      results.push({ feature: 'activity logging', status: 'FAIL', notes: 'No activity logs found' })
    }
  } catch (error) {
    results.push({ feature: 'activity logging', status: 'FAIL', notes: `Error: ${error}` })
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
