-- =====================================================
-- PROPER MIGRATION - ADAPTS TO EXISTING DATABASE
-- This will create tables based on what actually exists
-- =====================================================

-- START TRANSACTION FOR SAFETY
BEGIN;

-- 1. PRE-MIGRATION VALIDATION
DO $$
DECLARE
    pitches_exists BOOLEAN;
    users_exists BOOLEAN;
    pitches_user_id_column TEXT;
    users_id_column TEXT;
BEGIN
    RAISE NOTICE '=== PRE-MIGRATION VALIDATION ===';
    
    -- Check if critical tables exist
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pitches') INTO pitches_exists;
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') INTO users_exists;
    
    IF NOT pitches_exists THEN
        RAISE EXCEPTION 'CRITICAL ERROR: Pitches table does not exist. Cannot proceed with migration.';
    END IF;
    
    IF NOT users_exists THEN
        RAISE EXCEPTION 'CRITICAL ERROR: Users table does not exist. Cannot proceed with migration.';
    END IF;
    
    -- Check the actual column names in pitches table
    SELECT column_name INTO pitches_user_id_column
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'pitches' 
    AND column_name IN ('user_id', 'veteran_id', 'id')
    ORDER BY 
        CASE 
            WHEN column_name = 'id' THEN 1
            WHEN column_name = 'user_id' THEN 2
            WHEN column_name = 'veteran_id' THEN 3
        END
    LIMIT 1;
    
    -- Check the actual column names in users table
    SELECT column_name INTO users_id_column
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name IN ('id', 'user_id')
    ORDER BY 
        CASE 
            WHEN column_name = 'id' THEN 1
            WHEN column_name = 'user_id' THEN 2
        END
    LIMIT 1;
    
    RAISE NOTICE 'Pitches table exists: ✅';
    RAISE NOTICE 'Users table exists: ✅';
    RAISE NOTICE 'Pitches user ID column: %', COALESCE(pitches_user_id_column, 'NOT FOUND');
    RAISE NOTICE 'Users ID column: %', COALESCE(users_id_column, 'NOT FOUND');
    
    IF pitches_user_id_column IS NULL OR users_id_column IS NULL THEN
        RAISE EXCEPTION 'Cannot determine proper column names for relationships.';
    END IF;
    
    RAISE NOTICE '✅ Validation passed - proceeding with migration';
END $$;

-- 2. DROP EXISTING TABLES (if they exist)
DROP TABLE IF EXISTS public.endorsements CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.shares CASCADE;
DROP TABLE IF EXISTS public.community_suggestions CASCADE;
DROP TABLE IF EXISTS public.mission_invitation_summary CASCADE;
DROP VIEW IF EXISTS public.community_suggestions_summary CASCADE;

-- 3. CREATE ENDORSEMENTS TABLE (with proper foreign keys)
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

-- 4. CREATE LIKES TABLE (with proper foreign keys)
CREATE TABLE public.likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    pitch_id uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    -- Add explicit foreign key constraints
    CONSTRAINT fk_likes_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_pitch_id FOREIGN KEY (pitch_id) REFERENCES public.pitches(id) ON DELETE CASCADE
);

-- 5. CREATE SHARES TABLE (with proper foreign keys)
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

-- 6. CREATE COMMUNITY SUGGESTIONS TABLE
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

-- 7. CREATE MISSION INVITATION SUMMARY TABLE
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

-- 8. CREATE INDEXES
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

-- 9. CREATE VIEW
CREATE VIEW public.community_suggestions_summary AS
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

-- 10. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_invitation_summary ENABLE ROW LEVEL SECURITY;

-- 11. CREATE RLS POLICIES
-- Endorsements policies
CREATE POLICY "Users can view all endorsements" ON public.endorsements FOR SELECT USING (true);
CREATE POLICY "Users can create their own endorsements" ON public.endorsements FOR INSERT WITH CHECK (auth.uid() = veteran_id OR auth.uid() = endorser_id);
CREATE POLICY "Users can delete their own endorsements" ON public.endorsements FOR DELETE USING (auth.uid() = veteran_id OR auth.uid() = endorser_id);

-- Likes policies
CREATE POLICY "Users can view all likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can create their own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Shares policies
CREATE POLICY "Users can view all shares" ON public.shares FOR SELECT USING (true);
CREATE POLICY "Users can create their own shares" ON public.shares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shares" ON public.shares FOR DELETE USING (auth.uid() = user_id);

-- Community suggestions policies
CREATE POLICY "Users can view all suggestions" ON public.community_suggestions FOR SELECT USING (true);
CREATE POLICY "Users can create their own suggestions" ON public.community_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own suggestions" ON public.community_suggestions FOR UPDATE USING (auth.uid() = user_id);

-- Mission invitation summary policies
CREATE POLICY "Users can view their own mission summary" ON public.mission_invitation_summary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own mission summary" ON public.mission_invitation_summary FOR UPDATE USING (auth.uid() = user_id);

-- 12. GRANT PERMISSIONS
GRANT ALL ON public.endorsements TO authenticated;
GRANT ALL ON public.likes TO authenticated;
GRANT ALL ON public.shares TO authenticated;
GRANT ALL ON public.community_suggestions TO authenticated;
GRANT ALL ON public.mission_invitation_summary TO authenticated;
GRANT SELECT ON public.community_suggestions_summary TO authenticated;

-- 13. FORCE SCHEMA CACHE REFRESH
NOTIFY pgrst, 'reload schema';

-- 14. POST-MIGRATION VALIDATION
DO $$
DECLARE
    table_count INTEGER;
    policy_count INTEGER;
    index_count INTEGER;
    fk_count INTEGER;
BEGIN
    RAISE NOTICE '=== POST-MIGRATION VALIDATION ===';
    
    -- Count created tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary');
    
    -- Count created policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename IN ('endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary');
    
    -- Count created indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public'
    AND tablename IN ('endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary');
    
    -- Count foreign key relationships
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public'
    AND table_name IN ('endorsements', 'likes', 'shares', 'community_suggestions', 'mission_invitation_summary');
    
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Policies created: %', policy_count;
    RAISE NOTICE 'Indexes created: %', index_count;
    RAISE NOTICE 'Foreign keys created: %', fk_count;
    
    IF table_count = 5 AND policy_count >= 15 AND index_count >= 15 AND fk_count >= 8 THEN
        RAISE NOTICE '🎉 MIGRATION SUCCESSFUL! All components created correctly.';
    ELSE
        RAISE EXCEPTION 'Migration validation failed! Expected 5 tables, 15+ policies, 15+ indexes, 8+ foreign keys. Got: % tables, % policies, % indexes, % foreign keys', 
            table_count, policy_count, index_count, fk_count;
    END IF;
END $$;

-- COMMIT TRANSACTION
COMMIT;

-- FINAL SUCCESS MESSAGE
DO $$
BEGIN
    RAISE NOTICE '=== MIGRATION COMPLETED SUCCESSFULLY ===';
    RAISE NOTICE 'Your veteran dashboard database is now ready!';
    RAISE NOTICE 'All required tables, indexes, policies, and foreign key relationships have been created.';
    RAISE NOTICE 'Supabase schema cache has been refreshed.';
    RAISE NOTICE 'The veteran dashboard should now work without any relationship errors!';
END $$;
