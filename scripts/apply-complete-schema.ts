import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyCompleteSchema() {
  try {
    console.log('Reading migration file...')
    const migrationPath = path.join(process.cwd(), 'migrations', '20250227_complete_professional_schema.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('Applying complete professional schema...')
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('Error applying schema:', error)
      return
    }
    
    console.log('✅ Complete professional schema applied successfully!')
  } catch (error) {
    console.error('Error:', error)
  }
}

applyCompleteSchema()
