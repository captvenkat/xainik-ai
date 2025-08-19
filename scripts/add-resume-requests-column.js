const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addResumeRequestsColumn() {
  try {
    console.log('Adding allow_resume_requests column to pitches table...');
    
    // Add the column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.pitches 
        ADD COLUMN IF NOT EXISTS allow_resume_requests boolean DEFAULT false;
        
        UPDATE public.pitches 
        SET allow_resume_requests = false 
        WHERE allow_resume_requests IS NULL;
      `
    });

    if (alterError) {
      console.error('Error adding column:', alterError);
      return;
    }

    console.log('✅ Successfully added allow_resume_requests column to pitches table');
    
    // Verify the column was added
    const { data: columns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'pitches')
      .eq('column_name', 'allow_resume_requests');

    if (verifyError) {
      console.error('Error verifying column:', verifyError);
      return;
    }

    if (columns && columns.length > 0) {
      console.log('✅ Column verification successful:', columns[0]);
    } else {
      console.log('⚠️ Column not found in verification query');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addResumeRequestsColumn();
