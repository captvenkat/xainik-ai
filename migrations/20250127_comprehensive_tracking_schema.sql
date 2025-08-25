-- Comprehensive Tracking System Database Schema
-- Migration: 20250127_comprehensive_tracking_schema.sql
-- This creates all tables needed for the world-class tracking system

-- 1. ENHANCED REFERRALS TABLE (for direct and referral tracking)
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  share_link text NOT NULL,
  platform text, -- whatsapp, linkedin, email, direct, web
  created_at timestamptz DEFAULT now(),
  UNIQUE (supporter_id, pitch_id)
);

-- 2. COMPREHENSIVE REFERRAL EVENTS TABLE (all tracking events)
CREATE TABLE IF NOT EXISTS public.referral_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid REFERENCES public.referrals(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'LINK_OPENED',
    'PITCH_VIEWED', 
    'CALL_CLICKED',
    'PHONE_CLICKED',
    'EMAIL_CLICKED',
    'LINKEDIN_CLICKED',
    'RESUME_REQUEST_CLICKED',
    'SHARE_RESHARED',
    'SIGNUP_FROM_REFERRAL',
    'SCROLL_25_PERCENT',
    'SCROLL_50_PERCENT', 
    'SCROLL_75_PERCENT',
    'TIME_30_SECONDS',
    'TIME_60_SECONDS',
    'TIME_120_SECONDS',
    'PAGE_EXIT'
  )),
  platform text, -- whatsapp, linkedin, email, direct, web
  user_agent text,
  country text,
  ip_hash text,
  metadata jsonb, -- Additional tracking data
  occurred_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 3. ENHANCED PITCHES TABLE (with tracking metrics)
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS calls_count integer DEFAULT 0;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS emails_count integer DEFAULT 0;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS shares_count integer DEFAULT 0;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS linkedin_clicks_count integer DEFAULT 0;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS resume_requests_count integer DEFAULT 0;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS scroll_25_count integer DEFAULT 0;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS scroll_50_count integer DEFAULT 0;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS scroll_75_count integer DEFAULT 0;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS time_30_count integer DEFAULT 0;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS time_60_count integer DEFAULT 0;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS time_120_count integer DEFAULT 0;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS last_activity_at timestamptz;

-- 4. COMPREHENSIVE ACTIVITY LOG TABLE (for FOMO ticker and analytics)
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL, -- pitch_viewed, call_clicked, email_clicked, etc.
  meta jsonb, -- {pitch_id, event_type, platform, user_agent, ip_address, timestamp, scroll_depth, time_spent, etc.}
  created_at timestamptz DEFAULT now()
);

-- 5. TRACKING SESSIONS TABLE (for session-based analytics)
CREATE TABLE IF NOT EXISTS public.tracking_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  referral_id uuid REFERENCES public.referrals(id) ON DELETE CASCADE,
  platform text,
  user_agent text,
  ip_hash text,
  country text,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  total_time_seconds integer DEFAULT 0,
  max_scroll_depth integer DEFAULT 0,
  events_count integer DEFAULT 0,
  metadata jsonb
);

-- 6. PLATFORM ANALYTICS TABLE (for platform-specific insights)
CREATE TABLE IF NOT EXISTS public.platform_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  platform text NOT NULL, -- whatsapp, linkedin, email, direct, web
  date date NOT NULL,
  views_count integer DEFAULT 0,
  calls_count integer DEFAULT 0,
  emails_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  conversion_rate numeric(5,2) DEFAULT 0,
  avg_time_spent_seconds integer DEFAULT 0,
  avg_scroll_depth integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (pitch_id, platform, date)
);

-- 7. REAL-TIME METRICS CACHE TABLE (for fast dashboard queries)
CREATE TABLE IF NOT EXISTS public.realtime_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  metric_type text NOT NULL, -- total_views, total_calls, engagement_rate, etc.
  metric_value numeric(10,2) NOT NULL,
  period text NOT NULL, -- today, week, month, all_time
  calculated_at timestamptz DEFAULT now(),
  UNIQUE (pitch_id, user_id, metric_type, period)
);

-- INDEXES for optimal performance

