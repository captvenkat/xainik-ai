-- =====================================================
-- COMPREHENSIVE DATABASE DIAGNOSTIC & VALIDATION
-- This script provides complete database health check
-- =====================================================

-- 1. PRE-MIGRATION DIAGNOSTIC
DO $$
DECLARE
    table_info RECORD;
    column_info RECORD;
    constraint_info RECORD;
    index_info RECORD;
    policy_info RECORD;
    relationship_count INTEGER := 0;
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    broken_relationships TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE '=== COMPREHENSIVE DATABASE DIAGNOSTIC ===';
    RAISE NOTICE 'Timestamp: %', now();
    RAISE NOTICE '';

    -- Check for required tables
    RAISE NOTICE '1. REQUIRED TABLES CHECK:';
    RAISE NOTICE '----------------------------------------';
    
    FOR table_info IN 
        SELECT table_name, 
               CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t.table_name) 
                    THEN '✅ EXISTS' 
                    ELSE '❌ MISSING' 
               END as status
        FROM (VALUES 
            ('users'),
            ('pitches'),
            ('endorsements'),
            ('likes'),
            ('shares'),
            ('community_suggestions'),
            ('mission_invitation_summary')
        ) AS t(table_name)
        ORDER BY table_name
    LOOP
        RAISE NOTICE '%-20s %s', table_info.table_name, table_info.status;
        
        IF table_info.status = '❌ MISSING' THEN
            missing_tables := array_append(missing_tables, table_info.table_name);
        END IF;
    END LOOP;

    -- Check table structures
    RAISE NOTICE '';
    RAISE NOTICE '2. TABLE STRUCTURE ANALYSIS:';
    RAISE NOTICE '----------------------------------------';
    
    FOR table_info IN 
        SELECT 
            t.table_name,
            COUNT(c.column_name) as column_count,
            COUNT(CASE WHEN c.column_name = 'id' THEN 1 END) as has_id,
            COUNT(CASE WHEN c.column_name = 'created_at' THEN 1 END) as has_created_at,
            COUNT(CASE WHEN c.column_name = 'updated_at' THEN 1 END) as has_updated_at
        FROM (VALUES 
            ('users'),
            ('pitches'),
            ('endorsements'),
            ('likes'),
            ('shares'),
            ('community_suggestions'),
            ('mission_invitation_summary')
        ) AS t(table_name)
        LEFT JOIN information_schema.columns c ON c.table_schema = 'public' AND c.table_name = t.table_name
        GROUP BY t.table_name
        ORDER BY t.table_name
    LOOP
        RAISE NOTICE '%-25s Columns: % | ID: % | Created: % | Updated: %', 
            table_info.table_name,
            table_info.column_count,
            CASE WHEN table_info.has_id > 0 THEN '✅' ELSE '❌' END,
            CASE WHEN table_info.has_created_at > 0 THEN '✅' ELSE '❌' END,
            CASE WHEN table_info.has_updated_at > 0 THEN '✅' ELSE '❌' END;
    END LOOP;

    -- Check foreign key relationships
    RAISE NOTICE '';
    RAISE NOTICE '3. FOREIGN KEY RELATIONSHIPS:';
    RAISE NOTICE '----------------------------------------';
    
    FOR constraint_info IN 
        SELECT 
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
        AND tc.table_name IN ('endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary')
        ORDER BY tc.table_name, kcu.column_name
    LOOP
        relationship_count := relationship_count + 1;
        RAISE NOTICE '%-15s.%-15s → %-15s.%-15s', 
            constraint_info.table_name,
            constraint_info.column_name,
            constraint_info.foreign_table_name,
            constraint_info.foreign_column_name;
    END LOOP;
    
    IF relationship_count = 0 THEN
        RAISE NOTICE '❌ No foreign key relationships found!';
    ELSE
        RAISE NOTICE '✅ Found % foreign key relationships', relationship_count;
    END IF;

    -- Check indexes
    RAISE NOTICE '';
    RAISE NOTICE '4. INDEX ANALYSIS:';
    RAISE NOTICE '----------------------------------------';
    
    FOR index_info IN 
        SELECT 
            schemaname,
            tablename,
            indexname,
            indexdef
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND tablename IN ('endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary')
        ORDER BY tablename, indexname
    LOOP
        RAISE NOTICE '%-20s %-30s', index_info.tablename, index_info.indexname;
    END LOOP;

    -- Check RLS policies
    RAISE NOTICE '';
    RAISE NOTICE '5. ROW LEVEL SECURITY POLICIES:';
    RAISE NOTICE '----------------------------------------';
    
    FOR policy_info IN 
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
        AND tablename IN ('endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary')
        ORDER BY tablename, policyname
    LOOP
        RAISE NOTICE '%-20s %-25s %s', policy_info.tablename, policy_info.policyname, policy_info.cmd;
    END LOOP;

    -- Check permissions
    RAISE NOTICE '';
    RAISE NOTICE '6. PERMISSIONS CHECK:';
    RAISE NOTICE '----------------------------------------';
    
    FOR table_info IN 
        SELECT 
            table_name,
            privilege_type
        FROM information_schema.table_privileges 
        WHERE table_schema = 'public'
        AND grantee = 'authenticated'
        AND table_name IN ('endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary')
        ORDER BY table_name, privilege_type
    LOOP
        RAISE NOTICE '%-25s %s', table_info.table_name, table_info.privilege_type;
    END LOOP;

    -- Summary and recommendations
    RAISE NOTICE '';
    RAISE NOTICE '7. DIAGNOSTIC SUMMARY:';
    RAISE NOTICE '----------------------------------------';
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE '❌ MISSING TABLES: %', array_to_string(missing_tables, ', ');
        RAISE NOTICE '   → Run the proper_migration.sql script to create missing tables';
    ELSE
        RAISE NOTICE '✅ All required tables exist';
    END IF;
    
    IF relationship_count < 8 THEN
        RAISE NOTICE '❌ INSUFFICIENT RELATIONSHIPS: Found % (expected 8+)', relationship_count;
        RAISE NOTICE '   → Run the proper_migration.sql script to fix relationships';
    ELSE
        RAISE NOTICE '✅ Foreign key relationships are properly configured';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '=== DIAGNOSTIC COMPLETE ===';
