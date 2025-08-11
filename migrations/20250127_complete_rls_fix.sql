-- Complete RLS Fix - Allow Dashboard Access Without Infinite Recursion
-- Migration: 20250127_complete_rls_fix.sql

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

-- Also drop the simple policies we created earlier
DROP POLICY IF EXISTS "Users can manage own profile" ON public.users;
DROP POLICY IF EXISTS "Veterans can manage own profile" ON public.veterans;
DROP POLICY IF EXISTS "Recruiters can manage own profile" ON public.recruiters;
DROP POLICY IF EXISTS "Supporters can manage own profile" ON public.supporters;
DROP POLICY IF EXISTS "Users can manage own notification prefs" ON public.notification_prefs;
DROP POLICY IF EXISTS "Public can view recent activity" ON public.activity_log;
DROP POLICY IF EXISTS "Public can view donations" ON public.donations;

-- Create comprehensive RLS policies that allow dashboard access

-- 1. Users table: owner can manage own profile
CREATE POLICY "Users can manage own profile" ON public.users
  FOR ALL USING (auth.uid() = id);

-- 2. Veterans: owner can manage own profile
CREATE POLICY "Veterans can manage own profile" ON public.veterans
  FOR ALL USING (auth.uid() = user_id);

-- 3. Recruiters: owner can manage own profile  
CREATE POLICY "Recruiters can manage own profile" ON public.recruiters
  FOR ALL USING (auth.uid() = user_id);

-- 4. Supporters: owner can manage own profile
CREATE POLICY "Supporters can manage own profile" ON public.supporters
  FOR ALL USING (auth.uid() = user_id);

-- 5. Pitches: public can view active pitches, owner can manage own
CREATE POLICY "Public can view active pitches" ON public.pitches
  FOR SELECT USING (is_active = true AND plan_expires_at > now());
CREATE POLICY "Veterans can manage own pitches" ON public.pitches
  FOR ALL USING (auth.uid() = veteran_id);

-- 6. Endorsements: signed-in users can endorse, public can view
CREATE POLICY "Signed-in users can endorse" ON public.endorsements
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Public can view endorsements" ON public.endorsements
  FOR SELECT USING (true);

-- 7. Referrals: owner can manage own
CREATE POLICY "Supporters can manage own referrals" ON public.referrals
  FOR ALL USING (auth.uid() = supporter_id);

-- 8. Referral events: owner can manage own
CREATE POLICY "Supporters can manage own referral events" ON public.referral_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.referrals r WHERE r.id = referral_id AND r.supporter_id = auth.uid())
  );

-- 9. Shared pitches: owner can manage own
CREATE POLICY "Supporters can manage own shared pitches" ON public.shared_pitches
  FOR ALL USING (auth.uid() = supporter_id);

-- 10. Donations: public can view
CREATE POLICY "Public can view donations" ON public.donations
  FOR SELECT USING (true);

-- 11. Activity log: public can view recent
CREATE POLICY "Public can view recent activity" ON public.activity_log
  FOR SELECT USING (true);

-- 12. Resume requests: owner can manage own
CREATE POLICY "Recruiters can manage own requests" ON public.resume_requests
  FOR ALL USING (auth.uid() = recruiter_id);
CREATE POLICY "Veterans can view own requests" ON public.resume_requests
  FOR SELECT USING (auth.uid() = veteran_id);

-- 13. Notifications: owner can manage own
CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- 14. Notification prefs: owner can manage own
CREATE POLICY "Users can manage own notification prefs" ON public.notification_prefs
  FOR ALL USING (auth.uid() = user_id);

-- 15. Email logs: owner can view own
CREATE POLICY "Users can view own email logs" ON public.email_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 16. Recruiter notes: owner can manage own
CREATE POLICY "Recruiters can manage own notes" ON public.recruiter_notes
  FOR ALL USING (auth.uid() = recruiter_id);

-- 17. Recruiter saved filters: owner can manage own
CREATE POLICY "Recruiters can manage own saved filters" ON public.recruiter_saved_filters
  FOR ALL USING (auth.uid() = recruiter_id);

-- 18. Payment events archive: no public access needed
CREATE POLICY "No public access to payment events archive" ON payment_events_archive
  FOR ALL USING (false);

-- 19. CRITICAL: Allow users to read their own role for dashboard access
-- This is safe because it only checks the current user's own row
CREATE POLICY "Users can read own role for dashboard access" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- 20. CRITICAL: Allow users to update their own role
CREATE POLICY "Users can update own role" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Note: For admin functionality, we'll need to implement it differently
-- Options:
-- 1. Use JWT claims for admin role
-- 2. Create a separate admin table
-- 3. Use service role key for admin operations
-- 4. Disable RLS for admin operations and handle security at application level
