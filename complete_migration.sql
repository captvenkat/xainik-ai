-- Complete Database Schema & RLS Migration
-- Migration: 20250127_complete_schema_rls.sql
-- Aligns schema with xainik-site-spec.md section 3

-- 1. USERS TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
  locations_preferred text[] -- up to 3 City, Country
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
  skills text[] NOT NULL, -- exactly 3 items
  job_type text NOT NULL, -- full-time, part-time, freelance, consulting, hybrid, project-based, remote, on-site
  location text NOT NULL, -- City, Country (display city only on card)
  availability text NOT NULL, -- Immediate/30/60/90
  photo_url text,
  phone text NOT NULL,
  likes_count int DEFAULT 0,
  is_active boolean DEFAULT true,
  plan_tier text, -- 'trial_14','plan_30','plan_60','plan_90'
  plan_expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 6. ENDORSEMENTS
CREATE TABLE IF NOT EXISTS public.endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  veteran_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  endorser_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  text text, -- optional Why I recommend (<=150 chars)
  created_at timestamptz DEFAULT now(),
  UNIQUE (veteran_id, endorser_id)
);

-- 7. REFERRALS (unique per supporter+pitch)
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  share_link text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (supporter_id, pitch_id)
);

-- 8. REFERRAL EVENTS (attribution + platform)
CREATE TABLE IF NOT EXISTS public.referral_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid REFERENCES public.referrals(id) ON DELETE CASCADE,
  event_type text CHECK (event_type IN ('LINK_OPENED','PITCH_VIEWED','CALL_CLICKED','EMAIL_CLICKED','SHARE_RESHARED','SIGNUP_FROM_REFERRAL')) NOT NULL,
  platform text, -- whatsapp, linkedin, email, direct
  user_agent text,
  country text,
  ip_hash text,
  occurred_at timestamptz DEFAULT now()
);

-- 9. OPTIONAL CACHE: SHARED PITCH AGGREGATES
CREATE TABLE IF NOT EXISTS public.shared_pitches (
  supporter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  share_link text NOT NULL,
  click_count int DEFAULT 0,
  PRIMARY KEY (supporter_id, pitch_id)
);

-- 10. DONATIONS (platform-wide)
CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  created_at timestamptz DEFAULT now()
);

-- 11. ACTIVITY LOG (FOMO ticker)
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL, -- veteran_joined, pitch_referred, recruiter_called, endorsement_added, like_added, donation_received
  meta jsonb,          -- {veteran_name, supporter_name, recruiter_name, amount, pitch_title, ...}
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

-- 15. EMAIL LOGS (for observability)
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

-- 16. INDEXES for query performance
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

-- 17. HELPFUL VIEWS

-- Donation aggregates view
CREATE OR REPLACE VIEW public.donations_aggregates AS
SELECT 
  COUNT(*) as total_donations,
  SUM(amount) as total_amount,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
  SUM(amount) FILTER (WHERE created_at >= CURRENT_DATE) as today_amount,
  MAX(amount) as highest_donation,
  MAX(created_at) as last_donation_at
FROM public.donations;

-- Activity ticker view (last 50 events)
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

-- Plan expiry candidates view
CREATE OR REPLACE VIEW public.plan_expiry_candidates AS
SELECT 
  p.id as pitch_id,
  p.title,
  p.plan_tier,
  p.plan_expires_at,
  u.name as veteran_name,
  u.email as veteran_email,
  CASE 
    WHEN p.plan_expires_at <= now() THEN 'EXPIRED'
    WHEN p.plan_expires_at <= now() + interval '3 days' THEN 'EXPIRING_SOON'
    ELSE 'ACTIVE'
  END as expiry_status
FROM public.pitches p
JOIN public.users u ON p.veteran_id = u.id
WHERE p.is_active = true 
  AND p.plan_expires_at IS NOT NULL
ORDER BY p.plan_expires_at ASC;

-- 18. HELPFUL RPCs

