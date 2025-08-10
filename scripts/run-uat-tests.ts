import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface TestResult {
  feature: string
  status: 'Pass' | 'Fail'
  notes: string
}

const results: TestResult[] = []

async function testDatabaseTables(): Promise<void> {
  console.log('🔍 Testing database tables...')
  
  const tables = ['payment_events', 'invoices', 'receipts', 'email_logs', 'numbering_state']
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        results.push({
          feature: `Database Table: ${table}`,
          status: 'Fail',
          notes: error.message
        })
      } else {
        results.push({
          feature: `Database Table: ${table}`,
          status: 'Pass',
          notes: 'Table exists and accessible'
        })
      }
    } catch (err: any) {
      results.push({
        feature: `Database Table: ${table}`,
        status: 'Fail',
        notes: err.message
      })
    }
  }
}

async function testStorageBucket(): Promise<void> {
  console.log('🔍 Testing storage bucket...')
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) {
      results.push({
        feature: 'Storage Bucket: docs',
        status: 'Fail',
        notes: error.message
      })
    } else {
      const docsBucket = buckets.find(b => b.name === 'docs')
      if (docsBucket) {
        results.push({
          feature: 'Storage Bucket: docs',
          status: 'Pass',
          notes: 'Bucket exists and accessible'
        })
      } else {
        results.push({
          feature: 'Storage Bucket: docs',
          status: 'Fail',
          notes: 'docs bucket not found'
        })
      }
    }
  } catch (err: any) {
    results.push({
      feature: 'Storage Bucket: docs',
      status: 'Fail',
      notes: err.message
    })
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
              plan_tier: 'premium',
              buyer_name: 'Test User',
              buyer_email: 'test@example.com',
              buyer_phone: '+919876543210'
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
        feature: 'Service Purchase',
        status: 'Pass',
        notes: 'Webhook processed successfully'
      })
    } else {
      const errorText = await response.text()
      results.push({
        feature: 'Service Purchase',
        status: 'Fail',
        notes: `Webhook failed: ${response.status} - ${errorText}`
      })
    }
  } catch (err: any) {
    results.push({
      feature: 'Service Purchase',
      status: 'Fail',
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
        feature: 'Donation',
        status: 'Pass',
        notes: 'Webhook processed successfully'
      })
    } else {
      const errorText = await response.text()
      results.push({
        feature: 'Donation',
        status: 'Fail',
        notes: `Webhook failed: ${response.status} - ${errorText}`
      })
    }
  } catch (err: any) {
    results.push({
      feature: 'Donation',
      status: 'Fail',
      notes: err.message
    })
  }
}

async function testInvoicePDF(): Promise<void> {
  console.log('🧪 Testing invoice PDF generation...')
  
  try {
    // Check if any invoices were created
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .limit(1)
    
    if (error) {
      results.push({
        feature: 'Invoice PDF',
        status: 'Fail',
        notes: `Database error: ${error.message}`
      })
    } else if (invoices && invoices.length > 0) {
      const invoice = invoices[0]
      if (invoice.number && invoice.storage_key) {
        results.push({
          feature: 'Invoice PDF',
          status: 'Pass',
          notes: `Invoice ${invoice.number} generated with storage key`
        })
      } else {
        results.push({
          feature: 'Invoice PDF',
          status: 'Fail',
          notes: 'Invoice missing number or storage key'
        })
      }
    } else {
      results.push({
        feature: 'Invoice PDF',
        status: 'Fail',
        notes: 'No invoices found in database'
      })
    }
  } catch (err: any) {
    results.push({
      feature: 'Invoice PDF',
      status: 'Fail',
      notes: err.message
    })
  }
}

async function testReceiptPDF(): Promise<void> {
  console.log('🧪 Testing receipt PDF generation...')
  
  try {
    // Check if any receipts were created
    const { data: receipts, error } = await supabase
      .from('receipts')
      .select('*')
      .limit(1)
    
    if (error) {
      results.push({
        feature: 'Receipt PDF',
        status: 'Fail',
        notes: `Database error: ${error.message}`
      })
    } else if (receipts && receipts.length > 0) {
      const receipt = receipts[0]
      if (receipt.number && receipt.storage_key) {
        results.push({
          feature: 'Receipt PDF',
          status: 'Pass',
          notes: `Receipt ${receipt.number} generated with storage key`
        })
      } else {
        results.push({
          feature: 'Receipt PDF',
          status: 'Fail',
          notes: 'Receipt missing number or storage key'
        })
      }
    } else {
      results.push({
        feature: 'Receipt PDF',
        status: 'Fail',
        notes: 'No receipts found in database'
      })
    }
  } catch (err: any) {
    results.push({
      feature: 'Receipt PDF',
      status: 'Fail',
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
        status: 'Fail',
        notes: `Database error: ${error.message}`
      })
    } else if (emailLogs && emailLogs.length > 0) {
      results.push({
        feature: 'Email Logs',
        status: 'Pass',
        notes: `${emailLogs.length} email log entries found`
      })
    } else {
      results.push({
        feature: 'Email Logs',
        status: 'Fail',
        notes: 'No email logs found'
      })
    }
  } catch (err: any) {
    results.push({
      feature: 'Email Logs',
      status: 'Fail',
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
        status: 'Fail',
        notes: `Database error: ${error.message}`
      })
    } else {
      results.push({
        feature: 'Activity Logs',
        status: 'Pass',
        notes: 'Activity log table accessible'
      })
    }
  } catch (err: any) {
    results.push({
      feature: 'Activity Logs',
      status: 'Fail',
      notes: err.message
    })
  }
}

async function testRLS(): Promise<void> {
  console.log('🧪 Testing RLS policies...')
  
  try {
    // Test that we can access tables with service role
    const { error: invoiceError } = await supabase.from('invoices').select('*').limit(1)
    const { error: receiptError } = await supabase.from('receipts').select('*').limit(1)
    
    if (invoiceError || receiptError) {
      results.push({
        feature: 'RLS Policies',
        status: 'Fail',
        notes: `Access denied: ${invoiceError?.message || receiptError?.message}`
      })
    } else {
      results.push({
        feature: 'RLS Policies',
        status: 'Pass',
        notes: 'Service role can access billing tables'
      })
    }
  } catch (err: any) {
    results.push({
      feature: 'RLS Policies',
      status: 'Fail',
      notes: err.message
    })
  }
}

function printResultsTable(): void {
  console.log('\n📊 UAT Test Results')
  console.log('==================')
  console.log('')
  console.log('| Feature | Status | Notes |')
  console.log('|---------|--------|-------|')
  
  results.forEach(result => {
    const status = result.status === 'Pass' ? '✅ Pass' : '❌ Fail'
    const notes = result.notes.length > 50 ? result.notes.substring(0, 47) + '...' : result.notes
    console.log(`| ${result.feature} | ${status} | ${notes} |`)
  })
  
  const passCount = results.filter(r => r.status === 'Pass').length
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
  console.log('🚀 Starting Billing System UAT Tests...')
  console.log('=====================================')
  console.log('')
  
  await testDatabaseTables()
  await testStorageBucket()
  await testServicePurchase()
  await testDonation()
  await testInvoicePDF()
  await testReceiptPDF()
  await testEmailLogs()
  await testActivityLogs()
  await testRLS()
  
  printResultsTable()
}

// Run all tests
runAllTests()
  .then(() => {
    console.log('\n🏁 UAT testing completed!')
  })
  .catch(error => {
    console.error('💥 UAT testing failed:', error)
    process.exit(1)
  })
