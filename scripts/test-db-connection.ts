import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('payment_events')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error)
      return false
    }
    
    console.log('✅ Database connection successful')
    
    // Test if billing tables exist
    const tables = ['payment_events', 'invoices', 'receipts', 'email_logs', 'numbering_state']
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (tableError) {
          console.error(`❌ Table ${table} not found:`, tableError)
        } else {
          console.log(`✅ Table ${table} exists`)
        }
      } catch (err) {
        console.error(`❌ Error checking table ${table}:`, err)
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return false
  }
}

// Run the test
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('🎉 Database test completed successfully')
    } else {
      console.log('💥 Database test failed')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('💥 Database test error:', error)
    process.exit(1)
  })
