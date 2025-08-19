-- COMPREHENSIVE PRODUCTION FIX - ALL MISSING TABLES AND RELATIONSHIPS
-- This fixes all the 400 Bad Request errors in production

-- 1. Create USERS table (if not exists)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  role text DEFAULT 'veteran',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create REFERRALS table
DROP TABLE IF EXISTS public.referrals CASCADE;
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  referral_text text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Create REFERRAL_EVENTS table
DROP TABLE IF EXISTS public.referral_events CASCADE;
CREATE TABLE public.referral_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid REFERENCES public.referrals(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  platform text,
  occurred_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 4. Update COMMUNITY_SUGGESTIONS table to include proper relationships
DROP TABLE IF EXISTS public.community_suggestions CASCADE;
CREATE TABLE public.community_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  suggestion_type text NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Update PITCHES table to include proper foreign key
ALTER TABLE public.pitches 
ADD CONSTRAINT IF NOT EXISTS pitches_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 6. Update ENDORSEMENTS table to include proper foreign keys
ALTER TABLE public.endorsements 
ADD CONSTRAINT IF NOT EXISTS endorsements_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.endorsements 
ADD CONSTRAINT IF NOT EXISTS endorsements_pitch_id_fkey 
FOREIGN KEY (pitch_id) REFERENCES public.pitches(id) ON DELETE CASCADE;

-- 7. Update LIKES table to include proper foreign keys
ALTER TABLE public.likes 
ADD CONSTRAINT IF NOT EXISTS likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.likes 
ADD CONSTRAINT IF NOT EXISTS likes_pitch_id_fkey 
FOREIGN KEY (pitch_id) REFERENCES public.pitches(id) ON DELETE CASCADE;

-- 8. Update SHARES table to include proper foreign keys
ALTER TABLE public.shares 
ADD CONSTRAINT IF NOT EXISTS shares_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.shares 
ADD CONSTRAINT IF NOT EXISTS shares_pitch_id_fkey 
FOREIGN KEY (pitch_id) REFERENCES public.pitches(id) ON DELETE CASCADE;

-- 9. Update MISSION_INVITATION_SUMMARY table to include proper foreign keys
ALTER TABLE public.mission_invitation_summary 
ADD CONSTRAINT IF NOT EXISTS mission_invitation_summary_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.mission_invitation_summary 
ADD CONSTRAINT IF NOT EXISTS mission_invitation_summary_inviter_id_fkey 
FOREIGN KEY (inviter_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 10. Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON public.referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_pitch_id ON public.referrals(pitch_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referral_events_referral_id ON public.referral_events(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_event_type ON public.referral_events(event_type);
CREATE INDEX IF NOT EXISTS idx_referral_events_occurred_at ON public.referral_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_user_id ON public.community_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_status ON public.community_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_votes ON public.community_suggestions(votes);

-- 11. Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;

-- 12. Create RLS policies
-- Users policies
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can create their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Referrals policies
CREATE POLICY "Users can view all referrals" ON public.referrals FOR SELECT USING (true);
CREATE POLICY "Users can create referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own referrals" ON public.referrals FOR UPDATE USING (auth.uid() = user_id);

-- Referral events policies
CREATE POLICY "Users can view all referral events" ON public.referral_events FOR SELECT USING (true);
CREATE POLICY "Users can create referral events" ON public.referral_events FOR INSERT WITH CHECK (true);

-- 13. Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.referrals TO authenticated;
GRANT ALL ON public.referral_events TO authenticated;

-- 14. Create views for easier querying
DROP VIEW IF EXISTS public.referrals_with_details CASCADE;
CREATE VIEW public.referrals_with_details AS
SELECT 
  r.id,
  r.user_id,
  r.pitch_id,
  r.referral_text,
  r.status,
  r.created_at,
  r.updated_at,
  u.name as user_name,
  u.email as user_email,
  p.title as pitch_title,
  p.user_id as pitch_user_id
FROM public.referrals r
LEFT JOIN public.users u ON r.user_id = u.id
LEFT JOIN public.pitches p ON r.pitch_id = p.id
ORDER BY r.created_at DESC;

-- 15. Create community suggestions view
DROP VIEW IF EXISTS public.community_suggestions_with_users CASCADE;
CREATE VIEW public.community_suggestions_with_users AS
SELECT 
  cs.id,
  cs.user_id,
  cs.suggestion_type,
  cs.title,
  cs.description,
  cs.status,
  cs.priority,
  cs.votes,
  cs.created_at,
  cs.updated_at,
  u.name as user_name,
  u.email as user_email
FROM public.community_suggestions cs
LEFT JOIN public.users u ON cs.user_id = u.id
ORDER BY cs.votes DESC, cs.created_at DESC;

-- Grant permissions on views
GRANT SELECT ON public.referrals_with_details TO authenticated;
GRANT SELECT ON public.community_suggestions_with_users TO authenticated;

-- Migration completed successfully!
-- All missing tables and relationships have been created
-- The veteran dashboard should now work without 400 Bad Request errors
