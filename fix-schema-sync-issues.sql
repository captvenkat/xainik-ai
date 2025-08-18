-- Fix Schema Synchronization Issues
-- This migration fixes all the issues identified in the recheck

BEGIN;

-- 1. Fix column name inconsistencies
-- Fix pitches table - change user_id to veteran_id
ALTER TABLE public.pitches RENAME COLUMN user_id TO veteran_id;

-- Fix endorsements table - change user_id to veteran_id and endorser_user_id to endorser_id
ALTER TABLE public.endorsements RENAME COLUMN user_id TO veteran_id;
ALTER TABLE public.endorsements RENAME COLUMN endorser_user_id TO endorser_id;

-- 2. Add missing columns
-- Add missing columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add missing columns to pitches table
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add missing columns to other tables
ALTER TABLE public.endorsements ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.shares ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.email_logs ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add missing columns to profile tables
ALTER TABLE public.veterans ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.recruiters ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.supporters ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 3. Create missing view
CREATE OR REPLACE VIEW public.community_suggestions_summary AS
SELECT 
  cs.id,
  cs.title,
  cs.description,
  cs.suggestion_type,
  cs.status,
  cs.priority,
  cs.votes,
  'User' as user_name,
  cs.created_at,
  cs.updated_at
FROM public.community_suggestions cs
ORDER BY cs.votes DESC, cs.created_at DESC;

-- 4. Update foreign key constraints to match new column names
-- Drop existing foreign key constraints
ALTER TABLE public.pitches DROP CONSTRAINT IF EXISTS pitches_user_id_fkey;
ALTER TABLE public.endorsements DROP CONSTRAINT IF EXISTS endorsements_user_id_fkey;
ALTER TABLE public.endorsements DROP CONSTRAINT IF EXISTS endorsements_endorser_user_id_fkey;

-- Add new foreign key constraints
ALTER TABLE public.pitches ADD CONSTRAINT pitches_veteran_id_fkey 
  FOREIGN KEY (veteran_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.endorsements ADD CONSTRAINT endorsements_veteran_id_fkey 
  FOREIGN KEY (veteran_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.endorsements ADD CONSTRAINT endorsements_endorser_id_fkey 
  FOREIGN KEY (endorser_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pitches_veteran_id ON public.pitches(veteran_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_veteran_id ON public.endorsements(veteran_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_endorser_id ON public.endorsements(endorser_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_pitch_id ON public.likes(pitch_id);
CREATE INDEX IF NOT EXISTS idx_shares_user_id ON public.shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_pitch_id ON public.shares(pitch_id);

-- 6. Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_invitation_summary ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
-- Users can view all users
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Veterans can view all veteran profiles
CREATE POLICY "Veterans can view all veteran profiles" ON public.veterans FOR SELECT USING (true);

-- Users can update their own veteran profile
CREATE POLICY "Users can update own veteran profile" ON public.veterans FOR UPDATE USING (auth.uid() = user_id);

-- Recruiters can view all recruiter profiles
CREATE POLICY "Recruiters can view all recruiter profiles" ON public.recruiters FOR SELECT USING (true);

-- Users can update their own recruiter profile
CREATE POLICY "Users can update own recruiter profile" ON public.recruiters FOR UPDATE USING (auth.uid() = user_id);

-- Supporters can view all supporter profiles
CREATE POLICY "Supporters can view all supporter profiles" ON public.supporters FOR SELECT USING (true);

-- Users can update their own supporter profile
CREATE POLICY "Users can update own supporter profile" ON public.supporters FOR UPDATE USING (auth.uid() = user_id);

-- Pitches can be viewed by all
CREATE POLICY "Pitches can be viewed by all" ON public.pitches FOR SELECT USING (true);

-- Veterans can create and update their own pitches
CREATE POLICY "Veterans can create own pitches" ON public.pitches FOR INSERT WITH CHECK (auth.uid() = veteran_id);
CREATE POLICY "Veterans can update own pitches" ON public.pitches FOR UPDATE USING (auth.uid() = veteran_id);

-- Endorsements can be viewed by all
CREATE POLICY "Endorsements can be viewed by all" ON public.endorsements FOR SELECT USING (true);

-- Users can create endorsements
CREATE POLICY "Users can create endorsements" ON public.endorsements FOR INSERT WITH CHECK (auth.uid() = endorser_id);

-- Likes can be viewed by all
CREATE POLICY "Likes can be viewed by all" ON public.likes FOR SELECT USING (true);

-- Users can create and delete their own likes
CREATE POLICY "Users can create own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Shares can be viewed by all
CREATE POLICY "Shares can be viewed by all" ON public.shares FOR SELECT USING (true);

-- Users can create their own shares
CREATE POLICY "Users can create own shares" ON public.shares FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referrals can be viewed by all
CREATE POLICY "Referrals can be viewed by all" ON public.referrals FOR SELECT USING (true);

-- Supporters can create referrals
CREATE POLICY "Supporters can create referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = supporter_id);

-- Community suggestions can be viewed by all
CREATE POLICY "Community suggestions can be viewed by all" ON public.community_suggestions FOR SELECT USING (true);

-- Users can create community suggestions
CREATE POLICY "Users can create community suggestions" ON public.community_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mission invitation summary can be viewed by all
CREATE POLICY "Mission invitation summary can be viewed by all" ON public.mission_invitation_summary FOR SELECT USING (true);

-- Users can update their own mission invitation summary
CREATE POLICY "Users can update own mission invitation summary" ON public.mission_invitation_summary FOR UPDATE USING (auth.uid() = user_id);

-- 8. Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.veterans TO authenticated;
GRANT ALL ON public.recruiters TO authenticated;
GRANT ALL ON public.supporters TO authenticated;
GRANT ALL ON public.pitches TO authenticated;
GRANT ALL ON public.endorsements TO authenticated;
GRANT ALL ON public.likes TO authenticated;
GRANT ALL ON public.shares TO authenticated;
GRANT ALL ON public.referrals TO authenticated;
GRANT ALL ON public.community_suggestions TO authenticated;
GRANT ALL ON public.mission_invitation_summary TO authenticated;
GRANT SELECT ON public.community_suggestions_summary TO authenticated;

-- 9. Refresh schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
