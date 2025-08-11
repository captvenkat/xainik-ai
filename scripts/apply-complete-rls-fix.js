const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, serviceRole)

async function applyCompleteRLSFix() {
  console.log('🔧 Applying Complete RLS Fix...')
  console.log('============================================')
  
  try {
    // Read the migration file
    const fs = require('fs')
    const path = require('path')
    const migrationPath = path.join(__dirname, '..', 'migrations', '20250127_complete_rls_fix.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath)
      process.exit(1)
    }
    
    const sql = fs.readFileSync(migrationPath, 'utf8')
    console.log('📄 Migration SQL loaded successfully')
    
    // Apply the migration
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('❌ Error applying complete RLS fix:', error)
      process.exit(1)
    }
    
    console.log('✅ Complete RLS fix applied successfully!')
    console.log('')
    console.log('🔍 What was fixed:')
    console.log('   - Removed all problematic admin policies')
    console.log('   - Created comprehensive user-ownership policies')
    console.log('   - Added CRITICAL policies for dashboard access:')
    console.log('     • Users can read their own role')
    console.log('     • Users can update their own role')
    console.log('     • All role-specific data accessible')
    console.log('')
    console.log('🎯 Dashboard access should now work:')
    console.log('   - Users can read their role after login')
    console.log('   - Role selection should work')
    console.log('   - Dashboard access should be functional')
    console.log('')
    console.log('⚠️  Note: Admin functionality still needs alternative implementation')
    console.log('   (JWT claims, separate admin table, or service role operations)')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

applyCompleteRLSFix()
