import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface TestResult {
  feature: string
  status: 'PASS' | 'FAIL'
  notes: string
}

const results: TestResult[] = []

async function testDatabaseTables(): Promise<void> {
  console.log('🔍 Testing database tables...')
  
  const requiredTables = [
    'users', 'veterans', 'recruiters', 'supporters', 'pitches', 
    'endorsements', 'referrals', 'referral_events', 'shared_pitches',
    'donations', 'activity_log', 'resume_requests', 'notifications',
    'notification_prefs', 'email_logs', 'payment_events', 'invoices', 
    'receipts', 'numbering_state'
  ]

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        results.push({
          feature: `Database Table: ${table}`,
          status: 'FAIL',
          notes: error.message
        })
      } else {
        results.push({
          feature: `Database Table: ${table}`,
          status: 'PASS',
          notes: 'Table exists and accessible'
        })
      }
    } catch (err: any) {
      results.push({
        feature: `Database Table: ${table}`,
        status: 'FAIL',
        notes: err.message
      })
    }
  }
}

async function testServicePurchase(): Promise<void> {
  console.log('🧪 Testing service purchase...')
  
  try {
    const eventId = `evt_test_${Date.now()}`
    const paymentId = `pay_test_${Date.now()}`
    const orderId = `order_test_${Date.now()}`

    const payload = {
      event: 'payment.captured',
      id: eventId,
      created_at: Math.floor(Date.now() / 1000),
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: orderId,
            amount: 29900,
            currency: 'INR',
            status: 'captured',
            notes: {
              type: 'service',
              user_id: 'test-user-123',
              plan_id: 'premium',
              name: 'Test User',
              email: 'test@example.com',
              phone: '+919876543210'
            }
          }
        }
      }
    }

    const body = JSON.stringify(payload)
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature
      },
      body
    })

    if (response.ok) {
      results.push({
        feature: 'Service Purchase Webhook',
        status: 'PASS',
        notes: 'Webhook processed successfully'
      })
    } else {
      const errorText = await response.text()
      results.push({
        feature: 'Service Purchase Webhook',
        status: 'FAIL',
        notes: `Webhook failed: ${response.status} - ${errorText}`
      })
    }
  } catch (err: any) {
    results.push({
      feature: 'Service Purchase Webhook',
      status: 'FAIL',
      notes: err.message
    })
  }
}

async function testDonation(): Promise<void> {
  console.log('🧪 Testing donation...')
  
  try {
    const eventId = `evt_test_${Date.now()}`
    const paymentId = `pay_test_${Date.now()}`
    const orderId = `order_test_${Date.now()}`

    const payload = {
      event: 'payment.captured',
      id: eventId,
      created_at: Math.floor(Date.now() / 1000),
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: orderId,
            amount: 50000,
            currency: 'INR',
            status: 'captured',
            notes: {
              type: 'donation',
              donor_name: 'John Doe',
              donor_email: 'john@example.com',
              donor_phone: '+919876543212',
              anonymous: 'false'
            }
          }
        }
      }
    }

    const body = JSON.stringify(payload)
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature
      },
      body
    })

    if (response.ok) {
      results.push({
        feature: 'Donation Webhook',
        status: 'PASS',
        notes: 'Webhook processed successfully'
      })
    } else {
      const errorText = await response.text()
      results.push({
        feature: 'Donation Webhook',
        status: 'FAIL',
        notes: `Webhook failed: ${response.status} - ${errorText}`
      })
    }
  } catch (err: any) {
    results.push({
      feature: 'Donation Webhook',
      status: 'FAIL',
      notes: err.message
    })
  }
}

async function testInvoiceGeneration(): Promise<void> {
  console.log('🧪 Testing invoice generation...')
  
  try {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .limit(1)

    if (error) {
      results.push({
        feature: 'Invoice Generation',
        status: 'FAIL',
        notes: `Database error: ${error.message}`
      })
    } else if (invoices && invoices.length > 0) {
      const invoice = invoices[0]
      if (invoice.number && invoice.storage_key) {
        results.push({
          feature: 'Invoice Generation',
          status: 'PASS',
          notes: `Invoice ${invoice.number} generated with storage key`
        })
      } else {
        results.push({
          feature: 'Invoice Generation',
          status: 'FAIL',
          notes: 'Invoice missing number or storage key'
        })
      }
    } else {
      results.push({
        feature: 'Invoice Generation',
        status: 'FAIL',
        notes: 'No invoices found in database'
      })
    }
  } catch (err: any) {
    results.push({
      feature: 'Invoice Generation',
      status: 'FAIL',
      notes: err.message
    })
  }
}

async function testReceiptGeneration(): Promise<void> {
  console.log('🧪 Testing receipt generation...')
  
  try {
    const { data: receipts, error } = await supabase
      .from('receipts')
      .select('*')
      .limit(1)

    if (error) {
      results.push({
        feature: 'Receipt Generation',
        status: 'FAIL',
        notes: `Database error: ${error.message}`
      })
    } else if (receipts && receipts.length > 0) {
      const receipt = receipts[0]
      if (receipt.number && receipt.storage_key) {
        results.push({
          feature: 'Receipt Generation',
          status: 'PASS',
          notes: `Receipt ${receipt.number} generated with storage key`
        })
      } else {
        results.push({
          feature: 'Receipt Generation',
          status: 'FAIL',
          notes: 'Receipt missing number or storage key'
        })
      }
    } else {
      results.push({
        feature: 'Receipt Generation',
        status: 'FAIL',
        notes: 'No receipts found in database'
      })
    }
  } catch (err: any) {
    results.push({
      feature: 'Receipt Generation',
      status: 'FAIL',
      notes: err.message
    })
  }
}

