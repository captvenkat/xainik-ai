-- =====================================================
-- WORKING DIAGNOSTIC - USES CORRECT COLUMN NAMES
-- This will show us EXACTLY what's in your database
-- =====================================================

-- 1. CHECK CURRENT DATABASE STATE
DO $$
BEGIN
    RAISE NOTICE '=== DATABASE DIAGNOSTIC STARTED ===';
    RAISE NOTICE 'Timestamp: %', NOW();
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'Schema: %', current_schema();
    RAISE NOTICE 'Current User: %', current_user;
END $$;

-- 2. LIST ALL EXISTING TABLES AND VIEWS (using correct column names)
SELECT 
    'EXISTING_TABLES' as check_type,
    schemaname,
    tablename
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. LIST ALL EXISTING VIEWS
SELECT 
    'EXISTING_VIEWS' as check_type,
    schemaname,
    viewname
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- 4. CHECK SPECIFIC REQUIRED TABLES
DO $$
DECLARE
    table_exists BOOLEAN;
    missing_tables TEXT[] := ARRAY['endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary'];
    existing_tables TEXT[] := ARRAY[]::TEXT[];
    missing_tables_list TEXT[] := ARRAY[]::TEXT[];
    i TEXT;
BEGIN
    RAISE NOTICE '=== CHECKING REQUIRED TABLES ===';
    
    FOREACH i IN ARRAY missing_tables
    LOOP
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = i
        ) INTO table_exists;
        
        IF table_exists THEN
            existing_tables := array_append(existing_tables, i);
            RAISE NOTICE '✅ Table "%" EXISTS', i;
        ELSE
            missing_tables_list := array_append(missing_tables_list, i);
            RAISE NOTICE '❌ Table "%" MISSING', i;
        END IF;
    END LOOP;
    
    RAISE NOTICE '=== SUMMARY ===';
    RAISE NOTICE 'Existing tables: %', array_to_string(existing_tables, ', ');
    RAISE NOTICE 'Missing tables: %', array_to_string(missing_tables_list, ', ');
    
    IF array_length(missing_tables_list, 1) > 0 THEN
        RAISE NOTICE '🚨 MIGRATION REQUIRED: % tables need to be created', array_length(missing_tables_list, 1);
    ELSE
        RAISE NOTICE '✅ ALL TABLES EXIST: No migration needed';
    END IF;
END $$;

-- 5. ANALYZE PITCHES TABLE STRUCTURE (CRITICAL)
DO $$
DECLARE
    pitches_exists BOOLEAN;
    column_count INTEGER;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches'
    ) INTO pitches_exists;
    
    IF pitches_exists THEN
        SELECT COUNT(*) INTO column_count
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches';
        
        RAISE NOTICE '=== PITCHES TABLE ANALYSIS ===';
        RAISE NOTICE 'Table exists: ✅';
        RAISE NOTICE 'Column count: %', column_count;
        RAISE NOTICE 'Table exists, checking structure...';
    ELSE
        RAISE NOTICE '🚨 PITCHES TABLE MISSING: This is CRITICAL for the veteran dashboard';
        RETURN;
    END IF;
END $$;

-- Show pitches table structure if it exists
SELECT 
    'PITCHES_STRUCTURE' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pitches'
ORDER BY ordinal_position;

-- 6. ANALYZE USERS TABLE STRUCTURE (CRITICAL)
DO $$
DECLARE
    users_exists BOOLEAN;
    column_count INTEGER;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
    ) INTO users_exists;
    
    IF users_exists THEN
        SELECT COUNT(*) INTO column_count
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users';
        
        RAISE NOTICE '=== USERS TABLE ANALYSIS ===';
        RAISE NOTICE 'Table exists: ✅';
        RAISE NOTICE 'Column count: %', column_count;
    ELSE
        RAISE NOTICE '🚨 USERS TABLE MISSING: This is CRITICAL for relationships';
        RETURN;
    END IF;
END $$;

-- Show users table structure if it exists
SELECT 
    'USERS_STRUCTURE' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 7. CHECK EXISTING FOREIGN KEY RELATIONSHIPS
SELECT 
    'EXISTING_FOREIGN_KEYS' as check_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
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

-- 8. CHECK EXISTING RLS POLICIES
SELECT 
    'EXISTING_RLS' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 9. CHECK EXISTING INDEXES
SELECT 
    'EXISTING_INDEXES' as check_type,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 10. CHECK FOR EXISTING DATA IN KEY TABLES
DO $$
DECLARE
    table_name TEXT;
    row_count BIGINT;
    tables_to_check TEXT[] := ARRAY['pitches', 'users', 'endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary'];
    i TEXT;
BEGIN
    RAISE NOTICE '=== EXISTING DATA ANALYSIS ===';
    
    FOREACH i IN ARRAY tables_to_check
    LOOP
        BEGIN
            EXECUTE format('SELECT COUNT(*) FROM public.%I', i) INTO row_count;
            RAISE NOTICE 'Table "%": % rows', i, row_count;
        EXCEPTION
            WHEN undefined_table THEN
                RAISE NOTICE 'Table "%": DOES NOT EXIST', i;
        END;
    END LOOP;
END $$;

-- 11. CHECK SUPABASE AUTH SCHEMA
SELECT 
    'AUTH_SCHEMA' as check_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'auth'
ORDER BY table_name;

-- 12. FINAL COMPREHENSIVE ASSESSMENT
DO $$
DECLARE
    missing_count INTEGER;
    existing_count INTEGER;
    pitches_exists BOOLEAN;
    users_exists BOOLEAN;
    critical_tables_exist BOOLEAN;
BEGIN
    -- Check required tables
    SELECT COUNT(*) INTO missing_count
    FROM (
        SELECT 'endorsements' as table_name
        UNION SELECT 'likes'
        UNION SELECT 'shares'
        UNION SELECT 'community_suggestions'
        UNION SELECT 'mission_invitation_summary'
    ) required_tables
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = required_tables.table_name
    );
    
    -- Check critical tables
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pitches') INTO pitches_exists;
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') INTO users_exists;
    
    existing_count := 5 - missing_count;
    critical_tables_exist := pitches_exists AND users_exists;
    
    RAISE NOTICE '=== COMPREHENSIVE ASSESSMENT ===';
    RAISE NOTICE 'Required tables: 5';
    RAISE NOTICE 'Existing tables: %', existing_count;
    RAISE NOTICE 'Missing tables: %', missing_count;
    RAISE NOTICE 'Pitches table exists: %', CASE WHEN pitches_exists THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'Users table exists: %', CASE WHEN users_exists THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'Critical tables exist: %', CASE WHEN critical_tables_exist THEN '✅' ELSE '❌' END;
    
    IF NOT critical_tables_exist THEN
        RAISE NOTICE '🚨 CRITICAL ERROR: Missing core tables (pitches/users)';
        RAISE NOTICE 'Cannot proceed with migration until core tables exist!';
    ELSIF missing_count = 0 THEN
        RAISE NOTICE '🎉 STATUS: READY - All required tables exist!';
        RAISE NOTICE 'No migration needed.';
    ELSIF missing_count = 5 THEN
        RAISE NOTICE '🚨 STATUS: MIGRATION REQUIRED - No required tables exist!';
        RAISE NOTICE 'Run the migration script to create all tables.';
    ELSE
        RAISE NOTICE '⚠️ STATUS: PARTIAL MIGRATION - Some tables exist, some missing!';
        RAISE NOTICE 'Run the migration script to complete setup.';
    END IF;
    
    RAISE NOTICE '=== DIAGNOSTIC COMPLETED ===';
END $$;
