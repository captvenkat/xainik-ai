-- Check Current State
-- Run this to see what's currently in your database

-- 1. Check pitches table columns
SELECT 'PITCHES COLUMNS' as info, column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pitches'
AND column_name IN ('user_id', 'veteran_id')
ORDER BY column_name;

-- 2. Check endorsements table columns
SELECT 'ENDORSEMENTS COLUMNS' as info, column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'endorsements'
AND column_name IN ('user_id', 'veteran_id', 'endorser_user_id', 'endorser_id')
ORDER BY column_name;

-- 3. Check all indexes on these tables
SELECT 'ALL INDEXES' as info, tablename, indexname
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('pitches', 'endorsements')
ORDER BY tablename, indexname;
