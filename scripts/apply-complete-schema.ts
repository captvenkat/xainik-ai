import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = 'https://byleslhlkakxnsurzyzt.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5bGVzbGhsa2FreG5zdXJ6eXp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2MDkyMywiZXhwIjoyMDcwMzM2OTIzfQ.a1c68T9xpuoPlJPUsZ4Z0X13gC2TdTMtwedGZujL7IE'

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
