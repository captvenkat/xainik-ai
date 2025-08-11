-- Simple RLS Fix - Only Use Columns That Actually Exist
-- Migration: 20250127_simple_rls_fix.sql

-- Drop all existing RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "Admin can manage all tables" ON public.users;
DROP POLICY IF EXISTS "Admin can manage all tables" ON public.veterans;
DROP POLICY IF EXISTS "Admin can manage all tables" ON public.recruiters;
DROP POLICY IF EXISTS "Admin can manage all tables" ON public.supporters;
DROP POLICY IF EXISTS "Admin can manage all tables" ON public.pitches;
DROP POLICY IF EXISTS "Admin can manage all tables" ON public.endorsements;
DROP POLICY IF EXISTS "Admin can manage all tables" ON public.referrals;
DROP POLICY IF EXISTS "Admin can manage all tables" ON public.referral_events;
DROP POLICY IF EXISTS "Admin can manage all tables" ON public.shared_pitches;
DROP POLICY IF EXISTS "Admin can manage all tables" ON public.donations;
DROP POLICY IF EXISTS "Admin can manage all tables" ON public.activity_log;
DROP POLICY IF EXISTS "Admin can manage all tables" ON public.resume_requests;
DROP POLICY IF EXISTS "Admin can manage all tables" ON public.notifications;
DROP POLICY IF EXISTS "Admin can manage all tables" ON public.notification_prefs;
DROP POLICY IF EXISTS "Admin can manage all tables" ON public.email_logs;
DROP POLICY IF EXISTS "Admin can manage all tables" ON public.recruiter_notes;
DROP POLICY IF EXISTS "Admin can manage all tables" ON public.recruiter_saved_filters;
DROP POLICY IF EXISTS "Admin can manage all tables" ON payment_events_archive;

-- Create ONLY the policies we know will work (using confirmed column names)

-- 1. Users table: owner can manage own profile (NO admin check to avoid recursion)
CREATE POLICY "Users can manage own profile" ON public.users
  FOR ALL USING (auth.uid() = id);

-- 2. Veterans: owner can manage own profile (user_id column confirmed to exist)
CREATE POLICY "Veterans can manage own profile" ON public.veterans
  FOR ALL USING (auth.uid() = user_id);

-- 3. Recruiters: owner can manage own profile (user_id column confirmed to exist)
CREATE POLICY "Recruiters can manage own profile" ON public.recruiters
  FOR ALL USING (auth.uid() = user_id);

-- 4. Supporters: owner can manage own profile (user_id column confirmed to exist)
CREATE POLICY "Supporters can manage own profile" ON public.supporters
  FOR ALL USING (auth.uid() = user_id);

-- 5. Notification prefs: owner can manage own (user_id column confirmed to exist)
CREATE POLICY "Users can manage own notification prefs" ON public.notification_prefs
  FOR ALL USING (auth.uid() = user_id);

-- 6. Activity log: public can view (no user-specific columns needed)
CREATE POLICY "Public can view recent activity" ON public.activity_log
  FOR SELECT USING (true);

-- 7. Donations: public can view (no user-specific columns needed)
CREATE POLICY "Public can view donations" ON public.donations
  FOR SELECT USING (true);

-- Note: We're only creating policies for tables where we confirmed the column names exist
-- Other tables will have RLS enabled but no policies, which means they'll be inaccessible
-- This is safer than guessing column names and causing errors
