const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMissionInvitationSchema() {
  console.log('🚀 Applying Simplified Mission Invitation Schema...')
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/20250128_mission_invitation_system_simple.sql')
    const migrationContent = fs.readFileSync(migrationPath, 'utf8')
    
    // Split into individual statements
    const statements = migrationContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    let successCount = 0
    let errorCount = 0
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      if (statement.trim().length === 0) continue
      
      try {
        console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`)
        
        // Try to execute the statement
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message)
          errorCount++
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
          successCount++
        }
        
      } catch (err) {
        console.error(`❌ Failed to execute statement ${i + 1}:`, err.message)
        errorCount++
      }
    }
    
    console.log(`\n📊 Execution Summary:`)
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some statements failed. You may need to apply them manually.')
    } else {
      console.log('\n🎉 All statements executed successfully!')
    }
    
    // Verify the tables were created
    await verifyTables()
    
  } catch (error) {
    console.error('❌ Failed to apply migration:', error.message)
    process.exit(1)
  }
}

async function verifyTables() {
  console.log('\n🔍 Verifying table creation...')
  
  const tablesToCheck = [
    'mission_invitations',
    'mission_invitation_events', 
    'mission_invitation_analytics'
  ]
  
  const viewsToCheck = [
    'mission_invitation_summary',
    'mission_invitation_performance'
  ]
  
  let tablesFound = 0
  let viewsFound = 0
  
  // Check tables
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`)
      } else {
        console.log(`✅ Table '${table}': Found`)
        tablesFound++
      }
    } catch (err) {
      console.log(`❌ Table '${table}': Could not access`)
    }
  }
  
  // Check views
  for (const view of viewsToCheck) {
    try {
      const { data, error } = await supabase
        .from(view)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ View '${view}': ${error.message}`)
      } else {
        console.log(`✅ View '${view}': Found`)
        viewsFound++
      }
    } catch (err) {
      console.log(`❌ View '${view}': Could not access`)
    }
  }
  
  console.log(`\n📊 Verification Summary:`)
  console.log(`   Tables: ${tablesFound}/${tablesToCheck.length}`)
  console.log(`   Views: ${viewsFound}/${viewsToCheck.length}`)
  
  if (tablesFound === tablesToCheck.length && viewsFound === viewsToCheck.length) {
    console.log('\n🎉 All database objects created successfully!')
  } else {
    console.log('\n⚠️  Some objects may not have been created. Check the errors above.')
  }
}

// Run the migration
applyMissionInvitationSchema()
  .then(() => {
    console.log('\n✨ Mission Invitation Schema migration completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error.message)
    process.exit(1)
  })
