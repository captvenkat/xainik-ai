import { createAdminClient } from '../src/lib/supabaseAdmin'
import type { Database } from '../types/live-schema'

async function checkBillingData() {
  console.log('🔍 Checking Billing Data...')
  console.log('============================')
  
  const adminClient = createAdminClient()

  // Check payment events archive
  console.log(`⏭️  Payment Events Archive: Table not in live schema (skipped)`)

  // Check donations
  try {
    const { data: donations, error } = await adminClient.from('donations').select('*').order('created_at', { ascending: false }).limit(5)
    if (error) {
      console.log(`❌ Donations Error: ${error.message}`)
    } else {
      console.log(`💰 Donations: ${donations?.length || 0} found`)
      if (donations && donations.length > 0) {
        console.log('   Latest donations:')
        donations.forEach((donation, index) => {
          console.log(`   ${index + 1}. Donation ID: ${donation.id} - Created: ${donation.created_at}`)
        })
      }
    }
  } catch (error) {
    console.log(`❌ Donations Error: ${error}`)
  }

  // Check user activity log
  console.log(`⏭️  User Activity Logs: Table not in live schema (skipped)`)

  console.log('\n🏁 Billing data check completed!')
}

checkBillingData().catch(console.error)
