// Apply Donations RLS Fix
// Script: apply-donations-rls-fix.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixDonationsRLS() {
  console.log('🔧 Fixing donations RLS policy...')
  
  try {
    // Drop the existing restrictive policy
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP POLICY IF EXISTS v_donations_owner ON donations;'
    })
    
    if (dropError) {
      console.error('Error dropping policy:', dropError)
      return
    }
    
    // Create new policy that allows anonymous donations
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY v_donations_owner ON donations
        FOR ALL USING (
          user_id = auth.uid() OR user_id IS NULL
        ) WITH CHECK (
          user_id = auth.uid() OR user_id IS NULL
        );
      `
    })
    
    if (createError) {
      console.error('Error creating policy:', createError)
      return
    }
    
    console.log('✅ Donations RLS policy fixed successfully!')
    console.log('✅ Anonymous donations (user_id IS NULL) are now allowed')
    console.log('✅ Authenticated users can still manage their own donations')
    
  } catch (error) {
    console.error('❌ Error fixing donations RLS:', error)
  }
}

fixDonationsRLS()
