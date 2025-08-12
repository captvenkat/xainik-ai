import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://byleslhlkakxnsurzyzt.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5bGVzbGhsa2FreG5zdXJ6eXp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2MDkyMywiZXhwIjoyMDcwMzM2OTIzfQ.a1c68T9xpuoPlJPUsZ4Z0X13gC2TdTMtwedGZujL7IE'

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
