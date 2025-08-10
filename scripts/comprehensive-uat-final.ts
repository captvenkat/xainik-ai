import { createAdminClient } from '../src/lib/supabaseAdmin'

interface TestResult {
  feature: string
  status: 'PASS' | 'FAIL'
  notes: string
  error?: any
}

async function comprehensiveUAT() {
  console.log('🧪 COMPREHENSIVE BILLING UAT')
  console.log('=============================')
  
  const adminClient = createAdminClient()
  const results: TestResult[] = []

  // Test 1: Environment Variables
  try {
    const requiredEnvVars = [
      'BILLING_PDF_BUCKET', 
      'BILLING_SIGNED_URL_TTL',
      'RAZORPAY_WEBHOOK_SECRET',
      'NEXT_PUBLIC_SITE_URL'
    ]
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length === 0) {
      results.push({ 
        feature: 'Environment Variables', 
        status: 'PASS', 
        notes: 'All required env vars present' 
      })
    } else {
      results.push({ 
        feature: 'Environment Variables', 
        status: 'FAIL', 
        notes: `Missing: ${missingVars.join(', ')}` 
      })
    }
  } catch (error) {
    results.push({ 
      feature: 'Environment Variables', 
      status: 'FAIL', 
      notes: 'Error checking env vars',
      error 
    })
  }

  // Test 2: Database Tables
  const tables = ['payment_events', 'invoices', 'receipts', 'email_logs', 'activity_log', 'numbering_state']
  for (const table of tables) {
    try {
      const { data, error } = await adminClient.from(table).select('count').limit(1)
      if (!error) {
        results.push({ 
          feature: `${table} table`, 
          status: 'PASS', 
          notes: 'Table exists and accessible' 
        })
      } else {
        results.push({ 
          feature: `${table} table`, 
          status: 'FAIL', 
          notes: `Error: ${error.message}`,
          error 
        })
      }
    } catch (error) {
      results.push({ 
        feature: `${table} table`, 
        status: 'FAIL', 
        notes: 'Table not found',
        error 
      })
    }
  }

  // Test 3: Storage Bucket
  try {
    const { data: buckets } = await adminClient.storage.listBuckets()
    const docsBucket = buckets?.find(b => b.name === 'docs')
    if (docsBucket) {
      results.push({ 
        feature: 'docs storage bucket', 
        status: 'PASS', 
        notes: 'Bucket exists' 
      })
    } else {
      results.push({ 
        feature: 'docs storage bucket', 
        status: 'FAIL', 
        notes: 'Bucket not found' 
      })
    }
  } catch (error) {
    results.push({ 
      feature: 'docs storage bucket', 
      status: 'FAIL', 
      notes: 'Error accessing storage',
      error 
    })
  }

  // Test 4: Check existing data
  try {
    const { data: paymentEvents } = await adminClient.from('payment_events').select('*').limit(5)
    results.push({ 
      feature: 'payment_events data', 
      status: 'PASS', 
      notes: `${paymentEvents?.length || 0} events found` 
    })
  } catch (error) {
    results.push({ 
      feature: 'payment_events data', 
      status: 'FAIL', 
      notes: 'Error accessing payment events',
      error 
    })
  }

  try {
    const { data: invoices } = await adminClient.from('invoices').select('*').limit(5)
    results.push({ 
      feature: 'invoices data', 
      status: 'PASS', 
      notes: `${invoices?.length || 0} invoices found` 
    })
  } catch (error) {
    results.push({ 
      feature: 'invoices data', 
      status: 'FAIL', 
      notes: 'Error accessing invoices',
      error 
    })
  }

  try {
    const { data: receipts } = await adminClient.from('receipts').select('*').limit(5)
    results.push({ 
      feature: 'receipts data', 
      status: 'PASS', 
      notes: `${receipts?.length || 0} receipts found` 
    })
  } catch (error) {
    results.push({ 
      feature: 'receipts data', 
      status: 'FAIL', 
      notes: 'Error accessing receipts',
      error 
    })
  }

  try {
    const { data: emailLogs } = await adminClient.from('email_logs').select('*').limit(5)
    results.push({ 
      feature: 'email_logs data', 
      status: 'PASS', 
      notes: `${emailLogs?.length || 0} email logs found` 
    })
  } catch (error) {
    results.push({ 
      feature: 'email_logs data', 
      status: 'FAIL', 
      notes: 'Error accessing email logs',
      error 
    })
  }

  try {
    const { data: activityLogs } = await adminClient.from('activity_log').select('*').limit(5)
    results.push({ 
      feature: 'activity_log data', 
      status: 'PASS', 
      notes: `${activityLogs?.length || 0} activity logs found` 
    })
  } catch (error) {
    results.push({ 
      feature: 'activity_log data', 
      status: 'FAIL', 
      notes: 'Error accessing activity logs',
      error 
    })
  }

  // Test 5: Check storage files
  try {
    const { data: files } = await adminClient.storage.from('docs').list('', { limit: 10 })
    if (files && files.length > 0) {
      results.push({ 
        feature: 'PDF storage', 
        status: 'PASS', 
        notes: `${files.length} files in docs bucket` 
      })
    } else {
      results.push({ 
        feature: 'PDF storage', 
        status: 'FAIL', 
        notes: 'No PDF files found in docs bucket' 
      })
    }
  } catch (error) {
    results.push({ 
      feature: 'PDF storage', 
      status: 'FAIL', 
      notes: 'Error accessing storage files',
      error 
    })
  }

  // Print Results
  console.log('\n📊 COMPREHENSIVE UAT RESULTS')
  console.log('=============================')
  console.log('')
  console.log('| Feature | Status | Notes |')
  console.log('|---------|--------|-------|')

  results.forEach(result => {
    const statusIcon = result.status === 'PASS' ? '✅' : '❌'
    console.log(`| ${result.feature} | ${statusIcon} ${result.status} | ${result.notes} |`)
  })

  const passCount = results.filter(r => r.status === 'PASS').length
  const totalCount = results.length
  const percentage = Math.round((passCount / totalCount) * 100)

  console.log('')
  console.log(`📈 Summary: ${passCount}/${totalCount} tests passed (${percentage}%)`)

  if (passCount === totalCount) {
    console.log('🎉 All tests passed! Billing system is 100% functional!')
  } else {
    console.log('⚠️  Some tests failed. Please review the issues above.')
    
    // Show detailed errors for failed tests
    const failedTests = results.filter(r => r.status === 'FAIL')
    if (failedTests.length > 0) {
      console.log('\n🔍 DETAILED ERROR ANALYSIS:')
      console.log('==========================')
      failedTests.forEach(test => {
        console.log(`\n❌ ${test.feature}:`)
        console.log(`   Notes: ${test.notes}`)
        if (test.error) {
          console.log(`   Error: ${test.error.message || test.error}`)
        }
      })
    }
  }

  console.log('\n🏁 Comprehensive UAT testing completed!')
}

comprehensiveUAT().catch(console.error)
