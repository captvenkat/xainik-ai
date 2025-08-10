import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function applyCompleteSchema() {
  console.log('🔧 Applying Complete Schema Migration...')
  console.log('=====================================')
  
  try {
    // Read the complete schema migration
    const migrationPath = path.join(process.cwd(), 'migrations', '20250127_complete_schema_rls.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📋 Migration SQL loaded successfully')
    console.log('')
    console.log('⚠️  This migration needs to be applied manually through Supabase Dashboard')
    console.log('')
    console.log('📝 Steps to apply migration:')
    console.log('1. Go to https://supabase.com/dashboard/project/byleslhlkakxnsurzyzt/sql')
    console.log('2. Copy the complete SQL below')
    console.log('3. Paste and execute the SQL')
    console.log('4. Verify all tables are created')
    console.log('')
    console.log('```sql')
    console.log(migrationSQL)
    console.log('```')
    console.log('')
    
    console.log('🔍 After applying migration, verifying tables...')
    
    // Check if tables exist after migration
    const requiredTables = [
      'users', 'veterans', 'recruiters', 'supporters', 'pitches', 
      'endorsements', 'referrals', 'referral_events', 'shared_pitches',
      'donations', 'activity_log', 'resume_requests', 'notifications',
      'notification_prefs', 'email_logs'
    ]
    
    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`)
        } else {
          console.log(`✅ Table ${table}: exists and accessible`)
        }
      } catch (err: any) {
        console.log(`❌ Table ${table}: ${err.message}`)
      }
    }
    
    console.log('')
    console.log('🎉 Complete schema migration ready to apply!')
    console.log('')
    console.log('🧪 After applying migration, run:')
    console.log('set -a && source .env.local && set +a && npx tsx scripts/run-uat-tests.ts')
    
  } catch (error) {
    console.error('❌ Error applying complete schema migration:', error)
    process.exit(1)
  }
}

applyCompleteSchema()
  .then(() => {
    console.log('🔧 Complete schema migration script completed')
  })
  .catch(error => {
    console.error('💥 Complete schema migration failed:', error)
    process.exit(1)
  })
