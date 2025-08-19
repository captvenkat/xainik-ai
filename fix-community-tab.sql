-- Fix Community Tab Issues
-- This script creates the missing community_suggestions_summary view and fixes mission invitation analytics

-- 1. Create the missing community_suggestions_summary view
CREATE OR REPLACE VIEW public.community_suggestions_summary AS
SELECT 
  COUNT(*) as total_suggestions,
  COUNT(*) FILTER (WHERE status = 'active') as active_suggestions,
  COUNT(*) FILTER (WHERE status = 'implemented') as implemented_suggestions,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_suggestions,
  COALESCE(AVG(votes), 0) as avg_votes,
  COUNT(DISTINCT user_id) as unique_suggesters
FROM public.community_suggestions;

-- Grant permissions on the view
DO $$ BEGIN 
  BEGIN 
    GRANT SELECT ON public.community_suggestions_summary TO anon, authenticated;
  EXCEPTION WHEN OTHERS THEN NULL; 
  END; 
END $$;

-- 2. Create the missing vote_on_suggestion RPC function
-- Drop existing function first if it exists
DROP FUNCTION IF EXISTS public.vote_on_suggestion(uuid, text);

CREATE OR REPLACE FUNCTION public.vote_on_suggestion(
  p_suggestion_id uuid,
  p_vote_type text
)
RETURNS void AS $$
BEGIN
  IF p_vote_type = 'upvote' THEN
    UPDATE public.community_suggestions 
    SET votes = votes + 1 
    WHERE id = p_suggestion_id;
  ELSIF p_vote_type = 'downvote' THEN
    UPDATE public.community_suggestions 
    SET votes = GREATEST(votes - 1, 0) 
    WHERE id = p_suggestion_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
DO $$ BEGIN 
  BEGIN 
    GRANT EXECUTE ON FUNCTION public.vote_on_suggestion TO authenticated;
  EXCEPTION WHEN OTHERS THEN NULL; 
  END; 
END $$;

-- 3. Fix mission_invitation_summary table structure to resolve 406 error
-- Add missing columns that might be causing the issue
DO $$ BEGIN
  -- Add inviter_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'mission_invitation_summary' 
                 AND column_name = 'inviter_id') THEN
    ALTER TABLE public.mission_invitation_summary 
    ADD COLUMN inviter_id uuid REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
  
  -- Add invitee_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'mission_invitation_summary' 
                 AND column_name = 'invitee_id') THEN
    ALTER TABLE public.mission_invitation_summary 
    ADD COLUMN invitee_id uuid REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
  
  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'mission_invitation_summary' 
                 AND column_name = 'status') THEN
    ALTER TABLE public.mission_invitation_summary 
    ADD COLUMN status text DEFAULT 'pending';
  END IF;
END $$;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_suggestions_status ON public.community_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_votes ON public.community_suggestions(votes DESC);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_created ON public.community_suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_summary_inviter ON public.mission_invitation_summary(inviter_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_summary_invitee ON public.mission_invitation_summary(invitee_id);

-- 5. Add some sample community suggestions for testing
INSERT INTO public.community_suggestions (
  user_id, 
  title, 
  description, 
  category, 
  suggestion_type, 
  priority, 
  status, 
  votes
) VALUES 
  (
    (SELECT id FROM public.users LIMIT 1), 
    'Add dark mode support', 
    'It would be great to have a dark mode option for better user experience, especially for users who prefer darker interfaces.', 
    'feature', 
    'feature', 
    'medium', 
    'active', 
    5
  ),
  (
    (SELECT id FROM public.users LIMIT 1), 
    'Improve mobile responsiveness', 
    'The mobile experience could be enhanced with better touch targets and improved navigation.', 
    'improvement', 
    'improvement', 
    'high', 
    'active', 
    8
  ),
  (
    (SELECT id FROM public.users LIMIT 1), 
    'Add email notifications', 
    'Users should receive email notifications for important events like new endorsements or recruiter contacts.', 
    'feature', 
    'feature', 
    'high', 
    'implemented', 
    12
  )
ON CONFLICT DO NOTHING;
