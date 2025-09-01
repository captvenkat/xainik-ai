-- =====================================================
-- SUPABASE DATABASE CLEANUP FOR FUNDRAISING APP
-- =====================================================
-- This script removes all unnecessary tables and keeps only
-- the essential tables for the Xainik fundraising app

-- =====================================================
-- STEP 1: DROP ALL UNNECESSARY TABLES
-- =====================================================

-- Drop complex analytics and tracking tables
DROP TABLE IF EXISTS public.activity_log CASCADE;
DROP TABLE IF EXISTS public.analytics_events CASCADE;
DROP TABLE IF EXISTS public.attribution_chains CASCADE;
DROP TABLE IF EXISTS public.call_tracking CASCADE;
DROP TABLE IF EXISTS public.channel_performance CASCADE;
DROP TABLE IF EXISTS public.cohort_analytics CASCADE;
DROP TABLE IF EXISTS public.contact_outcomes CASCADE;
DROP TABLE IF EXISTS public.conversion_funnel CASCADE;
DROP VIEW IF EXISTS public.donations_aggregates CASCADE;
DROP TABLE IF EXISTS public.email_events CASCADE;
DROP TABLE IF EXISTS public.endorsements CASCADE;
DROP TABLE IF EXISTS public.funnel_analytics CASCADE;
DROP TABLE IF EXISTS public.impact_analytics CASCADE;
DROP TABLE IF EXISTS public.keyword_analytics CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.mission_analytics CASCADE;
DROP TABLE IF EXISTS public.mission_invitations CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.payment_events CASCADE;
DROP TABLE IF EXISTS public.pitch_connections CASCADE;
DROP TABLE IF EXISTS public.pitch_tracking CASCADE;
DROP TABLE IF EXISTS public.pitches CASCADE;
DROP TABLE IF EXISTS public.platform_emails CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.referral_events CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.resume_requests CASCADE;
DROP TABLE IF EXISTS public.service_plans CASCADE;
DROP TABLE IF EXISTS public.shares CASCADE;
DROP TABLE IF EXISTS public.shortlist CASCADE;
DROP TABLE IF EXISTS public.stories CASCADE;
DROP TABLE IF EXISTS public.supporter_analytics CASCADE;
DROP TABLE IF EXISTS public.user_activity CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.veteran_value_activity CASCADE;
DROP TABLE IF EXISTS public.voting CASCADE;

-- Drop billing and payment related tables (keeping only donations)
DROP TABLE IF EXISTS public.billing_accounts CASCADE;
DROP TABLE IF EXISTS public.billing_cycles CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.payment_methods CASCADE;
DROP TABLE IF EXISTS public.receipts CASCADE;
DROP TABLE IF EXISTS public.service_purchases CASCADE;

-- Drop AI and content related tables
DROP TABLE IF EXISTS public.ai_insights CASCADE;
DROP TABLE IF EXISTS public.ai_suggestions CASCADE;
DROP TABLE IF EXISTS public.contact_suggestions CASCADE;
DROP TABLE IF EXISTS public.content_analytics CASCADE;
DROP TABLE IF EXISTS public.smart_notifications CASCADE;

-- Drop recruiter and supporter specific tables
DROP TABLE IF EXISTS public.recruiter_notes CASCADE;
DROP TABLE IF EXISTS public.recruiter_profiles CASCADE;
DROP TABLE IF EXISTS public.recruiter_saved_filters CASCADE;
DROP TABLE IF EXISTS public.supporter_profiles CASCADE;

-- =====================================================
-- STEP 2: DROP UNNECESSARY VIEWS
-- =====================================================

-- Drop complex analytics views
DROP VIEW IF EXISTS public.v_activity_summary CASCADE;
DROP VIEW IF EXISTS public.v_analytics_dashboard CASCADE;
DROP VIEW IF EXISTS public.v_attribution_summary CASCADE;
DROP VIEW IF EXISTS public.v_channel_performance CASCADE;
DROP VIEW IF EXISTS public.v_cohort_analysis CASCADE;
DROP VIEW IF EXISTS public.v_conversion_funnel CASCADE;
DROP VIEW IF EXISTS public.v_donations_summary CASCADE;
DROP VIEW IF EXISTS public.v_impact_metrics CASCADE;
DROP VIEW IF EXISTS public.v_keyword_performance CASCADE;
DROP VIEW IF EXISTS public.v_mission_analytics CASCADE;
DROP VIEW IF EXISTS public.v_pitch_analytics CASCADE;
DROP VIEW IF EXISTS public.v_progress_dashboard CASCADE;
DROP VIEW IF EXISTS public.v_referral_analytics CASCADE;
DROP VIEW IF EXISTS public.v_supporter_analytics CASCADE;
DROP VIEW IF EXISTS public.v_tracking_summary CASCADE;
DROP VIEW IF EXISTS public.v_user_analytics CASCADE;
DROP VIEW IF EXISTS public.v_veteran_analytics CASCADE;

-- =====================================================
-- STEP 3: DROP UNNECESSARY FUNCTIONS
-- =====================================================

