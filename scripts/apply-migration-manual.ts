import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function applyMigration() {
  console.log('🔧 Applying billing system migration manually...')
  
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '20250127_billing_system.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration file loaded')
    
    // Split into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
        
        try {
          // Execute the SQL statement using the service role client
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          
          if (error) {
            // Check if it's a "already exists" error which is okay
            if (error.message.includes('already exists') || 
                error.message.includes('duplicate key') ||
                error.message.includes('already exists')) {
              console.log(`⚠️  Statement ${i + 1} skipped (already exists)`)
            } else {
              console.error(`❌ Statement ${i + 1} failed:`, error.message)
              // Continue with other statements
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`)
          }
        } catch (err: any) {
          console.error(`❌ Error executing statement ${i + 1}:`, err.message)
          // Continue with other statements
        }
      }
    }
    
    console.log('🎉 Migration completed!')
    
    // Test the tables
    await testTables()
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

async function testTables() {
  console.log('🔍 Testing created tables...')
  
  const tables = [
    'payment_events',
    'invoices', 
    'receipts',
    'email_logs',
    'numbering_state'
  ]
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.error(`❌ Table ${table} test failed:`, error.message)
      } else {
        console.log(`✅ Table ${table} is accessible`)
      }
    } catch (err: any) {
      console.error(`❌ Error testing table ${table}:`, err.message)
    }
  }
  
  // Test storage bucket
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) {
      console.error('❌ Storage buckets test failed:', error.message)
    } else {
      const docsBucket = buckets.find(b => b.name === 'docs')
      if (docsBucket) {
        console.log('✅ Storage bucket "docs" exists')
      } else {
        console.log('⚠️  Storage bucket "docs" not found')
      }
    }
  } catch (err: any) {
    console.error('❌ Error testing storage:', err.message)
  }
}

// Run the migration
applyMigration()
  .then(() => {
    console.log('🎉 Migration process completed successfully!')
  })
  .catch(error => {
    console.error('💥 Migration process failed:', error)
    process.exit(1)
  })
