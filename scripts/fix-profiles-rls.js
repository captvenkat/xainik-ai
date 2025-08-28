import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function fixProfilesRLS() {
  console.log('🔧 Fixing profiles table RLS policies...')
  
  try {
    // Test current connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log('❌ Connection test failed:', testError.message)
      return
    }
    
    console.log('✅ Connection test successful')
    
    // Apply the RLS fix via SQL
    const { error: sqlError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop the restrictive policy
        drop policy if exists "Profiles: owner read/write" on public.profiles;
        
        -- Create a more permissive policy that allows profile creation
        create policy "Profiles: owner read/write"
        on public.profiles
        using (auth.uid() = id)
        with check (
          -- Allow insert if user is creating their own profile
          (auth.uid() = id) OR
          -- Allow insert if no profile exists yet (for new users)
          (not exists (
            select 1 from public.profiles where id = auth.uid()
          ))
        );
      `
    })
    
    if (sqlError) {
      console.log('❌ SQL execution failed:', sqlError.message)
      
      // Try alternative approach - direct table operations
      console.log('🔄 Trying alternative approach...')
      
      // Test if we can now create a profile
      const testId = '00000000-0000-0000-0000-000000000000'
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({ 
          id: testId,
          email: 'test@example.com',
          status: 'pending'
        })
        .select()
      
      if (error) {
        console.log('❌ Profile creation still failing:', error.code, '-', error.message)
      } else {
        console.log('✅ Profile creation now working!')
        
        // Clean up test record
        await supabase.from('profiles').delete().eq('id', testId)
      }
    } else {
      console.log('✅ RLS policy updated successfully')
    }
    
  } catch (e) {
    console.error('❌ Unexpected error:', e)
  }
}

fixProfilesRLS()