-- Referral events indexes
CREATE INDEX IF NOT EXISTS idx_referral_events_referral_id ON public.referral_events(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_event_type ON public.referral_events(event_type);
CREATE INDEX IF NOT EXISTS idx_referral_events_occurred_at ON public.referral_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_events_platform ON public.referral_events(platform);
CREATE INDEX IF NOT EXISTS idx_referral_events_pitch_id ON public.referral_events(referral_id) INCLUDE (event_type, occurred_at, platform);

-- Referrals indexes
CREATE INDEX IF NOT EXISTS idx_referrals_pitch_id ON public.referrals(pitch_id);
CREATE INDEX IF NOT EXISTS idx_referrals_supporter_id ON public.referrals(supporter_id);
CREATE INDEX IF NOT EXISTS idx_referrals_platform ON public.referrals(platform);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON public.referrals(created_at DESC);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_event ON public.activity_log(event);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_meta_gin ON public.activity_log USING GIN (meta);

-- Tracking sessions indexes
CREATE INDEX IF NOT EXISTS idx_tracking_sessions_session_id ON public.tracking_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_tracking_sessions_pitch_id ON public.tracking_sessions(pitch_id);
CREATE INDEX IF NOT EXISTS idx_tracking_sessions_started_at ON public.tracking_sessions(started_at DESC);

-- Platform analytics indexes
CREATE INDEX IF NOT EXISTS idx_platform_analytics_pitch_platform_date ON public.platform_analytics(pitch_id, platform, date);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_date ON public.platform_analytics(date DESC);

-- Real-time metrics indexes
CREATE INDEX IF NOT EXISTS idx_realtime_metrics_user_period ON public.realtime_metrics(user_id, period);
CREATE INDEX IF NOT EXISTS idx_realtime_metrics_pitch_period ON public.realtime_metrics(pitch_id, period);
CREATE INDEX IF NOT EXISTS idx_realtime_metrics_calculated_at ON public.realtime_metrics(calculated_at DESC);

-- Pitches tracking indexes
CREATE INDEX IF NOT EXISTS idx_pitches_views_count ON public.pitches(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_pitches_last_activity ON public.pitches(last_activity_at DESC);

-- FUNCTIONS for automatic metric updates

-- Function to update pitch metrics when events occur
CREATE OR REPLACE FUNCTION update_pitch_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the corresponding pitch metrics based on event type
  CASE NEW.event_type
    WHEN 'PITCH_VIEWED' THEN
      UPDATE public.pitches 
      SET views_count = views_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = (SELECT pitch_id FROM public.referrals WHERE id = NEW.referral_id);
    
    WHEN 'CALL_CLICKED', 'PHONE_CLICKED' THEN
      UPDATE public.pitches 
      SET calls_count = calls_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = (SELECT pitch_id FROM public.referrals WHERE id = NEW.referral_id);
    
    WHEN 'EMAIL_CLICKED' THEN
      UPDATE public.pitches 
      SET emails_count = emails_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = (SELECT pitch_id FROM public.referrals WHERE id = NEW.referral_id);
    
    WHEN 'LINKEDIN_CLICKED' THEN
      UPDATE public.pitches 
      SET linkedin_clicks_count = linkedin_clicks_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = (SELECT pitch_id FROM public.referrals WHERE id = NEW.referral_id);
    
    WHEN 'RESUME_REQUEST_CLICKED' THEN
      UPDATE public.pitches 
      SET resume_requests_count = resume_requests_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = (SELECT pitch_id FROM public.referrals WHERE id = NEW.referral_id);
    
    WHEN 'SHARE_RESHARED' THEN
      UPDATE public.pitches 
      SET shares_count = shares_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = (SELECT pitch_id FROM public.referrals WHERE id = NEW.referral_id);
    
    WHEN 'SCROLL_25_PERCENT' THEN
      UPDATE public.pitches 
      SET scroll_25_count = scroll_25_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = (SELECT pitch_id FROM public.referrals WHERE id = NEW.referral_id);
    
    WHEN 'SCROLL_50_PERCENT' THEN
      UPDATE public.pitches 
      SET scroll_50_count = scroll_50_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = (SELECT pitch_id FROM public.referrals WHERE id = NEW.referral_id);
    
    WHEN 'SCROLL_75_PERCENT' THEN
      UPDATE public.pitches 
      SET scroll_75_count = scroll_75_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = (SELECT pitch_id FROM public.referrals WHERE id = NEW.referral_id);
    
    WHEN 'TIME_30_SECONDS' THEN
      UPDATE public.pitches 
      SET time_30_count = time_30_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = (SELECT pitch_id FROM public.referrals WHERE id = NEW.referral_id);
    
    WHEN 'TIME_60_SECONDS' THEN
      UPDATE public.pitches 
      SET time_60_count = time_60_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = (SELECT pitch_id FROM public.referrals WHERE id = NEW.referral_id);
    
    WHEN 'TIME_120_SECONDS' THEN
      UPDATE public.pitches 
      SET time_120_count = time_120_count + 1,
          last_activity_at = NEW.occurred_at
      WHERE id = (SELECT pitch_id FROM public.referrals WHERE id = NEW.referral_id);
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update pitch metrics
DROP TRIGGER IF EXISTS trigger_update_pitch_metrics ON public.referral_events;
CREATE TRIGGER trigger_update_pitch_metrics
  AFTER INSERT ON public.referral_events
  FOR EACH ROW
  EXECUTE FUNCTION update_pitch_metrics();

-- Function to update platform analytics
CREATE OR REPLACE FUNCTION update_platform_analytics()
RETURNS TRIGGER AS $$
DECLARE
  pitch_id uuid;
  event_date date;
BEGIN
  -- Get pitch_id and event date
  SELECT r.pitch_id INTO pitch_id 
  FROM public.referrals r 
  WHERE r.id = NEW.referral_id;
  
  event_date := DATE(NEW.occurred_at);
  
  -- Insert or update platform analytics
  INSERT INTO public.platform_analytics (pitch_id, platform, date, views_count, calls_count, emails_count, shares_count)
  VALUES (pitch_id, NEW.platform, event_date, 0, 0, 0, 0)
  ON CONFLICT (pitch_id, platform, date) DO NOTHING;
  
  -- Update the specific metric based on event type
  CASE NEW.event_type
    WHEN 'PITCH_VIEWED' THEN
      UPDATE public.platform_analytics 
      SET views_count = views_count + 1,
          updated_at = NOW()
      WHERE pitch_id = pitch_id AND platform = NEW.platform AND date = event_date;
    
    WHEN 'CALL_CLICKED', 'PHONE_CLICKED' THEN
      UPDATE public.platform_analytics 
      SET calls_count = calls_count + 1,
          updated_at = NOW()
      WHERE pitch_id = pitch_id AND platform = NEW.platform AND date = event_date;
    
    WHEN 'EMAIL_CLICKED' THEN
      UPDATE public.platform_analytics 
      SET emails_count = emails_count + 1,
          updated_at = NOW()
      WHERE pitch_id = pitch_id AND platform = NEW.platform AND date = event_date;
    
    WHEN 'SHARE_RESHARED' THEN
      UPDATE public.platform_analytics 
      SET shares_count = shares_count + 1,
          updated_at = NOW()
      WHERE pitch_id = pitch_id AND platform = NEW.platform AND date = event_date;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update platform analytics
DROP TRIGGER IF EXISTS trigger_update_platform_analytics ON public.referral_events;
CREATE TRIGGER trigger_update_platform_analytics
  AFTER INSERT ON public.referral_events
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_analytics();

-- RLS POLICIES

-- Referrals: Users can see their own referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own referrals" ON public.referrals
  FOR SELECT USING (
    supporter_id = auth.uid() OR 
    pitch_id IN (SELECT id FROM public.pitches WHERE user_id = auth.uid())
  );

-- Referral events: Users can see events for their pitches
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view events for their pitches" ON public.referral_events
  FOR SELECT USING (
    referral_id IN (
      SELECT r.id FROM public.referrals r 
      JOIN public.pitches p ON r.pitch_id = p.id 
      WHERE p.user_id = auth.uid()
    )
  );

-- Activity log: Public read access for FOMO ticker
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for activity log" ON public.activity_log
  FOR SELECT USING (true);

-- Tracking sessions: Users can see sessions for their pitches
ALTER TABLE public.tracking_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view sessions for their pitches" ON public.tracking_sessions
  FOR SELECT USING (
    pitch_id IN (SELECT id FROM public.pitches WHERE user_id = auth.uid())
  );

-- Platform analytics: Users can see analytics for their pitches
ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view analytics for their pitches" ON public.platform_analytics
  FOR SELECT USING (
    pitch_id IN (SELECT id FROM public.pitches WHERE user_id = auth.uid())
  );

-- Real-time metrics: Users can see their own metrics
ALTER TABLE public.realtime_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own metrics" ON public.realtime_metrics
  FOR SELECT USING (user_id = auth.uid());

-- VIEWS for easy querying

-- Recent activity view for FOMO ticker
CREATE OR REPLACE VIEW public.recent_activity AS
SELECT 
  id,
  event,
  meta,
  created_at,
  CASE 
    WHEN event = 'pitch_viewed' THEN 'Someone viewed a pitch'
    WHEN event = 'call_clicked' THEN 'Someone made a call'
    WHEN event = 'email_clicked' THEN 'Someone sent an email'
    WHEN event = 'linkedin_clicked' THEN 'Someone visited LinkedIn'
    WHEN event = 'resume_request_clicked' THEN 'Someone requested a resume'
    WHEN event = 'share_reshared' THEN 'Someone shared a pitch'
    WHEN event = 'scroll_25_percent' THEN 'Someone engaged with a pitch'
    WHEN event = 'scroll_50_percent' THEN 'Someone read half a pitch'
    WHEN event = 'scroll_75_percent' THEN 'Someone read most of a pitch'
    WHEN event = 'time_30_seconds' THEN 'Someone spent time on a pitch'
    WHEN event = 'time_60_seconds' THEN 'Someone spent a minute on a pitch'
    WHEN event = 'time_120_seconds' THEN 'Someone spent 2 minutes on a pitch'
    ELSE event
  END as display_text
FROM public.activity_log 
ORDER BY created_at DESC 
LIMIT 50;

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
  pa.views_count,
  pa.calls_count,
  pa.emails_count,
  pa.shares_count,
  pa.conversion_rate,
  pa.avg_time_spent_seconds,
  pa.avg_scroll_depth,
  CASE 
    WHEN pa.views_count > 0 THEN ROUND(((pa.calls_count + pa.emails_count)::numeric / pa.views_count) * 100, 2)
    ELSE 0 
  END as calculated_conversion_rate
FROM public.platform_analytics pa
ORDER BY pa.date DESC, pa.views_count DESC;
