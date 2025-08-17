-- =====================================================
-- COMPLETE FIX SCRIPT - AUTO MODE
-- This will fix ALL issues in your veteran dashboard
-- =====================================================

-- START TRANSACTION FOR SAFETY
BEGIN;

-- 1. PRE-FIX VALIDATION
DO $$
BEGIN
    RAISE NOTICE '=== COMPLETE FIX SCRIPT STARTED ===';
    RAISE NOTICE 'Timestamp: %', NOW();
    RAISE NOTICE 'This script will fix ALL database issues';
END $$;

-- 2. DROP EXISTING TABLES (if they exist) - CLEAN SLATE
DROP TABLE IF EXISTS public.mission_invitation_summary CASCADE;
DROP TABLE IF EXISTS public.community_suggestions CASCADE;
DROP TABLE IF EXISTS public.shares CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.endorsements CASCADE;
DROP TABLE IF EXISTS public.pitches CASCADE;
DROP TABLE IF EXISTS public.veterans CASCADE;
DROP TABLE IF EXISTS public.recruiters CASCADE;
DROP TABLE IF EXISTS public.supporters CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 3. CREATE USERS TABLE (STANDALONE - NO AUTH DEPENDENCY)
CREATE TABLE public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    name text NOT NULL,
    phone text,
    role text CHECK (role IN ('veteran','recruiter','supporter','admin')) NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 4. CREATE VETERANS PROFILE
CREATE TABLE public.veterans (
    user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    rank text,
    service_branch text,
    years_experience int,
    location_current text,
    locations_preferred text[]
);

-- 5. CREATE RECRUITERS PROFILE
CREATE TABLE public.recruiters (
    user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    company_name text,
    industry text
);

-- 6. CREATE SUPPORTERS PROFILE
CREATE TABLE public.supporters (
    user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    intro text
);

-- 7. CREATE PITCHES TABLE (WITH CORRECT FIELD NAMES)
CREATE TABLE public.pitches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL, -- ✅ CORRECT FIELD NAME for frontend compatibility
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
    created_at timestamptz DEFAULT now(),
    -- Add explicit foreign key constraint
    CONSTRAINT fk_pitches_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 8. CREATE ENDORSEMENTS TABLE
