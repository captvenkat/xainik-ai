-- Clean Verification Script - Check if column names are fixed
-- Run this after applying the fix

-- 1. Check pitches table structure
SELECT 'PITCHES TABLE COLUMNS' as table_info, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pitches'
AND column_name IN ('user_id', 'veteran_id')
ORDER BY column_name;

-- 2. Check endorsements table structure  
SELECT 'ENDORSEMENTS TABLE COLUMNS' as table_info, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'endorsements'
AND column_name IN ('user_id', 'veteran_id', 'endorser_user_id', 'endorser_id')
ORDER BY column_name;

-- 3. Check foreign key constraints
SELECT 'FOREIGN KEY CONSTRAINTS' as constraint_info,
       tc.table_name, 
       tc.constraint_name, 
       kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('pitches', 'endorsements')
ORDER BY tc.table_name, tc.constraint_name;

-- 4. Check indexes
SELECT 'INDEXES' as index_info,
       tablename, 
       indexname
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('pitches', 'endorsements')
  AND indexname LIKE '%user_id%'
ORDER BY tablename, indexname;

-- 5. Check RLS policies
SELECT 'RLS POLICIES' as policy_info,
       tablename, 
       policyname
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('pitches', 'endorsements')
ORDER BY tablename, policyname;