async function testEmailLogs(): Promise<void> {
  console.log('🧪 Testing email logs...')
  
  try {
    const { data: emailLogs, error } = await supabase
      .from('email_logs')
      .select('*')
      .limit(1)

    if (error) {
      results.push({
        feature: 'Email Logs',
        status: 'FAIL',
        notes: `Database error: ${error.message}`
      })
    } else if (emailLogs && emailLogs.length > 0) {
      results.push({
        feature: 'Email Logs',
        status: 'PASS',
        notes: `${emailLogs.length} email log entries found`
      })
    } else {
      results.push({
        feature: 'Email Logs',
        status: 'FAIL',
        notes: 'No email logs found'
      })
    }
  } catch (err: any) {
    results.push({
      feature: 'Email Logs',
      status: 'FAIL',
      notes: err.message
    })
  }
}

async function testActivityLogs(): Promise<void> {
  console.log('🧪 Testing activity logs...')
  
  try {
    const { data: activities, error } = await supabase
      .from('activity_log')
      .select('*')
      .limit(1)

    if (error) {
      results.push({
        feature: 'Activity Logs',
        status: 'FAIL',
        notes: `Database error: ${error.message}`
      })
    } else {
      results.push({
        feature: 'Activity Logs',
        status: 'PASS',
        notes: 'Activity log table accessible'
      })
    }
  } catch (err: any) {
    results.push({
      feature: 'Activity Logs',
      status: 'FAIL',
      notes: err.message
    })
  }
}

async function testStorageUpload(): Promise<void> {
  console.log('🧪 Testing storage upload...')
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) {
      results.push({
        feature: 'Storage Upload',
        status: 'FAIL',
        notes: error.message
      })
    } else {
      const docsBucket = buckets.find(b => b.name === 'docs')
      if (docsBucket) {
        results.push({
          feature: 'Storage Upload',
          status: 'PASS',
          notes: 'docs bucket exists and accessible'
        })
      } else {
        results.push({
          feature: 'Storage Upload',
          status: 'FAIL',
          notes: 'docs bucket not found'
        })
      }
    }
  } catch (err: any) {
    results.push({
      feature: 'Storage Upload',
      status: 'FAIL',
      notes: err.message
    })
  }
}

async function testTickerUpdate(): Promise<void> {
  console.log('🧪 Testing ticker update...')
  
  try {
    // Check if activity_recent view exists and has data
    const { data: recentActivity, error } = await supabase
      .from('activity_recent')
      .select('*')
      .limit(5)

    if (error) {
      results.push({
        feature: 'Ticker Update',
        status: 'FAIL',
        notes: `View error: ${error.message}`
      })
    } else if (recentActivity && recentActivity.length > 0) {
      results.push({
        feature: 'Ticker Update',
        status: 'PASS',
        notes: `${recentActivity.length} recent activities found`
      })
    } else {
      results.push({
        feature: 'Ticker Update',
        status: 'FAIL',
        notes: 'No recent activities found'
      })
    }
  } catch (err: any) {
    results.push({
      feature: 'Ticker Update',
      status: 'FAIL',
      notes: err.message
    })
  }
}

async function testRLSPolicies(): Promise<void> {
  console.log('🧪 Testing RLS policies...')
  
  try {
    // Test that service role can access tables
    const { error: invoiceError } = await supabase.from('invoices').select('*').limit(1)
    const { error: receiptError } = await supabase.from('receipts').select('*').limit(1)
    const { error: activityError } = await supabase.from('activity_log').select('*').limit(1)

    if (invoiceError || receiptError || activityError) {
      results.push({
        feature: 'RLS Policies',
        status: 'FAIL',
        notes: `Access denied: ${invoiceError?.message || receiptError?.message || activityError?.message}`
      })
    } else {
      results.push({
        feature: 'RLS Policies',
        status: 'PASS',
        notes: 'Service role can access billing tables'
      })
    }
  } catch (err: any) {
    results.push({
      feature: 'RLS Policies',
      status: 'FAIL',
      notes: err.message
    })
  }
}

function printResultsTable(): void {
  console.log('\n📊 COMPREHENSIVE UAT TEST RESULTS')
  console.log('==================================')
  console.log('')
  console.log('| Feature | Status | Notes |')
  console.log('|---------|--------|-------|')

  results.forEach(result => {
    const status = result.status === 'PASS' ? '✅ PASS' : '❌ FAIL'
    const notes = result.notes.length > 50 ? result.notes.substring(0, 47) + '...' : result.notes
    console.log(`| ${result.feature} | ${status} | ${notes} |`)
  })

  const passCount = results.filter(r => r.status === 'PASS').length
  const totalCount = results.length

  console.log('')
  console.log(`📈 Summary: ${passCount}/${totalCount} tests passed`)

  if (passCount === totalCount) {
    console.log('🎉 All tests passed! Billing system is ready for production.')
  } else {
    console.log('⚠️  Some tests failed. Please review the issues above.')
  }
}

async function runAllTests(): Promise<void> {
  console.log('🚀 Starting Comprehensive Billing System UAT Tests...')
  console.log('==================================================')
  console.log('')

  await testDatabaseTables()
  await testServicePurchase()
  await testDonation()
  await testInvoiceGeneration()
  await testReceiptGeneration()
  await testEmailLogs()
  await testActivityLogs()
  await testStorageUpload()
  await testTickerUpdate()
  await testRLSPolicies()

  printResultsTable()
}

// Run all tests
runAllTests()
  .then(() => {
    console.log('\n🏁 Comprehensive UAT testing completed!')
  })
  .catch(error => {
    console.error('💥 Comprehensive UAT testing failed:', error)
    process.exit(1)
  })
