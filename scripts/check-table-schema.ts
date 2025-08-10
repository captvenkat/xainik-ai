import { createAdminClient } from '../src/lib/supabaseAdmin'

async function checkTableSchema() {
  console.log('🔍 Checking Table Schema...')
  console.log('============================')
  
  const adminClient = createAdminClient()

  // Check payment_events table structure
  try {
    const { data: paymentEvents, error } = await adminClient.from('payment_events').select('*').limit(1)
    if (error) {
      console.log('❌ Payment Events Error:', error.message)
    } else {
      console.log('✅ Payment Events table accessible')
      if (paymentEvents && paymentEvents.length > 0) {
        const columns = Object.keys(paymentEvents[0])
        console.log('📋 Payment Events columns:', columns)
        
        // Show sample data
        console.log('📄 Sample payment event:')
        console.log(JSON.stringify(paymentEvents[0], null, 2))
      }
    }
  } catch (error) {
    console.log('❌ Payment Events Error:', error)
  }

  // Check invoices table structure
  try {
    const { data: invoices, error } = await adminClient.from('invoices').select('*').limit(1)
    if (error) {
      console.log('❌ Invoices Error:', error.message)
    } else {
      console.log('✅ Invoices table accessible')
      if (invoices && invoices.length > 0) {
        const columns = Object.keys(invoices[0])
        console.log('📋 Invoices columns:', columns)
      } else {
        console.log('📋 Invoices table is empty')
      }
    }
  } catch (error) {
    console.log('❌ Invoices Error:', error)
  }

  // Check receipts table structure
  try {
    const { data: receipts, error } = await adminClient.from('receipts').select('*').limit(1)
    if (error) {
      console.log('❌ Receipts Error:', error.message)
    } else {
      console.log('✅ Receipts table accessible')
      if (receipts && receipts.length > 0) {
        const columns = Object.keys(receipts[0])
        console.log('📋 Receipts columns:', columns)
      } else {
        console.log('📋 Receipts table is empty')
      }
    }
  } catch (error) {
    console.log('❌ Receipts Error:', error)
  }

  // Check activity_log table structure
  try {
    const { data: activityLogs, error } = await adminClient.from('activity_log').select('*').limit(1)
    if (error) {
      console.log('❌ Activity Log Error:', error.message)
    } else {
      console.log('✅ Activity Log table accessible')
      if (activityLogs && activityLogs.length > 0) {
        const columns = Object.keys(activityLogs[0])
        console.log('📋 Activity Log columns:', columns)
      } else {
        console.log('📋 Activity Log table is empty')
      }
    }
  } catch (error) {
    console.log('❌ Activity Log Error:', error)
  }

  console.log('\n🏁 Table schema check completed!')
}

checkTableSchema().catch(console.error)
