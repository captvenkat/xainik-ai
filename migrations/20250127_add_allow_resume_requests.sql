-- Add allow_resume_requests column to pitches table
-- Migration: 20250127_add_allow_resume_requests.sql

-- Add the allow_resume_requests column to pitches table
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS allow_resume_requests boolean DEFAULT false;

-- Update existing records to have allow_resume_requests = false
UPDATE public.pitches SET allow_resume_requests = false WHERE allow_resume_requests IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.pitches.allow_resume_requests IS 'Whether recruiters can request resume for this pitch';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_pitches_allow_resume_requests ON public.pitches(allow_resume_requests);
