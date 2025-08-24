-- Add bio field to veterans table
-- Migration: 20250128_add_bio_to_veterans.sql

-- Add bio field with 600 character limit
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'veterans' 
    AND column_name = 'bio'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.veterans ADD COLUMN bio text CHECK (length(bio) <= 600);
    RAISE NOTICE 'Added bio field to veterans table';
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_veterans_bio ON public.veterans(bio);

-- Test the migration
SELECT 
  'Bio Migration Complete' as status,
  COUNT(*) as total_veterans,
  COUNT(CASE WHEN bio IS NOT NULL THEN 1 END) as veterans_with_bio
FROM public.veterans;
