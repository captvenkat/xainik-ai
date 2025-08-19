-- Add allow_resume_requests column to pitches table
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS allow_resume_requests boolean DEFAULT false;

-- Update existing pitches to have allow_resume_requests as false by default
UPDATE public.pitches SET allow_resume_requests = false WHERE allow_resume_requests IS NULL;

-- Add comment to the column
COMMENT ON COLUMN public.pitches.allow_resume_requests IS 'Whether recruiters can request resume for this pitch';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'pitches' AND column_name = 'allow_resume_requests';
