-- Complete Professional Tracking System
-- Migration: 20250127_complete_tracking_system.sql
-- Central entities: user_id (source of truth), pitch (central tracking)
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. CORE TRACKING TABLES
-- =====================================================

-- Enhanced referrals table with attribution chains (using existing user_id structure)
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS parent_referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS original_supporter_id uuid REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS attribution_chain text[] DEFAULT '{}';
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS attribution_depth integer DEFAULT 0;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'direct' CHECK (source_type IN ('direct', 'self', 'supporter', 'anonymous', 'chain'));
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS platform text CHECK (platform IN ('whatsapp', 'linkedin', 'email', 'direct', 'web', 'twitter', 'facebook'));
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Comprehensive tracking events table
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE, -- Central source of truth
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE, -- Central tracking entity
  referral_id uuid REFERENCES public.referrals(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'PITCH_VIEWED',
    'CALL_CLICKED',
    'PHONE_CLICKED', 
    'EMAIL_CLICKED',
    'LINKEDIN_CLICKED',
    'RESUME_REQUEST_CLICKED',
    'SHARE_RESHARED',
    'LINK_OPENED',
    'SIGNUP_FROM_REFERRAL',
    'SCROLL_25_PERCENT',
    'SCROLL_50_PERCENT',
    'SCROLL_75_PERCENT',
    'TIME_30_SECONDS',
    'TIME_60_SECONDS',
    'TIME_120_SECONDS',
    'PAGE_EXIT',
    'FORM_SUBMITTED',
    'DOWNLOAD_CLICKED',
    'VIDEO_PLAYED',
    'SOCIAL_SHARE'
  )),
  platform text,
  user_agent text,
  ip_hash text,
  country text, city text, device_type text, browser text, os text,
  metadata jsonb DEFAULT '{}',
  session_id text,
  occurred_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. AGGREGATED METRICS TABLES
-- =====================================================

-- Real-time pitch metrics (denormalized for performance)
CREATE TABLE IF NOT EXISTS public.pitch_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE, -- Central source of truth
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE, -- Central tracking entity
  total_views integer DEFAULT 0,
  total_calls integer DEFAULT 0,
  total_emails integer DEFAULT 0,
  total_shares integer DEFAULT 0,
  total_linkedin_clicks integer DEFAULT 0,
  total_resume_requests integer DEFAULT 0,
  total_conversions integer DEFAULT 0,
  total_engagement_time integer DEFAULT 0, -- seconds
  avg_engagement_time numeric(8,2) DEFAULT 0,
  scroll_depth_25_count integer DEFAULT 0,
  scroll_depth_50_count integer DEFAULT 0,
  scroll_depth_75_count integer DEFAULT 0,
  time_30_count integer DEFAULT 0,
  time_60_count integer DEFAULT 0,
  time_120_count integer DEFAULT 0,
  last_activity_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, pitch_id)
);

-- User-level aggregated metrics
CREATE TABLE IF NOT EXISTS public.user_tracking_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE, -- Central source of truth
  total_pitches integer DEFAULT 0,
  total_views integer DEFAULT 0,
  total_calls integer DEFAULT 0,
  total_emails integer DEFAULT 0,
  total_shares integer DEFAULT 0,
  total_conversions integer DEFAULT 0,
  total_engagement_time integer DEFAULT 0,
  avg_conversion_rate numeric(5,2) DEFAULT 0,
  avg_engagement_rate numeric(5,2) DEFAULT 0,
  viral_coefficient numeric(5,2) DEFAULT 0,
  last_activity_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

