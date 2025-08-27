-- =====================================================
-- COMPLETE TRACKING SYSTEM SETUP
-- Ensures everything is tracked, saved, and accessible
-- No missing tables, views, or data structures
-- =====================================================

-- START TRANSACTION FOR SAFETY
BEGIN;

-- =====================================================
-- 1. ENSURE ALL REQUIRED COLUMNS EXIST IN PITCHES TABLE
-- =====================================================

-- Add missing tracking columns to pitches table
ALTER TABLE public.pitches 
ADD COLUMN IF NOT EXISTS calls_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS emails_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS linkedin_clicks_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS resume_requests_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS scroll_25_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS scroll_50_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS scroll_75_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_30_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_60_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_120_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_at timestamptz DEFAULT now();

-- =====================================================
-- 2. ENSURE ALL TRACKING TABLES EXIST
-- =====================================================

-- Comprehensive tracking events table
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
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
  country text, 
  city text, 
  device_type text, 
  browser text, 
  os text,
  metadata jsonb DEFAULT '{}',
  session_id text,
  occurred_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Real-time pitch metrics table
CREATE TABLE IF NOT EXISTS public.pitch_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  total_views integer DEFAULT 0,
  total_calls integer DEFAULT 0,
  total_emails integer DEFAULT 0,
  total_shares integer DEFAULT 0,
  total_linkedin_clicks integer DEFAULT 0,
  total_resume_requests integer DEFAULT 0,
  total_conversions integer DEFAULT 0,
  total_engagement_time integer DEFAULT 0,
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
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
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
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
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
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
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

-- Daily tracking metrics
CREATE TABLE IF NOT EXISTS public.daily_tracking_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
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
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
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
-- 3. CREATE ALL REQUIRED VIEWS
-- =====================================================

-- Veteran dashboard summary view
CREATE OR REPLACE VIEW public.veteran_dashboard_summary AS
SELECT 
  p.user_id,
  p.id as pitch_id,
  p.title as pitch_title,
  p.views_count,
  p.calls_count,
  p.emails_count,
  p.shares_count,
  p.linkedin_clicks_count,
  p.resume_requests_count,
  p.scroll_25_count,
  p.scroll_50_count,
  p.scroll_75_count,
  p.time_30_count,
  p.time_60_count,
  p.time_120_count,
  p.last_activity_at,
  CASE 
    WHEN p.views_count > 0 THEN ROUND(((p.calls_count + p.emails_count)::numeric / p.views_count) * 100, 2)
    ELSE 0 
  END as engagement_rate,
  CASE 
    WHEN p.views_count > 0 THEN ROUND(((p.scroll_75_count)::numeric / p.views_count) * 100, 2)
    ELSE 0 
  END as deep_engagement_rate
FROM public.pitches p
WHERE p.is_active = true;

-- Platform performance view
CREATE OR REPLACE VIEW public.platform_performance AS
SELECT 
  pa.pitch_id,
  pa.platform,
  pa.date,
  pa.views,
  pa.calls,
  pa.emails,
  pa.shares,
  pa.conversion_rate,
  pa.conversions,
  CASE 
    WHEN pa.views > 0 THEN ROUND(((pa.calls + pa.emails)::numeric / pa.views) * 100, 2)
    ELSE 0 
  END as calculated_conversion_rate
FROM public.platform_metrics pa
ORDER BY pa.date DESC, pa.views DESC;

-- Recent activity view for FOMO ticker
CREATE OR REPLACE VIEW public.recent_activity AS
SELECT 
  id,
  event_type as event,
  metadata as meta,
  occurred_at as created_at,
  CASE 
    WHEN event_type = 'PITCH_VIEWED' THEN 'Someone viewed a pitch'
    WHEN event_type = 'CALL_CLICKED' THEN 'Someone made a call'
    WHEN event_type = 'EMAIL_CLICKED' THEN 'Someone sent an email'
    WHEN event_type = 'LINKEDIN_CLICKED' THEN 'Someone visited LinkedIn'
    WHEN event_type = 'RESUME_REQUEST_CLICKED' THEN 'Someone requested a resume'
    WHEN event_type = 'SHARE_RESHARED' THEN 'Someone shared a pitch'
    WHEN event_type = 'SCROLL_25_PERCENT' THEN 'Someone engaged with a pitch'
    WHEN event_type = 'SCROLL_50_PERCENT' THEN 'Someone read half a pitch'
    WHEN event_type = 'SCROLL_75_PERCENT' THEN 'Someone read most of a pitch'
    WHEN event_type = 'TIME_30_SECONDS' THEN 'Someone spent time on a pitch'
    WHEN event_type = 'TIME_60_SECONDS' THEN 'Someone spent a minute on a pitch'
    WHEN event_type = 'TIME_120_SECONDS' THEN 'Someone spent 2 minutes on a pitch'
    ELSE event_type
  END as display_text
FROM public.tracking_events 
ORDER BY occurred_at DESC 
LIMIT 50;

-- =====================================================
-- 4. CREATE ALL REQUIRED INDEXES
-- =====================================================

