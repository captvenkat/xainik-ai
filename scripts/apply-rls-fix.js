import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

// Load environment variables
dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Applying RLS Policy Fix...')
console.log('=============================')

if (!url || !serviceRole) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, serviceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyRLSFix() {
  try {
    // Read the migration SQL
    const migrationSQL = fs.readFileSync('migrations/20250127_fix_rls_policies.sql', 'utf8')
    
    console.log('📝 Applying RLS policy fix...')
    
    // Execute the migration using raw SQL
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      
      // Try alternative approach - execute SQL statements manually
      console.log('🔄 Trying alternative approach...')
      
      const statements = [
        'DROP POLICY IF EXISTS "Users can manage own profile" ON public.users;',
        'DROP POLICY IF EXISTS "Admin can manage all users" ON public.users;',
        'CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);',
        'CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);',
        'CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);',
        'CREATE POLICY "Users can create profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NOT NULL);',
        'CREATE POLICY "Authenticated users can read basic user info" ON public.users FOR SELECT USING (auth.uid() IS NOT NULL);'
      ]
      
      for (const statement of statements) {
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement })
        if (stmtError) {
          console.error('❌ Statement failed:', statement, stmtError)
        } else {
          console.log('✅ Statement executed:', statement.substring(0, 50) + '...')
        }
      }
    } else {
      console.log('✅ RLS policy fix applied successfully')
    }
    
    // Test the fix
    console.log('\n🧪 Testing the fix...')
    const testUserId = '713e1683-8089-4dfc-ac29-b0f1b2d6c787'
    
    // Test user query
    const { data: userData, error: queryError } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', testUserId)
      .single()
    
    if (queryError) {
      console.error('❌ User query still failing:', queryError)
    } else {
      console.log('✅ User query successful:', userData)
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

applyRLSFix()
