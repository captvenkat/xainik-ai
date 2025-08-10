import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkActivityTable() {
  console.log('🔍 Checking activity_log table...')
  
  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Activity log table error:', error)
      
      // Check if table exists
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'activity_log')
      
      if (tablesError) {
        console.error('❌ Cannot check table existence:', tablesError)
      } else if (tables && tables.length > 0) {
        console.log('✅ activity_log table exists but has access issues')
      } else {
        console.log('❌ activity_log table does not exist')
      }
    } else {
      console.log('✅ Activity log table is accessible')
      console.log('📊 Sample data:', data)
    }
  } catch (err: any) {
    console.error('❌ Error checking activity_log table:', err.message)
  }
}

checkActivityTable()
  .then(() => {
    console.log('🔍 Activity table check completed')
  })
  .catch(error => {
    console.error('💥 Activity table check failed:', error)
  })
