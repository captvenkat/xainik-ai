-- Safe Schema Update Migration
-- This migration adds missing tables and fields WITHOUT breaking existing functionality
-- All operations are designed to be safe and non-destructive

-- First, let's check what we have and add only what's missing

-- 1. ADD MISSING FIELDS TO EXISTING TABLES (using ALTER TABLE ADD COLUMN IF NOT EXISTS)

-- Update users table - add missing fields that the app expects
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update pitches table - add missing fields
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS user_id uuid; -- Common identifier across all tables
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS resume_url text;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS resume_share_enabled boolean DEFAULT false;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS shares_count integer DEFAULT 0;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS endorsements_count integer DEFAULT 0;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS plan_tier text DEFAULT 'free';
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS experience_years text DEFAULT '';
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS allow_resume_requests boolean DEFAULT false;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS location_preferred text[];

-- Update veterans table - add missing fields
ALTER TABLE public.veterans ADD COLUMN IF NOT EXISTS bio text DEFAULT '';
ALTER TABLE public.veterans ADD COLUMN IF NOT EXISTS military_rank text DEFAULT '';
ALTER TABLE public.veterans ADD COLUMN IF NOT EXISTS web_links text DEFAULT '';
ALTER TABLE public.veterans ADD COLUMN IF NOT EXISTS location_current_city text DEFAULT '';
ALTER TABLE public.veterans ADD COLUMN IF NOT EXISTS location_current_country text DEFAULT '';
ALTER TABLE public.veterans ADD COLUMN IF NOT EXISTS locations_preferred_structured jsonb DEFAULT '[]';
ALTER TABLE public.veterans ADD COLUMN IF NOT EXISTS retirement_date text;

-- Update endorsements table - add missing fields
ALTER TABLE public.endorsements ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.endorsements ADD COLUMN IF NOT EXISTS endorser_user_id uuid;
ALTER TABLE public.endorsements ADD COLUMN IF NOT EXISTS text text;
ALTER TABLE public.endorsements ADD COLUMN IF NOT EXISTS pitch_id uuid;
ALTER TABLE public.endorsements ADD COLUMN IF NOT EXISTS endorser_name text;
ALTER TABLE public.endorsements ADD COLUMN IF NOT EXISTS endorser_email text;
ALTER TABLE public.endorsements ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false;

-- Update notifications table - add missing fields
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS payload_json jsonb;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS channel text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- Update notification_prefs table - add missing fields
ALTER TABLE public.notification_prefs ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.notification_prefs ADD COLUMN IF NOT EXISTS digest_enabled boolean DEFAULT true;
ALTER TABLE public.notification_prefs ADD COLUMN IF NOT EXISTS quiet_hours_start time;
ALTER TABLE public.notification_prefs ADD COLUMN IF NOT EXISTS quiet_hours_end time;

-- Update donations table - add missing fields
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS amount_cents integer;
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS currency text DEFAULT 'INR';
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false;

-- Update resume_requests table - add missing field
ALTER TABLE public.resume_requests ADD COLUMN IF NOT EXISTS message text;

-- Update referral_events table - add missing fields
ALTER TABLE public.referral_events ADD COLUMN IF NOT EXISTS feedback text;
ALTER TABLE public.referral_events ADD COLUMN IF NOT EXISTS feedback_comment text;
ALTER TABLE public.referral_events ADD COLUMN IF NOT EXISTS feedback_at timestamptz;

-- 2. CREATE MISSING TABLES (using CREATE TABLE IF NOT EXISTS)

-- User Activity Log table
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  activity_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- AI Suggestions table
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  suggestion_type text NOT NULL,
  suggestion_data jsonb,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Supporter Celebrations table
CREATE TABLE IF NOT EXISTS public.supporter_celebrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  celebration_type text NOT NULL,
  celebration_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, pitch_id)
);

-- Shares table
CREATE TABLE IF NOT EXISTS public.shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  platform text,
  created_at timestamptz DEFAULT now()
);

-- User Subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  status text NOT NULL,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Community Suggestions table
CREATE TABLE IF NOT EXISTS public.community_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  suggestion_type text DEFAULT 'improvement',
  priority text DEFAULT 'medium',
  status text DEFAULT 'active',
  votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Mission Invitations table
CREATE TABLE IF NOT EXISTS public.mission_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  invitation_link text NOT NULL,
  platform text DEFAULT 'direct',
  created_at timestamptz DEFAULT now()
);

-- Community Suggestions Summary view (as table for compatibility)
CREATE TABLE IF NOT EXISTS public.community_suggestions_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_suggestions integer DEFAULT 0,
  active_suggestions integer DEFAULT 0,
  total_votes integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Community Suggestions with Votes view (as table for compatibility)
CREATE TABLE IF NOT EXISTS public.community_suggestions_with_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  title text,
  description text,
  suggestion_type text,
  priority text,
  status text,
  votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Mission Invitation Analytics view (as table for compatibility)
CREATE TABLE IF NOT EXISTS public.mission_invitation_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid,
  total_invitations integer DEFAULT 0,
  pending_invitations integer DEFAULT 0,
  accepted_invitations integer DEFAULT 0,
  declined_invitations integer DEFAULT 0,
  expired_invitations integer DEFAULT 0,
  total_registrations integer DEFAULT 0,
  veteran_registrations integer DEFAULT 0,
  recruiter_registrations integer DEFAULT 0,
  supporter_registrations integer DEFAULT 0,
  last_invitation_at timestamptz,
  first_invitation_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Mission Invitation Summary view (as table for compatibility)
