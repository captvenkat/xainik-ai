const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkImpactTables() {
  try {
    console.log('🔍 Checking impact analytics tables...')
    
    // Check if impact_funnel view exists
    const { data: funnelData, error: funnelError } = await supabase
      .from('impact_funnel')
      .select('*')
      .limit(1)
    
    if (funnelError) {
      console.log('❌ impact_funnel view does not exist:', funnelError.message)
    } else {
      console.log('✅ impact_funnel view exists')
    }
    
    // Check if impact_calls table exists
    const { data: callsData, error: callsError } = await supabase
      .from('impact_calls')
      .select('*')
      .limit(1)
    
    if (callsError) {
      console.log('❌ impact_calls table does not exist:', callsError.message)
    } else {
      console.log('✅ impact_calls table exists')
    }
    
    // Check if impact_outcomes table exists
    const { data: outcomesData, error: outcomesError } = await supabase
      .from('impact_outcomes')
      .select('*')
      .limit(1)
    
    if (outcomesError) {
      console.log('❌ impact_outcomes table does not exist:', outcomesError.message)
    } else {
      console.log('✅ impact_outcomes table exists')
    }
    
    // Check if impact_keywords table exists
    const { data: keywordsData, error: keywordsError } = await supabase
      .from('impact_keywords')
      .select('*')
      .limit(1)
    
    if (keywordsError) {
      console.log('❌ impact_keywords table does not exist:', keywordsError.message)
    } else {
      console.log('✅ impact_keywords table exists')
    }
    
    // Check if impact_nudges table exists
    const { data: nudgesData, error: nudgesError } = await supabase
      .from('impact_nudges')
      .select('*')
      .limit(1)
    
    if (nudgesError) {
      console.log('❌ impact_nudges table does not exist:', nudgesError.message)
    } else {
      console.log('✅ impact_nudges table exists')
    }
    
    // Check if impact_supporter_stats view exists
    const { data: supporterData, error: supporterError } = await supabase
      .from('impact_supporter_stats')
      .select('*')
      .limit(1)
    
    if (supporterError) {
      console.log('❌ impact_supporter_stats view does not exist:', supporterError.message)
    } else {
      console.log('✅ impact_supporter_stats view exists')
    }
    
  } catch (error) {
    console.error('❌ Error checking impact tables:', error)
  }
}

checkImpactTables()
