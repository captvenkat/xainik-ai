const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, serviceRole)

async function checkColumnNames() {
  console.log('🔍 Checking Column Names...')
  console.log('=====================================')
  
  const tables = [
    'users', 'veterans', 'recruiters', 'supporters', 'pitches', 
    'endorsements', 'referrals', 'referral_events', 'shared_pitches',
    'donations', 'activity_log', 'resume_requests', 'notifications',
    'notification_prefs', 'email_logs', 'recruiter_notes', 'recruiter_saved_filters'
  ]
  
  for (const table of tables) {
    try {
      // Try to select one row to see the structure
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: columns available`)
        if (data && data.length > 0) {
          console.log(`   Sample data keys: ${Object.keys(data[0]).join(', ')}`)
        } else {
          console.log(`   Table is empty`)
        }
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`)
    }
  }
}

checkColumnNames()