-- Get endorsement count for a veteran
CREATE OR REPLACE FUNCTION public.get_endorsement_count(veteran_uuid uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM public.endorsements 
    WHERE veteran_id = veteran_uuid
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Get referral stats for a supporter
CREATE OR REPLACE FUNCTION public.get_supporter_referral_stats(supporter_uuid uuid)
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'total_referrals', COUNT(r.id),
      'total_clicks', COALESCE(SUM(sp.click_count), 0),
      'recent_events', (
        SELECT json_agg(json_build_object(
          'event_type', re.event_type,
          'platform', re.platform,
          'occurred_at', re.occurred_at
        ))
        FROM public.referral_events re
        JOIN public.referrals r2 ON re.referral_id = r2.id
        WHERE r2.supporter_id = supporter_uuid
        ORDER BY re.occurred_at DESC
        LIMIT 10
      )
    )
    FROM public.referrals r
    LEFT JOIN public.shared_pitches sp ON r.supporter_id = sp.supporter_id AND r.pitch_id = sp.pitch_id
    WHERE r.supporter_id = supporter_uuid
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- 19. RLS POLICIES

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

-- Users: owner read/write, admin override
CREATE POLICY "Users can manage own profile" ON public.users
  FOR ALL USING (auth.uid() = id);
CREATE POLICY "Admin can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Veterans/Recruiters/Supporters: owner read/write, admin all
CREATE POLICY "Veterans can manage own profile" ON public.veterans
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage veterans" ON public.veterans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Recruiters can manage own profile" ON public.recruiters
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage recruiters" ON public.recruiters
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Supporters can manage own profile" ON public.supporters
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage supporters" ON public.supporters
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Pitches: public read active, owner insert/update, admin all
CREATE POLICY "Public can view active pitches" ON public.pitches
  FOR SELECT USING (is_active = true AND plan_expires_at > now());
CREATE POLICY "Veterans can manage own pitches" ON public.pitches
  FOR ALL USING (auth.uid() = veteran_id);
CREATE POLICY "Admin can manage all pitches" ON public.pitches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Endorsements: signed-in insert, unique per (veteran_id, endorser_id)
CREATE POLICY "Signed-in users can endorse" ON public.endorsements
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Veterans can view own endorsements" ON public.endorsements
  FOR SELECT USING (auth.uid() = veteran_id);
CREATE POLICY "Admin can manage endorsements" ON public.endorsements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Referrals: supporter own, admin all
CREATE POLICY "Supporters can manage own referrals" ON public.referrals
  FOR ALL USING (auth.uid() = supporter_id);
CREATE POLICY "Admin can manage referrals" ON public.referrals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Referral events: supporter via join, veteran via pitch join, admin all
CREATE POLICY "Supporters can view own referral events" ON public.referral_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.referrals r 
      WHERE r.id = referral_events.referral_id AND r.supporter_id = auth.uid()
    )
  );
CREATE POLICY "Veterans can view events for own pitches" ON public.referral_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.referrals r 
      JOIN public.pitches p ON r.pitch_id = p.id
      WHERE r.id = referral_events.referral_id AND p.veteran_id = auth.uid()
    )
  );
CREATE POLICY "Admin can manage referral events" ON public.referral_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Shared pitches: supporter own, admin all
CREATE POLICY "Supporters can manage own shared pitches" ON public.shared_pitches
  FOR ALL USING (auth.uid() = supporter_id);
CREATE POLICY "Admin can manage shared pitches" ON public.shared_pitches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Donations: public aggregates via view, admin full access
CREATE POLICY "Admin can manage donations" ON public.donations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Activity log: public last N via view, admin full access
CREATE POLICY "Admin can manage activity log" ON public.activity_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Resume requests: recruiter own, veteran own, admin all
CREATE POLICY "Recruiters can manage own requests" ON public.resume_requests
  FOR ALL USING (auth.uid() = recruiter_id);
CREATE POLICY "Veterans can view own requests" ON public.resume_requests
  FOR SELECT USING (auth.uid() = veteran_id);
