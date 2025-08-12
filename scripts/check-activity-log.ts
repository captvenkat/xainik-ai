import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkActivityLogTable() {
  try {
    console.log('🔍 Checking user_activity_log table structure...')
    
    // Get table info
    const { data, error } = await supabase
      .from('user_activity_log')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Error querying user_activity_log table:', error)
      return
    }
    
    if (data && data.length > 0) {
      console.log('✅ user_activity_log table structure:')
      console.log(Object.keys(data[0]))
    } else {
      console.log('⚠️ user_activity_log table exists but is empty')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkActivityLogTable()
