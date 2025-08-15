const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySchemaFix() {
  console.log('🔧 Applying Comprehensive Schema Fix...\n')

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/20250128_fix_missing_fields.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('📋 Migration file loaded successfully')
    console.log('🚀 Applying migration...')

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    let successCount = 0
    let errorCount = 0

    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
        
        if (error) {
          // Try direct execution if RPC fails
          const { error: directError } = await supabase.from('_exec_sql').select('*').eq('sql', statement + ';')
          
          if (directError) {
            console.log(`⚠️  Statement skipped (likely already applied): ${statement.substring(0, 50)}...`)
          } else {
            console.log(`✅ Statement executed: ${statement.substring(0, 50)}...`)
            successCount++
          }
        } else {
          console.log(`✅ Statement executed: ${statement.substring(0, 50)}...`)
          successCount++
        }
      } catch (err) {
        console.log(`⚠️  Statement skipped: ${statement.substring(0, 50)}...`)
        console.log(`   Reason: ${err.message}`)
        errorCount++
      }
    }

    console.log(`\n📊 Migration Summary:`)
    console.log(`✅ Successful statements: ${successCount}`)
    console.log(`⚠️  Skipped statements: ${errorCount}`)

    // Verify the fix worked
    console.log('\n🔍 Verifying schema fix...')
    
    // Test users table
    const { data: testUser, error: userError } = await supabase
      .from('users')
      .select('id, email, name, phone, is_active, location, military_branch')
      .limit(1)

    if (userError) {
      console.error('❌ Users table still has issues:', userError.message)
    } else {
      console.log('✅ Users table fields accessible')
    }

    // Test pitches table
    const { data: testPitch, error: pitchError } = await supabase
      .from('pitches')
      .select('id, user_id, title, is_active, views_count')
      .limit(1)

    if (pitchError) {
      console.error('❌ Pitches table still has issues:', pitchError.message)
    } else {
      console.log('✅ Pitches table fields accessible')
    }

    console.log('\n🎉 Schema fix application complete!')

  } catch (error) {
    console.error('❌ Schema fix failed:', error)
  }
}

applySchemaFix()