-- Attribution chain analytics
CREATE TABLE IF NOT EXISTS public.attribution_chains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE, -- Central source of truth
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE, -- Central tracking entity
  original_referral_id uuid REFERENCES public.referrals(id) ON DELETE CASCADE,
  original_supporter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  chain_depth integer DEFAULT 0,
  total_chain_views integer DEFAULT 0,
  total_chain_calls integer DEFAULT 0,
  total_chain_emails integer DEFAULT 0,
  total_chain_shares integer DEFAULT 0,
  total_chain_conversions integer DEFAULT 0,
  chain_reach integer DEFAULT 0,
  viral_coefficient numeric(5,2) DEFAULT 0,
  attribution_value numeric(10,2) DEFAULT 0,
  last_activity_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (original_referral_id)
);

-- Supporter performance tracking
CREATE TABLE IF NOT EXISTS public.supporter_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE, -- Central source of truth (pitch owner)
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE, -- Central tracking entity
  supporter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  total_referrals_created integer DEFAULT 0,
  total_attributed_views integer DEFAULT 0,
  total_attributed_calls integer DEFAULT 0,
  total_attributed_emails integer DEFAULT 0,
  total_attributed_shares integer DEFAULT 0,
  total_attributed_conversions integer DEFAULT 0,
  conversion_rate numeric(5,2) DEFAULT 0,
  engagement_rate numeric(5,2) DEFAULT 0,
  attribution_value numeric(10,2) DEFAULT 0,
  last_activity_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, pitch_id, supporter_id)
);

-- =====================================================
-- 3. TIME-BASED ANALYTICS TABLES
-- =====================================================

-- Daily tracking metrics
CREATE TABLE IF NOT EXISTS public.daily_tracking_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE, -- Central source of truth
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE, -- Central tracking entity
  date date NOT NULL,
  views integer DEFAULT 0,
  calls integer DEFAULT 0,
  emails integer DEFAULT 0,
  shares integer DEFAULT 0,
  conversions integer DEFAULT 0,
  engagement_time integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, pitch_id, date)
);

-- Platform-specific metrics
CREATE TABLE IF NOT EXISTS public.platform_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE, -- Central source of truth
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE, -- Central tracking entity
  platform text NOT NULL,
  date date NOT NULL,
  views integer DEFAULT 0,
  calls integer DEFAULT 0,
  emails integer DEFAULT 0,
  shares integer DEFAULT 0,
  conversions integer DEFAULT 0,
  conversion_rate numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, pitch_id, platform, date)
);

-- =====================================================
-- 4. INDEXES FOR OPTIMAL PERFORMANCE
-- =====================================================

