import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function applyMigrationDirect() {
  console.log('🔧 Applying billing system migration directly...')
  
  try {
    // Since we can't execute raw SQL through the client, we'll need to apply this manually
    // through the Supabase Dashboard SQL Editor
    
    console.log('📋 Migration needs to be applied manually through Supabase Dashboard')
    console.log('')
    console.log('📝 Steps to apply migration:')
    console.log('1. Go to https://supabase.com/dashboard/project/byleslhlkakxnsurzyzt/sql')
    console.log('2. Copy the contents of migrations/20250127_billing_system.sql')
    console.log('3. Paste and execute the SQL')
    console.log('4. Verify all tables are created')
    console.log('')
    
    // Test if tables already exist
    await testTables()
    
  } catch (error) {
    console.error('💥 Migration check failed:', error)
    process.exit(1)
  }
}

async function testTables() {
  console.log('🔍 Testing if billing tables exist...')
  
  const tables = [
    'payment_events',
    'invoices', 
    'receipts',
    'email_logs',
    'numbering_state'
  ]
  
  let allTablesExist = true
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table ${table} does not exist: ${error.message}`)
        allTablesExist = false
      } else {
        console.log(`✅ Table ${table} exists`)
      }
    } catch (err: any) {
      console.log(`❌ Table ${table} does not exist: ${err.message}`)
      allTablesExist = false
    }
  }
  
  // Test storage bucket
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) {
      console.log('❌ Cannot check storage buckets:', error.message)
      allTablesExist = false
    } else {
      const docsBucket = buckets.find(b => b.name === 'docs')
      if (docsBucket) {
        console.log('✅ Storage bucket "docs" exists')
      } else {
        console.log('❌ Storage bucket "docs" does not exist')
        allTablesExist = false
      }
    }
  } catch (err: any) {
    console.log('❌ Cannot check storage:', err.message)
    allTablesExist = false
  }
  
  if (allTablesExist) {
    console.log('')
    console.log('🎉 All billing system tables exist! Migration appears to be applied.')
    console.log('✅ Ready to run UAT tests')
  } else {
    console.log('')
    console.log('⚠️  Some tables are missing. Please apply the migration manually.')
    console.log('📄 Migration file: migrations/20250127_billing_system.sql')
  }
  
  return allTablesExist
}

// Run the check
applyMigrationDirect()
  .then(() => {
    console.log('🔍 Migration status check completed!')
  })
  .catch(error => {
    console.error('💥 Migration check failed:', error)
    process.exit(1)
  })
