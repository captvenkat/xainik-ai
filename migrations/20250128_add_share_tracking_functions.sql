-- Share Tracking Functions
-- Adds functions for tracking share events and analytics

-- Function to increment pitch shares count
CREATE OR REPLACE FUNCTION increment_pitch_shares(pitch_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE pitches 
  SET shares_count = COALESCE(shares_count, 0) + 1
  WHERE id = pitch_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get share analytics for a pitch
CREATE OR REPLACE FUNCTION get_pitch_share_analytics(pitch_id UUID)
RETURNS TABLE (
  total_shares BIGINT,
  platform_stats JSONB,
  recent_shares JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH share_stats AS (
    SELECT 
      COUNT(*) as total_shares,
      jsonb_object_agg(
        COALESCE(platform, 'unknown'), 
        platform_count
      ) as platform_stats
    FROM (
      SELECT 
        platform,
        COUNT(*) as platform_count
      FROM referral_events 
      WHERE referral_id = pitch_id 
        AND event_type = 'SHARE'
      GROUP BY platform
    ) platform_counts
  ),
  recent_share_data AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'platform', platform,
        'created_at', created_at,
        'metadata', metadata
      )
    ) as recent_shares
    FROM (
      SELECT platform, created_at, metadata
      FROM referral_events 
      WHERE referral_id = pitch_id 
        AND event_type = 'SHARE'
      ORDER BY created_at DESC
      LIMIT 10
    ) recent
  )
  SELECT 
    ss.total_shares,
    ss.platform_stats,
    rs.recent_shares
  FROM share_stats ss
  CROSS JOIN recent_share_data rs;
END;
$$ LANGUAGE plpgsql;

-- Add shares_count column to pitches table if it doesn't exist
ALTER TABLE pitches ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

-- Create index for better performance on share analytics
CREATE INDEX IF NOT EXISTS idx_referral_events_share_tracking 
ON referral_events(referral_id, event_type, platform, created_at);

-- Function to track QR code scans
CREATE OR REPLACE FUNCTION track_qr_scan(pitch_id UUID, scan_data JSONB DEFAULT '{}'::jsonb)
RETURNS VOID AS $$
BEGIN
  INSERT INTO referral_events (
    referral_id,
    event_type,
    platform,
    metadata
  ) VALUES (
    pitch_id,
    'QR_SCAN',
    'qr_code',
    scan_data
  );
  
  -- Increment pitch views
  UPDATE pitches 
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = pitch_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get comprehensive pitch sharing metrics
CREATE OR REPLACE FUNCTION get_pitch_sharing_metrics(pitch_id UUID)
RETURNS TABLE (
  total_views INTEGER,
  total_shares INTEGER,
  total_qr_scans INTEGER,
  platform_breakdown JSONB,
  share_trend JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(p.views_count, 0) as total_views,
    COALESCE(p.shares_count, 0) as total_shares,
    COALESCE(qr_scans.count, 0) as total_qr_scans,
    platform_breakdown.data as platform_breakdown,
    share_trend.data as share_trend
  FROM pitches p
  LEFT JOIN (
    SELECT COUNT(*) as count
    FROM referral_events 
    WHERE referral_id = pitch_id 
      AND event_type = 'QR_SCAN'
  ) qr_scans ON true
  LEFT JOIN (
    SELECT jsonb_object_agg(platform, count) as data
    FROM (
      SELECT platform, COUNT(*) as count
      FROM referral_events 
      WHERE referral_id = pitch_id 
        AND event_type = 'SHARE'
      GROUP BY platform
    ) platform_counts
  ) platform_breakdown ON true
  LEFT JOIN (
    SELECT jsonb_agg(
      jsonb_build_object(
        'date', date_trunc('day', created_at)::date,
        'shares', count
      )
    ) as data
    FROM (
      SELECT created_at, COUNT(*) as count
      FROM referral_events 
      WHERE referral_id = pitch_id 
        AND event_type = 'SHARE'
      GROUP BY date_trunc('day', created_at)
      ORDER BY date_trunc('day', created_at) DESC
      LIMIT 30
    ) daily_shares
  ) share_trend ON true
  WHERE p.id = pitch_id;
END;
$$ LANGUAGE plpgsql;