END $$;

-- 2. DATA INTEGRITY CHECK
DO $$
DECLARE
    orphan_count INTEGER;
    total_records INTEGER;
    integrity_issues TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== DATA INTEGRITY CHECK ===';
    
    -- Check for orphaned records in endorsements
    SELECT COUNT(*) INTO orphan_count
    FROM public.endorsements e
    LEFT JOIN public.users u ON e.veteran_id = u.id
    WHERE u.id IS NULL;
    
    IF orphan_count > 0 THEN
        integrity_issues := array_append(integrity_issues, format('Endorsements: % orphaned veteran records', orphan_count));
    END IF;
    
    SELECT COUNT(*) INTO orphan_count
    FROM public.endorsements e
    LEFT JOIN public.users u ON e.endorser_id = u.id
    WHERE u.id IS NULL;
    
    IF orphan_count > 0 THEN
        integrity_issues := array_append(integrity_issues, format('Endorsements: % orphaned endorser records', orphan_count));
    END IF;
    
    -- Check for orphaned records in likes
    SELECT COUNT(*) INTO orphan_count
    FROM public.likes l
    LEFT JOIN public.users u ON l.user_id = u.id
    WHERE u.id IS NULL;
    
    IF orphan_count > 0 THEN
        integrity_issues := array_append(integrity_issues, format('Likes: % orphaned user records', orphan_count));
    END IF;
    
    SELECT COUNT(*) INTO orphan_count
    FROM public.likes l
    LEFT JOIN public.pitches p ON l.pitch_id = p.id
    WHERE p.id IS NULL;
    
    IF orphan_count > 0 THEN
        integrity_issues := array_append(integrity_issues, format('Likes: % orphaned pitch records', orphan_count));
    END IF;
    
    -- Check for orphaned records in shares
    SELECT COUNT(*) INTO orphan_count
    FROM public.shares s
    LEFT JOIN public.users u ON s.user_id = u.id
    WHERE u.id IS NULL;
    
    IF orphan_count > 0 THEN
        integrity_issues := array_append(integrity_issues, format('Shares: % orphaned user records', orphan_count));
    END IF;
    
    SELECT COUNT(*) INTO orphan_count
    FROM public.shares s
    LEFT JOIN public.pitches p ON s.pitch_id = p.id
    WHERE p.id IS NULL;
    
    IF orphan_count > 0 THEN
        integrity_issues := array_append(integrity_issues, format('Shares: % orphaned pitch records', orphan_count));
    END IF;
    
    -- Check for orphaned records in community_suggestions
    SELECT COUNT(*) INTO orphan_count
    FROM public.community_suggestions cs
    LEFT JOIN public.users u ON cs.user_id = u.id
    WHERE u.id IS NULL;
    
    IF orphan_count > 0 THEN
        integrity_issues := array_append(integrity_issues, format('Community suggestions: % orphaned user records', orphan_count));
    END IF;
    
    -- Check for orphaned records in mission_invitation_summary
    SELECT COUNT(*) INTO orphan_count
    FROM public.mission_invitation_summary mis
    LEFT JOIN public.users u ON mis.user_id = u.id
    WHERE u.id IS NULL;
    
    IF orphan_count > 0 THEN
        integrity_issues := array_append(integrity_issues, format('Mission invitation summary: % orphaned user records', orphan_count));
    END IF;
    
    -- Report integrity status
    IF array_length(integrity_issues, 1) > 0 THEN
        RAISE NOTICE '❌ DATA INTEGRITY ISSUES FOUND:';
        FOREACH integrity_issues IN ARRAY integrity_issues
        LOOP
            RAISE NOTICE '   - %', integrity_issues;
        END LOOP;
    ELSE
        RAISE NOTICE '✅ All data integrity checks passed';
    END IF;
    
    -- Show record counts
    RAISE NOTICE '';
    RAISE NOTICE 'RECORD COUNTS:';
    SELECT COUNT(*) INTO total_records FROM public.endorsements;
    RAISE NOTICE 'Endorsements: %', total_records;
    
    SELECT COUNT(*) INTO total_records FROM public.likes;
    RAISE NOTICE 'Likes: %', total_records;
    
    SELECT COUNT(*) INTO total_records FROM public.shares;
    RAISE NOTICE 'Shares: %', total_records;
    
    SELECT COUNT(*) INTO total_records FROM public.community_suggestions;
    RAISE NOTICE 'Community suggestions: %', total_records;
    
    SELECT COUNT(*) INTO total_records FROM public.mission_invitation_summary;
    RAISE NOTICE 'Mission invitation summary: %', total_records;