CREATE POLICY "Admin can manage resume requests" ON public.resume_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Notifications: user own, admin all
CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage notifications" ON public.notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Notification prefs: user own, admin all
CREATE POLICY "Users can manage own notification prefs" ON public.notification_prefs
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage notification prefs" ON public.notification_prefs
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

-- 20. SEED DATA (dev only)
-- Insert sample data for development/testing

-- Sample users
INSERT INTO public.users (id, email, name, phone, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'veteran1@test.com', 'Col. Raghav Mehta (Retd.)', '+91XXXXXXXXXX', 'veteran'),
  ('550e8400-e29b-41d4-a716-446655440002', 'veteran2@test.com', 'Lt. Priya Singh (Retd.)', '+91XXXXXXXXXX', 'veteran'),
  ('550e8400-e29b-41d4-a716-446655440003', 'recruiter1@test.com', 'Ananya Kapoor', '+91XXXXXXXXXX', 'recruiter'),
  ('550e8400-e29b-41d4-a716-446655440004', 'supporter1@test.com', 'Amit Sharma', '+91XXXXXXXXXX', 'supporter'),
  ('550e8400-e29b-41d4-a716-446655440005', 'admin@xainik.com', 'Admin User', '+91XXXXXXXXXX', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Sample veterans
INSERT INTO public.veterans (user_id, rank, service_branch, years_experience, location_current, locations_preferred) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Colonel', 'Indian Army', 22, 'Delhi, India', ARRAY['Mumbai, India', 'Bengaluru, India', 'Pune, India']),
  ('550e8400-e29b-41d4-a716-446655440002', 'Lieutenant', 'Indian Navy', 8, 'Mumbai, India', ARRAY['Delhi, India', 'Chennai, India'])
ON CONFLICT (user_id) DO NOTHING;

-- Sample recruiters
INSERT INTO public.recruiters (user_id, company_name, industry) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'TechCorp India', 'Technology')
ON CONFLICT (user_id) DO NOTHING;

-- Sample supporters
INSERT INTO public.supporters (user_id, intro) VALUES
  ('550e8400-e29b-41d4-a716-446655440004', 'Passionate about supporting veterans in their transition to civilian careers.')
ON CONFLICT (user_id) DO NOTHING;

-- Sample pitches
INSERT INTO public.pitches (veteran_id, title, pitch_text, skills, job_type, location, availability, phone, is_active, plan_tier, plan_expires_at, likes_count) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Operations Lead — 22 yrs, Indian Army', 'Led 500+ personnel across complex logistics ops in 3 regions. Immediate joiner; excels in crisis mgmt, vendor ops, cross-functional delivery. Ready to drive outcomes now.', ARRAY['Logistics', 'Operations', 'Leadership'], 'Full-Time', 'Delhi, India', 'Immediate', '+91XXXXXXXXXX', true, 'plan_30', now() + interval '25 days', 5),
  ('550e8400-e29b-41d4-a716-446655440002', 'Project Manager — 8 yrs, Indian Navy', 'Managed critical naval infrastructure projects worth ₹50Cr+. Expert in stakeholder mgmt, risk mitigation, agile delivery. Available in 30 days.', ARRAY['Project Management', 'Stakeholder Management', 'Risk Mitigation'], 'Full-Time', 'Mumbai, India', '30 days', '+91XXXXXXXXXX', true, 'plan_60', now() + interval '45 days', 3),
  ('550e8400-e29b-41d4-a716-446655440001', 'Consulting Advisor — Military Experience', 'Strategic advisor with deep military background. Specializes in defense consulting, security protocols, crisis management. Available for project-based work.', ARRAY['Strategic Planning', 'Security', 'Consulting'], 'Consulting', 'Delhi, India', '60 days', '+91XXXXXXXXXX', false, 'plan_30', now() - interval '5 days', 1)
ON CONFLICT DO NOTHING;

