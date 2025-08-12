import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkNotificationsTable() {
  try {
    console.log('🔍 Checking notifications table structure...')
    
    // Get table info
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Error querying notifications table:', error)
      return
    }
    
    if (data && data.length > 0) {
      console.log('✅ notifications table structure:')
      console.log(Object.keys(data[0]))
    } else {
      console.log('⚠️ notifications table exists but is empty')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkNotificationsTable()
