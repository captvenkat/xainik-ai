-- Migration: 20250127_donations_aggregates_view.sql
-- Create safe aggregates view for donations

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.donations_aggregates;

-- Create donations aggregates view
CREATE OR REPLACE VIEW public.donations_aggregates AS
SELECT
  COALESCE(COUNT(*), 0) as total_donations,
  COALESCE(SUM(amount), 0) as total_amount,
  COALESCE(COUNT(*) FILTER (WHERE created_at::date = NOW()::date), 0) as today_count,
  COALESCE(SUM(amount) FILTER (WHERE created_at::date = NOW()::date), 0) as today_amount,
  COALESCE(MAX(amount), 0) as highest_donation,
  COALESCE(MAX(created_at), NULL) as last_donation_at
FROM donations
WHERE status = 'completed';

-- Grant permissions
GRANT SELECT ON public.donations_aggregates TO anon, authenticated;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_donations_status_created_at ON donations(status, created_at);
CREATE INDEX IF NOT EXISTS idx_donations_amount ON donations(amount);
