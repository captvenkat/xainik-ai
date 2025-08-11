-- Complete Database Schema & RLS Migration - FIXED VERSION
-- Migration: 20250127_complete_schema_rls.sql

-- 1. USERS TABLE (standalone - no foreign key to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  role text CHECK (role IN ('veteran','recruiter','supporter','admin')) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. VETERANS PROFILE
CREATE TABLE IF NOT EXISTS public.veterans (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  rank text,
  service_branch text,
  years_experience int,
  location_current text,
  locations_preferred text[]
);

-- 3. RECRUITERS PROFILE
CREATE TABLE IF NOT EXISTS public.recruiters (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  industry text
);

-- 4. SUPPORTERS PROFILE
CREATE TABLE IF NOT EXISTS public.supporters (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  intro text
);

-- 5. PITCHES
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

-- 6. ENDORSEMENTS
CREATE TABLE IF NOT EXISTS public.endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  veteran_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  endorser_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  text text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (veteran_id, endorser_id)
);

-- 7. REFERRALS
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  share_link text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (supporter_id, pitch_id)
);

-- 8. REFERRAL EVENTS
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

-- 9. SHARED PITCHES
CREATE TABLE IF NOT EXISTS public.shared_pitches (
  supporter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  share_link text NOT NULL,
  click_count int DEFAULT 0,
  PRIMARY KEY (supporter_id, pitch_id)
);

-- 10. DONATIONS
CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  created_at timestamptz DEFAULT now()
);

-- 11. ACTIVITY LOG
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- 12. RESUME REQUESTS
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

-- 13. NOTIFICATIONS
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

-- 14. NOTIFICATION PREFS
CREATE TABLE IF NOT EXISTS public.notification_prefs (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  email_enabled boolean DEFAULT true,
  in_app_enabled boolean DEFAULT true,
  digest_enabled boolean DEFAULT true,
  quiet_hours_start time,
  quiet_hours_end time
);

-- 15. EMAIL LOGS
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

-- 16. RECRUITER NOTES
CREATE TABLE IF NOT EXISTS public.recruiter_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 17. RECRUITER SAVED FILTERS
CREATE TABLE IF NOT EXISTS public.recruiter_saved_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  filters jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 18. PAYMENT EVENTS ARCHIVE
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
CREATE INDEX IF NOT EXISTS idx_activity_log_time ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_event ON public.activity_log(event);
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
  SUM(amount) as total_amount,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
  SUM(amount) FILTER (WHERE created_at >= CURRENT_DATE) as today_amount,
  MAX(amount) as highest_donation,
  MAX(created_at) as last_donation_at
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
    WHEN event = 'like_added' THEN 'Someone liked ' || (meta->>'pitch_title')
    WHEN event = 'donation_received' THEN '₹' || (meta->>'amount')::text || ' donation received'
    ELSE event
  END as display_text
FROM public.activity_log 
ORDER BY created_at DESC 
LIMIT 50;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events_archive ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (admin can access all)
CREATE POLICY "Admin can manage all tables" ON public.users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can manage all tables" ON public.veterans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can manage all tables" ON public.recruiters
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can manage all tables" ON public.supporters
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can manage all tables" ON public.pitches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can manage all tables" ON public.endorsements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can manage all tables" ON public.referrals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can manage all tables" ON public.referral_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can manage all tables" ON public.shared_pitches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can manage all tables" ON public.donations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can manage all tables" ON public.activity_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can manage all tables" ON public.resume_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can manage all tables" ON public.notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can manage all tables" ON public.notification_prefs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can manage all tables" ON public.email_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can manage all tables" ON public.recruiter_notes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can manage all tables" ON public.recruiter_saved_filters
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can manage all tables" ON payment_events_archive
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Sample data can be added later when needed
