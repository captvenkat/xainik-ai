-- Fix Missing Tables Migration
-- This migration adds the missing tables that are causing database relationship errors

-- 1. LIKES TABLE (for pitch likes)
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, pitch_id)
);

-- 2. SHARES TABLE (for pitch shares)
CREATE TABLE IF NOT EXISTS public.shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  platform text, -- whatsapp, linkedin, email, direct
  share_link text,
  created_at timestamptz DEFAULT now()
);

-- 3. MISSION INVITATION SUMMARY TABLE (for mission analytics)
CREATE TABLE IF NOT EXISTS public.mission_invitation_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  invitee_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  invitation_link text NOT NULL,
  status text CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED')) DEFAULT 'PENDING',
  platform text, -- whatsapp, linkedin, email, direct
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz
);

-- 4. COMMUNITY SUGGESTIONS TABLE (for community features)
CREATE TABLE IF NOT EXISTS public.community_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text, -- feature, improvement, bug, general
  status text CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'IMPLEMENTED')) DEFAULT 'PENDING',
  votes int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. COMMUNITY SUGGESTION VOTES TABLE (for voting system)
CREATE TABLE IF NOT EXISTS public.community_suggestion_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  suggestion_id uuid REFERENCES public.community_suggestions(id) ON DELETE CASCADE,
  vote_type text CHECK (vote_type IN ('UP', 'DOWN')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, suggestion_id)
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_pitch_id ON public.likes(pitch_id);
CREATE INDEX IF NOT EXISTS idx_shares_user_id ON public.shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_pitch_id ON public.shares(pitch_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_inviter ON public.mission_invitation_summary(inviter_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_invitee ON public.mission_invitation_summary(invitee_id);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_user_id ON public.community_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_status ON public.community_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_community_suggestion_votes_user_id ON public.community_suggestion_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_suggestion_votes_suggestion_id ON public.community_suggestion_votes(suggestion_id);

-- 7. Enable RLS on new tables
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_invitation_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_suggestion_votes ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for new tables

-- Likes policies
CREATE POLICY "Users can view all likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can create their own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Shares policies
CREATE POLICY "Users can view all shares" ON public.shares FOR SELECT USING (true);
CREATE POLICY "Users can create their own shares" ON public.shares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shares" ON public.shares FOR UPDATE USING (auth.uid() = user_id);

-- Mission invitation policies
CREATE POLICY "Users can view their own invitations" ON public.mission_invitation_summary FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);
CREATE POLICY "Users can create invitations" ON public.mission_invitation_summary FOR INSERT WITH CHECK (auth.uid() = inviter_id);
CREATE POLICY "Users can update their own invitations" ON public.mission_invitation_summary FOR UPDATE USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- Community suggestions policies
CREATE POLICY "Users can view all suggestions" ON public.community_suggestions FOR SELECT USING (true);
CREATE POLICY "Users can create their own suggestions" ON public.community_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own suggestions" ON public.community_suggestions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update any suggestion" ON public.community_suggestions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Community suggestion votes policies
CREATE POLICY "Users can view all votes" ON public.community_suggestion_votes FOR SELECT USING (true);
CREATE POLICY "Users can create their own votes" ON public.community_suggestion_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON public.community_suggestion_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON public.community_suggestion_votes FOR DELETE USING (auth.uid() = user_id);

-- 9. Create views for easier querying

-- Pitch engagement view (likes + shares)
CREATE OR REPLACE VIEW public.pitch_engagement AS
SELECT 
  p.id as pitch_id,
  p.title,
  p.veteran_id,
  u.name as veteran_name,
  COUNT(DISTINCT l.id) as likes_count,
  COUNT(DISTINCT s.id) as shares_count,
  p.created_at
FROM public.pitches p
JOIN public.users u ON p.veteran_id = u.id
LEFT JOIN public.likes l ON p.id = l.pitch_id
LEFT JOIN public.shares s ON p.id = s.pitch_id
WHERE p.is_active = true
GROUP BY p.id, p.title, p.veteran_id, u.name, p.created_at
ORDER BY p.created_at DESC;

-- Community suggestions with vote counts
CREATE OR REPLACE VIEW public.community_suggestions_with_votes AS
SELECT 
  cs.id,
  cs.title,
  cs.description,
  cs.category,
  cs.status,
  cs.votes,
  u.name as user_name,
  cs.created_at,
  cs.updated_at
FROM public.community_suggestions cs
JOIN public.users u ON cs.user_id = u.id
ORDER BY cs.votes DESC, cs.created_at DESC;

-- 10. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.likes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shares TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_invitation_summary TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_suggestions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_suggestion_votes TO authenticated;

GRANT SELECT ON public.pitch_engagement TO authenticated;
GRANT SELECT ON public.community_suggestions_with_votes TO authenticated;

-- 11. Insert some sample data for testing
INSERT INTO public.community_suggestions (user_id, title, description, category, status, votes) VALUES
  ('4c5a525f-77d7-4350-b4e3-eb6459abecdc', 'Dark Mode Support', 'Add dark mode theme option for better user experience', 'feature', 'PENDING', 5),
  ('4c5a525f-77d7-4350-b4e3-eb6459abecdc', 'Mobile App', 'Develop a mobile app for iOS and Android', 'feature', 'PENDING', 12),
  ('4c5a525f-77d7-4350-b4e3-eb6459abecdc', 'Video Pitches', 'Allow veterans to record video pitches', 'feature', 'APPROVED', 8)
ON CONFLICT DO NOTHING;

-- 12. Update existing pitches to have some sample engagement
INSERT INTO public.likes (user_id, pitch_id) 
SELECT 
  '4c5a525f-77d7-4350-b4e3-eb6459abecdc' as user_id,
  id as pitch_id
FROM public.pitches 
LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO public.shares (user_id, pitch_id, platform, share_link)
SELECT 
  '4c5a525f-77d7-4350-b4e3-eb6459abecdc' as user_id,
  id as pitch_id,
  'whatsapp' as platform,
  'https://xainik.com/pitch/' || id as share_link
FROM public.pitches 
LIMIT 2
ON CONFLICT DO NOTHING;

-- 13. Create a sample mission invitation
INSERT INTO public.mission_invitation_summary (inviter_id, invitee_id, invitation_link, status, platform)
VALUES 
  ('4c5a525f-77d7-4350-b4e3-eb6459abecdc', '4c5a525f-77d7-4350-b4e3-eb6459abecdc', 'https://xainik.com/mission/invite/sample123', 'PENDING', 'whatsapp')
ON CONFLICT DO NOTHING;

-- Migration completed successfully!
-- All missing tables have been created with proper relationships and RLS policies
