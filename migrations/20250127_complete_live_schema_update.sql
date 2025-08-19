-- Complete Live Schema Update Migration
-- This migration adds ALL missing tables and fields to bring the live schema up to date
-- Including: invoices, billing system, user_activity_log, and all other missing components

-- =============================================================================
-- PART 1: ADD MISSING FIELDS TO EXISTING TABLES
-- =============================================================================

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
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS experience_years integer DEFAULT 0;
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

-- Update service_plans table - add missing columns if they don't exist
ALTER TABLE public.service_plans ADD COLUMN IF NOT EXISTS plan_code text;
ALTER TABLE public.service_plans ADD COLUMN IF NOT EXISTS plan_name text;
ALTER TABLE public.service_plans ADD COLUMN IF NOT EXISTS price_cents integer;
ALTER TABLE public.service_plans ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.service_plans ADD COLUMN IF NOT EXISTS currency text DEFAULT 'INR';
ALTER TABLE public.service_plans ADD COLUMN IF NOT EXISTS duration_days integer;
ALTER TABLE public.service_plans ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]';

-- Update receipts table - add missing columns if they don't exist
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS donor_email text;
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS donor_name text;
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS donor_phone text;
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false;

-- Update referrals table - add missing fields
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS pitch_id uuid;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS share_link text;

-- Update referral_events table - add missing fields
ALTER TABLE public.referral_events ADD COLUMN IF NOT EXISTS referral_id uuid;
ALTER TABLE public.referral_events ADD COLUMN IF NOT EXISTS event_type text;
ALTER TABLE public.referral_events ADD COLUMN IF NOT EXISTS platform text;
ALTER TABLE public.referral_events ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE public.referral_events ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE public.referral_events ADD COLUMN IF NOT EXISTS metadata jsonb;
ALTER TABLE public.referral_events ADD COLUMN IF NOT EXISTS feedback text;
ALTER TABLE public.referral_events ADD COLUMN IF NOT EXISTS feedback_comment text;
ALTER TABLE public.referral_events ADD COLUMN IF NOT EXISTS feedback_at timestamptz;

-- =============================================================================
-- PART 2: CREATE MISSING TABLES
-- =============================================================================

-- User Activity Log table
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  activity_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- User Profiles table (for compatibility)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  profile_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  status text NOT NULL,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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

-- Mission Invitations table
CREATE TABLE IF NOT EXISTS public.mission_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  invitation_link text NOT NULL,
  platform text DEFAULT 'direct',
  created_at timestamptz DEFAULT now()
);

-- Mission Invitation Summary view (as table for compatibility)
CREATE TABLE IF NOT EXISTS public.mission_invitation_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  inviter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  inviter_name text,
  inviter_role text,
  inviter_avatar text,
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

-- =============================================================================
-- PART 3: BILLING SYSTEM TABLES
-- =============================================================================

