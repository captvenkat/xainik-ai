const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, serviceRole)

async function checkActualSchema() {
  console.log('🔍 Checking Actual Table Schema...')
  console.log('=====================================')
  
  // Test tables that might have different column names
  const testTables = [
    { name: 'veterans', testData: { rank: 'test', service_branch: 'test' } },
    { name: 'recruiters', testData: { company_name: 'test', industry: 'test' } },
    { name: 'supporters', testData: { intro: 'test' } },
    { name: 'resume_requests', testData: { status: 'pending' } },
    { name: 'notifications', testData: { event: 'test', status: 'unread' } },
    { name: 'notification_prefs', testData: { email_enabled: true } },
    { name: 'email_logs', testData: { email: 'test@test.com', status: 'sent' } },
    { name: 'recruiter_notes', testData: { note: 'test note' } },
    { name: 'recruiter_saved_filters', testData: { filter_name: 'test filter' } }
  ]
  
  for (const table of testTables) {
    try {
      console.log(`\n📋 Testing ${table.name} table...`)
      
      // Try to insert with different possible column names
      const possibleColumns = [
        { user_id: '00000000-0000-0000-0000-000000000000' },
        { id: '00000000-0000-0000-0000-000000000000' },
        { recruiter_id: '00000000-0000-0000-0000-000000000000' },
        { veteran_id: '00000000-0000-0000-0000-000000000000' },
        { supporter_id: '00000000-0000-0000-0000-000000000000' }
      ]
      
      for (const columnTest of possibleColumns) {
        try {
          const testData = { ...table.testData, ...columnTest }
          const { error } = await supabase
            .from(table.name)
            .insert(testData)
          
          if (error) {
            if (error.message.includes('column') && error.message.includes('does not exist')) {
              console.log(`   ❌ Column ${Object.keys(columnTest)[0]} does not exist`)
            } else if (error.message.includes('foreign key constraint')) {
              console.log(`   ✅ Column ${Object.keys(columnTest)[0]} exists (foreign key constraint hit)`)
              break
            } else {
              console.log(`   ⚠️  Other error: ${error.message}`)
            }
          } else {
            console.log(`   ✅ Column ${Object.keys(columnTest)[0]} exists and insert succeeded`)
            break
          }
        } catch (err) {
          console.log(`   ❌ Error testing ${Object.keys(columnTest)[0]}: ${err.message}`)
        }
      }
      
    } catch (err) {
      console.log(`❌ ${table.name}: ${err.message}`)
    }
  }
}

checkActualSchema()
