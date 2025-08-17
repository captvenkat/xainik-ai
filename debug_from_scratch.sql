-- =====================================================
-- COMPLETE DEBUG FROM SCRATCH - AUTO MODE
-- This will identify ALL issues in your database
-- =====================================================

-- 1. CHECK CURRENT DATABASE STATE
DO $$
BEGIN
    RAISE NOTICE '=== COMPLETE DEBUG FROM SCRATCH STARTED ===';
    RAISE NOTICE 'Timestamp: %', NOW();
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'Schema: %', current_schema();
    RAISE NOTICE 'Current User: %', current_user;
END $$;

-- 2. LIST ALL EXISTING TABLES
SELECT 
    'EXISTING_TABLES' as check_type,
    schemaname,
    tablename,
    'TABLE' as object_type
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. CHECK SPECIFIC REQUIRED TABLES
DO $$
DECLARE
    table_exists BOOLEAN;
    required_tables TEXT[] := ARRAY['users', 'pitches', 'endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary'];
    existing_tables TEXT[] := ARRAY[]::TEXT[];
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    i TEXT;
BEGIN
    RAISE NOTICE '=== CHECKING REQUIRED TABLES ===';
    
    FOREACH i IN ARRAY required_tables
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
            missing_tables := array_append(missing_tables, i);
            RAISE NOTICE '❌ Table "%" MISSING', i;
        END IF;
    END LOOP;
    
    RAISE NOTICE '=== SUMMARY ===';
    RAISE NOTICE 'Required tables: 7';
    RAISE NOTICE 'Existing tables: %', array_length(existing_tables, 1);
    RAISE NOTICE 'Missing tables: %', array_length(missing_tables, 1);
    RAISE NOTICE 'Existing: %', array_to_string(existing_tables, ', ');
    RAISE NOTICE 'Missing: %', array_to_string(missing_tables, ', ');
END $$;

-- 4. ANALYZE PITCHES TABLE STRUCTURE (CRITICAL)
DO $$
DECLARE
    pitches_exists BOOLEAN;
    column_count INTEGER;
    veteran_id_exists BOOLEAN;
    user_id_exists BOOLEAN;
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
        
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'pitches' 
            AND column_name = 'veteran_id'
        ) INTO veteran_id_exists;
        
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'pitches' 
            AND column_name = 'user_id'
        ) INTO user_id_exists;
        
        RAISE NOTICE '=== PITCHES TABLE ANALYSIS ===';
        RAISE NOTICE 'Table exists: ✅';
        RAISE NOTICE 'Column count: %', column_count;
        RAISE NOTICE 'veteran_id column exists: %', CASE WHEN veteran_id_exists THEN '✅' ELSE '❌' END;
        RAISE NOTICE 'user_id column exists: %', CASE WHEN user_id_exists THEN '✅' ELSE '❌' END;
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

-- 5. ANALYZE USERS TABLE STRUCTURE (CRITICAL)
DO $$
DECLARE
    users_exists BOOLEAN;
    column_count INTEGER;
    id_column_exists BOOLEAN;
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
        
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'users' 
            AND column_name = 'id'
        ) INTO id_column_exists;
        
        RAISE NOTICE '=== USERS TABLE ANALYSIS ===';
        RAISE NOTICE 'Table exists: ✅';
        RAISE NOTICE 'Column count: %', column_count;
        RAISE NOTICE 'id column exists: %', CASE WHEN id_column_exists THEN '✅' ELSE '❌' END;
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

-- 6. CHECK EXISTING FOREIGN KEY RELATIONSHIPS
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

-- 7. CHECK EXISTING RLS POLICIES
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

-- 8. CHECK EXISTING INDEXES
SELECT 
    'EXISTING_INDEXES' as check_type,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 9. CHECK FOR EXISTING DATA IN KEY TABLES
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

-- 10. CHECK SUPABASE AUTH SCHEMA
SELECT 
    'AUTH_SCHEMA' as check_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'auth'
ORDER BY table_name;

-- 11. FINAL COMPREHENSIVE ASSESSMENT
DO $$
DECLARE
    missing_count INTEGER;
    existing_count INTEGER;
    pitches_exists BOOLEAN;
    users_exists BOOLEAN;
    critical_tables_exist BOOLEAN;
    veteran_id_exists BOOLEAN;
    user_id_exists BOOLEAN;
    field_mismatch BOOLEAN;
BEGIN
    -- Check required tables
    SELECT COUNT(*) INTO missing_count
    FROM (
        SELECT 'users' as table_name
        UNION SELECT 'pitches'
        UNION SELECT 'endorsements'
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
    
    -- Check field names in pitches table
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pitches' AND column_name = 'veteran_id') INTO veteran_id_exists;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pitches' AND column_name = 'user_id') INTO user_id_exists;
    
    existing_count := 7 - missing_count;
    critical_tables_exist := pitches_exists AND users_exists;
    field_mismatch := NOT veteran_id_exists AND NOT user_id_exists;
    
    RAISE NOTICE '=== COMPREHENSIVE ASSESSMENT ===';
    RAISE NOTICE 'Required tables: 7';
    RAISE NOTICE 'Existing tables: %', existing_count;
    RAISE NOTICE 'Missing tables: %', missing_count;
    RAISE NOTICE 'Pitches table exists: %', CASE WHEN pitches_exists THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'Users table exists: %', CASE WHEN users_exists THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'Critical tables exist: %', CASE WHEN critical_tables_exist THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'veteran_id field exists: %', CASE WHEN veteran_id_exists THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'user_id field exists: %', CASE WHEN user_id_exists THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'Field mismatch detected: %', CASE WHEN field_mismatch THEN '🚨' ELSE '✅' END;
    
    IF NOT critical_tables_exist THEN
        RAISE NOTICE '🚨 CRITICAL ERROR: Missing core tables (pitches/users)';
        RAISE NOTICE 'Cannot proceed with migration until core tables exist!';
    ELSIF field_mismatch THEN
        RAISE NOTICE '🚨 CRITICAL ERROR: Pitches table missing both veteran_id and user_id fields!';
        RAISE NOTICE 'This will cause all queries to fail!';
    ELSIF missing_count = 0 THEN
        RAISE NOTICE '🎉 STATUS: READY - All required tables exist!';
        RAISE NOTICE 'No migration needed.';
    ELSIF missing_count = 7 THEN
        RAISE NOTICE '🚨 STATUS: MIGRATION REQUIRED - No required tables exist!';
        RAISE NOTICE 'Run the migration script to create all tables.';
    ELSE
        RAISE NOTICE '⚠️ STATUS: PARTIAL MIGRATION - Some tables exist, some missing!';
        RAISE NOTICE 'Run the migration script to complete setup.';
    END IF;
    
    RAISE NOTICE '=== DIAGNOSTIC COMPLETED ===';
END $$;
