const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, serviceRole)

async function applySimpleRLSFix() {
  console.log('🔧 Applying Simple RLS Fix...')
  console.log('============================================')
  
  try {
    // Read the migration file
    const fs = require('fs')
    const path = require('path')
    const migrationPath = path.join(__dirname, '..', 'migrations', '20250127_simple_rls_fix.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath)
      process.exit(1)
    }
    
    const sql = fs.readFileSync(migrationPath, 'utf8')
    console.log('📄 Migration SQL loaded successfully')
    
    // Apply the migration
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('❌ Error applying RLS fix:', error)
      process.exit(1)
    }
    
    console.log('✅ Simple RLS fix applied successfully!')
    console.log('')
    console.log('🔍 What was fixed:')
    console.log('   - Removed all admin policies that caused infinite recursion')
    console.log('   - Created policies ONLY for tables with confirmed column names')
    console.log('   - Users table: owner can manage own profile')
    console.log('   - Veterans/Recruiters/Supporters: owner can manage own profile')
    console.log('   - Notification prefs: owner can manage own')
    console.log('   - Activity log & Donations: public can view')
    console.log('')
    console.log('⚠️  Note: Some tables may be inaccessible until we confirm their column names')
    console.log('   This is safer than guessing and causing errors')
    console.log('')
    console.log('🎯 Authentication should now work without infinite recursion!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

applySimpleRLSFix()