CREATE TABLE IF NOT EXISTS public.mission_invitation_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid,
  total_invitations integer DEFAULT 0,
  pending_invitations integer DEFAULT 0,
  accepted_invitations integer DEFAULT 0,
  declined_invitations integer DEFAULT 0,
  expired_invitations integer DEFAULT 0,
  total_registrations integer DEFAULT 0,
  veteran_registrations integer DEFAULT 0,
  recruiter_registrations integer DEFAULT 0,
  supporter_registrations integer DEFAULT 0,
  last_invitation_at timestamptz,
  first_invitation_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- 3. CREATE MISSING RPC FUNCTIONS

-- Create exec_sql function (for migrations) - drop first if exists
DROP FUNCTION IF EXISTS public.exec_sql(text) CASCADE;

CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow admin users to execute SQL
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  EXECUTE sql_query;
  RETURN 'SQL executed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$;

-- Create mission invitation function (drop first if exists)
DROP FUNCTION IF EXISTS public.create_mission_invitation(uuid,text,text,text) CASCADE;
DROP FUNCTION IF EXISTS public.create_mission_invitation(uuid,text,text,text,text) CASCADE;

CREATE OR REPLACE FUNCTION public.create_mission_invitation(
  p_inviter_id uuid,
  p_inviter_role text,
  p_invitation_message text,
  p_platform text DEFAULT 'direct'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_id uuid;
BEGIN
  -- Generate invitation link
  INSERT INTO public.mission_invitations (inviter_id, invitation_link, platform)
  VALUES (
    p_inviter_id,
    'https://xainik.com/invite?ref=' || p_inviter_id || '&platform=' || p_platform,
    p_platform
  )
  RETURNING id INTO invitation_id;
  
  RETURN invitation_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create mission invitation: %', SQLERRM;
END;
$$;

-- 4. CREATE INDEXES FOR PERFORMANCE

CREATE INDEX IF NOT EXISTS idx_users_updated_at ON public.users(updated_at);
CREATE INDEX IF NOT EXISTS idx_pitches_user_id ON public.pitches(user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_pitch_id ON public.endorsements(pitch_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_pitch ON public.likes(user_id, pitch_id);
CREATE INDEX IF NOT EXISTS idx_shares_user_pitch ON public.shares(user_id, pitch_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created ON public.user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user ON public.ai_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_supporter_celebrations_supporter ON public.supporter_celebrations(supporter_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_user ON public.community_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_inviter ON public.mission_invitations(inviter_id);

-- 5. SET UP FOREIGN KEY CONSTRAINTS (only where they don't exist)

-- Note: We'll add these constraints carefully to avoid breaking existing data
-- These will be added only if the referenced data exists

-- 6. UPDATE TRIGGERS FOR AUTOMATIC TIMESTAMPS

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to tables that need them
DO $$
BEGIN
  -- Check if trigger exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE event_object_table = 'users' 
    AND trigger_name = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON public.users 
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE event_object_table = 'pitches' 
    AND trigger_name = 'update_pitches_updated_at'
  ) THEN
    CREATE TRIGGER update_pitches_updated_at 
      BEFORE UPDATE ON public.pitches 
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 7. POPULATE user_id fields where they're missing (for compatibility)

-- Note: We only use user_id as the common identifier
-- No veteran_id field exists in the schema
-- This section is for future data consistency if needed

-- 8. CREATE OR UPDATE VIEWS FOR COMPATIBILITY

-- Refresh the activity recent view if it exists
CREATE OR REPLACE VIEW public.activity_recent AS
SELECT 
  id,
  event,
  meta,
  created_at,
  CASE 
    WHEN event = 'veteran_joined' THEN COALESCE(meta->>'veteran_name', 'A veteran') || ' joined Xainik'
    WHEN event = 'pitch_referred' THEN COALESCE(meta->>'supporter_name', 'Someone') || ' referred ' || COALESCE(meta->>'veteran_name', 'a veteran')
    WHEN event = 'recruiter_called' THEN COALESCE(meta->>'recruiter_name', 'A recruiter') || ' contacted ' || COALESCE(meta->>'veteran_name', 'a veteran')
    WHEN event = 'endorsement_added' THEN COALESCE(meta->>'endorser_name', 'Someone') || ' endorsed ' || COALESCE(meta->>'veteran_name', 'a veteran')
    WHEN event = 'like_added' THEN 'Someone liked ' || COALESCE(meta->>'pitch_title', 'a pitch')
    WHEN event = 'donation_received' THEN '₹' || COALESCE((meta->>'amount')::text, '0') || ' donation received'
    ELSE event
  END as display_text
FROM public.activity_log 
ORDER BY created_at DESC 
LIMIT 50;

-- 9. FINAL SAFETY CHECKS AND CLEANUP

-- Ensure critical fields have defaults where needed
UPDATE public.pitches SET likes_count = 0 WHERE likes_count IS NULL;
UPDATE public.pitches SET shares_count = 0 WHERE shares_count IS NULL;
UPDATE public.pitches SET views_count = 0 WHERE views_count IS NULL;
UPDATE public.pitches SET endorsements_count = 0 WHERE endorsements_count IS NULL;
UPDATE public.pitches SET is_active = true WHERE is_active IS NULL;
UPDATE public.pitches SET plan_tier = 'free' WHERE plan_tier IS NULL;
UPDATE public.pitches SET experience_years = '' WHERE experience_years IS NULL;
UPDATE public.pitches SET allow_resume_requests = false WHERE allow_resume_requests IS NULL;

-- Update users table defaults
UPDATE public.users SET updated_at = created_at WHERE updated_at IS NULL;

-- 10. GRANT NECESSARY PERMISSIONS

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant necessary table permissions
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant function execution permissions
GRANT EXECUTE ON FUNCTION public.create_mission_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql TO authenticated;

-- Migration completed successfully
SELECT 'Schema update migration completed successfully!' as result;
