-- SIMPLE DATABASE DIAGNOSTIC - NO COMPLEX SQL
-- Run this to see exactly what exists in your database

-- 1. List ALL tables in public schema
SELECT 
  'TABLE' as object_type,
  table_name as name,
  'public' as schema
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
  'VIEW' as object_type,
  table_name as name,
  'public' as schema
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'VIEW'
ORDER BY object_type, name;

-- 2. Show the EXACT structure of each table (if any exist)
-- Check if pitches table exists and show its structure
SELECT 
  'pitches' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'pitches'
ORDER BY ordinal_position;

-- Check if users table exists and show its structure
SELECT 
  'users' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Check if likes table exists and show its structure
SELECT 
  'likes' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'likes'
ORDER BY ordinal_position;

-- Check if shares table exists and show its structure
SELECT 
  'shares' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'shares'
ORDER BY ordinal_position;

-- Check if endorsements table exists and show its structure
SELECT 
  'endorsements' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'endorsements'
ORDER BY ordinal_position;

-- 3. Show ALL columns from ALL tables (detailed view)
SELECT 
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default,
  c.ordinal_position
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
  AND c.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;

-- 4. Show foreign key relationships (if any exist)
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 5. Show RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
