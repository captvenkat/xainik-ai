-- Attribution Chain System for Complete Referral Tracking
-- Migration: 20250127_attribution_chain_system.sql
-- This enhances the tracking system to handle full referral loops and attribution

-- 1. ENHANCED REFERRALS TABLE with attribution chain
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS parent_referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS original_supporter_id uuid REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS attribution_chain text[] DEFAULT '{}'; -- Array of referral IDs in chain
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS attribution_depth integer DEFAULT 0; -- How many levels deep
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'direct' CHECK (source_type IN ('direct', 'self', 'supporter', 'anonymous', 'chain'));

-- 2. ATTRIBUTION EVENTS TABLE (tracks the full chain)
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

-- 3. REFERRAL CHAIN ANALYTICS TABLE
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

-- 4. SUPPORTER ATTRIBUTION SUMMARY TABLE
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

-- INDEXES for attribution queries
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

-- FUNCTIONS for attribution chain management

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

-- Trigger to update attribution analytics
DROP TRIGGER IF EXISTS trigger_update_attribution_analytics ON public.referral_events;
CREATE TRIGGER trigger_update_attribution_analytics
  AFTER INSERT ON public.referral_events
  FOR EACH ROW
  EXECUTE FUNCTION update_attribution_analytics();

-- VIEWS for attribution analytics

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

-- RLS POLICIES for attribution tables

-- Attribution events: Users can see events for their pitches
ALTER TABLE public.attribution_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view attribution events for their pitches" ON public.attribution_events
  FOR SELECT USING (
    pitch_id IN (SELECT id FROM public.pitches WHERE user_id = auth.uid())
  );

-- Referral chain analytics: Users can see analytics for their pitches
ALTER TABLE public.referral_chain_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view chain analytics for their pitches" ON public.referral_chain_analytics
  FOR SELECT USING (
    pitch_id IN (SELECT id FROM public.pitches WHERE user_id = auth.uid())
  );

-- Supporter attribution summary: Users can see their own attribution
ALTER TABLE public.supporter_attribution_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own attribution summary" ON public.supporter_attribution_summary
  FOR SELECT USING (
    supporter_id = auth.uid() OR 
    pitch_id IN (SELECT id FROM public.pitches WHERE user_id = auth.uid())
  );

-- Success message
SELECT '✅ Attribution chain system setup completed successfully!' as status;
