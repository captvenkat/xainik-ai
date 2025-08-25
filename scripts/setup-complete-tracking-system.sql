-- Complete Tracking System with Attribution Chains
-- Run this script in your Supabase SQL Editor to set up the complete system
-- This includes both basic tracking and full attribution chain functionality

-- =====================================================
-- 1. BASIC TRACKING SYSTEM
-- =====================================================

-- Enhanced referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  share_link text NOT NULL,
  platform text, -- whatsapp, linkedin, email, direct, web
  created_at timestamptz DEFAULT now(),
  UNIQUE (supporter_id, pitch_id)
);

-- Comprehensive referral events table
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

-- Enhanced pitches table with tracking metrics
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

-- Activity log table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL, -- pitch_viewed, call_clicked, email_clicked, etc.
  meta jsonb, -- {pitch_id, event_type, platform, user_agent, ip_address, timestamp, scroll_depth, time_spent, etc.}
  created_at timestamptz DEFAULT now()
);

-- Platform analytics table
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

-- Real-time metrics cache table
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

-- =====================================================
-- 2. ATTRIBUTION CHAIN SYSTEM
-- =====================================================

-- Enhanced referrals table with attribution chain
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS parent_referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS original_supporter_id uuid REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS attribution_chain text[] DEFAULT '{}'; -- Array of referral IDs in chain
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS attribution_depth integer DEFAULT 0; -- How many levels deep
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'direct' CHECK (source_type IN ('direct', 'self', 'supporter', 'anonymous', 'chain'));

-- Attribution events table
CREATE TABLE IF NOT EXISTS public.attribution_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid REFERENCES public.referrals(id) ON DELETE CASCADE,
  original_referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  platform text,
  user_agent text,
  ip_hash text,
  metadata jsonb,
  attribution_chain text[], -- Full chain of referral IDs
  attribution_depth integer DEFAULT 0,
  source_type text, -- self, supporter, anonymous, chain
  original_supporter_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  occurred_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Referral chain analytics table
CREATE TABLE IF NOT EXISTS public.referral_chain_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_referral_id uuid REFERENCES public.referrals(id) ON DELETE CASCADE,
  original_supporter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  chain_depth integer DEFAULT 0,
  total_views integer DEFAULT 0,
  total_calls integer DEFAULT 0,
  total_emails integer DEFAULT 0,
  total_shares integer DEFAULT 0,
  total_conversions integer DEFAULT 0,
  chain_reach integer DEFAULT 0, -- Total unique people reached
  viral_coefficient numeric(5,2) DEFAULT 0, -- Average shares per view
  attribution_value numeric(10,2) DEFAULT 0, -- Calculated value of this chain
  last_activity_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Supporter attribution summary table
CREATE TABLE IF NOT EXISTS public.supporter_attribution_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  total_referrals_created integer DEFAULT 0,
  total_chain_reach integer DEFAULT 0,
  total_attributed_views integer DEFAULT 0,
  total_attributed_calls integer DEFAULT 0,
  total_attributed_emails integer DEFAULT 0,
  total_attributed_shares integer DEFAULT 0,
  total_attributed_conversions integer DEFAULT 0,
  viral_coefficient numeric(5,2) DEFAULT 0,
  attribution_value numeric(10,2) DEFAULT 0,
  last_activity_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (supporter_id, pitch_id)
);

-- =====================================================
-- 3. INDEXES for optimal performance
-- =====================================================

