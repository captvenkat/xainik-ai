require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runSQL(sqlFile) {
  try {
    console.log(`📄 Running SQL file: ${sqlFile}`)
    
    // Read the SQL file
    const sql = fs.readFileSync(sqlFile, 'utf8')
    
    // Split by semicolons and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (statement.length === 0) continue
      
      console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`)
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement
      })
      
      if (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error)
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`)
        if (data) {
          console.log('📊 Result:', data)
        }
      }
    }
    
    console.log('\n🎉 SQL execution completed!')
    
  } catch (error) {
    console.error('❌ Failed to run SQL:', error)
  }
}

// Get the SQL file from command line arguments
const sqlFile = process.argv[2]

if (!sqlFile) {
  console.error('❌ Please provide a SQL file path')
  console.log('Usage: node scripts/run-sql.js <sql-file>')
  process.exit(1)
}

if (!fs.existsSync(sqlFile)) {
  console.error(`❌ SQL file not found: ${sqlFile}`)
  process.exit(1)
}

// Run the SQL
runSQL(sqlFile)
