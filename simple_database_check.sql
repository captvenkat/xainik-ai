-- =====================================================
-- SIMPLE DATABASE PRE-CHECK - WORKS WITH SUPABASE
-- =====================================================

-- 1. BASIC DATABASE INFO
DO $$
BEGIN
    RAISE NOTICE '=== DATABASE PRE-CHECK STARTED ===';
    RAISE NOTICE 'Timestamp: %', NOW();
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'Schema: %', current_schema();
END $$;

-- 2. LIST ALL EXISTING TABLES (using correct column names)
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
    
    -- Check each required table
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
    
    -- Summary
    RAISE NOTICE '=== SUMMARY ===';
    RAISE NOTICE 'Existing tables: %', array_to_string(existing_tables, ', ');
    RAISE NOTICE 'Missing tables: %', array_to_string(missing_tables_list, ', ');
    
    IF array_length(missing_tables_list, 1) > 0 THEN
        RAISE NOTICE '⚠️  MIGRATION REQUIRED: % tables need to be created', array_length(missing_tables_list, 1);
    ELSE
        RAISE NOTICE '✅ ALL TABLES EXIST: No migration needed';
    END IF;
END $$;

-- 5. CHECK PITCHES TABLE STRUCTURE (if it exists)
DO $$
DECLARE
    pitches_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches'
    ) INTO pitches_exists;
    
    IF pitches_exists THEN
        RAISE NOTICE '=== PITCHES TABLE STRUCTURE ===';
        RAISE NOTICE 'Table exists, checking structure...';
    ELSE
        RAISE NOTICE '⚠️  PITCHES TABLE MISSING: This is required for the veteran dashboard';
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

-- 6. CHECK EXISTING RLS POLICIES
SELECT 
    'EXISTING_RLS' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 7. CHECK EXISTING INDEXES
SELECT 
    'EXISTING_INDEXES' as check_type,
    schemaname,
    tablename,
    indexname
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE '%endorsements%' 
   OR indexname LIKE '%likes%' 
   OR indexname LIKE '%shares%' 
   OR indexname LIKE '%community%'
   OR indexname LIKE '%mission%'
ORDER BY tablename, indexname;

-- 8. CHECK FOR EXISTING DATA
DO $$
DECLARE
    table_name TEXT;
    row_count BIGINT;
    tables_to_check TEXT[] := ARRAY['endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary'];
    i TEXT;
BEGIN
    RAISE NOTICE '=== CHECKING EXISTING DATA ===';
    
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

-- 9. FINAL ASSESSMENT
DO $$
DECLARE
    missing_count INTEGER;
    existing_count INTEGER;
BEGIN
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
    
    existing_count := 5 - missing_count;
    
    RAISE NOTICE '=== FINAL ASSESSMENT ===';
    RAISE NOTICE 'Required tables: 5';
    RAISE NOTICE 'Existing tables: %', existing_count;
    RAISE NOTICE 'Missing tables: %', missing_count;
    
    IF missing_count = 0 THEN
        RAISE NOTICE '🎉 STATUS: READY - All required tables exist!';
        RAISE NOTICE 'No migration needed.';
    ELSIF missing_count = 5 THEN
        RAISE NOTICE '🚨 STATUS: MIGRATION REQUIRED - No required tables exist!';
        RAISE NOTICE 'Run the completely_safe_fix_enhanced.sql script.';
    ELSE
        RAISE NOTICE '⚠️  STATUS: PARTIAL MIGRATION - Some tables exist, some missing!';
        RAISE NOTICE 'Run the completely_safe_fix_enhanced.sql script to complete setup.';
    END IF;
    
    RAISE NOTICE '=== PRE-CHECK COMPLETED ===';
END $$;
