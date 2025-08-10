import fs from 'fs'
import path from 'path'

function printActivityLogMigration() {
  console.log('📋 Activity Log Migration SQL')
  console.log('=============================')
  console.log('')
  console.log('📝 Copy the following SQL and paste it into your Supabase Dashboard SQL Editor:')
  console.log('🔗 https://supabase.com/dashboard/project/byleslhlkakxnsurzyzt/sql')
  console.log('')
  console.log('⚠️  This adds the missing activity_log table needed for the billing system')
  console.log('')

  try {
    const migrationPath = path.join(process.cwd(), 'migrations', '20250127_add_activity_log.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    console.log('```sql')
    console.log(migrationSQL)
    console.log('```')
  } catch (error) {
    console.error('❌ Error reading migration file:', error)
    process.exit(1)
  }

  console.log('')
  console.log('📋 After executing the SQL:')
  console.log('1. Verify the "activity_log" table is created in the Table Editor')
  console.log('2. Run the UAT tests again')
  console.log('')
  console.log('🧪 To run UAT tests after migration:')
  console.log('set -a && source .env.local && set +a && npx tsx scripts/comprehensive-uat.ts')
}

printActivityLogMigration()
