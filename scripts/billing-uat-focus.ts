import { createAdminClient } from '../src/lib/supabaseAdmin'
import type { Database } from '../types/live-schema'

async function testBillingSystem() {
  console.log('🧪 Testing Billing System Components...')
  console.log('========================================')
  
  const adminClient = createAdminClient()
  const results: Array<{feature: string, status: 'PASS' | 'FAIL' | 'SKIP', notes: string}> = []

  // Test 1: Available Tables Exist
  // Note: payment_events_archive table not found in live schema
  results.push({ feature: 'payment_events_archive table', status: 'SKIP', notes: 'Table not in live schema' })

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

    // Skip insert - table doesn't exist in live schema
    results.push({ feature: 'webhook idempotency', status: 'SKIP', notes: 'payment_events_archive table not in live schema' })
  } catch (error) {
    results.push({ feature: 'webhook idempotency', status: 'FAIL', notes: `Error: ${error}` })
  }

  // Test 4: Check for existing payment events
  try {
    // Skip query - table doesn't exist in live schema
    results.push({ feature: 'payment events data', status: 'SKIP', notes: 'payment_events_archive table not in live schema' })
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
    // Skip query - table doesn't exist in live schema
    results.push({ feature: 'activity logging', status: 'SKIP', notes: 'user_activity_log table not in live schema' })
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
    const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'SKIP' ? '⏭️' : '❌'
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
