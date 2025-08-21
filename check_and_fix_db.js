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

async function checkAndFixDatabase() {
  try {
    console.log('🔍 Checking database tables...')
    
    // Check if shortlist table exists
    const { data: shortlistTest, error: shortlistError } = await supabase
      .from('shortlist')
      .select('count')
      .limit(1)
    
    console.log('Shortlist table check:', { 
      exists: !shortlistError, 
      error: shortlistError?.message 
    })
    
    if (shortlistError && (shortlistError.message.includes('relation "shortlist" does not exist') || shortlistError.message.includes('Could not find the table'))) {
      console.log('❌ Shortlist table does not exist. Creating it...')
      
      // Apply the shortlist table migration
      const migrationSQL = `
        -- Add shortlist table for recruiter shortlisted pitches
        CREATE TABLE IF NOT EXISTS shortlist (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          recruiter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(recruiter_user_id, pitch_id)
        );

        -- Add RLS policies
        ALTER TABLE shortlist ENABLE ROW LEVEL SECURITY;

        -- Policy: Users can only see their own shortlisted items
        CREATE POLICY "Users can view own shortlisted items" ON shortlist
          FOR SELECT USING (auth.uid() = recruiter_user_id);

        -- Policy: Users can only insert their own shortlisted items
        CREATE POLICY "Users can insert own shortlisted items" ON shortlist
          FOR INSERT WITH CHECK (auth.uid() = recruiter_user_id);

        -- Policy: Users can only update their own shortlisted items
        CREATE POLICY "Users can update own shortlisted items" ON shortlist
          FOR UPDATE USING (auth.uid() = recruiter_user_id);

        -- Policy: Users can only delete their own shortlisted items
        CREATE POLICY "Users can delete own shortlisted items" ON shortlist
          FOR DELETE USING (auth.uid() = recruiter_user_id);

        -- Add indexes for performance
        CREATE INDEX IF NOT EXISTS idx_shortlist_recruiter_user_id ON shortlist(recruiter_user_id);
        CREATE INDEX IF NOT EXISTS idx_shortlist_pitch_id ON shortlist(pitch_id);
        CREATE INDEX IF NOT EXISTS idx_shortlist_created_at ON shortlist(created_at DESC);

        -- Add trigger for updated_at
        CREATE OR REPLACE FUNCTION update_shortlist_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER trigger_update_shortlist_updated_at
          BEFORE UPDATE ON shortlist
          FOR EACH ROW
          EXECUTE FUNCTION update_shortlist_updated_at();
      `
      
      const { error: migrationError } = await supabase.rpc('exec_sql', { sql: migrationSQL })
      
      if (migrationError) {
        console.error('❌ Migration failed:', migrationError)
        return
      }
      
      console.log('✅ Shortlist table created successfully!')
    } else {
      console.log('✅ Shortlist table already exists')
    }
    
    // Check if pitches table exists and has data
    const { data: pitchesTest, error: pitchesError } = await supabase
      .from('pitches')
      .select('id, title, user_id')
      .limit(5)
    
    console.log('Pitches table check:', { 
      exists: !pitchesError, 
      count: pitchesTest?.length || 0,
      error: pitchesError?.message 
    })
    
    // Check if users table exists
    const { data: usersTest, error: usersError } = await supabase
      .from('users')
      .select('id, name, role')
      .limit(5)
    
    console.log('Users table check:', { 
      exists: !usersError, 
      count: usersTest?.length || 0,
      error: usersError?.message 
    })
    
    console.log('✅ Database check complete!')
    
  } catch (error) {
    console.error('❌ Database check failed:', error)
  }
}

// Run the check
checkAndFixDatabase()
