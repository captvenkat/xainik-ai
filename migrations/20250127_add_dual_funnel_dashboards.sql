-- Migration: Add Dual Funnel Dashboard Support
-- Date: 2025-01-27
-- Description: Add columns and views for veteran and supporter dual funnel dashboards

-- Add new event types for richer funnels
DO $$ BEGIN
    CREATE TYPE referral_event_type AS ENUM (
        'share', 'view', 'like', 'contact', 'resume', 'hire'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to referral_events table
ALTER TABLE referral_events 
ADD COLUMN IF NOT EXISTS mode text CHECK (mode IN ('self', 'supporter', 'anonymous')),
ADD COLUMN IF NOT EXISTS link_token text,
ADD COLUMN IF NOT EXISTS parent_share_id bigint REFERENCES referral_events(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ref_ev_mode ON referral_events(mode);
CREATE INDEX IF NOT EXISTS idx_ref_ev_parent ON referral_events(parent_share_id);

-- Create view for inbound funnel (effort → views)
CREATE OR REPLACE VIEW vw_inbound_funnel AS
SELECT 
    r.pitch_id,
    re.platform,
    re.mode,
    COUNT(*) FILTER (WHERE re.event_type = 'share') as shares,
    COUNT(*) FILTER (WHERE re.event_type = 'view') as views,
    DATE_TRUNC('day', re.occurred_at) as date
FROM referral_events re
JOIN referrals r ON re.referral_id = r.id
GROUP BY r.pitch_id, re.platform, re.mode, DATE_TRUNC('day', re.occurred_at);

-- Create view for conversion funnel (views → hire)
CREATE OR REPLACE VIEW vw_conversion_funnel AS
SELECT 
    r.pitch_id,
    COUNT(*) FILTER (WHERE re.event_type = 'view') as views,
    COUNT(*) FILTER (WHERE re.event_type = 'like') as likes,
    COUNT(*) FILTER (WHERE re.event_type = 'share') as forwards,
    COUNT(*) FILTER (WHERE re.event_type = 'contact') as contacts,
    COUNT(*) FILTER (WHERE re.event_type = 'resume') as resumes,
    COUNT(*) FILTER (WHERE re.event_type = 'hire') as hires
FROM referral_events re
JOIN referrals r ON re.referral_id = r.id
GROUP BY r.pitch_id;

-- Create view for supporter progress
CREATE OR REPLACE VIEW vw_supporter_progress AS
SELECT 
    r.pitch_id,
    r.user_id as supporter_user_id,
    COUNT(*) FILTER (WHERE re.event_type = 'share') as shares,
    COUNT(*) FILTER (WHERE re.event_type = 'view') as views,
    COUNT(*) FILTER (WHERE re.event_type = 'contact') as contacts,
    COUNT(*) FILTER (WHERE re.event_type = 'hire') as hires
FROM referral_events re
JOIN referrals r ON re.referral_id = r.id
WHERE re.mode = 'supporter'
GROUP BY r.pitch_id, r.user_id;

-- Add RLS policies for the new views
ALTER VIEW vw_inbound_funnel SET (security_invoker = true);
ALTER VIEW vw_conversion_funnel SET (security_invoker = true);
ALTER VIEW vw_supporter_progress SET (security_invoker = true);

-- Grant access to authenticated users
GRANT SELECT ON vw_inbound_funnel TO authenticated;
GRANT SELECT ON vw_conversion_funnel TO authenticated;
GRANT SELECT ON vw_supporter_progress TO authenticated;