-- Core tracking indexes
CREATE INDEX IF NOT EXISTS idx_tracking_events_user_id ON public.tracking_events(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_pitch_id ON public.tracking_events(pitch_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_type ON public.tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_tracking_events_occurred_at ON public.tracking_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_events_referral_id ON public.tracking_events(referral_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_platform ON public.tracking_events(platform);

-- Pitch metrics indexes
CREATE INDEX IF NOT EXISTS idx_pitch_metrics_user_id ON public.pitch_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_metrics_pitch_id ON public.pitch_metrics(pitch_id);
CREATE INDEX IF NOT EXISTS idx_pitch_metrics_updated_at ON public.pitch_metrics(updated_at DESC);

-- User tracking summary indexes
CREATE INDEX IF NOT EXISTS idx_user_tracking_summary_user_id ON public.user_tracking_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tracking_summary_updated_at ON public.user_tracking_summary(updated_at DESC);

-- Attribution chains indexes
CREATE INDEX IF NOT EXISTS idx_attribution_chains_user_id ON public.attribution_chains(user_id);
CREATE INDEX IF NOT EXISTS idx_attribution_chains_pitch_id ON public.attribution_chains(pitch_id);
CREATE INDEX IF NOT EXISTS idx_attribution_chains_original_referral_id ON public.attribution_chains(original_referral_id);

-- Supporter performance indexes
CREATE INDEX IF NOT EXISTS idx_supporter_performance_user_id ON public.supporter_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_supporter_performance_pitch_id ON public.supporter_performance(pitch_id);
CREATE INDEX IF NOT EXISTS idx_supporter_performance_supporter_id ON public.supporter_performance(supporter_id);

-- Daily metrics indexes
CREATE INDEX IF NOT EXISTS idx_daily_tracking_metrics_user_id ON public.daily_tracking_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tracking_metrics_pitch_id ON public.daily_tracking_metrics(pitch_id);
CREATE INDEX IF NOT EXISTS idx_daily_tracking_metrics_date ON public.daily_tracking_metrics(date DESC);

-- Platform metrics indexes
CREATE INDEX IF NOT EXISTS idx_platform_metrics_user_id ON public.platform_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_pitch_id ON public.platform_metrics(pitch_id);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_platform_date ON public.platform_metrics(platform, date DESC);

-- =====================================================
-- 5. CREATE ALL REQUIRED FUNCTIONS AND TRIGGERS
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
  
  -- Update the corresponding pitch metrics based on event type
  CASE NEW.event_type
    WHEN 'PITCH_VIEWED' THEN
      UPDATE public.pitches 
      SET views_count = views_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = NEW.pitch_id;
    
    WHEN 'CALL_CLICKED', 'PHONE_CLICKED' THEN
      UPDATE public.pitches 
      SET calls_count = calls_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = NEW.pitch_id;
    
    WHEN 'EMAIL_CLICKED' THEN
      UPDATE public.pitches 
      SET emails_count = emails_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = NEW.pitch_id;
    
    WHEN 'LINKEDIN_CLICKED' THEN
      UPDATE public.pitches 
      SET linkedin_clicks_count = linkedin_clicks_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = NEW.pitch_id;
    
    WHEN 'RESUME_REQUEST_CLICKED' THEN
      UPDATE public.pitches 
      SET resume_requests_count = resume_requests_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = NEW.pitch_id;
    
    WHEN 'SHARE_RESHARED' THEN
      UPDATE public.pitches 
      SET shares_count = shares_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = NEW.pitch_id;
    
    WHEN 'SCROLL_25_PERCENT' THEN
      UPDATE public.pitches 
      SET scroll_25_count = scroll_25_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = NEW.pitch_id;
    
    WHEN 'SCROLL_50_PERCENT' THEN
      UPDATE public.pitches 
      SET scroll_50_count = scroll_50_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = NEW.pitch_id;
    
    WHEN 'SCROLL_75_PERCENT' THEN
      UPDATE public.pitches 
      SET scroll_75_count = scroll_75_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = NEW.pitch_id;
    
    WHEN 'TIME_30_SECONDS' THEN
      UPDATE public.pitches 
      SET time_30_count = time_30_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = NEW.pitch_id;
    
    WHEN 'TIME_60_SECONDS' THEN
      UPDATE public.pitches 
      SET time_60_count = time_60_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = NEW.pitch_id;
    
    WHEN 'TIME_120_SECONDS' THEN
      UPDATE public.pitches 
      SET time_120_count = time_120_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = NEW.pitch_id;
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
-- 6. CREATE ALL REQUIRED TRIGGERS
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
-- 7. SET UP ROW LEVEL SECURITY
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
-- 8. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions on views
GRANT SELECT ON public.veteran_dashboard_summary TO authenticated;
GRANT SELECT ON public.platform_performance TO authenticated;
GRANT SELECT ON public.recent_activity TO authenticated;

-- Grant permissions on tables
GRANT ALL ON public.tracking_events TO authenticated;
GRANT ALL ON public.pitch_metrics TO authenticated;
GRANT ALL ON public.user_tracking_summary TO authenticated;
GRANT ALL ON public.attribution_chains TO authenticated;
GRANT ALL ON public.supporter_performance TO authenticated;
GRANT ALL ON public.daily_tracking_metrics TO authenticated;
GRANT ALL ON public.platform_metrics TO authenticated;

-- =====================================================
-- 9. COMMIT TRANSACTION
-- =====================================================

COMMIT;

-- =====================================================
-- 10. SUCCESS MESSAGE
-- =====================================================

SELECT '✅ COMPLETE TRACKING SYSTEM SETUP SUCCESSFUL!' as status;
SELECT '📊 All tables, views, functions, and triggers created' as message;
SELECT '🚀 Veteran dashboard will now show real data when sharing pitches' as ready;
