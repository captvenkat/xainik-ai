-- =====================================================
-- ADD THEME SUPPORT FOR POSTERS
-- =====================================================
-- This script adds the theme_id column to enable poster variety

-- Add theme_id column for poster variety
alter table memes add column if not exists theme_id text;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check that the column was added successfully
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'memes' AND column_name = 'theme_id';
