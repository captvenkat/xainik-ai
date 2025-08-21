import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Initialize Supabase admin client
const supabase = createClient(supabaseUrl, serviceRoleKey)

async function createShortlistTable() {
  try {
    console.log('🔧 Creating shortlist table...')
    
    // Create the shortlist table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.shortlist (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recruiter_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        pitch_id UUID NOT NULL REFERENCES public.pitches(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(recruiter_user_id, pitch_id)
      );
    `
    
    // Execute the SQL using the admin client
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (createError) {
      console.error('❌ Failed to create table:', createError)
      
      // Try alternative approach - use direct SQL query
      console.log('🔄 Trying alternative approach...')
      const { error: altError } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .then(() => {
          // If this works, try to create table with a different method
          return supabase.rpc('exec_sql', { sql_query: createTableSQL })
        })
      
      if (altError) {
        console.error('❌ Alternative approach also failed:', altError)
        return
      }
    }
    
    console.log('✅ Shortlist table created successfully!')
    
    // Enable RLS
    console.log('🔧 Enabling RLS...')
    const enableRLSSQL = `ALTER TABLE public.shortlist ENABLE ROW LEVEL SECURITY;`
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLSSQL })
    
    if (rlsError) {
      console.error('❌ Failed to enable RLS:', rlsError)
    } else {
      console.log('✅ RLS enabled successfully!')
    }
    
    // Create indexes
    console.log('🔧 Creating indexes...')
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_shortlist_recruiter_user_id ON public.shortlist(recruiter_user_id);
      CREATE INDEX IF NOT EXISTS idx_shortlist_pitch_id ON public.shortlist(pitch_id);
      CREATE INDEX IF NOT EXISTS idx_shortlist_created_at ON public.shortlist(created_at DESC);
    `
    const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexesSQL })
    
    if (indexError) {
      console.error('❌ Failed to create indexes:', indexError)
    } else {
      console.log('✅ Indexes created successfully!')
    }
    
    // Test the table
    console.log('🔍 Testing the new table...')
    const { data: testData, error: testError } = await supabase
      .from('shortlist')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Table test failed:', testError)
    } else {
      console.log('✅ Shortlist table is working correctly!')
    }
    
  } catch (error) {
    console.error('❌ Error creating shortlist table:', error)
  }
}

createShortlistTable()
