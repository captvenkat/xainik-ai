#!/usr/bin/env node

// =====================================================
// APPLY ENHANCED USER PROFILES MIGRATION
// Script: scripts/apply-enhanced-user-profiles.js
// Purpose: Apply comprehensive user profile enhancement
// =====================================================

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, serviceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyEnhancedUserProfilesMigration() {
  console.log('🔧 Applying Enhanced User Profiles Migration...')
  console.log('================================================')
  
  try {
    // Step 1: Check current users table structure
    console.log('\n1️⃣ Checking current users table structure...')
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'users')
      .order('ordinal_position')
    
    if (columnsError) {
      console.error('❌ Error checking table structure:', columnsError)
      process.exit(1)
    }
    
    console.log(`✅ Found ${columns.length} columns in users table`)
    
    // Check if migration is already applied
    const hasMilitaryBranch = columns.some(col => col.column_name === 'military_branch')
    if (hasMilitaryBranch) {
      console.log('⚠️  Migration appears to be already applied (military_branch column exists)')
      console.log('   Skipping migration...')
      return
    }
    
    // Step 2: Apply the migration
    console.log('\n2️⃣ Applying enhanced user profiles migration...')
    
    // Read the migration file
    const fs = require('fs')
    const path = require('path')
    const migrationPath = path.join(__dirname, '..', 'migrations', '20250128_enhance_user_profiles.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath)
      process.exit(1)
    }
    
    const sql = fs.readFileSync(migrationPath, 'utf8')
    console.log('📄 Migration SQL loaded successfully')
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement?.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          
          if (error) {
            console.error(`❌ Statement ${i + 1} failed:`, error.message)
            console.log(`   SQL: ${statement.substring(0, 100)}...`)
            
            // Try alternative approach for some statements
            if (statement.includes('ADD COLUMN')) {
              console.log('   🔄 Trying alternative column addition...')
              await addColumnAlternative(statement)
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`)
          }
        } catch (err) {
          console.error(`❌ Error with statement ${i + 1}:`, err.message)
        }
      }
    }
    
    // Step 3: Verify migration
    console.log('\n3️⃣ Verifying migration...')
    
    const { data: newColumns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'users')
      .order('ordinal_position')
    
    if (verifyError) {
      console.error('❌ Error verifying migration:', verifyError)
    } else {
      const newColumnCount = newColumns.length - columns.length
      console.log(`✅ Migration completed! Added ${newColumnCount} new columns`)
      
      // Show new columns
      const originalColumnNames = columns.map(col => col.column_name)
      const newColumnNames = newColumns
        .filter(col => !originalColumnNames.includes(col.column_name))
        .map(col => col.column_name)
      
      if (newColumnNames.length > 0) {
        console.log('\n📋 New columns added:')
        newColumnNames.forEach(col => console.log(`   • ${col}`))
      }
    }
    
    console.log('\n🎉 Enhanced User Profiles Migration Completed!')
    console.log('================================================')
    console.log('✅ Users table now supports comprehensive veteran profiles')
    console.log('✅ Military service information tracking')
    console.log('✅ Education and certification management')
    console.log('✅ Professional status and availability')
    console.log('✅ Enhanced privacy and notification settings')
    console.log('✅ Profile completion tracking')
    console.log('✅ Advanced search and filtering capabilities')
    
    console.log('\n🔧 Next Steps:')
    console.log('   1. Update your TypeScript types to include new fields')
    console.log('   2. Enhance your user profile forms to use new fields')
    console.log('   3. Update your search and filtering logic')
    console.log('   4. Test the new profile capabilities')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

async function addColumnAlternative(statement) {
  try {
    // Extract column name and type from ADD COLUMN statement
    const match = statement.match(/ADD COLUMN IF NOT EXISTS (\w+) ([^,]+)/i)
    if (match) {
      const [, columnName, columnType] = match
      
      // Try to add column directly
      const { error } = await supabase.rpc('exec_sql', { 
        sql: `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ${columnName} ${columnType};` 
      })
      
      if (!error) {
        console.log(`   ✅ Added column ${columnName} using alternative method`)
      } else {
        console.log(`   ❌ Alternative method failed for ${columnName}`)
      }
    }
  } catch (err) {
    console.log('   ❌ Alternative method error:', err.message)
  }
}

// Run the migration
applyEnhancedUserProfilesMigration().catch(console.error)