-- Sample endorsements (to test verified badge)
INSERT INTO public.endorsements (veteran_id, endorser_id, text) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'Exceptional leader with proven track record in complex operations.'),
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Outstanding strategic thinking and execution capabilities.'),
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Highly recommend for any leadership role.')
ON CONFLICT DO NOTHING;

-- Sample activity log events for ticker
INSERT INTO public.activity_log (event, meta) VALUES
  ('veteran_joined', '{"veteran_name": "Col. Raghav Mehta (Retd.)"}'),
  ('donation_received', '{"amount": 500}'),
  ('pitch_referred', '{"supporter_name": "Amit Sharma", "veteran_name": "Col. Raghav Mehta (Retd.)"}'),
  ('endorsement_added', '{"endorser_name": "Amit Sharma", "veteran_name": "Col. Raghav Mehta (Retd.)"}'),
  ('like_added', '{"pitch_title": "Operations Lead — 22 yrs, Indian Army"}'),
  ('recruiter_called', '{"recruiter_name": "Ananya Kapoor", "veteran_name": "Col. Raghav Mehta (Retd.)"}')
ON CONFLICT DO NOTHING;

-- Sample donations
INSERT INTO public.donations (donor_name, amount) VALUES
  ('Anonymous', 500),
  ('Amit Sharma', 1000),
  ('Anonymous', 250)
ON CONFLICT DO NOTHING;
-- Add recruiter_notes table for dashboard functionality
-- Migration: 20250127_add_recruiter_notes.sql

-- Create recruiter_notes table
CREATE TABLE IF NOT EXISTS public.recruiter_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_recruiter_notes_recruiter ON public.recruiter_notes(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_notes_pitch ON public.recruiter_notes(pitch_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_notes_created ON public.recruiter_notes(created_at DESC);

-- Add RLS policies
ALTER TABLE public.recruiter_notes ENABLE ROW LEVEL SECURITY;

-- Recruiter can only see their own notes
CREATE POLICY "recruiter_notes_select_policy" ON public.recruiter_notes
  FOR SELECT USING (recruiter_id = auth.uid());

-- Recruiter can insert their own notes
CREATE POLICY "recruiter_notes_insert_policy" ON public.recruiter_notes
  FOR INSERT WITH CHECK (recruiter_id = auth.uid());

-- Recruiter can update their own notes
CREATE POLICY "recruiter_notes_update_policy" ON public.recruiter_notes
  FOR UPDATE USING (recruiter_id = auth.uid());

-- Recruiter can delete their own notes
CREATE POLICY "recruiter_notes_delete_policy" ON public.recruiter_notes
  FOR DELETE USING (recruiter_id = auth.uid());

-- Admin can see all notes
CREATE POLICY "recruiter_notes_admin_policy" ON public.recruiter_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
-- Add recruiter saved filters table
-- Migration: 20250127_add_recruiter_saved_filters.sql

CREATE TABLE IF NOT EXISTS public.recruiter_saved_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  filters jsonb NOT NULL, -- Store filter criteria as JSON
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.recruiter_saved_filters ENABLE ROW LEVEL SECURITY;

-- Recruiters can only see their own saved filters
CREATE POLICY "recruiters_can_manage_own_filters" ON public.recruiter_saved_filters
  FOR ALL USING (recruiter_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_recruiter_saved_filters_recruiter ON public.recruiter_saved_filters(recruiter_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recruiter_saved_filters_updated_at 
  BEFORE UPDATE ON public.recruiter_saved_filters 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Payment Events Archive Table
-- Migration: 20250127_payment_events_archive.sql

-- Create archive table with same structure as payment_events
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

-- Create indexes for archive table
CREATE INDEX IF NOT EXISTS idx_payment_events_archive_event_id ON payment_events_archive(event_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_archive_payment_id ON payment_events_archive(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_archive_order_id ON payment_events_archive(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_archive_created_at ON payment_events_archive(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_events_archive_archived_at ON payment_events_archive(archived_at);

-- RLS policies for archive table (admin only)
ALTER TABLE payment_events_archive ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage payment events archive" ON payment_events_archive
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