-- Create fiscal year function
CREATE OR REPLACE FUNCTION fy_label(ts timestamptz DEFAULT now())
RETURNS text AS $$
BEGIN
  RETURN CASE 
    WHEN EXTRACT(month FROM ts) >= 4 
    THEN EXTRACT(year FROM ts)::text || '-' || (EXTRACT(year FROM ts) + 1)::text
    ELSE (EXTRACT(year FROM ts) - 1)::text || '-' || EXTRACT(year FROM ts)::text
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create numbering state table
CREATE TABLE IF NOT EXISTS public.numbering_state (
  id text PRIMARY KEY,
  fy text NOT NULL,
  next_number integer NOT NULL DEFAULT 1,
  locked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment events table
CREATE TABLE IF NOT EXISTS public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  payment_id text NOT NULL,
  order_id text NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL,
  notes jsonb,
  processed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  payment_event_id uuid REFERENCES public.payment_events(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  plan_tier text,
  plan_meta jsonb,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  buyer_phone text,
  storage_key text NOT NULL,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create receipts table
CREATE TABLE IF NOT EXISTS public.receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number text UNIQUE NOT NULL,
  payment_event_id uuid REFERENCES public.payment_events(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  donor_name text,
  donor_email text,
  donor_phone text,
  is_anonymous boolean NOT NULL DEFAULT false,
  storage_key text NOT NULL,
  status text DEFAULT 'issued',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service plans table
CREATE TABLE IF NOT EXISTS public.service_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price integer NOT NULL,
  currency text DEFAULT 'INR',
  duration_months integer DEFAULT 1,
  features jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================================
-- PART 4: IMPACT AND ANALYTICS TABLES
-- =============================================================================

-- Impact Channel Stats table
CREATE TABLE IF NOT EXISTS public.impact_channel_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_name text NOT NULL,
  performance_score integer DEFAULT 0,
  total_views integer DEFAULT 0,
  total_shares integer DEFAULT 0,
  total_conversions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Impact Funnel table
CREATE TABLE IF NOT EXISTS public.impact_funnel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_stage text NOT NULL,
  conversion_rate decimal DEFAULT 0,
  total_entries integer DEFAULT 0,
  successful_conversions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Impact Keywords table
CREATE TABLE IF NOT EXISTS public.impact_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  performance_score integer DEFAULT 0,
  usage_count integer DEFAULT 0,
  success_rate decimal DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Impact Nudges table
CREATE TABLE IF NOT EXISTS public.impact_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  nudge_type text NOT NULL,
  nudge_content text NOT NULL,
  priority text DEFAULT 'medium',
  status text DEFAULT 'active',
  actioned_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Impact Supporter Stats table
CREATE TABLE IF NOT EXISTS public.impact_supporter_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  total_donations integer DEFAULT 0,
  total_endorsements integer DEFAULT 0,
  total_referrals integer DEFAULT 0,
  impact_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Recruiter Saved Filters table
CREATE TABLE IF NOT EXISTS public.recruiter_saved_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  filter_name text NOT NULL,
  filter_criteria jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Recruiter Notes table
CREATE TABLE IF NOT EXISTS public.recruiter_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  notes text,
  rating integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(recruiter_id, pitch_id)
);

-- =============================================================================
-- PART 5: RPC FUNCTIONS
-- =============================================================================

-- Create exec_sql function (for migrations)
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

-- Create mission invitation function
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

-- Create increment pitch shares function
CREATE OR REPLACE FUNCTION public.increment_pitch_shares(pitch_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.pitches 
  SET shares_count = COALESCE(shares_count, 0) + 1,
      updated_at = now()
  WHERE id = pitch_id;
END;
$$;

-- =============================================================================
-- PART 6: INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_users_updated_at ON public.users(updated_at);
CREATE INDEX IF NOT EXISTS idx_pitches_user_id ON public.pitches(user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_pitch_id ON public.endorsements(pitch_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_user_id ON public.endorsements(user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_endorser_user_id ON public.endorsements(endorser_user_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_pitch ON public.likes(user_id, pitch_id);
CREATE INDEX IF NOT EXISTS idx_shares_user_pitch ON public.shares(user_id, pitch_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created ON public.user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_user ON public.community_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_inviter ON public.mission_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON public.referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_pitch_id ON public.referrals(pitch_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_referral_id ON public.referral_events(referral_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON public.donations(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_number ON public.receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_payment_events_event_id ON public.payment_events(event_id);

-- =============================================================================
-- PART 7: UPDATE TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =============================================================================

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
  -- Users table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE event_object_table = 'users' 
    AND trigger_name = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON public.users 
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Pitches table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE event_object_table = 'pitches' 
    AND trigger_name = 'update_pitches_updated_at'
  ) THEN
    CREATE TRIGGER update_pitches_updated_at 
      BEFORE UPDATE ON public.pitches 
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Invoices table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE event_object_table = 'invoices' 
    AND trigger_name = 'update_invoices_updated_at'
  ) THEN
    CREATE TRIGGER update_invoices_updated_at 
      BEFORE UPDATE ON public.invoices 
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Receipts table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE event_object_table = 'receipts' 
    AND trigger_name = 'update_receipts_updated_at'
  ) THEN
    CREATE TRIGGER update_receipts_updated_at 
      BEFORE UPDATE ON public.receipts 
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- =============================================================================
-- PART 8: POPULATE DEFAULT DATA AND FIX EXISTING DATA
-- =============================================================================

-- Ensure critical fields have defaults where needed
UPDATE public.pitches SET likes_count = 0 WHERE likes_count IS NULL;
UPDATE public.pitches SET shares_count = 0 WHERE shares_count IS NULL;
UPDATE public.pitches SET views_count = 0 WHERE views_count IS NULL;
UPDATE public.pitches SET endorsements_count = 0 WHERE endorsements_count IS NULL;
UPDATE public.pitches SET is_active = true WHERE is_active IS NULL;
UPDATE public.pitches SET plan_tier = 'free' WHERE plan_tier IS NULL;
UPDATE public.pitches SET experience_years = 0 WHERE experience_years IS NULL;
UPDATE public.pitches SET allow_resume_requests = false WHERE allow_resume_requests IS NULL;

-- Update users table defaults
UPDATE public.users SET updated_at = created_at WHERE updated_at IS NULL;

-- Insert default service plans
INSERT INTO public.service_plans (plan_code, plan_name, description, price_cents, currency, duration_days, features) VALUES
('trial_14', '14-Day Trial', 'Perfect for testing the platform', 100, 'INR', 14, '{"full_pitch_visibility": true, "recruiter_contact": true, "analytics_dashboard": true, "email_support": true}'),
('plan_30', '30-Day Plan', 'Most popular choice', 29900, 'INR', 30, '{"full_pitch_visibility": true, "recruiter_contact": true, "analytics_dashboard": true, "priority_support": true, "resume_request_feature": true}'),
('plan_60', '60-Day Plan', 'Better value for longer searches', 49900, 'INR', 60, '{"full_pitch_visibility": true, "recruiter_contact": true, "analytics_dashboard": true, "priority_support": true, "resume_request_feature": true, "featured_placement": true}'),
('plan_90', '90-Day Plan', 'Best value for extended visibility', 59900, 'INR', 90, '{"full_pitch_visibility": true, "recruiter_contact": true, "analytics_dashboard": true, "priority_support": true, "resume_request_feature": true, "featured_placement": true, "direct_messaging": true}')
ON CONFLICT (plan_code) DO UPDATE SET
    plan_name = EXCLUDED.plan_name,
    description = EXCLUDED.description,
    price_cents = EXCLUDED.price_cents,
    duration_days = EXCLUDED.duration_days,
    features = EXCLUDED.features,
    updated_at = NOW();

-- =============================================================================
-- PART 9: ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Users can view own activity" ON public.user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profiles" ON public.user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage invoices" ON public.invoices
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view own receipts" ON public.receipts
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage payment events" ON public.payment_events
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "All can view service plans" ON public.service_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage service plans" ON public.service_plans
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- =============================================================================
-- PART 10: GRANT PERMISSIONS
-- =============================================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant necessary table permissions
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant function execution permissions
GRANT EXECUTE ON FUNCTION public.create_mission_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_pitch_shares TO authenticated;
GRANT EXECUTE ON FUNCTION public.fy_label TO authenticated;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

SELECT 'Complete live schema update migration completed successfully! 🎉' as result;