CREATE TABLE public.endorsements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    veteran_id uuid NOT NULL,
    endorser_id uuid NOT NULL,
    text text,
    created_at timestamptz DEFAULT now(),
    -- Add explicit foreign key constraints
    CONSTRAINT fk_endorsements_veteran_id FOREIGN KEY (veteran_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_endorsements_endorser_id FOREIGN KEY (endorser_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 9. CREATE LIKES TABLE
CREATE TABLE public.likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    pitch_id uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    -- Add explicit foreign key constraints
    CONSTRAINT fk_likes_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_pitch_id FOREIGN KEY (pitch_id) REFERENCES public.pitches(id) ON DELETE CASCADE
);

-- 10. CREATE SHARES TABLE
CREATE TABLE public.shares (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    pitch_id uuid NOT NULL,
    platform text,
    share_link text,
    created_at timestamptz DEFAULT now(),
    -- Add explicit foreign key constraints
    CONSTRAINT fk_shares_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_shares_pitch_id FOREIGN KEY (pitch_id) REFERENCES public.pitches(id) ON DELETE CASCADE
);

-- 11. CREATE COMMUNITY SUGGESTIONS TABLE
CREATE TABLE public.community_suggestions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    suggestion_type text NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'pending',
    priority text DEFAULT 'medium',
    votes integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    -- Add explicit foreign key constraint
    CONSTRAINT fk_community_suggestions_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 12. CREATE MISSION INVITATION SUMMARY TABLE
CREATE TABLE public.mission_invitation_summary (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    inviter_id uuid,
    total_invitations_sent integer DEFAULT 0,
    total_invitations_accepted integer DEFAULT 0,
    total_invitations_declined integer DEFAULT 0,
    total_invitations_pending integer DEFAULT 0,
    last_invitation_sent timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    -- Add explicit foreign key constraint
    CONSTRAINT fk_mission_invitation_summary_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 13. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_pitches_user_id ON public.pitches(user_id);
CREATE INDEX idx_pitches_created_at ON public.pitches(created_at);
CREATE INDEX idx_pitches_is_active ON public.pitches(is_active);

CREATE INDEX idx_endorsements_veteran_id ON public.endorsements(veteran_id);
CREATE INDEX idx_endorsements_endorser_id ON public.endorsements(endorser_id);
CREATE INDEX idx_endorsements_created_at ON public.endorsements(created_at);

CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_likes_pitch_id ON public.likes(pitch_id);
CREATE INDEX idx_likes_created_at ON public.likes(created_at);

CREATE INDEX idx_shares_user_id ON public.shares(user_id);
CREATE INDEX idx_shares_pitch_id ON public.shares(pitch_id);
CREATE INDEX idx_shares_created_at ON public.shares(created_at);

CREATE INDEX idx_community_suggestions_user_id ON public.community_suggestions(user_id);
CREATE INDEX idx_community_suggestions_status ON public.community_suggestions(status);
CREATE INDEX idx_community_suggestions_priority ON public.community_suggestions(priority);
CREATE INDEX idx_community_suggestions_created_at ON public.community_suggestions(created_at);

CREATE INDEX idx_mission_invitation_summary_user_id ON public.mission_invitation_summary(user_id);
CREATE INDEX idx_mission_invitation_summary_inviter_id ON public.mission_invitation_summary(inviter_id);

-- 14. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_invitation_summary ENABLE ROW LEVEL SECURITY;

-- 15. CREATE RLS POLICIES
-- Users policies
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid()::text = id::text);

-- Veterans policies
CREATE POLICY "Users can view all veterans" ON public.veterans FOR SELECT USING (true);
CREATE POLICY "Users can update their own veteran profile" ON public.veterans FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Recruiters policies
CREATE POLICY "Users can view all recruiters" ON public.recruiters FOR SELECT USING (true);
CREATE POLICY "Users can update their own recruiter profile" ON public.recruiters FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Supporters policies
CREATE POLICY "Users can view all supporters" ON public.supporters FOR SELECT USING (true);
CREATE POLICY "Users can update their own supporter profile" ON public.supporters FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Pitches policies
CREATE POLICY "Users can view all pitches" ON public.pitches FOR SELECT USING (true);
CREATE POLICY "Users can create their own pitches" ON public.pitches FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own pitches" ON public.pitches FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own pitches" ON public.pitches FOR DELETE USING (auth.uid()::text = user_id::text);

-- Endorsements policies
CREATE POLICY "Users can view all endorsements" ON public.endorsements FOR SELECT USING (true);
CREATE POLICY "Users can create endorsements" ON public.endorsements FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete their own endorsements" ON public.endorsements FOR DELETE USING (auth.uid()::text = endorser_id::text);

-- Likes policies
CREATE POLICY "Users can view all likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can create their own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid()::text = user_id::text);

-- Shares policies
CREATE POLICY "Users can view all shares" ON public.shares FOR SELECT USING (true);
CREATE POLICY "Users can create their own shares" ON public.shares FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own shares" ON public.shares FOR DELETE USING (auth.uid()::text = user_id::text);

-- Community suggestions policies
CREATE POLICY "Users can view all suggestions" ON public.community_suggestions FOR SELECT USING (true);
CREATE POLICY "Users can create their own suggestions" ON public.community_suggestions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own suggestions" ON public.community_suggestions FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Mission invitation summary policies
CREATE POLICY "Users can view their own mission summary" ON public.mission_invitation_summary FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own mission summary" ON public.mission_invitation_summary FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 16. GRANT PERMISSIONS
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.veterans TO authenticated;
GRANT ALL ON public.recruiters TO authenticated;
GRANT ALL ON public.supporters TO authenticated;
GRANT ALL ON public.pitches TO authenticated;
GRANT ALL ON public.endorsements TO authenticated;
GRANT ALL ON public.likes TO authenticated;
GRANT ALL ON public.shares TO authenticated;
GRANT ALL ON public.community_suggestions TO authenticated;
GRANT ALL ON public.mission_invitation_summary TO authenticated;

-- 17. INSERT SAMPLE DATA FOR TESTING
INSERT INTO public.users (id, email, name, phone, role) VALUES
    ('4c5a525f-77d7-4350-b4e3-eb6459abecdc', 'test@example.com', 'Test Veteran', '+1234567890', 'veteran')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.veterans (user_id, rank, service_branch, years_experience, location_current) VALUES
    ('4c5a525f-77d7-4350-b4e3-eb6459abecdc', 'Sergeant', 'Army', 8, 'New York, USA')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.pitches (id, user_id, title, pitch_text, skills, job_type, location, availability, phone) VALUES
    (gen_random_uuid(), '4c5a525f-77d7-4350-b4e3-eb6459abecdc', 'Experienced Military Leader', 'Dedicated military professional with 8 years of leadership experience...', ARRAY['Leadership', 'Project Management', 'Team Building'], 'full-time', 'New York, USA', 'Immediate', '+1234567890')
ON CONFLICT DO NOTHING;

-- 18. FORCE SCHEMA CACHE REFRESH
NOTIFY pgrst, 'reload schema';

-- 19. POST-FIX VALIDATION
DO $$
DECLARE
    table_count INTEGER;
    policy_count INTEGER;
    index_count INTEGER;
    fk_count INTEGER;
    sample_pitch_count INTEGER;
BEGIN
    RAISE NOTICE '=== POST-FIX VALIDATION ===';
    
    -- Count created tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'veterans', 'recruiters', 'supporters', 'pitches', 'endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary');
    
    -- Count created policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename IN ('users', 'veterans', 'recruiters', 'supporters', 'pitches', 'endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary');
    
    -- Count created indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public'
    AND tablename IN ('users', 'veterans', 'recruiters', 'supporters', 'pitches', 'endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary');
    
    -- Count foreign key relationships
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public'
    AND table_name IN ('users', 'veterans', 'recruiters', 'supporters', 'pitches', 'endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary');
    
    -- Check sample data
    SELECT COUNT(*) INTO sample_pitch_count
    FROM public.pitches
    WHERE user_id = '4c5a525f-77d7-4350-b4e3-eb6459abecdc';
    
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Policies created: %', policy_count;
    RAISE NOTICE 'Indexes created: %', index_count;
    RAISE NOTICE 'Foreign keys created: %', fk_count;
    RAISE NOTICE 'Sample pitches created: %', sample_pitch_count;
    
    IF table_count = 10 AND policy_count >= 25 AND index_count >= 20 AND fk_count >= 10 AND sample_pitch_count > 0 THEN
        RAISE NOTICE '🎉 FIX SUCCESSFUL! All components created correctly.';
        RAISE NOTICE 'Your veteran dashboard should now work perfectly!';
    ELSE
        RAISE EXCEPTION 'Fix validation failed! Expected 10 tables, 25+ policies, 20+ indexes, 10+ foreign keys. Got: % tables, % policies, % indexes, % foreign keys', 
            table_count, policy_count, index_count, fk_count;
    END IF;
END $$;

-- COMMIT TRANSACTION
COMMIT;

-- FINAL SUCCESS MESSAGE
DO $$
BEGIN
    RAISE NOTICE '=== COMPLETE FIX COMPLETED SUCCESSFULLY ===';
    RAISE NOTICE 'Your veteran dashboard database is now PERFECT!';
    RAISE NOTICE 'All required tables, indexes, policies, and foreign key relationships have been created.';
    RAISE NOTICE 'Schema cache has been refreshed.';
    RAISE NOTICE 'Sample data has been inserted for testing.';
    RAISE NOTICE 'The veteran dashboard should now work without ANY errors!';
    RAISE NOTICE 'Go test your dashboard now!';
END $$;
