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

async function testAllowResumeRequests() {
  console.log('🔧 Testing allow_resume_requests column...');
  console.log('=====================================');
  
  try {
    // Try to select the allow_resume_requests column
    console.log('\n📝 Testing if allow_resume_requests column exists...');
    const { data: pitches, error } = await supabase
      .from('pitches')
      .select('id, title, allow_resume_requests')
      .limit(1);
    
    if (error) {
      console.log(`❌ Error: ${error.message}`);
      if (error.message.includes('column "allow_resume_requests" does not exist')) {
        console.log('\n📋 The allow_resume_requests column does not exist.');
        console.log('Please run the following SQL in your Supabase SQL Editor:');
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
      }
      return;
    }
    
    console.log('✅ Column allow_resume_requests exists!');
    console.log('Sample data:', pitches);
    
    // Try to update a record with allow_resume_requests
    console.log('\n📝 Testing update with allow_resume_requests...');
    const { data: updateResult, error: updateError } = await supabase
      .from('pitches')
      .update({ allow_resume_requests: true })
      .eq('id', pitches[0]?.id)
      .select('id, allow_resume_requests');
    
    if (updateError) {
      console.log(`❌ Update error: ${updateError.message}`);
      return;
    }
    
    console.log('✅ Update successful:', updateResult);
    console.log('\n🎉 The allow_resume_requests column is working correctly!');
    console.log('🚀 The resume request feature is ready to use!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testAllowResumeRequests();
