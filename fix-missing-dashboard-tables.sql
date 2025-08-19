-- Fix Missing Dashboard Tables
-- This script adds the missing tables that dashboard components are trying to use

-- 1. COMMUNITY SUGGESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.community_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text,
  status text DEFAULT 'pending',
  votes int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 2. MISSION INVITATION SUMMARY TABLE
CREATE TABLE IF NOT EXISTS public.mission_invitation_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  invitee_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  invitation_link text,
  status text DEFAULT 'pending',
  platform text,
  created_at timestamptz DEFAULT now()
);

-- 3. COMMUNITY SUGGESTIONS SUMMARY VIEW
CREATE OR REPLACE VIEW public.community_suggestions_summary AS
SELECT 
  COUNT(*) as total_suggestions,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_suggestions,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_suggestions,
  SUM(votes) as total_votes
FROM public.community_suggestions;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_suggestions_user_id ON public.community_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_status ON public.community_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_inviter ON public.mission_invitation_summary(inviter_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_invitee ON public.mission_invitation_summary(invitee_id);

-- 5. Enable RLS
ALTER TABLE public.community_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_invitation_summary ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
CREATE POLICY "Users can view all suggestions" ON public.community_suggestions FOR SELECT USING (true);
CREATE POLICY "Users can create their own suggestions" ON public.community_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own suggestions" ON public.community_suggestions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own mission summary" ON public.mission_invitation_summary FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);
CREATE POLICY "Users can create mission summary" ON public.mission_invitation_summary FOR INSERT WITH CHECK (auth.uid() = inviter_id);
CREATE POLICY "Users can update their own mission summary" ON public.mission_invitation_summary FOR UPDATE USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- 7. Grant permissions
GRANT ALL ON public.community_suggestions TO authenticated;
GRANT ALL ON public.mission_invitation_summary TO authenticated;
GRANT SELECT ON public.community_suggestions_summary TO authenticated;

-- 8. Add some sample data for testing
INSERT INTO public.community_suggestions (user_id, title, description, category, status, votes) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Add LinkedIn Integration', 'Allow veterans to connect their LinkedIn profiles', 'feature', 'pending', 5),
  ('00000000-0000-0000-0000-000000000000', 'Improve Mobile Experience', 'Make the platform more mobile-friendly', 'ui', 'approved', 12),
  ('00000000-0000-0000-0000-000000000000', 'Add Resume Builder', 'Help veterans create professional resumes', 'feature', 'pending', 8)
ON CONFLICT DO NOTHING;

INSERT INTO public.mission_invitation_summary (inviter_id, invitee_id, invitation_link, status, platform) VALUES
  ('00000000-0000-0000-0000-000000000000', NULL, 'https://xainik.com/invite/sample1', 'pending', 'email'),
  ('00000000-0000-0000-0000-000000000000', NULL, 'https://xainik.com/invite/sample2', 'accepted', 'linkedin')
ON CONFLICT DO NOTHING;
