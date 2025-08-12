import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Tables that should exist in our complete schema
const requiredTables = [
  'users',
  'user_profiles', 
  'pitches',
  'endorsements',
  'referrals',
  'referral_events',
  'shared_pitches',
  'donations',
  'user_activity_log',
  'resume_requests',
  'notifications',
  'notification_prefs',
  'recruiter_notes',
  'recruiter_saved_filters',
  'user_permissions',
  // Missing tables that are causing errors
  'activity_log',
  'service_plans',
  'user_subscriptions',
  'invoices',
  'receipts',
  'payment_events',
  'numbering_state',
  'email_logs'
]

async function checkMissingTables() {
  console.log('🔍 Checking for missing tables...')
  console.log('=====================================')
  
  const missingTables = []
  const existingTables = []
  
  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
        missingTables.push(table)
      } else {
        console.log(`✅ ${table}: exists`)
        existingTables.push(table)
      }
    } catch (err: any) {
      console.log(`❌ ${table}: ${err.message}`)
      missingTables.push(table)
    }
  }
  
  console.log('')
  console.log('📊 Summary:')
  console.log(`✅ Existing tables: ${existingTables.length}`)
  console.log(`❌ Missing tables: ${missingTables.length}`)
  
  if (missingTables.length > 0) {
    console.log('')
    console.log('🔧 Missing tables that need to be created:')
    missingTables.forEach(table => console.log(`  - ${table}`))
  }
}

checkMissingTables()
