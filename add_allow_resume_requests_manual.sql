-- Manual SQL script to add allow_resume_requests column
-- Run this in your Supabase SQL Editor

-- Add the allow_resume_requests column to pitches table
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS allow_resume_requests boolean DEFAULT false;

-- Update existing records to have allow_resume_requests = false
UPDATE public.pitches SET allow_resume_requests = false WHERE allow_resume_requests IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.pitches.allow_resume_requests IS 'Whether recruiters can request resume for this pitch';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_pitches_allow_resume_requests ON public.pitches(allow_resume_requests);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'pitches' AND column_name = 'allow_resume_requests';
