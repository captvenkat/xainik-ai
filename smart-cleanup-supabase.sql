-- =====================================================
-- SMART SUPABASE DATABASE CLEANUP FOR FUNDRAISING APP
-- =====================================================
-- This script intelligently removes unnecessary objects by first checking what exists

-- =====================================================
-- STEP 1: CHECK WHAT TABLES EXIST
-- =====================================================

-- Create a temporary function to safely drop objects
CREATE OR REPLACE FUNCTION safe_drop_table(target_table text)
RETURNS void AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1) THEN
        EXECUTE 'DROP TABLE IF EXISTS public.' || $1 || ' CASCADE';
        RAISE NOTICE 'Dropped table: %', $1;
    ELSE
        RAISE NOTICE 'Table does not exist, skipping: %', $1;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION safe_drop_view(target_view text)
RETURNS void AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = $1) THEN
        EXECUTE 'DROP VIEW IF EXISTS public.' || $1 || ' CASCADE';
        RAISE NOTICE 'Dropped view: %', $1;
    ELSE
        RAISE NOTICE 'View does not exist, skipping: %', $1;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 2: DROP TABLES THAT EXIST
-- =====================================================

-- List of tables to potentially drop
SELECT safe_drop_table('activity_log');
SELECT safe_drop_table('analytics_events');
SELECT safe_drop_table('attribution_chains');
SELECT safe_drop_table('call_tracking');
SELECT safe_drop_table('channel_performance');
SELECT safe_drop_table('cohort_analytics');
SELECT safe_drop_table('contact_outcomes');
SELECT safe_drop_table('conversion_funnel');
SELECT safe_drop_table('email_events');
SELECT safe_drop_table('endorsements');
SELECT safe_drop_table('funnel_analytics');
SELECT safe_drop_table('impact_analytics');
SELECT safe_drop_table('keyword_analytics');
SELECT safe_drop_table('likes');
SELECT safe_drop_table('mission_analytics');
SELECT safe_drop_table('mission_invitations');
SELECT safe_drop_table('notifications');
SELECT safe_drop_table('payment_events');
SELECT safe_drop_table('pitch_connections');
SELECT safe_drop_table('pitch_tracking');
SELECT safe_drop_table('pitches');
SELECT safe_drop_table('platform_emails');
SELECT safe_drop_table('profiles');
SELECT safe_drop_table('referral_events');
SELECT safe_drop_table('referrals');
SELECT safe_drop_table('resume_requests');
SELECT safe_drop_table('service_plans');
SELECT safe_drop_table('shares');
SELECT safe_drop_table('shortlist');
SELECT safe_drop_table('stories');
SELECT safe_drop_table('supporter_analytics');
SELECT safe_drop_table('user_activity');
SELECT safe_drop_table('user_roles');
SELECT safe_drop_table('users');
SELECT safe_drop_table('veteran_value_activity');
SELECT safe_drop_table('voting');

-- Billing and payment tables
SELECT safe_drop_table('billing_accounts');
SELECT safe_drop_table('billing_cycles');
SELECT safe_drop_table('invoices');
SELECT safe_drop_table('payment_methods');
SELECT safe_drop_table('receipts');
SELECT safe_drop_table('service_purchases');

-- AI and content tables
SELECT safe_drop_table('ai_insights');
SELECT safe_drop_table('ai_suggestions');
SELECT safe_drop_table('contact_suggestions');
SELECT safe_drop_table('content_analytics');
SELECT safe_drop_table('smart_notifications');

-- Recruiter and supporter tables
SELECT safe_drop_table('recruiter_notes');
SELECT safe_drop_table('recruiter_profiles');
SELECT safe_drop_table('recruiter_saved_filters');
SELECT safe_drop_table('supporter_profiles');

-- =====================================================
-- STEP 3: DROP VIEWS THAT EXIST
-- =====================================================

-- List of views to potentially drop
SELECT safe_drop_view('donations_aggregates');
SELECT safe_drop_view('v_activity_summary');
SELECT safe_drop_view('v_analytics_dashboard');
SELECT safe_drop_view('v_attribution_summary');
SELECT safe_drop_view('v_channel_performance');
SELECT safe_drop_view('v_cohort_analysis');
SELECT safe_drop_view('v_conversion_funnel');
SELECT safe_drop_view('v_donations_summary');
SELECT safe_drop_view('v_impact_metrics');
SELECT safe_drop_view('v_keyword_performance');
SELECT safe_drop_view('v_mission_analytics');
SELECT safe_drop_view('v_pitch_analytics');
SELECT safe_drop_view('v_progress_dashboard');
SELECT safe_drop_view('v_referral_analytics');
SELECT safe_drop_view('v_supporter_analytics');
SELECT safe_drop_view('v_tracking_summary');
SELECT safe_drop_view('v_user_analytics');
SELECT safe_drop_view('v_veteran_analytics');

