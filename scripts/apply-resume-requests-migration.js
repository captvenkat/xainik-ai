const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  try {
    console.log('Applying resume_requests table migration...');

    // Create resume_requests table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS resume_requests (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
          requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          veteran_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          message TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'expired')),
          response_message TEXT,
          responded_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createTableError) {
      console.error('Error creating table:', createTableError);
      return;
    }

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_resume_requests_pitch_id ON resume_requests(pitch_id);
        CREATE INDEX IF NOT EXISTS idx_resume_requests_requester_id ON resume_requests(requester_id);
        CREATE INDEX IF NOT EXISTS idx_resume_requests_veteran_id ON resume_requests(veteran_id);
        CREATE INDEX IF NOT EXISTS idx_resume_requests_status ON resume_requests(status);
        CREATE INDEX IF NOT EXISTS idx_resume_requests_created_at ON resume_requests(created_at);
      `
    });

    if (indexError) {
      console.error('Error creating indexes:', indexError);
      return;
    }

    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE resume_requests ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.error('Error enabling RLS:', rlsError);
      return;
    }

    // Create RLS policies
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        DROP POLICY IF EXISTS "Users can view their own resume requests" ON resume_requests;
        CREATE POLICY "Users can view their own resume requests" ON resume_requests
          FOR SELECT USING (
            auth.uid() = requester_id OR auth.uid() = veteran_id
          );

        DROP POLICY IF EXISTS "Users can create resume requests" ON resume_requests;
        CREATE POLICY "Users can create resume requests" ON resume_requests
          FOR INSERT WITH CHECK (
            auth.uid() = requester_id
          );

        DROP POLICY IF EXISTS "Veterans can update resume requests" ON resume_requests;
        CREATE POLICY "Veterans can update resume requests" ON resume_requests
          FOR UPDATE USING (
            auth.uid() = veteran_id
          );
      `
    });

    if (policiesError) {
      console.error('Error creating policies:', policiesError);
      return;
    }

    console.log('✅ Resume requests table migration applied successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

applyMigration();
