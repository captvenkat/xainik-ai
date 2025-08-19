-- Add allow_resume_requests column to pitches table
-- Run this in Supabase SQL Editor

-- Step 1: Add the allow_resume_requests column to pitches table
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS allow_resume_requests boolean DEFAULT false;

-- Step 2: Update existing records to have allow_resume_requests = false
UPDATE public.pitches SET allow_resume_requests = false WHERE allow_resume_requests IS NULL;

-- Step 3: Add comment for documentation
COMMENT ON COLUMN public.pitches.allow_resume_requests IS 'Whether recruiters can request resume for this pitch';

-- Step 4: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_pitches_allow_resume_requests ON public.pitches(allow_resume_requests);

-- Step 5: Verify the migration
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'pitches' 
  AND column_name = 'allow_resume_requests';

-- Step 6: Show sample data
SELECT id, title, allow_resume_requests 
FROM public.pitches 
LIMIT 5;
