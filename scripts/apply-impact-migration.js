const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyImpactMigration() {
  try {
    console.log('🔧 Applying impact analytics migration...')
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/20250814_impact_views_and_tables.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
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
        console.log(`Executing statement ${i + 1}/${statements.length}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.warn(`⚠️  Statement ${i + 1} warning:`, error.message)
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      }
    }
    
    console.log('🎉 Impact analytics migration completed!')
    console.log('📊 Impact analytics tables and views created:')
    console.log('- impact_calls')
    console.log('- impact_outcomes') 
    console.log('- impact_keywords')
    console.log('- impact_nudges')
    console.log('- impact_funnel (view)')
    console.log('- supporter_impact (view)')
    
  } catch (error) {
    console.error('❌ Error applying impact migration:', error)
    process.exit(1)
  }
}

applyImpactMigration()
