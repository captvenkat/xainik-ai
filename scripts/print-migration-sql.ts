import fs from 'fs'
import path from 'path'

function printMigrationSQL() {
  console.log('📋 Billing System Migration SQL')
  console.log('================================')
  console.log('')
  console.log('📝 Copy the following SQL and paste it into your Supabase Dashboard SQL Editor:')
  console.log('🔗 https://supabase.com/dashboard/project/byleslhlkakxnsurzyzt/sql')
  console.log('')
  console.log('```sql')
  
  try {
    const migrationPath = path.join(process.cwd(), 'migrations', '20250127_billing_system.sql')
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
  console.log('2. Check that the "docs" storage bucket exists')
  console.log('3. Run the UAT tests')
  console.log('')
  console.log('🧪 To run UAT tests after migration:')
  console.log('set -a && source .env.local && set +a && npx tsx scripts/test-payments/servicePurchase.ts test-user-123 premium 29900 "Test User" test@example.com +919876543210')
  console.log('set -a && source .env.local && set +a && npx tsx scripts/test-payments/donation.ts 50000 "John Doe" john@example.com +919876543212 false')
}

printMigrationSQL()
