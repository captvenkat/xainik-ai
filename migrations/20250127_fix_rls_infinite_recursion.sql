-- Fix RLS Infinite Recursion
-- Migration: 20250127_fix_rls_infinite_recursion.sql

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

-- Create new RLS policies that don't cause infinite recursion

-- Users table: owner can manage own profile, no admin check (to avoid recursion)
CREATE POLICY "Users can manage own profile" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Veterans: owner can manage own profile
CREATE POLICY "Veterans can manage own profile" ON public.veterans
  FOR ALL USING (auth.uid() = user_id);

-- Recruiters: owner can manage own profile  
CREATE POLICY "Recruiters can manage own profile" ON public.recruiters
  FOR ALL USING (auth.uid() = user_id);

-- Supporters: owner can manage own profile
CREATE POLICY "Supporters can manage own profile" ON public.supporters
  FOR ALL USING (auth.uid() = user_id);

-- Pitches: public can view active pitches, owner can manage own
CREATE POLICY "Public can view active pitches" ON public.pitches
  FOR SELECT USING (is_active = true AND plan_expires_at > now());
CREATE POLICY "Veterans can manage own pitches" ON public.pitches
  FOR ALL USING (auth.uid() = veteran_id);

-- Endorsements: signed-in users can endorse
CREATE POLICY "Signed-in users can endorse" ON public.endorsements
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Public can view endorsements" ON public.endorsements
  FOR SELECT USING (true);

-- Referrals: owner can manage own
CREATE POLICY "Supporters can manage own referrals" ON public.referrals
  FOR ALL USING (auth.uid() = supporter_id);

-- Referral events: owner can manage own
CREATE POLICY "Supporters can manage own referral events" ON public.referral_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.referrals r WHERE r.id = referral_id AND r.supporter_id = auth.uid())
  );

-- Shared pitches: owner can manage own
CREATE POLICY "Supporters can manage own shared pitches" ON public.shared_pitches
  FOR ALL USING (auth.uid() = supporter_id);

-- Donations: public can view
CREATE POLICY "Public can view donations" ON public.donations
  FOR SELECT USING (true);

-- Activity log: public can view recent
CREATE POLICY "Public can view recent activity" ON public.activity_log
  FOR SELECT USING (true);

-- Resume requests: owner can manage own
CREATE POLICY "Recruiters can manage own requests" ON public.resume_requests
  FOR ALL USING (auth.uid() = recruiter_id);
CREATE POLICY "Veterans can view own requests" ON public.resume_requests
  FOR SELECT USING (auth.uid() = veteran_id);

-- Notifications: owner can manage own
CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- Notification prefs: owner can manage own
CREATE POLICY "Users can manage own notification prefs" ON public.notification_prefs
  FOR ALL USING (auth.uid() = user_id);

-- Email logs: owner can view own
CREATE POLICY "Users can view own email logs" ON public.email_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Recruiter notes: owner can manage own
CREATE POLICY "Recruiters can manage own notes" ON public.recruiter_notes
  FOR ALL USING (auth.uid() = recruiter_id);

-- Recruiter saved filters: owner can manage own
CREATE POLICY "Recruiters can manage own saved filters" ON public.recruiter_saved_filters
  FOR ALL USING (auth.uid() = recruiter_id);

-- Payment events archive: no public access needed
CREATE POLICY "No public access to payment events archive" ON payment_events_archive
  FOR ALL USING (false);

-- Note: For admin functionality, we'll need to implement it differently
-- Options:
-- 1. Use JWT claims for admin role
-- 2. Create a separate admin table
-- 3. Use service role key for admin operations
-- 4. Disable RLS for admin operations and handle security at application level
