const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('Applying allow_resume_requests migration...');
    
    // Add the allow_resume_requests column to pitches table
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS allow_resume_requests boolean DEFAULT false;
      `
    });
    
    if (alterError) {
      console.error('Error adding column:', alterError);
      return;
    }
    
    // Update existing records to have allow_resume_requests = false
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.pitches SET allow_resume_requests = false WHERE allow_resume_requests IS NULL;
      `
    });
    
    if (updateError) {
      console.error('Error updating existing records:', updateError);
      return;
    }
    
    // Add comment for documentation
    const { error: commentError } = await supabase.rpc('exec_sql', {
      sql: `
        COMMENT ON COLUMN public.pitches.allow_resume_requests IS 'Whether recruiters can request resume for this pitch';
      `
    });
    
    if (commentError) {
      console.error('Error adding comment:', commentError);
      return;
    }
    
    // Create index for better query performance
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_pitches_allow_resume_requests ON public.pitches(allow_resume_requests);
      `
    });
    
    if (indexError) {
      console.error('Error creating index:', indexError);
      return;
    }
    
    console.log('✅ Migration applied successfully!');
    console.log('✅ allow_resume_requests column added to pitches table');
    console.log('✅ Existing records updated with default value');
    console.log('✅ Index created for better performance');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

applyMigration();
