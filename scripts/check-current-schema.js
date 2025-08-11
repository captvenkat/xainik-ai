import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, serviceRole)

async function checkCurrentSchema() {
  console.log('🔍 Checking Current Database Schema...')
  console.log('=====================================')
  
  try {
    // Get all tables in public schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name')
    
    if (tablesError) {
      console.error('Error fetching tables:', tablesError)
      return
    }
    
    console.log('\n📋 Current Tables in Database:')
    console.log('--------------------------------')
    
    const userTables = tables.filter(t => t.table_type === 'BASE TABLE')
    const views = tables.filter(t => t.table_type === 'VIEW')
    
    if (userTables.length === 0) {
      console.log('❌ No user tables found')
    } else {
      userTables.forEach(table => {
        console.log(`✅ ${table.table_name}`)
      })
    }
    
    if (views.length > 0) {
      console.log('\n👁️  Current Views:')
      console.log('------------------')
      views.forEach(view => {
        console.log(`👁️  ${view.table_name}`)
      })
    }
    
    // Check if any of our target tables exist
    console.log('\n🎯 Migration Target Tables Status:')
    console.log('-----------------------------------')
    
    const targetTables = [
      'users', 'veterans', 'recruiters', 'supporters', 'pitches', 
      'endorsements', 'referrals', 'referral_events', 'resume_requests',
      'notifications', 'notification_prefs', 'shared_pitches', 'donations',
      'recruiter_notes', 'recruiter_saved_filters', 'payment_events_archive'
    ]
    
    for (const tableName of targetTables) {
      try {
        const { error } = await supabase.from(tableName).select('*').limit(1)
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`)
        } else {
          // Check if table has data
          const { count } = await supabase.from(tableName).select('*', { count: 'exact', head: true })
          console.log(`✅ ${tableName}: exists (${count || 0} rows)`)
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`)
      }
    }
    
    console.log('\n⚠️  RECOMMENDATIONS:')
    console.log('====================')
    
    if (userTables.length > 0) {
      console.log('1. You have existing tables - consider backing up data first')
      console.log('2. Current migration will DROP and RECREATE all tables')
      console.log('3. This will DELETE ALL EXISTING DATA')
      console.log('4. Consider modifying migration to use CREATE TABLE IF NOT EXISTS')
    } else {
      console.log('1. No existing tables found - safe to run migration')
      console.log('2. Migration will create fresh schema')
    }
    
  } catch (error) {
    console.error('Error checking schema:', error)
  }
}

checkCurrentSchema()
