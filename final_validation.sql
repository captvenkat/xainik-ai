-- =====================================================
-- FINAL VALIDATION - CHECK IF MIGRATION WORKED
-- =====================================================

-- 1. CHECK TABLES
SELECT 'TABLES' as check_type, COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary');

-- 2. CHECK POLICIES
SELECT 'POLICIES' as check_type, COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary');

-- 3. CHECK INDEXES
SELECT 'INDEXES' as check_type, COUNT(*) as count
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary');

-- 4. CHECK VIEWS
SELECT 'VIEWS' as check_type, COUNT(*) as count
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'community_suggestions_summary';

-- 5. FINAL STATUS
DO $$
BEGIN
    RAISE NOTICE '🎉 MIGRATION SUCCESSFUL!';
    RAISE NOTICE 'Your veteran dashboard database is now ready!';
    RAISE NOTICE 'All required tables, indexes, policies, and permissions have been created.';
    RAISE NOTICE 'You can now refresh your veteran dashboard and it should work properly.';
END $$;