-- Basic tracking indexes
CREATE INDEX IF NOT EXISTS idx_referral_events_referral_id ON public.referral_events(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_event_type ON public.referral_events(event_type);
CREATE INDEX IF NOT EXISTS idx_referral_events_occurred_at ON public.referral_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_events_platform ON public.referral_events(platform);
CREATE INDEX IF NOT EXISTS idx_referral_events_pitch_id ON public.referral_events(referral_id) INCLUDE (event_type, occurred_at, platform);

CREATE INDEX IF NOT EXISTS idx_referrals_pitch_id ON public.referrals(pitch_id);
CREATE INDEX IF NOT EXISTS idx_referrals_supporter_id ON public.referrals(supporter_id);
CREATE INDEX IF NOT EXISTS idx_referrals_platform ON public.referrals(platform);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON public.referrals(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_log_event ON public.activity_log(event);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_meta_gin ON public.activity_log USING GIN (meta);

CREATE INDEX IF NOT EXISTS idx_platform_analytics_pitch_platform_date ON public.platform_analytics(pitch_id, platform, date);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_date ON public.platform_analytics(date DESC);

CREATE INDEX IF NOT EXISTS idx_realtime_metrics_user_period ON public.realtime_metrics(user_id, period);
CREATE INDEX IF NOT EXISTS idx_realtime_metrics_pitch_period ON public.realtime_metrics(pitch_id, period);
CREATE INDEX IF NOT EXISTS idx_realtime_metrics_calculated_at ON public.realtime_metrics(calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_pitches_views_count ON public.pitches(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_pitches_last_activity ON public.pitches(last_activity_at DESC);

-- Attribution chain indexes
CREATE INDEX IF NOT EXISTS idx_referrals_parent_id ON public.referrals(parent_referral_id);
CREATE INDEX IF NOT EXISTS idx_referrals_original_supporter ON public.referrals(original_supporter_id);
CREATE INDEX IF NOT EXISTS idx_referrals_attribution_chain ON public.referrals USING GIN (attribution_chain);
CREATE INDEX IF NOT EXISTS idx_referrals_source_type ON public.referrals(source_type);

CREATE INDEX IF NOT EXISTS idx_attribution_events_original_referral ON public.attribution_events(original_referral_id);
CREATE INDEX IF NOT EXISTS idx_attribution_events_chain ON public.attribution_events USING GIN (attribution_chain);
CREATE INDEX IF NOT EXISTS idx_attribution_events_source_type ON public.attribution_events(source_type);
CREATE INDEX IF NOT EXISTS idx_attribution_events_original_supporter ON public.attribution_events(original_supporter_id);

CREATE INDEX IF NOT EXISTS idx_referral_chain_original_referral ON public.referral_chain_analytics(original_referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_chain_original_supporter ON public.referral_chain_analytics(original_supporter_id);
CREATE INDEX IF NOT EXISTS idx_referral_chain_pitch ON public.referral_chain_analytics(pitch_id);

CREATE INDEX IF NOT EXISTS idx_supporter_attribution_supporter ON public.supporter_attribution_summary(supporter_id);
CREATE INDEX IF NOT EXISTS idx_supporter_attribution_pitch ON public.supporter_attribution_summary(pitch_id);

-- =====================================================
-- 4. FUNCTIONS for automatic updates
-- =====================================================

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

-- Function to create referral with attribution chain
CREATE OR REPLACE FUNCTION create_referral_with_attribution(
  p_supporter_id uuid,
  p_pitch_id uuid,
  p_share_link text,
  p_platform text,
  p_parent_referral_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  new_referral_id uuid;
  parent_chain text[];
  parent_depth integer;
  parent_source_type text;
  parent_original_supporter_id uuid;
  new_chain text[];
  new_depth integer;
  new_source_type text;
  new_original_supporter_id uuid;
BEGIN
  -- Get parent referral info if exists
  IF p_parent_referral_id IS NOT NULL THEN
    SELECT 
      attribution_chain,
      attribution_depth,
      source_type,
      original_supporter_id
    INTO 
      parent_chain,
      parent_depth,
      parent_source_type,
      parent_original_supporter_id
    FROM public.referrals 
    WHERE id = p_parent_referral_id;
  END IF;

  -- Build new attribution chain
  IF p_parent_referral_id IS NOT NULL THEN
    new_chain := array_append(parent_chain, p_parent_referral_id::text);
    new_depth := parent_depth + 1;
    new_source_type := 'chain';
    new_original_supporter_id := COALESCE(parent_original_supporter_id, p_supporter_id);
  ELSE
    new_chain := '{}';
    new_depth := 0;
    new_source_type := CASE 
      WHEN p_supporter_id IS NULL THEN 'anonymous'
      WHEN p_supporter_id = (SELECT user_id FROM public.pitches WHERE id = p_pitch_id) THEN 'self'
      ELSE 'supporter'
    END;
    new_original_supporter_id := p_supporter_id;
  END IF;

  -- Create the referral
  INSERT INTO public.referrals (
    supporter_id,
    pitch_id,
    share_link,
    platform,
    parent_referral_id,
    original_supporter_id,
    attribution_chain,
    attribution_depth,
    source_type
  ) VALUES (
    p_supporter_id,
    p_pitch_id,
    p_share_link,
    p_platform,
    p_parent_referral_id,
    new_original_supporter_id,
    new_chain,
    new_depth,
    new_source_type
  ) RETURNING id INTO new_referral_id;

  RETURN new_referral_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update attribution analytics when events occur
CREATE OR REPLACE FUNCTION update_attribution_analytics()
RETURNS TRIGGER AS $$
DECLARE
  referral_info record;
  original_referral_id uuid;
  original_supporter_id uuid;
  pitch_id uuid;
BEGIN
  -- Get referral info
  SELECT 
    r.id,
    r.original_supporter_id,
    r.pitch_id,
    r.attribution_chain,
    r.attribution_depth,
    r.source_type
  INTO referral_info
  FROM public.referrals r
  WHERE r.id = NEW.referral_id;

  -- Get original referral (first in chain or current if no chain)
  IF array_length(referral_info.attribution_chain, 1) > 0 THEN
    original_referral_id := referral_info.attribution_chain[1]::uuid;
  ELSE
    original_referral_id := referral_info.id;
  END IF;

  original_supporter_id := referral_info.original_supporter_id;
  pitch_id := referral_info.pitch_id;

  -- Create attribution event
  INSERT INTO public.attribution_events (
    referral_id,
    original_referral_id,
    event_type,
    platform,
    user_agent,
    ip_hash,
    metadata,
    attribution_chain,
    attribution_depth,
    source_type,
    original_supporter_id
  ) VALUES (
    NEW.referral_id,
    original_referral_id,
    NEW.event_type,
    NEW.platform,
    NEW.user_agent,
    NEW.ip_hash,
    NEW.metadata,
    referral_info.attribution_chain,
    referral_info.attribution_depth,
    referral_info.source_type,
    original_supporter_id
  );

  -- Update referral chain analytics
  INSERT INTO public.referral_chain_analytics (
    original_referral_id,
    original_supporter_id,
    pitch_id,
    chain_depth,
    total_views,
    total_calls,
    total_emails,
    total_shares,
    total_conversions,
    chain_reach,
    last_activity_at
  ) VALUES (
    original_referral_id,
    original_supporter_id,
    pitch_id,
    referral_info.attribution_depth,
    CASE WHEN NEW.event_type = 'PITCH_VIEWED' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type IN ('CALL_CLICKED', 'PHONE_CLICKED') THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'EMAIL_CLICKED' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'SHARE_RESHARED' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type IN ('CALL_CLICKED', 'PHONE_CLICKED', 'EMAIL_CLICKED') THEN 1 ELSE 0 END,
    1, -- chain_reach (unique person)
    NEW.occurred_at
  )
  ON CONFLICT (original_referral_id) DO UPDATE SET
    total_views = referral_chain_analytics.total_views + CASE WHEN NEW.event_type = 'PITCH_VIEWED' THEN 1 ELSE 0 END,
    total_calls = referral_chain_analytics.total_calls + CASE WHEN NEW.event_type IN ('CALL_CLICKED', 'PHONE_CLICKED') THEN 1 ELSE 0 END,
    total_emails = referral_chain_analytics.total_emails + CASE WHEN NEW.event_type = 'EMAIL_CLICKED' THEN 1 ELSE 0 END,
    total_shares = referral_chain_analytics.total_shares + CASE WHEN NEW.event_type = 'SHARE_RESHARED' THEN 1 ELSE 0 END,
    total_conversions = referral_chain_analytics.total_conversions + CASE WHEN NEW.event_type IN ('CALL_CLICKED', 'PHONE_CLICKED', 'EMAIL_CLICKED') THEN 1 ELSE 0 END,
    last_activity_at = NEW.occurred_at,
    updated_at = NOW();

  -- Update supporter attribution summary
  IF original_supporter_id IS NOT NULL THEN
    INSERT INTO public.supporter_attribution_summary (
      supporter_id,
      pitch_id,
      total_referrals_created,
      total_chain_reach,
      total_attributed_views,
      total_attributed_calls,
      total_attributed_emails,
      total_attributed_shares,
      total_attributed_conversions,
      last_activity_at
    ) VALUES (
      original_supporter_id,
      pitch_id,
      1,
      1,
      CASE WHEN NEW.event_type = 'PITCH_VIEWED' THEN 1 ELSE 0 END,
      CASE WHEN NEW.event_type IN ('CALL_CLICKED', 'PHONE_CLICKED') THEN 1 ELSE 0 END,
      CASE WHEN NEW.event_type = 'EMAIL_CLICKED' THEN 1 ELSE 0 END,
      CASE WHEN NEW.event_type = 'SHARE_RESHARED' THEN 1 ELSE 0 END,
      CASE WHEN NEW.event_type IN ('CALL_CLICKED', 'PHONE_CLICKED', 'EMAIL_CLICKED') THEN 1 ELSE 0 END,
      NEW.occurred_at
    )
    ON CONFLICT (supporter_id, pitch_id) DO UPDATE SET
      total_attributed_views = supporter_attribution_summary.total_attributed_views + CASE WHEN NEW.event_type = 'PITCH_VIEWED' THEN 1 ELSE 0 END,
      total_attributed_calls = supporter_attribution_summary.total_attributed_calls + CASE WHEN NEW.event_type IN ('CALL_CLICKED', 'PHONE_CLICKED') THEN 1 ELSE 0 END,
      total_attributed_emails = supporter_attribution_summary.total_attributed_emails + CASE WHEN NEW.event_type = 'EMAIL_CLICKED' THEN 1 ELSE 0 END,
      total_attributed_shares = supporter_attribution_summary.total_attributed_shares + CASE WHEN NEW.event_type = 'SHARE_RESHARED' THEN 1 ELSE 0 END,
      total_attributed_conversions = supporter_attribution_summary.total_attributed_conversions + CASE WHEN NEW.event_type IN ('CALL_CLICKED', 'PHONE_CLICKED', 'EMAIL_CLICKED') THEN 1 ELSE 0 END,
      last_activity_at = NEW.occurred_at,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TRIGGERS for automatic updates
-- =====================================================

-- Trigger to automatically update pitch metrics
DROP TRIGGER IF EXISTS trigger_update_pitch_metrics ON public.referral_events;
CREATE TRIGGER trigger_update_pitch_metrics
  AFTER INSERT ON public.referral_events
  FOR EACH ROW
  EXECUTE FUNCTION update_pitch_metrics();

-- Trigger to automatically update platform analytics
DROP TRIGGER IF EXISTS trigger_update_platform_analytics ON public.referral_events;
CREATE TRIGGER trigger_update_platform_analytics
  AFTER INSERT ON public.referral_events
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_analytics();

-- Trigger to update attribution analytics
DROP TRIGGER IF EXISTS trigger_update_attribution_analytics ON public.referral_events;
CREATE TRIGGER trigger_update_attribution_analytics
  AFTER INSERT ON public.referral_events
  FOR EACH ROW
  EXECUTE FUNCTION update_attribution_analytics();

-- =====================================================
-- 6. RLS POLICIES
-- =====================================================

-- Basic tracking policies
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own referrals" ON public.referrals
  FOR SELECT USING (
    supporter_id = auth.uid() OR 
    pitch_id IN (SELECT id FROM public.pitches WHERE user_id = auth.uid())
  );

ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view events for their pitches" ON public.referral_events
  FOR SELECT USING (
    referral_id IN (
      SELECT r.id FROM public.referrals r 
      JOIN public.pitches p ON r.pitch_id = p.id 
      WHERE p.user_id = auth.uid()
    )
  );

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for activity log" ON public.activity_log
  FOR SELECT USING (true);

ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view analytics for their pitches" ON public.platform_analytics
  FOR SELECT USING (
    pitch_id IN (SELECT id FROM public.pitches WHERE user_id = auth.uid())
  );

ALTER TABLE public.realtime_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own metrics" ON public.realtime_metrics
  FOR SELECT USING (user_id = auth.uid());

-- Attribution chain policies
ALTER TABLE public.attribution_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view attribution events for their pitches" ON public.attribution_events
  FOR SELECT USING (
    pitch_id IN (SELECT id FROM public.pitches WHERE user_id = auth.uid())
  );

ALTER TABLE public.referral_chain_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view chain analytics for their pitches" ON public.referral_chain_analytics
  FOR SELECT USING (
    pitch_id IN (SELECT id FROM public.pitches WHERE user_id = auth.uid())
  );

ALTER TABLE public.supporter_attribution_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own attribution summary" ON public.supporter_attribution_summary
  FOR SELECT USING (
    supporter_id = auth.uid() OR 
    pitch_id IN (SELECT id FROM public.pitches WHERE user_id = auth.uid())
  );

-- =====================================================
-- 7. VIEWS for easy querying
-- =====================================================

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

-- Complete attribution chain view
CREATE OR REPLACE VIEW public.attribution_chain_view AS
SELECT 
  r.id as referral_id,
  r.supporter_id,
  r.pitch_id,
  r.share_link,
  r.platform,
  r.parent_referral_id,
  r.original_supporter_id,
  r.attribution_chain,
  r.attribution_depth,
  r.source_type,
  r.created_at,
  -- Original supporter info
  os.name as original_supporter_name,
  os.email as original_supporter_email,
  -- Current supporter info
  cs.name as current_supporter_name,
  cs.email as current_supporter_email,
  -- Pitch info
  p.title as pitch_title,
  p.user_id as pitch_owner_id,
  po.name as pitch_owner_name,
  -- Chain metrics
  COALESCE(rca.total_views, 0) as chain_total_views,
  COALESCE(rca.total_calls, 0) as chain_total_calls,
  COALESCE(rca.total_emails, 0) as chain_total_emails,
  COALESCE(rca.total_shares, 0) as chain_total_shares,
  COALESCE(rca.total_conversions, 0) as chain_total_conversions,
  COALESCE(rca.chain_reach, 0) as chain_reach,
  COALESCE(rca.viral_coefficient, 0) as viral_coefficient
FROM public.referrals r
LEFT JOIN public.users os ON r.original_supporter_id = os.id
LEFT JOIN public.users cs ON r.supporter_id = cs.id
LEFT JOIN public.pitches p ON r.pitch_id = p.id
LEFT JOIN public.users po ON p.user_id = po.id
LEFT JOIN public.referral_chain_analytics rca ON rca.original_referral_id = 
  CASE 
    WHEN array_length(r.attribution_chain, 1) > 0 THEN r.attribution_chain[1]::uuid
    ELSE r.id
  END
ORDER BY r.created_at DESC;

-- Supporter attribution performance view
CREATE OR REPLACE VIEW public.supporter_attribution_performance AS
SELECT 
  sas.supporter_id,
  sas.pitch_id,
  u.name as supporter_name,
  u.email as supporter_email,
  p.title as pitch_title,
  po.name as pitch_owner_name,
  sas.total_referrals_created,
  sas.total_chain_reach,
  sas.total_attributed_views,
  sas.total_attributed_calls,
  sas.total_attributed_emails,
  sas.total_attributed_shares,
  sas.total_attributed_conversions,
  sas.viral_coefficient,
  sas.attribution_value,
  sas.last_activity_at,
  -- Calculate conversion rate
  CASE 
    WHEN sas.total_attributed_views > 0 THEN ROUND((sas.total_attributed_conversions::numeric / sas.total_attributed_views) * 100, 2)
    ELSE 0 
  END as conversion_rate,
  -- Calculate engagement rate
  CASE 
    WHEN sas.total_attributed_views > 0 THEN ROUND(((sas.total_attributed_calls + sas.total_attributed_emails)::numeric / sas.total_attributed_views) * 100, 2)
    ELSE 0 
  END as engagement_rate
FROM public.supporter_attribution_summary sas
JOIN public.users u ON sas.supporter_id = u.id
JOIN public.pitches p ON sas.pitch_id = p.id
JOIN public.users po ON p.user_id = po.id
ORDER BY sas.attribution_value DESC, sas.total_chain_reach DESC;

-- Viral coefficient calculation view
CREATE OR REPLACE VIEW public.viral_coefficient_analysis AS
SELECT 
  pitch_id,
  p.title as pitch_title,
  po.name as pitch_owner_name,
  COUNT(DISTINCT r.id) as total_referrals,
  COUNT(DISTINCT r.original_supporter_id) as unique_supporters,
  SUM(COALESCE(rca.total_shares, 0)) as total_shares,
  SUM(COALESCE(rca.total_views, 0)) as total_views,
  CASE 
    WHEN SUM(COALESCE(rca.total_views, 0)) > 0 THEN ROUND((SUM(COALESCE(rca.total_shares, 0))::numeric / SUM(COALESCE(rca.total_views, 0))) * 100, 2)
    ELSE 0 
  END as viral_coefficient,
  MAX(rca.last_activity_at) as last_activity
FROM public.referrals r
JOIN public.pitches p ON r.pitch_id = p.id
JOIN public.users po ON p.user_id = po.id
LEFT JOIN public.referral_chain_analytics rca ON rca.original_referral_id = 
  CASE 
    WHEN array_length(r.attribution_chain, 1) > 0 THEN r.attribution_chain[1]::uuid
    ELSE r.id
  END
GROUP BY pitch_id, p.title, po.name
ORDER BY viral_coefficient DESC, total_views DESC;

-- =====================================================
-- 8. SUCCESS MESSAGE
-- =====================================================

SELECT '✅ Complete tracking system with attribution chains setup completed successfully!' as status;
