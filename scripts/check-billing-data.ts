import { createAdminClient } from '../src/lib/supabaseAdmin'

async function checkBillingData() {
  console.log('🔍 Checking Billing Data...')
  console.log('============================')
  
  const adminClient = createAdminClient()

  // Check payment events
  try {
    const { data: paymentEvents, error } = await adminClient.from('payment_events').select('*').order('created_at', { ascending: false }).limit(5)
    if (error) {
      console.log(`❌ Payment Events Error: ${error.message}`)
    } else {
      console.log(`📋 Payment Events: ${paymentEvents?.length || 0} found`)
      if (paymentEvents && paymentEvents.length > 0) {
        console.log('   Latest payment events:')
        paymentEvents.forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.event_id} - ${event.payment_id} - ${event.created_at}`)
        })
      }
    }
  } catch (error) {
    console.log(`❌ Payment Events Error: ${error}`)
  }

  // Check invoices
  try {
    const { data: invoices, error } = await adminClient.from('invoices').select('*').order('created_at', { ascending: false }).limit(5)
    if (error) {
      console.log(`❌ Invoices Error: ${error.message}`)
    } else {
      console.log(`📄 Invoices: ${invoices?.length || 0} found`)
      if (invoices && invoices.length > 0) {
        console.log('   Latest invoices:')
        invoices.forEach((invoice, index) => {
          console.log(`   ${index + 1}. ${invoice.invoice_number} - ${invoice.amount} - ${invoice.created_at}`)
        })
      }
    }
  } catch (error) {
    console.log(`❌ Invoices Error: ${error}`)
  }

  // Check receipts
  try {
    const { data: receipts, error } = await adminClient.from('receipts').select('*').order('created_at', { ascending: false }).limit(5)
    if (error) {
      console.log(`❌ Receipts Error: ${error.message}`)
    } else {
      console.log(`🧾 Receipts: ${receipts?.length || 0} found`)
      if (receipts && receipts.length > 0) {
        console.log('   Latest receipts:')
        receipts.forEach((receipt, index) => {
          console.log(`   ${index + 1}. ${receipt.receipt_number} - ${receipt.amount} - ${receipt.created_at}`)
        })
      }
    }
  } catch (error) {
    console.log(`❌ Receipts Error: ${error}`)
  }

  // Check email logs
  try {
    const { data: emailLogs, error } = await adminClient.from('email_logs').select('*').order('created_at', { ascending: false }).limit(5)
    if (error) {
      console.log(`❌ Email Logs Error: ${error.message}`)
    } else {
      console.log(`📧 Email Logs: ${emailLogs?.length || 0} found`)
      if (emailLogs && emailLogs.length > 0) {
        console.log('   Latest email logs:')
        emailLogs.forEach((log, index) => {
          console.log(`   ${index + 1}. ${log.email_to} - ${log.subject} - ${log.status} - ${log.created_at}`)
        })
      }
    }
  } catch (error) {
    console.log(`❌ Email Logs Error: ${error}`)
  }

  // Check activity log
  try {
    const { data: activityLogs, error } = await adminClient.from('activity_log').select('*').order('created_at', { ascending: false }).limit(5)
    if (error) {
      console.log(`❌ Activity Logs Error: ${error.message}`)
    } else {
      console.log(`📝 Activity Logs: ${activityLogs?.length || 0} found`)
      if (activityLogs && activityLogs.length > 0) {
        console.log('   Latest activity logs:')
        activityLogs.forEach((log, index) => {
          console.log(`   ${index + 1}. ${log.event} - ${JSON.stringify(log.meta)} - ${log.created_at}`)
        })
      }
    }
  } catch (error) {
    console.log(`❌ Activity Logs Error: ${error}`)
  }

  console.log('\n🏁 Billing data check completed!')
}

checkBillingData().catch(console.error)
