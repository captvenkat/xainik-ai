-- MANUAL MIGRATION: Add bio field to veterans table
-- Run this in your Supabase SQL Editor

-- 1. Add bio column to veterans table
ALTER TABLE public.veterans 
ADD COLUMN IF NOT EXISTS bio text CHECK (length(bio) <= 600);

-- 2. Verify the column was added
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'veterans' 
  AND table_schema = 'public'
  AND column_name = 'bio';

-- 3. Test inserting a sample bio
UPDATE public.veterans 
SET bio = 'Sample bio for testing' 
WHERE user_id IN (
  SELECT id FROM public.users 
  WHERE role = 'veteran' 
  LIMIT 1
);

-- 4. Verify the update worked
SELECT 
  v.user_id,
  v.rank,
  v.service_branch,
  v.years_experience,
  v.bio,
  u.name
FROM public.veterans v
JOIN public.users u ON v.user_id = u.id
WHERE v.bio IS NOT NULL
LIMIT 5;
