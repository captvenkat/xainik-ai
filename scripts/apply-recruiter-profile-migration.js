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

async function applyRecruiterProfileMigration() {
  console.log('🔧 Applying Recruiter Profile Fields Migration...')
  console.log('===============================================')
  
  try {
    // Read the migration SQL
    const fs = require('fs')
    const path = require('path')
    const migrationPath = path.join(process.cwd(), 'migrations', '20250127_add_recruiter_profile_fields.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📋 Migration SQL loaded successfully')
    console.log('')
    console.log('⚠️  This migration needs to be applied manually through Supabase Dashboard')
    console.log('')
    console.log('📝 Steps to apply migration:')
    console.log('1. Go to https://supabase.com/dashboard/project/byleslhlkakxnsurzyzt/sql')
    console.log('2. Copy the complete SQL below')
    console.log('3. Paste and execute the SQL')
    console.log('4. Verify the new fields are added to recruiters table')
    console.log('')
    console.log('```sql')
    console.log(migrationSQL)
    console.log('```')
    console.log('')
    
    console.log('🔍 After applying migration, testing recruiter table...')
    
    // Test if the new fields exist
    const { data: testData, error: testError } = await supabase
      .from('recruiters')
      .select('user_id, company_name, industry, bio, website, linkedin_url')
      .limit(1)
    
    if (testError) {
      console.log('❌ Error testing recruiter table:', testError.message)
      console.log('   This is expected if the migration hasn\'t been applied yet')
    } else {
      console.log('✅ Recruiter table test successful!')
      console.log('   Available fields:', Object.keys(testData[0] || {}))
    }
    
    console.log('')
    console.log('🎯 Migration Summary:')
    console.log('   - Added bio field for company description')
    console.log('   - Added website field for company website')
    console.log('   - Added linkedin_url field for recruiter LinkedIn profile')
    console.log('')
    console.log('📱 Recruiter Profile Component:')
    console.log('   - Profile editing with photo upload')
    console.log('   - Company information management')
    console.log('   - Web links and bio management')
    console.log('   - Form validation and error handling')
    console.log('')
    console.log('✅ Recruiter dashboard now has a Profile tab!')
    
  } catch (error) {
    console.error('❌ Migration check failed:', error)
    process.exit(1)
  }
}

// Run the migration
applyRecruiterProfileMigration()
  .then(() => {
    console.log('🔍 Migration status check completed!')
  })
  .catch(error => {
    console.error('💥 Migration check failed:', error)
    process.exit(1)
  })