-- Core tracking indexes
CREATE INDEX IF NOT EXISTS idx_tracking_events_user_id ON public.tracking_events(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_pitch_id ON public.tracking_events(pitch_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_type ON public.tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_tracking_events_occurred_at ON public.tracking_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_events_referral_id ON public.tracking_events(referral_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_platform ON public.tracking_events(platform);
CREATE INDEX IF NOT EXISTS idx_tracking_events_session_id ON public.tracking_events(session_id);

-- Referrals indexes (using existing user_id structure)
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON public.referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_pitch_id ON public.referrals(pitch_id);
CREATE INDEX IF NOT EXISTS idx_referrals_parent_id ON public.referrals(parent_referral_id);
CREATE INDEX IF NOT EXISTS idx_referrals_original_supporter ON public.referrals(original_supporter_id);
CREATE INDEX IF NOT EXISTS idx_referrals_attribution_chain ON public.referrals USING GIN (attribution_chain);
CREATE INDEX IF NOT EXISTS idx_referrals_source_type ON public.referrals(source_type);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON public.referrals(created_at DESC);

-- Metrics indexes
CREATE INDEX IF NOT EXISTS idx_pitch_metrics_user_id ON public.pitch_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_metrics_pitch_id ON public.pitch_metrics(pitch_id);
CREATE INDEX IF NOT EXISTS idx_pitch_metrics_last_activity ON public.pitch_metrics(last_activity_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_tracking_summary_user_id ON public.user_tracking_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tracking_summary_last_activity ON public.user_tracking_summary(last_activity_at DESC);

CREATE INDEX IF NOT EXISTS idx_attribution_chains_user_id ON public.attribution_chains(user_id);
CREATE INDEX IF NOT EXISTS idx_attribution_chains_pitch_id ON public.attribution_chains(pitch_id);
CREATE INDEX IF NOT EXISTS idx_attribution_chains_original_supporter ON public.attribution_chains(original_supporter_id);

CREATE INDEX IF NOT EXISTS idx_supporter_performance_user_id ON public.supporter_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_supporter_performance_pitch_id ON public.supporter_performance(pitch_id);
CREATE INDEX IF NOT EXISTS idx_supporter_performance_supporter_id ON public.supporter_performance(supporter_id);

-- Time-based indexes
CREATE INDEX IF NOT EXISTS idx_daily_tracking_metrics_user_date ON public.daily_tracking_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_tracking_metrics_pitch_date ON public.daily_tracking_metrics(pitch_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_platform_metrics_user_platform_date ON public.platform_metrics(user_id, platform, date DESC);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_pitch_platform_date ON public.platform_metrics(pitch_id, platform, date DESC);

-- =====================================================
-- 5. DATABASE FUNCTIONS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update pitch metrics when events occur
CREATE OR REPLACE FUNCTION update_pitch_metrics()
RETURNS TRIGGER AS $$
DECLARE
  pitch_owner_id uuid;
BEGIN
  -- Get pitch owner user_id
  SELECT user_id INTO pitch_owner_id 
  FROM public.pitches 
  WHERE id = NEW.pitch_id;

  -- Insert or update pitch metrics
  INSERT INTO public.pitch_metrics (
    user_id, pitch_id, total_views, total_calls, total_emails, 
    total_shares, total_linkedin_clicks, total_resume_requests,
    total_conversions, scroll_depth_25_count, scroll_depth_50_count,
    scroll_depth_75_count, time_30_count, time_60_count, time_120_count,
    last_activity_at
  ) VALUES (
    pitch_owner_id, NEW.pitch_id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NEW.occurred_at
  )
  ON CONFLICT (user_id, pitch_id) DO NOTHING;

  -- Update the specific metric based on event type
  CASE NEW.event_type
    WHEN 'PITCH_VIEWED' THEN
      UPDATE public.pitch_metrics 
      SET total_views = total_views + 1,
          last_activity_at = NEW.occurred_at,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id;
    
    WHEN 'CALL_CLICKED', 'PHONE_CLICKED' THEN
      UPDATE public.pitch_metrics 
      SET total_calls = total_calls + 1,
          total_conversions = total_conversions + 1,
          last_activity_at = NEW.occurred_at,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id;
    
    WHEN 'EMAIL_CLICKED' THEN
      UPDATE public.pitch_metrics 
      SET total_emails = total_emails + 1,
          total_conversions = total_conversions + 1,
          last_activity_at = NEW.occurred_at,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id;
    
    WHEN 'LINKEDIN_CLICKED' THEN
      UPDATE public.pitch_metrics 
      SET total_linkedin_clicks = total_linkedin_clicks + 1,
          last_activity_at = NEW.occurred_at,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id;
    
    WHEN 'RESUME_REQUEST_CLICKED' THEN
      UPDATE public.pitch_metrics 
      SET total_resume_requests = total_resume_requests + 1,
          last_activity_at = NEW.occurred_at,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id;
    
    WHEN 'SHARE_RESHARED' THEN
      UPDATE public.pitch_metrics 
      SET total_shares = total_shares + 1,
          last_activity_at = NEW.occurred_at,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id;
    
    WHEN 'SCROLL_25_PERCENT' THEN
      UPDATE public.pitch_metrics 
      SET scroll_depth_25_count = scroll_depth_25_count + 1,
          last_activity_at = NEW.occurred_at,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id;
    
    WHEN 'SCROLL_50_PERCENT' THEN
      UPDATE public.pitch_metrics 
      SET scroll_depth_50_count = scroll_depth_50_count + 1,
          last_activity_at = NEW.occurred_at,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id;
    
    WHEN 'SCROLL_75_PERCENT' THEN
      UPDATE public.pitch_metrics 
      SET scroll_depth_75_count = scroll_depth_75_count + 1,
          last_activity_at = NEW.occurred_at,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id;
    
    WHEN 'TIME_30_SECONDS' THEN
      UPDATE public.pitch_metrics 
      SET time_30_count = time_30_count + 1,
          last_activity_at = NEW.occurred_at,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id;
    
    WHEN 'TIME_60_SECONDS' THEN
      UPDATE public.pitch_metrics 
      SET time_60_count = time_60_count + 1,
          last_activity_at = NEW.occurred_at,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id;
    
    WHEN 'TIME_120_SECONDS' THEN
      UPDATE public.pitch_metrics 
      SET time_120_count = time_120_count + 1,
          last_activity_at = NEW.occurred_at,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update daily metrics
CREATE OR REPLACE FUNCTION update_daily_metrics()
RETURNS TRIGGER AS $$
DECLARE
  pitch_owner_id uuid;
  event_date date;
BEGIN
  -- Get pitch owner user_id
  SELECT user_id INTO pitch_owner_id 
  FROM public.pitches 
  WHERE id = NEW.pitch_id;
  
  event_date := DATE(NEW.occurred_at);
  
  -- Insert or update daily metrics
  INSERT INTO public.daily_tracking_metrics (
    user_id, pitch_id, date, views, calls, emails, shares, conversions
  ) VALUES (
    pitch_owner_id, NEW.pitch_id, event_date, 0, 0, 0, 0, 0
  )
  ON CONFLICT (user_id, pitch_id, date) DO NOTHING;
  
  -- Update the specific metric
  CASE NEW.event_type
    WHEN 'PITCH_VIEWED' THEN
      UPDATE public.daily_tracking_metrics 
      SET views = views + 1,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id AND date = event_date;
    
    WHEN 'CALL_CLICKED', 'PHONE_CLICKED' THEN
      UPDATE public.daily_tracking_metrics 
      SET calls = calls + 1,
          conversions = conversions + 1,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id AND date = event_date;
    
    WHEN 'EMAIL_CLICKED' THEN
      UPDATE public.daily_tracking_metrics 
      SET emails = emails + 1,
          conversions = conversions + 1,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id AND date = event_date;
    
    WHEN 'SHARE_RESHARED' THEN
      UPDATE public.daily_tracking_metrics 
      SET shares = shares + 1,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id AND date = event_date;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update platform metrics
CREATE OR REPLACE FUNCTION update_platform_metrics()
RETURNS TRIGGER AS $$
DECLARE
  pitch_owner_id uuid;
  event_date date;
BEGIN
  -- Get pitch owner user_id
  SELECT user_id INTO pitch_owner_id 
  FROM public.pitches 
  WHERE id = NEW.pitch_id;
  
  event_date := DATE(NEW.occurred_at);
  
  -- Insert or update platform metrics
  INSERT INTO public.platform_metrics (
    user_id, pitch_id, platform, date, views, calls, emails, shares, conversions
  ) VALUES (
    pitch_owner_id, NEW.pitch_id, NEW.platform, event_date, 0, 0, 0, 0, 0
  )
  ON CONFLICT (user_id, pitch_id, platform, date) DO NOTHING;
  
  -- Update the specific metric
  CASE NEW.event_type
    WHEN 'PITCH_VIEWED' THEN
      UPDATE public.platform_metrics 
      SET views = views + 1,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id AND platform = NEW.platform AND date = event_date;
    
    WHEN 'CALL_CLICKED', 'PHONE_CLICKED' THEN
      UPDATE public.platform_metrics 
      SET calls = calls + 1,
          conversions = conversions + 1,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id AND platform = NEW.platform AND date = event_date;
    
    WHEN 'EMAIL_CLICKED' THEN
      UPDATE public.platform_metrics 
      SET emails = emails + 1,
          conversions = conversions + 1,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id AND platform = NEW.platform AND date = event_date;
    
    WHEN 'SHARE_RESHARED' THEN
      UPDATE public.platform_metrics 
      SET shares = shares + 1,
          updated_at = NOW()
      WHERE user_id = pitch_owner_id AND pitch_id = NEW.pitch_id AND platform = NEW.platform AND date = event_date;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update pitch metrics
DROP TRIGGER IF EXISTS trigger_update_pitch_metrics ON public.tracking_events;
CREATE TRIGGER trigger_update_pitch_metrics
  AFTER INSERT ON public.tracking_events
  FOR EACH ROW
  EXECUTE FUNCTION update_pitch_metrics();

-- Trigger to update daily metrics
DROP TRIGGER IF EXISTS trigger_update_daily_metrics ON public.tracking_events;
CREATE TRIGGER trigger_update_daily_metrics
  AFTER INSERT ON public.tracking_events
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_metrics();

-- Trigger to update platform metrics
DROP TRIGGER IF EXISTS trigger_update_platform_metrics ON public.tracking_events;
CREATE TRIGGER trigger_update_platform_metrics
  AFTER INSERT ON public.tracking_events
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_metrics();

-- =====================================================
-- 7. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Tracking events: Users can only see events for their pitches
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view tracking events for their pitches" ON public.tracking_events;
CREATE POLICY "Users can view tracking events for their pitches" ON public.tracking_events
  FOR SELECT USING (
    pitch_id IN (SELECT id FROM public.pitches WHERE user_id = auth.uid())
  );

-- Referrals: Users can view referrals for their pitches
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view referrals for their pitches" ON public.referrals;
CREATE POLICY "Users can view referrals for their pitches" ON public.referrals
  FOR SELECT USING (
    pitch_id IN (SELECT id FROM public.pitches WHERE user_id = auth.uid())
  );

-- Pitch metrics: Users can view their own pitch metrics
ALTER TABLE public.pitch_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own pitch metrics" ON public.pitch_metrics;
CREATE POLICY "Users can view their own pitch metrics" ON public.pitch_metrics
  FOR SELECT USING (user_id = auth.uid());

-- User tracking summary: Users can view their own summary
ALTER TABLE public.user_tracking_summary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own tracking summary" ON public.user_tracking_summary;
CREATE POLICY "Users can view their own tracking summary" ON public.user_tracking_summary
  FOR SELECT USING (user_id = auth.uid());

-- Attribution chains: Users can view chains for their pitches
ALTER TABLE public.attribution_chains ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view attribution chains for their pitches" ON public.attribution_chains;
CREATE POLICY "Users can view attribution chains for their pitches" ON public.attribution_chains
  FOR SELECT USING (
    pitch_id IN (SELECT id FROM public.pitches WHERE user_id = auth.uid())
  );

-- Supporter performance: Users can view performance for their pitches
ALTER TABLE public.supporter_performance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view supporter performance for their pitches" ON public.supporter_performance;
CREATE POLICY "Users can view supporter performance for their pitches" ON public.supporter_performance
  FOR SELECT USING (
    pitch_id IN (SELECT id FROM public.pitches WHERE user_id = auth.uid())
  );

-- Daily metrics: Users can view their own daily metrics
ALTER TABLE public.daily_tracking_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own daily metrics" ON public.daily_tracking_metrics;
CREATE POLICY "Users can view their own daily metrics" ON public.daily_tracking_metrics
  FOR SELECT USING (user_id = auth.uid());

-- Platform metrics: Users can view their own platform metrics
ALTER TABLE public.platform_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own platform metrics" ON public.platform_metrics;
CREATE POLICY "Users can view their own platform metrics" ON public.platform_metrics
  FOR SELECT USING (user_id = auth.uid());

-- =====================================================
-- 8. SUCCESS MESSAGE
-- =====================================================

SELECT '✅ Complete professional tracking system setup completed successfully!' as status;
