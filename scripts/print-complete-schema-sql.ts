import fs from 'fs'
import path from 'path'

function printCompleteSchemaSQL() {
  console.log('📋 Complete Schema Migration SQL')
  console.log('================================')
  console.log('')
  console.log('📝 Copy the following SQL and paste it into your Supabase Dashboard SQL Editor:')
  console.log('🔗 https://supabase.com/dashboard/project/byleslhlkakxnsurzyzt/sql')
  console.log('')
  console.log('⚠️  This migration includes the activity_log table needed for the billing system')
  console.log('')
  console.log('```sql')
  
  try {
    const migrationPath = path.join(process.cwd(), 'migrations', '20250127_complete_schema_rls.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    console.log(migrationSQL)
  } catch (error) {
    console.error('❌ Error reading migration file:', error)
    process.exit(1)
  }
  
  console.log('```')
  console.log('')
  console.log('📋 After executing the SQL:')
  console.log('1. Verify all tables are created in the Table Editor')
  console.log('2. Check that the "activity_log" table exists')
  console.log('3. Run the UAT tests again')
  console.log('')
  console.log('🧪 To run UAT tests after migration:')
  console.log('set -a && source .env.local && set +a && npx tsx scripts/run-uat-tests.ts')
}

printCompleteSchemaSQL()
