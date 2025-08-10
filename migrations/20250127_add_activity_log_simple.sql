-- Add missing activity_log table for billing system (Simplified)
-- Migration: 20250127_add_activity_log_simple.sql

-- ACTIVITY LOG (FOMO ticker) - ESSENTIAL for billing system
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL, -- veteran_joined, pitch_referred, recruiter_called, endorsement_added, like_added, donation_received
  meta jsonb,          -- {veteran_name, supporter_name, recruiter_name, amount, pitch_title, ...}
  created_at timestamptz DEFAULT now()
);

-- INDEXES for activity_log
CREATE INDEX IF NOT EXISTS idx_activity_log_time ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_event ON public.activity_log(event);

-- ACTIVITY TICKER VIEW (last 50 events)
CREATE OR REPLACE VIEW public.activity_recent AS
SELECT 
  id,
  event,
  meta,
  created_at,
  CASE 
    WHEN event = 'veteran_joined' THEN (meta->>'veteran_name') || ' joined Xainik'
    WHEN event = 'pitch_referred' THEN (meta->>'supporter_name') || ' referred ' || (meta->>'veteran_name')
    WHEN event = 'recruiter_called' THEN (meta->>'recruiter_name') || ' contacted ' || (meta->>'veteran_name')
    WHEN event = 'endorsement_added' THEN (meta->>'endorser_name') || ' endorsed ' || (meta->>'veteran_name')
    WHEN event = 'like_added' THEN 'Someone liked "' || (meta->>'pitch_title') || '"'
    WHEN event = 'donation_received' THEN '₹' || (meta->>'amount')::text || ' donation received'
    ELSE event
  END as display_text
FROM public.activity_log 
ORDER BY created_at DESC 
LIMIT 50;

-- RLS POLICIES for activity_log (simplified - no users table dependency)
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (we can add proper RLS later when users table exists)
CREATE POLICY "Allow all activity log operations" ON public.activity_log
  FOR ALL USING (true);
