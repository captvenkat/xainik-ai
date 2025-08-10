-- Minimal Database Schema Migration for Billing System
-- Migration: 20250127_minimal_schema.sql
-- Only essential tables needed for billing system to function

-- 1. USERS TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  role text CHECK (role IN ('veteran','recruiter','supporter','admin')) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. ACTIVITY LOG (FOMO ticker) - ESSENTIAL for billing system
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL, -- veteran_joined, pitch_referred, recruiter_called, endorsement_added, like_added, donation_received
  meta jsonb,          -- {veteran_name, supporter_name, recruiter_name, amount, pitch_title, ...}
  created_at timestamptz DEFAULT now()
);

-- 3. EMAIL LOGS (for observability) - ESSENTIAL for billing system
CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),
  email_to text NOT NULL,
  subject text NOT NULL,
  template text NOT NULL,
  message_id text,
  payload jsonb,
  status text NOT NULL DEFAULT 'QUEUED',
  created_at timestamptz DEFAULT now()
);

-- 4. BASIC INDEXES
CREATE INDEX IF NOT EXISTS idx_activity_log_time ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_event ON public.activity_log(event);
CREATE INDEX IF NOT EXISTS idx_email_logs_user ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);

-- 5. ACTIVITY TICKER VIEW (last 50 events)
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

-- 6. RLS POLICIES

-- Enable RLS on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Users: owner read/write, admin override
CREATE POLICY "Users can manage own profile" ON public.users
  FOR ALL USING (auth.uid() = id);
CREATE POLICY "Admin can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Activity log: admin full access
CREATE POLICY "Admin can manage activity log" ON public.activity_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Email logs: user own, admin all
CREATE POLICY "Users can view own email logs" ON public.email_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage email logs" ON public.email_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );
