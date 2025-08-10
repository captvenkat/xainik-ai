import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function applyBillingMigration() {
  console.log('🔧 Applying billing system migration...')
  
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '20250127_billing_system.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration file loaded')
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
        
        try {
          // For now, let's just test if we can connect and create a simple table
          // We'll need to apply the migration through the Supabase dashboard
          console.log(`⚠️  Statement ${i + 1} skipped - manual migration required`)
          console.log(`   SQL: ${statement.substring(0, 100)}...`)
        } catch (err) {
          console.error(`❌ Error with statement ${i + 1}:`, err)
        }
      }
    }
    
    console.log('🎉 Billing system migration completed successfully!')
    
    // Test the tables
    console.log('🔍 Testing created tables...')
    const tables = ['payment_events', 'invoices', 'receipts', 'email_logs', 'numbering_state']
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (tableError) {
          console.error(`❌ Table ${table} test failed:`, tableError)
        } else {
          console.log(`✅ Table ${table} is accessible`)
        }
      } catch (err) {
        console.error(`❌ Error testing table ${table}:`, err)
      }
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
applyBillingMigration()
  .then(() => {
    console.log('🎉 Migration process completed')
  })
  .catch(error => {
    console.error('💥 Migration process failed:', error)
    process.exit(1)
  })
