-- Final Corrected Schema Synchronization Fix
-- Copy and paste this entire script into your Supabase SQL Editor
-- This migration fixes all schema synchronization issues safely

BEGIN;

-- 1. Fix column name inconsistencies (with existence checks)
-- Fix pitches table - change user_id to veteran_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'user_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'veteran_id'
    ) THEN
        ALTER TABLE public.pitches RENAME COLUMN user_id TO veteran_id;
        RAISE NOTICE 'Renamed pitches.user_id to veteran_id';
    ELSE
        RAISE NOTICE 'Pitches table already has correct column structure';
    END IF;
END $$;

-- Fix endorsements table - change user_id to veteran_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'user_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'veteran_id'
    ) THEN
        ALTER TABLE public.endorsements RENAME COLUMN user_id TO veteran_id;
        RAISE NOTICE 'Renamed endorsements.user_id to veteran_id';
    ELSE
        RAISE NOTICE 'Endorsements table already has correct veteran_id column';
    END IF;
END $$;

-- Fix endorsements table - change endorser_user_id to endorser_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'endorser_user_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'endorser_id'
    ) THEN
        ALTER TABLE public.endorsements RENAME COLUMN endorser_user_id TO endorser_id;
        RAISE NOTICE 'Renamed endorsements.endorser_user_id to endorser_id';
    ELSE
        RAISE NOTICE 'Endorsements table already has correct endorser_id column';
    END IF;
END $$;

-- 2. Add missing columns (with existence checks)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
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

-- 4. Update foreign key constraints (with existence checks)
DO $$
BEGIN
    -- Drop existing foreign key constraints if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND constraint_name = 'pitches_user_id_fkey'
    ) THEN
        ALTER TABLE public.pitches DROP CONSTRAINT pitches_user_id_fkey;
        RAISE NOTICE 'Dropped pitches_user_id_fkey constraint';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND constraint_name = 'endorsements_user_id_fkey'
    ) THEN
        ALTER TABLE public.endorsements DROP CONSTRAINT endorsements_user_id_fkey;
        RAISE NOTICE 'Dropped endorsements_user_id_fkey constraint';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND constraint_name = 'endorsements_endorser_user_id_fkey'
    ) THEN
        ALTER TABLE public.endorsements DROP CONSTRAINT endorsements_endorser_user_id_fkey;
        RAISE NOTICE 'Dropped endorsements_endorser_user_id_fkey constraint';
    END IF;
    
    -- Add new foreign key constraints
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'veteran_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND constraint_name = 'pitches_veteran_id_fkey'
    ) THEN
        ALTER TABLE public.pitches ADD CONSTRAINT pitches_veteran_id_fkey 
          FOREIGN KEY (veteran_id) REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added pitches_veteran_id_fkey constraint';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'veteran_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND constraint_name = 'endorsements_veteran_id_fkey'
    ) THEN
        ALTER TABLE public.endorsements ADD CONSTRAINT endorsements_veteran_id_fkey 
          FOREIGN KEY (veteran_id) REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added endorsements_veteran_id_fkey constraint';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'endorser_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND constraint_name = 'endorsements_endorser_id_fkey'
    ) THEN
        ALTER TABLE public.endorsements ADD CONSTRAINT endorsements_endorser_id_fkey 
          FOREIGN KEY (endorser_id) REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added endorsements_endorser_id_fkey constraint';
    END IF;
END $$;

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

-- 7. Create RLS policies (with existence checks) - FIXED VERSION
DO $$
BEGIN
    -- Users policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view all users') THEN
        CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
    END IF;
    
    -- Veterans policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'veterans' AND policyname = 'Veterans can view all veteran profiles') THEN
        CREATE POLICY "Veterans can view all veteran profiles" ON public.veterans FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'veterans' AND policyname = 'Users can update own veteran profile') THEN
        CREATE POLICY "Users can update own veteran profile" ON public.veterans FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    -- Recruiters policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recruiters' AND policyname = 'Recruiters can view all recruiter profiles') THEN
        CREATE POLICY "Recruiters can view all recruiter profiles" ON public.recruiters FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recruiters' AND policyname = 'Users can update own recruiter profile') THEN
        CREATE POLICY "Users can update own recruiter profile" ON public.recruiters FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    -- Supporters policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'supporters' AND policyname = 'Supporters can view all supporter profiles') THEN
        CREATE POLICY "Supporters can view all supporter profiles" ON public.supporters FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'supporters' AND policyname = 'Users can update own supporter profile') THEN
        CREATE POLICY "Users can update own supporter profile" ON public.supporters FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    -- Pitches policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pitches' AND policyname = 'Pitches can be viewed by all') THEN
        CREATE POLICY "Pitches can be viewed by all" ON public.pitches FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pitches' AND policyname = 'Veterans can create own pitches') THEN
        CREATE POLICY "Veterans can create own pitches" ON public.pitches FOR INSERT WITH CHECK (auth.uid() = veteran_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pitches' AND policyname = 'Veterans can update own pitches') THEN
        CREATE POLICY "Veterans can update own pitches" ON public.pitches FOR UPDATE USING (auth.uid() = veteran_id);
    END IF;
    
    -- Endorsements policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'endorsements' AND policyname = 'Endorsements can be viewed by all') THEN
        CREATE POLICY "Endorsements can be viewed by all" ON public.endorsements FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'endorsements' AND policyname = 'Users can create endorsements') THEN
        CREATE POLICY "Users can create endorsements" ON public.endorsements FOR INSERT WITH CHECK (auth.uid() = endorser_id);
    END IF;
    
    -- Likes policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'Likes can be viewed by all') THEN
        CREATE POLICY "Likes can be viewed by all" ON public.likes FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'Users can create own likes') THEN
        CREATE POLICY "Users can create own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'Users can delete own likes') THEN
        CREATE POLICY "Users can delete own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);
    END IF;
    
    -- Shares policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shares' AND policyname = 'Shares can be viewed by all') THEN
        CREATE POLICY "Shares can be viewed by all" ON public.shares FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shares' AND policyname = 'Users can create own shares') THEN
        CREATE POLICY "Users can create own shares" ON public.shares FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    -- Referrals policies - SIMPLIFIED (no supporter_id reference)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'referrals' AND policyname = 'Referrals can be viewed by all') THEN
        CREATE POLICY "Referrals can be viewed by all" ON public.referrals FOR SELECT USING (true);
    END IF;
    
    -- Community suggestions policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_suggestions' AND policyname = 'Community suggestions can be viewed by all') THEN
        CREATE POLICY "Community suggestions can be viewed by all" ON public.community_suggestions FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_suggestions' AND policyname = 'Users can create community suggestions') THEN
        CREATE POLICY "Users can create community suggestions" ON public.community_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    -- Mission invitation summary policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_invitation_summary' AND policyname = 'Mission invitation summary can be viewed by all') THEN
        CREATE POLICY "Mission invitation summary can be viewed by all" ON public.mission_invitation_summary FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_invitation_summary' AND policyname = 'Users can update own mission invitation summary') THEN
        CREATE POLICY "Users can update own mission invitation summary" ON public.mission_invitation_summary FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

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
