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

async function checkDatabaseSchema() {
  console.log('🔍 Checking Database Schema...')
  console.log('=====================================')
  
  try {
    // Check if tables exist
    console.log('\n📋 Checking table existence...')
    const requiredTables = [
      'users', 'veterans', 'recruiters', 'supporters', 'pitches', 
      'endorsements', 'referrals', 'referral_events', 'shared_pitches',
      'donations', 'activity_log', 'resume_requests', 'notifications',
      'notification_prefs', 'email_logs'
    ]
    
    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`)
        } else {
          console.log(`✅ Table ${table}: exists`)
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err}`)
      }
    }
    
    // Check foreign key relationships
    console.log('\n🔗 Checking foreign key relationships...')
    
    // Test pitches -> users relationship
    try {
      const { error } = await supabase
        .from('pitches')
        .select(`
          id,
          veteran:users!pitches_veteran_id_fkey(id, name)
        `)
        .limit(1)
      
      if (error) {
        console.log(`❌ pitches -> users relationship: ${error.message}`)
      } else {
        console.log(`✅ pitches -> users relationship: working`)
      }
    } catch (err) {
      console.log(`❌ pitches -> users relationship: ${err}`)
    }
    
    // Test pitches -> veterans relationship
    try {
      const { error } = await supabase
        .from('pitches')
        .select(`
          id,
          veteran:users!pitches_veteran_id_fkey(
            id,
            name,
            veterans!veterans_user_id_fkey(rank, service_branch)
          )
        `)
        .limit(1)
      
      if (error) {
        console.log(`❌ pitches -> veterans relationship: ${error.message}`)
      } else {
        console.log(`✅ pitches -> veterans relationship: working`)
      }
    } catch (err) {
      console.log(`❌ pitches -> veterans relationship: ${err}`)
    }
    
    // Check RLS policies
    console.log('\n🔒 Checking RLS policies...')
    try {
      const { data: policies, error } = await supabase
        .from('information_schema.policies')
        .select('*')
        .eq('table_schema', 'public')
      
      if (error) {
        console.log(`❌ RLS policies check: ${error.message}`)
      } else {
        console.log(`✅ RLS policies: ${policies?.length || 0} found`)
        policies?.forEach(policy => {
          console.log(`   - ${policy.table_name}: ${policy.policy_name}`)
        })
      }
    } catch (err) {
      console.log(`❌ RLS policies check: ${err}`)
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error)
  }
}

checkDatabaseSchema()
