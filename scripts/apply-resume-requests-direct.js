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

async function applyResumeRequestsMigrationDirect() {
  console.log('🔧 Applying Resume Requests Migration (Direct Method)...');
  console.log('=====================================================');
  
  try {
    // Step 1: Check if the column already exists
    console.log('\n📝 Step 1: Checking if column exists...');
    const { data: existingColumns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'pitches')
      .eq('column_name', 'allow_resume_requests');
    
    if (checkError) {
      console.log(`❌ Error checking columns: ${checkError.message}`);
      return;
    }
    
    if (existingColumns && existingColumns.length > 0) {
      console.log('✅ Column allow_resume_requests already exists');
    } else {
      console.log('❌ Column does not exist - manual SQL application required');
      console.log('\n📋 Please run the following SQL in your Supabase SQL Editor:');
      console.log('==========================================================');
      console.log(`
-- Add allow_resume_requests column to pitches table
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS allow_resume_requests boolean DEFAULT false;

-- Update existing records to have allow_resume_requests = false
UPDATE public.pitches SET allow_resume_requests = false WHERE allow_resume_requests IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.pitches.allow_resume_requests IS 'Whether recruiters can request resume for this pitch';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_pitches_allow_resume_requests ON public.pitches(allow_resume_requests);
      `);
      return;
    }
    
    // Step 2: Update existing records to have allow_resume_requests = false
    console.log('\n📝 Step 2: Updating existing records...');
    const { data: updateResult, error: updateError } = await supabase
      .from('pitches')
      .update({ allow_resume_requests: false })
      .is('allow_resume_requests', null);
    
    if (updateError) {
      console.log(`❌ Error updating records: ${updateError.message}`);
      return;
    }
    console.log('✅ Records updated successfully');
    
    // Step 3: Verify the migration
    console.log('\n🔍 Step 3: Verifying migration...');
    const { data: pitches, error: verifyError } = await supabase
      .from('pitches')
      .select('id, title, allow_resume_requests')
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
    console.log('✅ allow_resume_requests column is available');
    console.log('✅ Default value set to false for existing records');
    console.log('✅ Migration verified');
    console.log('\n🚀 The resume request feature is now ready to use!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
applyResumeRequestsMigrationDirect();