-- =====================================================
-- STEP 4: DROP FUNCTIONS THAT EXIST
-- =====================================================

-- Create a function to safely drop functions
CREATE OR REPLACE FUNCTION safe_drop_function(target_func text, func_signature text DEFAULT '')
RETURNS void AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = $1
    ) THEN
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || $1 || '(' || $2 || ') CASCADE';
        RAISE NOTICE 'Dropped function: %', $1;
    ELSE
        RAISE NOTICE 'Function does not exist, skipping: %', $1;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop functions (with empty signature for now - can be enhanced if needed)
SELECT safe_drop_function('analyze_attribution_chain');
SELECT safe_drop_function('calculate_conversion_rate');
SELECT safe_drop_function('calculate_viral_coefficient');
SELECT safe_drop_function('get_activity_summary');
SELECT safe_drop_function('get_analytics_dashboard');
SELECT safe_drop_function('get_attribution_summary');
SELECT safe_drop_function('get_channel_performance');
SELECT safe_drop_function('get_cohort_analysis');
SELECT safe_drop_function('get_conversion_funnel');
SELECT safe_drop_function('get_impact_metrics');
SELECT safe_drop_function('get_keyword_performance');
SELECT safe_drop_function('get_mission_analytics');
SELECT safe_drop_function('get_pitch_analytics');
SELECT safe_drop_function('get_progress_dashboard');
SELECT safe_drop_function('get_referral_analytics');
SELECT safe_drop_function('get_supporter_analytics');
SELECT safe_drop_function('get_tracking_summary');
SELECT safe_drop_function('get_user_analytics');
SELECT safe_drop_function('get_veteran_analytics');
SELECT safe_drop_function('track_activity');
SELECT safe_drop_function('track_analytics_event');
SELECT safe_drop_function('track_attribution_chain');
SELECT safe_drop_function('track_call');
SELECT safe_drop_function('track_channel_performance');
SELECT safe_drop_function('track_contact_outcome');
SELECT safe_drop_function('track_conversion_funnel');
SELECT safe_drop_function('track_donation_aggregate');
SELECT safe_drop_function('track_email_event');
SELECT safe_drop_function('track_funnel_analytics');
SELECT safe_drop_function('track_impact_analytics');
SELECT safe_drop_function('track_keyword_analytics');
SELECT safe_drop_function('track_mission_analytics');
SELECT safe_drop_function('track_payment_event');
SELECT safe_drop_function('track_pitch_connection');
SELECT safe_drop_function('track_pitch_tracking');
SELECT safe_drop_function('track_platform_email');
SELECT safe_drop_function('track_referral_event');
SELECT safe_drop_function('track_supporter_analytics');
SELECT safe_drop_function('track_user_activity');
SELECT safe_drop_function('track_veteran_value_activity');

-- =====================================================
-- STEP 5: CLEAN UP HELPER FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS safe_drop_table(text);
DROP FUNCTION IF EXISTS safe_drop_view(text);
DROP FUNCTION IF EXISTS safe_drop_function(text, text);

-- =====================================================
-- STEP 6: SHOW WHAT REMAINS
-- =====================================================

-- List remaining tables
SELECT 
    'TABLE' as object_type,
    tablename as name
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- List remaining views
SELECT 
    'VIEW' as object_type,
    viewname as name
FROM pg_views 
WHERE schemaname = 'public' 
ORDER BY viewname;

-- List remaining functions
SELECT 
    'FUNCTION' as object_type,
    p.proname as name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- =====================================================
-- STEP 7: SUMMARY
-- =====================================================

SELECT 
    'CLEANUP_COMPLETE' as status,
    COUNT(*) as remaining_objects
FROM (
    SELECT tablename as name FROM pg_tables WHERE schemaname = 'public'
    UNION ALL
    SELECT viewname FROM pg_views WHERE schemaname = 'public'
    UNION ALL
    SELECT p.proname FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public'
) all_objects;

-- =====================================================
-- STEP 8: NEXT STEPS
-- =====================================================

-- After this cleanup, run supabase-schema.sql to create the fundraising app structure
-- The database should now be clean and ready for the new schema
