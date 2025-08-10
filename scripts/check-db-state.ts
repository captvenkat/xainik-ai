import { createAdminClient } from '../src/lib/supabaseAdmin'

async function checkDatabaseState() {
  console.log('🔍 Checking Database State...')
  console.log('=============================')
  
  const adminClient = createAdminClient()

  // Check billing tables
  const billingTables = ['payment_events', 'invoices', 'receipts', 'numbering_state', 'activity_log', 'email_logs']
  
  for (const table of billingTables) {
    try {
      const { data, error } = await adminClient.from(table).select('count').limit(1)
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: Table exists`)
      }
    } catch (error) {
      console.log(`❌ ${table}: ${error}`)
    }
  }

  // Check storage bucket
  try {
    const { data: buckets } = await adminClient.storage.listBuckets()
    const docsBucket = buckets?.find(b => b.name === 'docs')
    if (docsBucket) {
      console.log('✅ docs bucket: Exists')
    } else {
      console.log('❌ docs bucket: Not found')
    }
  } catch (error) {
    console.log(`❌ docs bucket: ${error}`)
  }

  // Check for any existing data
  console.log('\n📊 Existing Data:')
  try {
    const { data: paymentEvents } = await adminClient.from('payment_events').select('*').limit(3)
    console.log(`📋 Payment Events: ${paymentEvents?.length || 0} found`)
    
    const { data: invoices } = await adminClient.from('invoices').select('*').limit(3)
    console.log(`📄 Invoices: ${invoices?.length || 0} found`)
    
    const { data: receipts } = await adminClient.from('receipts').select('*').limit(3)
    console.log(`🧾 Receipts: ${receipts?.length || 0} found`)
    
    const { data: emailLogs } = await adminClient.from('email_logs').select('*').limit(3)
    console.log(`📧 Email Logs: ${emailLogs?.length || 0} found`)
  } catch (error) {
    console.log(`❌ Error checking data: ${error}`)
  }

  console.log('\n🏁 Database state check completed!')
}

checkDatabaseState().catch(console.error)
