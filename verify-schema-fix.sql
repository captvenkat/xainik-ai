-- Verification Script - Run this after applying the schema fix
-- This will show you what was successfully applied

-- Check column structure of key tables
SELECT 'PITCHES TABLE' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'pitches'
ORDER BY ordinal_position;

SELECT 'ENDORSEMENTS TABLE' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'endorsements'
ORDER BY ordinal_position;

SELECT 'USERS TABLE' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Check if view was created
SELECT 'COMMUNITY_SUGGESTIONS_SUMMARY VIEW' as object_name, 
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.views 
           WHERE table_schema = 'public' AND table_name = 'community_suggestions_summary'
       ) THEN 'EXISTS' ELSE 'MISSING' END as status;

-- Check foreign key constraints
SELECT 'FOREIGN KEY CONSTRAINTS' as constraint_type,
       table_name, constraint_name, column_name
FROM information_schema.key_column_usage kcu
JOIN information_schema.table_constraints tc 
  ON kcu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('pitches', 'endorsements')
ORDER BY table_name, constraint_name;

-- Check RLS policies
SELECT 'RLS POLICIES' as policy_type,
       tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'pitches', 'endorsements', 'likes', 'shares')
ORDER BY tablename, policyname;

-- Check indexes
SELECT 'INDEXES' as index_type,
       tablename, indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('pitches', 'endorsements', 'likes', 'shares')
ORDER BY tablename, indexname;
