import fs from 'fs'
import path from 'path'

// Read the complete schema file
const migrationPath = path.join(process.cwd(), 'migrations', '20250227_complete_professional_schema.sql')
const completeSQL = fs.readFileSync(migrationPath, 'utf8')

// Extract only the billing-related SQL statements
const billingTables = [
  'service_plans',
  'user_subscriptions', 
  'invoices',
  'receipts',
  'payment_events',
  'payment_events_archive',
  'numbering_state',
  'email_logs'
]

// Find the billing section
const lines = completeSQL.split('\n')
let billingSQL = ''
let inBillingSection = false

for (const line of lines) {
  // Check if we're entering a billing table section
  if (billingTables.some(table => line.includes(`CREATE TABLE IF NOT EXISTS ${table}`))) {
    inBillingSection = true
  }
  
  // Check if we're exiting the billing section (after the last billing table)
  if (inBillingSection && line.includes('-- =====================================================') && 
      !line.includes('BILLING')) {
    inBillingSection = false
  }
  
  if (inBillingSection) {
    billingSQL += line + '\n'
  }
}

// Also include indexes, policies, triggers, and default data for billing tables
const billingIndexes = lines.filter(line => 
  line.includes('CREATE INDEX') && 
  billingTables.some(table => line.includes(table))
).join('\n')

const billingPolicies = lines.filter(line => 
  line.includes('CREATE POLICY') && 
  billingTables.some(table => line.includes(table))
).join('\n')

const billingTriggers = lines.filter(line => 
  line.includes('CREATE TRIGGER') && 
  billingTables.some(table => line.includes(table))
).join('\n')

const billingData = lines.filter(line => 
  line.includes('INSERT INTO') && 
  billingTables.some(table => line.includes(table))
).join('\n')

// Combine all billing SQL
const finalBillingSQL = `
-- =====================================================
-- BILLING SYSTEM SCHEMA (MISSING TABLES)
-- Apply this SQL in Supabase SQL Editor
-- =====================================================

${billingSQL}

-- =====================================================
-- BILLING INDEXES
-- =====================================================

${billingIndexes}

-- =====================================================
-- BILLING POLICIES  
-- =====================================================

${billingPolicies}

-- =====================================================
-- BILLING TRIGGERS
-- =====================================================

${billingTriggers}

-- =====================================================
-- BILLING DEFAULT DATA
-- =====================================================

${billingData}
`

// Write to file
const outputPath = path.join(process.cwd(), 'scripts', 'billing-schema-only.sql')
fs.writeFileSync(outputPath, finalBillingSQL)

console.log('📝 Billing schema SQL extracted!')
console.log(`📄 File saved to: ${outputPath}`)
console.log('')
console.log('🔧 Next steps:')
console.log('1. Go to Supabase Dashboard > SQL Editor')
console.log('2. Copy and paste the contents of billing-schema-only.sql')
console.log('3. Execute the SQL')
console.log('4. Run: npx supabase gen types typescript --project-id <your-project-id> > types/supabase.ts')
console.log('5. Run: npm run build')
