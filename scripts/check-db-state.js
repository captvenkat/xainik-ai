const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('Missing Supabase environment variables')
  console.error('Please check your .env.local file contains:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=...')
  console.error('SUPABASE_SERVICE_ROLE_KEY=...')
  process.exit(1)
}

const supabase = createClient(url, serviceRole)

async function checkDatabaseState() {
  console.log('🔍 Checking Database State...')
  console.log('=====================================')
  
  try {
    // Check if the complete schema migration has been applied
    console.log('\n📋 Checking if complete schema migration is applied...')
    
    const requiredTables = [
      'users', 'veterans', 'recruiters', 'supporters', 'pitches', 
      'endorsements', 'referrals', 'referral_events', 'shared_pitches',
      'donations', 'activity_log', 'resume_requests', 'notifications',
      'notification_prefs', 'email_logs'
    ]
    
    let missingTables = []
    let existingTables = []
    
    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          missingTables.push(table)
          console.log(`❌ Table ${table}: ${error.message}`)
        } else {
          existingTables.push(table)
          console.log(`✅ Table ${table}: exists`)
        }
      } catch (err) {
        missingTables.push(table)
        console.log(`❌ Table ${table}: ${err}`)
      }
    }
    
    console.log(`\n📊 Summary:`)
    console.log(`✅ Existing tables: ${existingTables.length}`)
    console.log(`❌ Missing tables: ${missingTables.length}`)
    
    if (missingTables.length > 0) {
      console.log(`\n⚠️  Missing tables that need to be created:`)
      missingTables.forEach(table => console.log(`   - ${table}`))
      
      console.log(`\n🔧 To fix this, run the complete schema migration:`)
      console.log(`1. Go to Supabase Dashboard > SQL Editor`)
      console.log(`2. Run the migration: migrations/20250127_complete_schema_rls.sql`)
      console.log(`3. Verify all tables are created`)
    } else {
      console.log(`\n🎉 All required tables exist! Database schema is up to date.`)
    }
    
    // Check if there are any existing users
    if (existingTables.includes('users')) {
      console.log(`\n👥 Checking existing users...`)
      try {
        const { count, error } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`❌ Users count error: ${error.message}`)
        } else {
          console.log(`✅ Users count: ${count || 0}`)
        }
      } catch (err) {
        console.log(`❌ Users count error: ${err}`)
      }
    }
    
    // Check if there are any existing pitches
    if (existingTables.includes('pitches')) {
      console.log(`\n🎯 Checking existing pitches...`)
      try {
        const { count, error } = await supabase
          .from('pitches')
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`❌ Pitches count error: ${error.message}`)
        } else {
          console.log(`✅ Pitches count: ${count || 0}`)
        }
      } catch (err) {
        console.log(`❌ Pitches count error: ${err}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Database state check failed:', error)
  }
}

checkDatabaseState()
