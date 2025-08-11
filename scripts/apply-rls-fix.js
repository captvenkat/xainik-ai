const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('Missing Supabase environment variables')
  console.error('Please check your .env.local file contains:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=...')
  console.error('SUPABASE_SERVICE_ROLE_KEY=...')
  process.exit(1)
}

const supabase = createClient(url, serviceRole)

async function applyRLSFix() {
  console.log('🔧 Applying RLS Infinite Recursion Fix...')
  console.log('============================================')
  
  try {
    // Read the migration file
    const fs = require('fs')
    const path = require('path')
    const migrationPath = path.join(__dirname, '..', 'migrations', '20250127_fix_rls_infinite_recursion.sql')
    
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
    
    console.log('✅ RLS infinite recursion fix applied successfully!')
    console.log('')
    console.log('🔍 The following changes were made:')
    console.log('   - Removed all admin policies that caused infinite recursion')
    console.log('   - Created new policies that only check user ownership')
    console.log('   - Fixed the users table policy to avoid circular dependencies')
    console.log('')
    console.log('📝 Note: Admin functionality will need to be implemented differently')
    console.log('   Options: JWT claims, separate admin table, or service role operations')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

applyRLSFix()
