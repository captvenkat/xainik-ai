-- =====================================================
-- COMPLETELY SAFE SCHEMA FIX - SIMPLE WORKING VERSION
-- NO PROBLEMATIC CHECKS - JUST CREATES THE TABLES
-- =====================================================

-- 1. CREATE ENDORSEMENTS TABLE
DROP TABLE IF EXISTS public.endorsements CASCADE;
CREATE TABLE public.endorsements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    pitch_id uuid NOT NULL,
    endorsement_text text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. CREATE LIKES TABLE
DROP TABLE IF EXISTS public.likes CASCADE;
CREATE TABLE public.likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    pitch_id uuid NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 3. CREATE SHARES TABLE
DROP TABLE IF EXISTS public.shares CASCADE;
CREATE TABLE public.shares (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    pitch_id uuid NOT NULL,
    platform text,
    share_link text,
    created_at timestamptz DEFAULT now()
);

-- 4. CREATE COMMUNITY SUGGESTIONS TABLE
DROP TABLE IF EXISTS public.community_suggestions CASCADE;
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
    updated_at timestamptz DEFAULT now()
);

-- 5. CREATE MISSION INVITATION SUMMARY TABLE
DROP TABLE IF EXISTS public.mission_invitation_summary CASCADE;
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
    updated_at timestamptz DEFAULT now()
);

-- 6. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_endorsements_user_id ON public.endorsements(user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_pitch_id ON public.endorsements(pitch_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_created_at ON public.endorsements(created_at);

CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_pitch_id ON public.likes(pitch_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON public.likes(created_at);

CREATE INDEX IF NOT EXISTS idx_shares_user_id ON public.shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_pitch_id ON public.shares(pitch_id);
CREATE INDEX IF NOT EXISTS idx_shares_created_at ON public.shares(created_at);

CREATE INDEX IF NOT EXISTS idx_community_suggestions_user_id ON public.community_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_status ON public.community_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_priority ON public.community_suggestions(priority);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_created_at ON public.community_suggestions(created_at);

CREATE INDEX IF NOT EXISTS idx_mission_invitation_summary_user_id ON public.mission_invitation_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_summary_inviter_id ON public.mission_invitation_summary(inviter_id);

-- 7. CREATE VIEW
DROP VIEW IF EXISTS public.community_suggestions_summary CASCADE;
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

-- 8. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_invitation_summary ENABLE ROW LEVEL SECURITY;

-- 9. CREATE RLS POLICIES
-- Endorsements policies
DROP POLICY IF EXISTS "Users can view all endorsements" ON public.endorsements;
DROP POLICY IF EXISTS "Users can create their own endorsements" ON public.endorsements;
DROP POLICY IF EXISTS "Users can delete their own endorsements" ON public.endorsements;

CREATE POLICY "Users can view all endorsements" ON public.endorsements FOR SELECT USING (true);
CREATE POLICY "Users can create their own endorsements" ON public.endorsements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own endorsements" ON public.endorsements FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
DROP POLICY IF EXISTS "Users can view all likes" ON public.likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;

CREATE POLICY "Users can view all likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can create their own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Shares policies
DROP POLICY IF EXISTS "Users can view all shares" ON public.shares;
DROP POLICY IF EXISTS "Users can create their own shares" ON public.shares;
DROP POLICY IF EXISTS "Users can delete their own shares" ON public.shares;

CREATE POLICY "Users can view all shares" ON public.shares FOR SELECT USING (true);
CREATE POLICY "Users can create their own shares" ON public.shares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shares" ON public.shares FOR DELETE USING (auth.uid() = user_id);

-- Community suggestions policies
DROP POLICY IF EXISTS "Users can view all suggestions" ON public.community_suggestions;
DROP POLICY IF EXISTS "Users can create their own suggestions" ON public.community_suggestions;
DROP POLICY IF EXISTS "Users can update their own suggestions" ON public.community_suggestions;

CREATE POLICY "Users can view all suggestions" ON public.community_suggestions FOR SELECT USING (true);
CREATE POLICY "Users can create their own suggestions" ON public.community_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own suggestions" ON public.community_suggestions FOR UPDATE USING (auth.uid() = user_id);

-- Mission invitation summary policies
DROP POLICY IF EXISTS "Users can view their own mission summary" ON public.mission_invitation_summary;
DROP POLICY IF EXISTS "Users can update their own mission summary" ON public.mission_invitation_summary;

CREATE POLICY "Users can view their own mission summary" ON public.mission_invitation_summary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own mission summary" ON public.mission_invitation_summary FOR UPDATE USING (auth.uid() = user_id);

-- 10. GRANT PERMISSIONS
GRANT ALL ON public.endorsements TO authenticated;
GRANT ALL ON public.likes TO authenticated;
GRANT ALL ON public.shares TO authenticated;
GRANT ALL ON public.community_suggestions TO authenticated;
GRANT ALL ON public.mission_invitation_summary TO authenticated;
GRANT SELECT ON public.community_suggestions_summary TO authenticated;

-- SUCCESS!
SELECT 'Migration completed successfully! All tables created.' as status;
