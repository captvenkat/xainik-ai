const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyPitchesRLSFix() {
  console.log('🔧 Applying RLS fix for pitches table...\n')

  try {
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, '../migrations/20250128_fix_pitches_rls.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    console.log('📋 SQL migration content loaded')
    console.log('🚀 Executing RLS policies fix...')

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent })

    if (error) {
      console.error('❌ Error applying RLS fix:', error)
      
      // Try alternative approach - execute statements one by one
      console.log('\n🔄 Trying alternative approach...')
      
      const statements = [
        'ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;',
        'DROP POLICY IF EXISTS "Users can view all active pitches" ON pitches;',
        'DROP POLICY IF EXISTS "Users can create their own pitches" ON pitches;',
        'DROP POLICY IF EXISTS "Users can update their own pitches" ON pitches;',
        'DROP POLICY IF EXISTS "Users can delete their own pitches" ON pitches;',
        'DROP POLICY IF EXISTS "Users can view their own pitches" ON pitches;',
        'CREATE POLICY "Users can view all active pitches" ON pitches FOR SELECT USING (is_active = true);',
        'CREATE POLICY "Users can view their own pitches" ON pitches FOR SELECT USING (auth.uid() = user_id);',
        'CREATE POLICY "Users can create their own pitches" ON pitches FOR INSERT WITH CHECK (auth.uid() = user_id);',
        'CREATE POLICY "Users can update their own pitches" ON pitches FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);',
        'CREATE POLICY "Users can delete their own pitches" ON pitches FOR DELETE USING (auth.uid() = user_id);'
      ]

      for (const statement of statements) {
        try {
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement })
          if (stmtError) {
            console.log(`⚠️ Statement failed: ${statement}`)
            console.log(`   Error: ${stmtError.message}`)
          } else {
            console.log(`✅ Statement executed: ${statement.substring(0, 50)}...`)
          }
        } catch (err) {
          console.log(`❌ Statement error: ${statement}`)
          console.log(`   Error: ${err.message}`)
        }
      }
    } else {
      console.log('✅ RLS fix applied successfully!')
    }

    // Verify the fix by checking if policies exist
    console.log('\n🔍 Verifying RLS policies...')
    
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd')
      .eq('tablename', 'pitches')

    if (policiesError) {
      console.log('⚠️ Could not verify policies directly')
    } else {
      console.log('📋 Current policies on pitches table:')
      policies?.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

applyPitchesRLSFix()
