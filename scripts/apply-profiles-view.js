const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('Missing Supabase environment variables')
  console.error('Please check your .env.local file contains:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=...')
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here')
  process.exit(1)
}

const supabase = createClient(url, serviceRole)

async function applyProfilesView() {
  console.log('🔧 Applying Profiles Compatibility View...')
  console.log('==========================================')
  
  try {
    // Read the migration SQL
    const fs = require('fs')
    const path = require('path')
    const migrationPath = path.join(process.cwd(), 'migrations', '20250127_add_profiles_compatibility_view.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📋 Migration SQL loaded successfully')
    console.log('')
    console.log('⚠️  This migration needs to be applied manually through Supabase Dashboard')
    console.log('')
    console.log('📝 Steps to apply migration:')
    console.log('1. Go to https://supabase.com/dashboard/project/byleslhlkakxnsurzyzt/sql')
    console.log('2. Copy the complete SQL below')
    console.log('3. Paste and execute the SQL')
    console.log('4. Verify the profiles view is created')
    console.log('')
    console.log('```sql')
    console.log(migrationSQL)
    console.log('```')
    console.log('')
    
    console.log('🔍 After applying migration, testing profiles view...')
    
    // Test if the profiles view works
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Profiles view test failed: ${error.message}`)
      } else {
        console.log(`✅ Profiles view test successful`)
        console.log(`   - Found ${profiles?.length || 0} profiles`)
        if (profiles && profiles.length > 0) {
          console.log(`   - Sample profile:`, profiles[0])
        }
      }
    } catch (err) {
      console.log(`❌ Profiles view test error: ${err}`)
    }
    
  } catch (error) {
    console.error('❌ Migration application failed:', error)
  }
}

applyProfilesView()
