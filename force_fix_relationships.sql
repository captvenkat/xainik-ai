-- =====================================================
-- FORCE FIX RELATIONSHIPS - AGGRESSIVE APPROACH
-- This will recreate the tables with proper foreign key relationships
-- =====================================================

-- 1. DROP EXISTING TABLES (CASCADE to remove all dependencies)
DROP TABLE IF EXISTS public.endorsements CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.shares CASCADE;
DROP TABLE IF EXISTS public.community_suggestions CASCADE;
DROP TABLE IF EXISTS public.mission_invitation_summary CASCADE;
DROP VIEW IF EXISTS public.community_suggestions_summary CASCADE;

-- 2. RECREATE ENDORSEMENTS TABLE WITH PROPER FOREIGN KEY
CREATE TABLE public.endorsements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    veteran_id uuid NOT NULL,
    endorser_id uuid NOT NULL,
    text text,
    created_at timestamptz DEFAULT now(),
    -- Add explicit foreign key constraint
    CONSTRAINT fk_endorsements_veteran_id FOREIGN KEY (veteran_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_endorsements_endorser_id FOREIGN KEY (endorser_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 3. RECREATE LIKES TABLE WITH PROPER FOREIGN KEY
CREATE TABLE public.likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    pitch_id uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    -- Add explicit foreign key constraint
    CONSTRAINT fk_likes_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_pitch_id FOREIGN KEY (pitch_id) REFERENCES public.pitches(id) ON DELETE CASCADE
);

-- 4. RECREATE SHARES TABLE WITH PROPER FOREIGN KEY
CREATE TABLE public.shares (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    pitch_id uuid NOT NULL,
    platform text,
    share_link text,
    created_at timestamptz DEFAULT now(),
    -- Add explicit foreign key constraint
    CONSTRAINT fk_shares_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_shares_pitch_id FOREIGN KEY (pitch_id) REFERENCES public.pitches(id) ON DELETE CASCADE
);

-- 5. RECREATE COMMUNITY SUGGESTIONS TABLE
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

-- 6. RECREATE MISSION INVITATION SUMMARY TABLE
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

-- 7. CREATE INDEXES
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

-- 8. CREATE VIEW
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

-- 9. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_invitation_summary ENABLE ROW LEVEL SECURITY;

-- 10. CREATE RLS POLICIES
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

-- 11. GRANT PERMISSIONS
GRANT ALL ON public.endorsements TO authenticated;
GRANT ALL ON public.likes TO authenticated;
GRANT ALL ON public.shares TO authenticated;
GRANT ALL ON public.community_suggestions TO authenticated;
GRANT ALL ON public.mission_invitation_summary TO authenticated;
GRANT SELECT ON public.community_suggestions_summary TO authenticated;

-- 12. FORCE SCHEMA CACHE REFRESH
NOTIFY pgrst, 'reload schema';

-- 13. VERIFY RELATIONSHIPS WERE CREATED
SELECT 
    'RELATIONSHIPS_VERIFICATION' as check_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN ('endorsements', 'likes', 'shares')
ORDER BY tc.table_name, kcu.column_name;

-- SUCCESS!
SELECT 'Force migration completed! All tables recreated with proper foreign keys.' as status;