-- Drop complex analytics functions
DROP FUNCTION IF EXISTS public.analyze_attribution_chain(text) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_conversion_rate(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_viral_coefficient() CASCADE;
DROP FUNCTION IF EXISTS public.get_activity_summary(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_analytics_dashboard(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_attribution_summary(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_channel_performance(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_cohort_analysis(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_conversion_funnel(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_impact_metrics(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_keyword_performance(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_mission_analytics(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_pitch_analytics(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_progress_dashboard(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_referral_analytics(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_supporter_analytics(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_tracking_summary(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_analytics(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_veteran_analytics(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.track_activity(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_analytics_event(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_attribution_chain(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_call(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_channel_performance(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_contact_outcome(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_conversion_funnel(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_donation_aggregate(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_email_event(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_funnel_analytics(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_impact_analytics(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_keyword_analytics(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_mission_analytics(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_payment_event(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_pitch_connection(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_pitch_tracking(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_platform_email(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_referral_event(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_supporter_analytics(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_user_activity(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.track_veteran_value_activity(text, jsonb) CASCADE;

-- =====================================================
-- STEP 4: DROP UNNECESSARY TRIGGERS
-- =====================================================

-- Drop complex triggers
DROP TRIGGER IF EXISTS tr_activity_log_insert ON public.activity_log CASCADE;
DROP TRIGGER IF EXISTS tr_analytics_events_insert ON public.analytics_events CASCADE;
DROP TRIGGER IF EXISTS tr_attribution_chains_insert ON public.attribution_chains CASCADE;
DROP TRIGGER IF EXISTS tr_call_tracking_insert ON public.call_tracking CASCADE;
DROP TRIGGER IF EXISTS tr_channel_performance_insert ON public.channel_performance CASCADE;
DROP TRIGGER IF EXISTS tr_cohort_analytics_insert ON public.cohort_analytics CASCADE;
DROP TRIGGER IF EXISTS tr_contact_outcomes_insert ON public.contact_outcomes CASCADE;
DROP TRIGGER IF EXISTS tr_conversion_funnel_insert ON public.conversion_funnel CASCADE;
DROP TRIGGER IF EXISTS tr_donations_aggregates_insert ON public.donations_aggregates CASCADE;
DROP TRIGGER IF EXISTS tr_email_events_insert ON public.email_events CASCADE;
DROP TRIGGER IF EXISTS tr_endorsements_insert ON public.endorsements CASCADE;
DROP TRIGGER IF EXISTS tr_funnel_analytics_insert ON public.funnel_analytics CASCADE;
DROP TRIGGER IF EXISTS tr_impact_analytics_insert ON public.impact_analytics CASCADE;
DROP TRIGGER IF EXISTS tr_keyword_analytics_insert ON public.keyword_analytics CASCADE;
DROP TRIGGER IF EXISTS tr_likes_insert ON public.likes CASCADE;
DROP TRIGGER IF EXISTS tr_mission_analytics_insert ON public.mission_analytics CASCADE;
DROP TRIGGER IF EXISTS tr_mission_invitations_insert ON public.mission_invitations CASCADE;
DROP TRIGGER IF EXISTS tr_notifications_insert ON public.notifications CASCADE;
DROP TRIGGER IF EXISTS tr_payment_events_insert ON public.payment_events CASCADE;
DROP TRIGGER IF EXISTS tr_pitch_connections_insert ON public.pitch_connections CASCADE;
DROP TRIGGER IF EXISTS tr_pitch_tracking_insert ON public.pitch_connections CASCADE;
DROP TABLE IF EXISTS public.pitches CASCADE;
DROP TABLE IF EXISTS public.platform_emails CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.referral_events CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.resume_requests CASCADE;
DROP TABLE IF EXISTS public.service_plans CASCADE;
DROP TABLE IF EXISTS public.shares CASCADE;
DROP TABLE IF EXISTS public.shortlist CASCADE;
DROP TABLE IF EXISTS public.stories CASCADE;
DROP TABLE IF EXISTS public.supporter_analytics CASCADE;
DROP TABLE IF EXISTS public.user_activity CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.veteran_value_activity CASCADE;
DROP TABLE IF EXISTS public.voting CASCADE;

-- =====================================================
-- STEP 5: DROP UNNECESSARY INDEXES
-- =====================================================

-- Drop indexes for dropped tables (PostgreSQL will handle this automatically)
-- But we can explicitly drop any remaining indexes if needed

-- =====================================================
-- STEP 6: VERIFY CLEAN STATE
-- =====================================================

-- List remaining tables to verify cleanup
SELECT 
    schemaname,
    tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- List remaining views to verify cleanup
SELECT 
    schemaname,
    viewname 
FROM pg_views 
WHERE schemaname = 'public' 
ORDER BY viewname;

-- List remaining functions to verify cleanup
SELECT 
    n.nspname as schema,
    p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- =====================================================
-- STEP 7: FINAL CLEANUP MESSAGE
-- =====================================================

-- The database should now only contain:
-- 1. donors (fundraising app)
-- 2. donations (fundraising app)
-- 3. subscribers (fundraising app)
-- 4. documents (fundraising app)
-- 5. badge_tiers (fundraising app)
-- 6. v_stats (fundraising app view)
-- 7. v_public_feed (fundraising app view)
-- 8. Any system tables (auth, storage, etc.)

-- Total cleanup: Removed ~50+ unnecessary tables, views, functions, and triggers
-- Kept only the essential fundraising app structure

-- =====================================================
-- STEP 8: ADD THEME SUPPORT FOR POSTERS
-- =====================================================

-- Add theme_id column for poster variety
alter table memes add column if not exists theme_id text;
