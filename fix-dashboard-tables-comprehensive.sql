-- Comprehensive Dashboard Tables Fix
-- This script handles existing tables and adds missing columns properly

-- 1. CHECK AND ADD MISSING COLUMNS TO EXISTING TABLES

-- Add category column to community_suggestions if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'community_suggestions' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.community_suggestions ADD COLUMN category text;
  END IF;
END $$;

-- Add description column to community_suggestions if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'community_suggestions' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.community_suggestions ADD COLUMN description text;
  END IF;
END $$;

-- 2. CREATE TABLES IF THEY DON'T EXIST

-- COMMUNITY SUGGESTIONS TABLE (with proper structure)
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

-- MISSION INVITATION SUMMARY TABLE (with proper structure)
CREATE TABLE IF NOT EXISTS public.mission_invitation_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  total_invitations_sent integer DEFAULT 0,
  total_invitations_accepted integer DEFAULT 0,
  total_invitations_declined integer DEFAULT 0,
  total_invitations_pending integer DEFAULT 0,
  last_invitation_sent timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. SAFELY DROP AND RECREATE VIEWS
DROP VIEW IF EXISTS public.community_suggestions_summary CASCADE;
CREATE VIEW public.community_suggestions_summary AS
SELECT 
  COUNT(*) as total_suggestions,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_suggestions,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_suggestions,
  SUM(votes) as total_votes
FROM public.community_suggestions;

-- 4. Create indexes for performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_community_suggestions_user_id ON public.community_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_status ON public.community_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_category ON public.community_suggestions(category);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_summary_user_id ON public.mission_invitation_summary(user_id);

-- 5. Enable RLS (safe - won't error if already enabled)
ALTER TABLE public.community_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_invitation_summary ENABLE ROW LEVEL SECURITY;

-- 6. SAFELY CREATE RLS POLICIES (drop if exist first)
DROP POLICY IF EXISTS "Users can view all suggestions" ON public.community_suggestions;
DROP POLICY IF EXISTS "Users can create their own suggestions" ON public.community_suggestions;
DROP POLICY IF EXISTS "Users can update their own suggestions" ON public.community_suggestions;

DROP POLICY IF EXISTS "Users can view their own mission summary" ON public.mission_invitation_summary;
DROP POLICY IF EXISTS "Users can update their own mission summary" ON public.mission_invitation_summary;

-- Now create the policies
CREATE POLICY "Users can view all suggestions" ON public.community_suggestions FOR SELECT USING (true);
CREATE POLICY "Users can create their own suggestions" ON public.community_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own suggestions" ON public.community_suggestions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own mission summary" ON public.mission_invitation_summary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own mission summary" ON public.mission_invitation_summary FOR UPDATE USING (auth.uid() = user_id);

-- 7. Grant permissions
GRANT ALL ON public.community_suggestions TO authenticated;
GRANT ALL ON public.mission_invitation_summary TO authenticated;
GRANT SELECT ON public.community_suggestions_summary TO authenticated;

-- 8. Add sample data only if tables are empty
INSERT INTO public.community_suggestions (user_id, title, description, category, status, votes)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid, 
  'Add LinkedIn Integration', 
  'Allow veterans to connect their LinkedIn profiles', 
  'feature', 
  'pending', 
  5
WHERE NOT EXISTS (SELECT 1 FROM public.community_suggestions LIMIT 1);

INSERT INTO public.community_suggestions (user_id, title, description, category, status, votes)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid, 
  'Improve Mobile Experience', 
  'Make the platform more mobile-friendly', 
  'ui', 
  'approved', 
  12
WHERE NOT EXISTS (SELECT 1 FROM public.community_suggestions WHERE title = 'Improve Mobile Experience');

INSERT INTO public.community_suggestions (user_id, title, description, category, status, votes)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid, 
  'Add Resume Builder', 
  'Help veterans create professional resumes', 
  'feature', 
  'pending', 
  8
WHERE NOT EXISTS (SELECT 1 FROM public.community_suggestions WHERE title = 'Add Resume Builder');

-- Add sample mission invitation summary data (only if table is empty)
INSERT INTO public.mission_invitation_summary (user_id, total_invitations_sent, total_invitations_accepted, total_invitations_declined, total_invitations_pending)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid, 
  15, 
  8, 
  2, 
  5
WHERE NOT EXISTS (SELECT 1 FROM public.mission_invitation_summary LIMIT 1);

-- 9. VERIFICATION QUERY
SELECT 
  'Tables created/updated successfully' as status,
  (SELECT COUNT(*) FROM public.community_suggestions) as community_suggestions_count,
  (SELECT COUNT(*) FROM public.mission_invitation_summary) as mission_invitation_summary_count;
