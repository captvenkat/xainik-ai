-- =====================================================
-- CHECK CURRENT DATABASE STATE
-- =====================================================
-- Run this first to see what's currently in your database

-- =====================================================
-- STEP 1: LIST ALL TABLES
-- =====================================================

SELECT 
    schemaname,
    tablename,
    'TABLE' as object_type
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- =====================================================
-- STEP 2: LIST ALL VIEWS
-- =====================================================

SELECT 
    schemaname,
    viewname as tablename,
    'VIEW' as object_type
FROM pg_views 
WHERE schemaname = 'public' 
ORDER BY viewname;

-- =====================================================
-- STEP 3: LIST ALL FUNCTIONS
-- =====================================================

SELECT 
    n.nspname as schemaname,
    p.proname as tablename,
    'FUNCTION' as object_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- =====================================================
-- STEP 4: COUNT OBJECTS BY TYPE
-- =====================================================

SELECT 
    'TABLES' as object_type,
    COUNT(*) as count
FROM pg_tables 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'VIEWS' as object_type,
    COUNT(*) as count
FROM pg_views 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'FUNCTIONS' as object_type,
    COUNT(*) as count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public';

-- =====================================================
-- STEP 5: CHECK FOR FUNDRAISING APP TABLES
-- =====================================================

SELECT 
    tablename,
    CASE 
        WHEN tablename IN ('donors', 'donations', 'subscribers', 'documents', 'badge_tiers') 
        THEN 'FUNDRAISING_APP' 
        WHEN tablename IN ('v_stats', 'v_public_feed') 
        THEN 'FUNDRAISING_VIEW'
        ELSE 'UNNECESSARY'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY status, tablename;

-- =====================================================
-- STEP 6: ESTIMATE CLEANUP IMPACT
-- =====================================================

SELECT 
    'CURRENT_STATE' as phase,
    COUNT(*) as total_objects,
    COUNT(CASE WHEN tablename IN ('donors', 'donations', 'subscribers', 'documents', 'badge_tiers', 'v_stats', 'v_public_feed') THEN 1 END) as fundraising_objects,
    COUNT(CASE WHEN tablename NOT IN ('donors', 'donations', 'subscribers', 'documents', 'badge_tiers', 'v_stats', 'v_public_feed') THEN 1 END) as unnecessary_objects
FROM (
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    UNION ALL
    SELECT viewname FROM pg_views WHERE schemaname = 'public'
) all_objects;
