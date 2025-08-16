-- =====================================================
-- SCHEMA ANALYSIS - FOCUS ON KEY TABLES
-- Analyze existing database structure to understand relationships
-- =====================================================

-- 1. ANALYZE EXISTING TABLES
SELECT 
    'EXISTING_TABLES' as analysis_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. ANALYZE PITCHES TABLE STRUCTURE (if it exists)
SELECT 
    'PITCHES_STRUCTURE' as analysis_type,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pitches'
ORDER BY ordinal_position;

-- 3. ANALYZE USERS TABLE STRUCTURE (if it exists)
SELECT 
    'USERS_STRUCTURE' as analysis_type,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. CHECK FOR EXISTING FOREIGN KEY RELATIONSHIPS
SELECT 
    'EXISTING_FOREIGN_KEYS' as analysis_type,
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

-- 5. CHECK EXISTING RLS POLICIES
SELECT 
    'EXISTING_RLS' as analysis_type,
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

-- 6. CHECK EXISTING INDEXES
SELECT 
    'EXISTING_INDEXES' as analysis_type,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 7. CHECK FOR EXISTING DATA IN KEY TABLES
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

-- 8. CHECK SUPABASE AUTH SCHEMA
SELECT 
    'AUTH_SCHEMA' as analysis_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'auth'
ORDER BY table_name;

-- 9. FINAL SCHEMA SUMMARY
DO $$
DECLARE
    total_tables INTEGER;
    total_views INTEGER;
    total_policies INTEGER;
    total_indexes INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_tables
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    
    SELECT COUNT(*) INTO total_views
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'VIEW';
    
    SELECT COUNT(*) INTO total_policies
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    SELECT COUNT(*) INTO total_indexes
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    RAISE NOTICE '=== SCHEMA SUMMARY ===';
    RAISE NOTICE 'Total Tables: %', total_tables;
    RAISE NOTICE 'Total Views: %', total_views;
    RAISE NOTICE 'Total RLS Policies: %', total_policies;
    RAISE NOTICE 'Total Indexes: %', total_indexes;
    RAISE NOTICE '=== ANALYSIS COMPLETED ===';
END $$;
