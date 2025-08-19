const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('Please check your .env.local file contains:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=...');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyResumeRequestsMigration() {
  console.log('🔧 Applying Resume Requests Migration...');
  console.log('=====================================');
  
  try {
    // Step 1: Add the allow_resume_requests column to pitches table
    console.log('\n📝 Step 1: Adding allow_resume_requests column...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS allow_resume_requests boolean DEFAULT false;
      `
    });
    
    if (alterError) {
      console.log(`❌ Error adding column: ${alterError.message}`);
      return;
    }
    console.log('✅ Column added successfully');
    
    // Step 2: Update existing records to have allow_resume_requests = false
    console.log('\n📝 Step 2: Updating existing records...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.pitches SET allow_resume_requests = false WHERE allow_resume_requests IS NULL;
      `
    });
    
    if (updateError) {
      console.log(`❌ Error updating records: ${updateError.message}`);
      return;
    }
    console.log('✅ Records updated successfully');
    
    // Step 3: Add comment for documentation
    console.log('\n📝 Step 3: Adding column comment...');
    const { error: commentError } = await supabase.rpc('exec_sql', {
      sql: `
        COMMENT ON COLUMN public.pitches.allow_resume_requests IS 'Whether recruiters can request resume for this pitch';
      `
    });
    
    if (commentError) {
      console.log(`⚠️ Warning: Could not add comment: ${commentError.message}`);
    } else {
      console.log('✅ Comment added successfully');
    }
    
    // Step 4: Create index for better query performance
    console.log('\n📝 Step 4: Creating index...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_pitches_allow_resume_requests ON public.pitches(allow_resume_requests);
      `
    });
    
    if (indexError) {
      console.log(`⚠️ Warning: Could not create index: ${indexError.message}`);
    } else {
      console.log('✅ Index created successfully');
    }
    
    // Step 5: Verify the migration
    console.log('\n🔍 Step 5: Verifying migration...');
    const { data: pitches, error: verifyError } = await supabase
      .from('pitches')
      .select('id, allow_resume_requests')
      .limit(5);
    
    if (verifyError) {
      console.log(`❌ Error verifying migration: ${verifyError.message}`);
      return;
    }
    
    console.log('✅ Migration verification successful');
    console.log(`   - Found ${pitches?.length || 0} sample pitches`);
    if (pitches && pitches.length > 0) {
      console.log('   - Sample pitch:', pitches[0]);
    }
    
    console.log('\n🎉 Resume Requests Migration Completed Successfully!');
    console.log('==================================================');
    console.log('✅ allow_resume_requests column added to pitches table');
    console.log('✅ Default value set to false for existing records');
    console.log('✅ Column comment added for documentation');
    console.log('✅ Index created for performance');
    console.log('✅ Migration verified');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
applyResumeRequestsMigration();