END $$;

-- 3. PERFORMANCE ANALYSIS
DO $$
DECLARE
    table_size_info RECORD;
    index_usage_info RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== PERFORMANCE ANALYSIS ===';
    
    -- Table sizes
    RAISE NOTICE 'TABLE SIZES:';
    FOR table_size_info IN 
        SELECT 
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename IN ('endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary')
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    LOOP
        RAISE NOTICE '%-25s %s', table_size_info.tablename, table_size_info.size;
    END LOOP;
    
    -- Index usage statistics
    RAISE NOTICE '';
    RAISE NOTICE 'INDEX USAGE (if available):';
    FOR index_usage_info IN 
        SELECT 
            schemaname,
            tablename,
            indexname,
            idx_scan as scans,
            idx_tup_read as tuples_read,
            idx_tup_fetch as tuples_fetched
        FROM pg_stat_user_indexes 
        WHERE schemaname = 'public'
        AND tablename IN ('endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary')
        ORDER BY idx_scan DESC
        LIMIT 10
    LOOP
        RAISE NOTICE '%-20s %-25s Scans: % | Read: % | Fetched: %', 
            index_usage_info.tablename,
            index_usage_info.indexname,
            index_usage_info.scans,
            index_usage_info.tuples_read,
            index_usage_info.tuples_fetched;
    END LOOP;
END $$;

-- 4. FINAL RECOMMENDATIONS
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== FINAL RECOMMENDATIONS ===';
    RAISE NOTICE '';
    RAISE NOTICE '✅ If all checks passed: Your database is healthy and ready for production!';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 If issues were found:';
    RAISE NOTICE '   1. Run proper_migration.sql to fix structural issues';
    RAISE NOTICE '   2. Clean up orphaned data if any integrity issues were found';
    RAISE NOTICE '   3. Monitor performance metrics regularly';
    RAISE NOTICE '';
    RAISE NOTICE '📊 For ongoing monitoring:';
    RAISE NOTICE '   - Run this diagnostic script regularly';
    RAISE NOTICE '   - Monitor query performance in Supabase dashboard';
    RAISE NOTICE '   - Set up alerts for data integrity issues';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Your veteran dashboard database is now fully validated!';
END $$;
