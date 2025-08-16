import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPitchesTable() {
  try {
    console.log('🔍 Checking Pitches Table Structure...')
    
    // First, let's see what columns exist
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'pitches')
      .eq('table_schema', 'public')
    
    if (columnsError) {
      console.log('❌ Error getting columns:', columnsError.message)
    } else {
      console.log('✅ Pitches Table Columns:')
      columns?.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`)
      })
    }
    
    // Now let's try to get some data with the correct columns
    console.log('\n🔍 Checking Pitches Data...')
    const { data, error } = await supabase
      .from('pitches')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Error getting data:', error.message)
    } else {
      console.log('✅ Pitches Data: Working')
      console.log('📊 Sample data:', data)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkPitchesTable()
