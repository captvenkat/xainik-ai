-- Rollback Script for Safe Schema Update
-- This script can undo the changes made by 20250127_safe_schema_update.sql
-- Only run this if you need to revert the migration

-- WARNING: This will remove added columns and tables
-- Make sure you have backups before running this script

-- 1. DROP ADDED TABLES (in reverse order of dependencies)

DROP TABLE IF EXISTS public.mission_invitation_summary CASCADE;
DROP TABLE IF EXISTS public.mission_invitation_analytics CASCADE;
DROP TABLE IF EXISTS public.community_suggestions_with_votes CASCADE;
DROP TABLE IF EXISTS public.community_suggestions_summary CASCADE;
DROP TABLE IF EXISTS public.mission_invitations CASCADE;
DROP TABLE IF EXISTS public.community_suggestions CASCADE;
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;
DROP TABLE IF EXISTS public.shares CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.supporter_celebrations CASCADE;
DROP TABLE IF EXISTS public.ai_suggestions CASCADE;
DROP TABLE IF EXISTS public.user_activity_log CASCADE;

-- 2. DROP ADDED FUNCTIONS

DROP FUNCTION IF EXISTS public.create_mission_invitation(uuid, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.exec_sql(text) CASCADE;

-- 3. REMOVE ADDED COLUMNS FROM EXISTING TABLES

-- Remove from users table
ALTER TABLE public.users DROP COLUMN IF EXISTS updated_at;

-- Remove from pitches table
ALTER TABLE public.pitches DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.pitches DROP COLUMN IF EXISTS photo_url;
ALTER TABLE public.pitches DROP COLUMN IF EXISTS resume_url;
ALTER TABLE public.pitches DROP COLUMN IF EXISTS resume_share_enabled;
ALTER TABLE public.pitches DROP COLUMN IF EXISTS linkedin_url;
ALTER TABLE public.pitches DROP COLUMN IF EXISTS likes_count;
ALTER TABLE public.pitches DROP COLUMN IF EXISTS shares_count;
ALTER TABLE public.pitches DROP COLUMN IF EXISTS views_count;
ALTER TABLE public.pitches DROP COLUMN IF EXISTS endorsements_count;
ALTER TABLE public.pitches DROP COLUMN IF EXISTS plan_tier;
ALTER TABLE public.pitches DROP COLUMN IF EXISTS experience_years;
ALTER TABLE public.pitches DROP COLUMN IF EXISTS allow_resume_requests;
ALTER TABLE public.pitches DROP COLUMN IF EXISTS is_active;
ALTER TABLE public.pitches DROP COLUMN IF EXISTS location_preferred;

-- Remove from veterans table
ALTER TABLE public.veterans DROP COLUMN IF EXISTS bio;
ALTER TABLE public.veterans DROP COLUMN IF EXISTS military_rank;
ALTER TABLE public.veterans DROP COLUMN IF EXISTS web_links;
ALTER TABLE public.veterans DROP COLUMN IF EXISTS location_current_city;
ALTER TABLE public.veterans DROP COLUMN IF EXISTS location_current_country;
ALTER TABLE public.veterans DROP COLUMN IF EXISTS locations_preferred_structured;
ALTER TABLE public.veterans DROP COLUMN IF EXISTS retirement_date;

-- Remove from endorsements table
ALTER TABLE public.endorsements DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.endorsements DROP COLUMN IF EXISTS endorser_user_id;
ALTER TABLE public.endorsements DROP COLUMN IF EXISTS text;
ALTER TABLE public.endorsements DROP COLUMN IF EXISTS pitch_id;
ALTER TABLE public.endorsements DROP COLUMN IF EXISTS endorser_name;
ALTER TABLE public.endorsements DROP COLUMN IF EXISTS endorser_email;
ALTER TABLE public.endorsements DROP COLUMN IF EXISTS is_anonymous;

-- Remove from notifications table
ALTER TABLE public.notifications DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.notifications DROP COLUMN IF EXISTS type;
ALTER TABLE public.notifications DROP COLUMN IF EXISTS payload_json;
ALTER TABLE public.notifications DROP COLUMN IF EXISTS channel;
ALTER TABLE public.notifications DROP COLUMN IF EXISTS read_at;

-- Remove from notification_prefs table
ALTER TABLE public.notification_prefs DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.notification_prefs DROP COLUMN IF EXISTS digest_enabled;
ALTER TABLE public.notification_prefs DROP COLUMN IF EXISTS quiet_hours_start;
ALTER TABLE public.notification_prefs DROP COLUMN IF EXISTS quiet_hours_end;

-- Remove from donations table
ALTER TABLE public.donations DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.donations DROP COLUMN IF EXISTS amount_cents;
ALTER TABLE public.donations DROP COLUMN IF EXISTS currency;
ALTER TABLE public.donations DROP COLUMN IF EXISTS is_anonymous;

-- Remove from resume_requests table
ALTER TABLE public.resume_requests DROP COLUMN IF EXISTS message;

-- Remove from referral_events table
ALTER TABLE public.referral_events DROP COLUMN IF EXISTS feedback;
ALTER TABLE public.referral_events DROP COLUMN IF EXISTS feedback_comment;
ALTER TABLE public.referral_events DROP COLUMN IF EXISTS feedback_at;

-- 4. DROP ADDED INDEXES

DROP INDEX IF EXISTS public.idx_users_updated_at;
DROP INDEX IF EXISTS public.idx_pitches_user_id;
DROP INDEX IF EXISTS public.idx_endorsements_pitch_id;
DROP INDEX IF EXISTS public.idx_likes_user_pitch;
DROP INDEX IF EXISTS public.idx_shares_user_pitch;
DROP INDEX IF EXISTS public.idx_user_activity_log_user;
DROP INDEX IF EXISTS public.idx_user_activity_log_created;
DROP INDEX IF EXISTS public.idx_ai_suggestions_user;
DROP INDEX IF EXISTS public.idx_supporter_celebrations_supporter;
DROP INDEX IF EXISTS public.idx_user_subscriptions_user;
DROP INDEX IF EXISTS public.idx_community_suggestions_user;
DROP INDEX IF EXISTS public.idx_mission_invitations_inviter;

-- 5. DROP ADDED TRIGGERS

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_pitches_updated_at ON public.pitches;

-- 6. DROP TRIGGER FUNCTION

DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- 7. RECREATE ORIGINAL ACTIVITY VIEW (if it was different)

CREATE OR REPLACE VIEW public.activity_recent AS
SELECT 
  id,
  event,
  meta,
  created_at
FROM public.activity_log 
ORDER BY created_at DESC 
LIMIT 50;

-- Rollback completed
SELECT 'Schema rollback completed. The database has been restored to its previous state.' as result;
