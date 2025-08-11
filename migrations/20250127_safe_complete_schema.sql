-- Safe Complete Schema Migration - Handles Existing Objects
-- Migration: 20250127_safe_complete_schema.sql

-- First, drop any existing views that might conflict
DROP VIEW IF EXISTS public.donations_aggregates CASCADE;
DROP VIEW IF EXISTS public.activity_recent CASCADE;

-- Drop existing tables if they exist (will recreate them)
DROP TABLE IF EXISTS public.recruiter_saved_filters CASCADE;
DROP TABLE IF EXISTS public.recruiter_notes CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.notification_prefs CASCADE;
DROP TABLE IF EXISTS public.resume_requests CASCADE;
DROP TABLE IF EXISTS public.referral_events CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.shared_pitches CASCADE;
DROP TABLE IF EXISTS public.endorsements CASCADE;
DROP TABLE IF EXISTS public.pitches CASCADE;
DROP TABLE IF EXISTS public.supporters CASCADE;
DROP TABLE IF EXISTS public.recruiters CASCADE;
DROP TABLE IF EXISTS public.veterans CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS payment_events_archive CASCADE;

-- Note: We keep existing users, activity_log, and email_logs tables
-- as they already exist and have data

-- Now create the missing tables

-- 1. VETERANS PROFILE
CREATE TABLE IF NOT EXISTS public.veterans (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  rank text,
  service_branch text,
  years_experience int,
  location_current text,
  locations_preferred text[]
);

-- 2. RECRUITERS PROFILE
CREATE TABLE IF NOT EXISTS public.recruiters (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  industry text
);

-- 3. SUPPORTERS PROFILE
CREATE TABLE IF NOT EXISTS public.supporters (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  intro text
);

-- 4. PITCHES
CREATE TABLE IF NOT EXISTS public.pitches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  veteran_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  pitch_text text NOT NULL CHECK (length(pitch_text) <= 300),
  skills text[] NOT NULL,
  job_type text NOT NULL,
  location text NOT NULL,
  availability text NOT NULL,
  photo_url text,
  phone text NOT NULL,
  likes_count int DEFAULT 0,
  is_active boolean DEFAULT true,
  plan_tier text,
  plan_expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 5. ENDORSEMENTS
CREATE TABLE IF NOT EXISTS public.endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  veteran_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  endorser_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  text text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (veteran_id, endorser_id)
);

-- 6. REFERRALS
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  share_link text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (supporter_id, pitch_id)
);

-- 7. REFERRAL EVENTS
CREATE TABLE IF NOT EXISTS public.referral_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid REFERENCES public.referrals(id) ON DELETE CASCADE,
  event_type text CHECK (event_type IN ('LINK_OPENED','PITCH_VIEWED','CALL_CLICKED','EMAIL_CLICKED','SHARE_RESHARED','SIGNUP_FROM_REFERRAL')) NOT NULL,
  platform text,
  user_agent text,
  country text,
  ip_hash text,
  occurred_at timestamptz DEFAULT now()
);

-- 8. SHARED PITCHES
CREATE TABLE IF NOT EXISTS public.shared_pitches (
  supporter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  share_link text NOT NULL,
  click_count int DEFAULT 0,
  PRIMARY KEY (supporter_id, pitch_id)
);

-- 9. DONATIONS
CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  created_at timestamptz DEFAULT now()
);

-- 10. RESUME REQUESTS
CREATE TABLE IF NOT EXISTS public.resume_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  veteran_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE SET NULL,
  job_role text,
  status text CHECK (status IN ('PENDING','APPROVED','DECLINED')) DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz
);

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload_json jsonb,
  channel text CHECK (channel IN ('IN_APP','EMAIL')) NOT NULL,
  status text CHECK (status IN ('PENDING','SENT','FAILED')) DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  read_at timestamptz
);

-- 12. NOTIFICATION PREFS
CREATE TABLE IF NOT EXISTS public.notification_prefs (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  email_enabled boolean DEFAULT true,
  in_app_enabled boolean DEFAULT true,
  digest_enabled boolean DEFAULT true,
  quiet_hours_start time,
  quiet_hours_end time
);

-- 13. RECRUITER NOTES
CREATE TABLE IF NOT EXISTS public.recruiter_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 14. RECRUITER SAVED FILTERS
CREATE TABLE IF NOT EXISTS public.recruiter_saved_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  filters jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 15. PAYMENT EVENTS ARCHIVE
CREATE TABLE IF NOT EXISTS payment_events_archive (
  id uuid PRIMARY KEY,
  event_id text NOT NULL,
  payment_id text NOT NULL,
  order_id text NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL,
  notes jsonb,
  processed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  archived_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pitches_active ON public.pitches(is_active, plan_expires_at);
CREATE INDEX IF NOT EXISTS idx_pitches_veteran ON public.pitches(veteran_id);
CREATE INDEX IF NOT EXISTS idx_pitches_created ON public.pitches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pitches_likes ON public.pitches(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_endorsements_veteran ON public.endorsements(veteran_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_endorser ON public.endorsements(endorser_id);
CREATE INDEX IF NOT EXISTS idx_referrals_supporter ON public.referrals(supporter_id);
CREATE INDEX IF NOT EXISTS idx_referrals_pitch ON public.referrals(pitch_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_referral_time ON public.referral_events(referral_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_events_type ON public.referral_events(event_type);
CREATE INDEX IF NOT EXISTS idx_resume_requests_recruiter ON public.resume_requests(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_resume_requests_veteran ON public.resume_requests(veteran_id);
CREATE INDEX IF NOT EXISTS idx_resume_requests_status ON public.resume_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_donations_created ON public.donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recruiter_notes_recruiter ON public.recruiter_notes(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_notes_pitch ON public.recruiter_notes(pitch_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_notes_created ON public.recruiter_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recruiter_saved_filters_recruiter ON public.recruiter_saved_filters(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_archive_event_id ON payment_events_archive(event_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_archive_payment_id ON payment_events_archive(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_archive_order_id ON payment_events_archive(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_archive_created_at ON payment_events_archive(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_events_archive_archived_at ON payment_events_archive(archived_at);

-- Create views
CREATE OR REPLACE VIEW public.donations_aggregates AS
SELECT 
  COUNT(*) as total_donations,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') as last_24h_count,
  MAX(amount) as highest_donation,
  SUM(amount) as total_amount
FROM public.donations;

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

-- Enable RLS on all tables
ALTER TABLE public.veterans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events_archive ENABLE ROW LEVEL SECURITY;

-- Note: users, activity_log, and email_logs already have RLS enabled
