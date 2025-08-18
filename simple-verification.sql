-- Simple Verification - Check Key Schema Fixes
-- Run this to verify the migration was successful

-- 1. Check if pitches table has veteran_id column
SELECT 'PITCHES TABLE - veteran_id column' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_schema = 'public' 
           AND table_name = 'pitches' 
           AND column_name = 'veteran_id'
       ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 2. Check if pitches table has updated_at column
SELECT 'PITCHES TABLE - updated_at column' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_schema = 'public' 
           AND table_name = 'pitches' 
           AND column_name = 'updated_at'
       ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 3. Check if users table has updated_at column
SELECT 'USERS TABLE - updated_at column' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_schema = 'public' 
           AND table_name = 'users' 
           AND column_name = 'updated_at'
       ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 4. Check if endorsements table has veteran_id column
SELECT 'ENDORSEMENTS TABLE - veteran_id column' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_schema = 'public' 
           AND table_name = 'endorsements' 
           AND column_name = 'veteran_id'
       ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 5. Check if endorsements table has endorser_id column
SELECT 'ENDORSEMENTS TABLE - endorser_id column' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_schema = 'public' 
           AND table_name = 'endorsements' 
           AND column_name = 'endorser_id'
       ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 6. Check if community_suggestions_summary view exists
SELECT 'COMMUNITY_SUGGESTIONS_SUMMARY VIEW' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.views 
           WHERE table_schema = 'public' 
           AND table_name = 'community_suggestions_summary'
       ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 7. Check foreign key constraints
SELECT 'FOREIGN KEY - pitches.veteran_id' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE table_schema = 'public' 
           AND table_name = 'pitches' 
           AND constraint_name = 'pitches_veteran_id_fkey'
       ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 8. Check RLS is enabled on key tables
SELECT 'RLS - pitches table' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM pg_tables 
           WHERE schemaname = 'public' 
           AND tablename = 'pitches' 
           AND rowsecurity = true
       ) THEN '✅ ENABLED' ELSE '❌ DISABLED' END as status;

SELECT 'RLS - users table' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM pg_tables 
           WHERE schemaname = 'public' 
           AND tablename = 'users' 
           AND rowsecurity = true
       ) THEN '✅ ENABLED' ELSE '❌ DISABLED' END as status;

-- 9. Check indexes
SELECT 'INDEX - idx_pitches_veteran_id' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM pg_indexes 
           WHERE schemaname = 'public' 
           AND tablename = 'pitches' 
           AND indexname = 'idx_pitches_veteran_id'
       ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;
