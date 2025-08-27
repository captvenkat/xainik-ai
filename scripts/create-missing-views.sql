-- Create missing views for veteran dashboard
-- Run this in your Supabase SQL Editor

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
FROM public.platform_metrics pa
ORDER BY pa.date DESC, pa.views_count DESC;

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

-- Grant permissions
GRANT SELECT ON public.veteran_dashboard_summary TO authenticated;
GRANT SELECT ON public.platform_performance TO authenticated;
GRANT SELECT ON public.recent_activity TO authenticated;

-- Success message
SELECT '✅ Missing views created successfully!' as status;
