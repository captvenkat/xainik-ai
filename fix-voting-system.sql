-- Foolproof Voting System for Community Suggestions
-- Complete implementation with user tracking and proper security

-- 1. Create voting tracking table to ensure one vote per user per suggestion
CREATE TABLE IF NOT EXISTS public.community_suggestion_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  suggestion_id uuid REFERENCES public.community_suggestions(id) ON DELETE CASCADE,
  vote_type text CHECK (vote_type IN ('upvote', 'downvote')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, suggestion_id) -- Ensures only one vote per user per suggestion
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_suggestion_votes_user ON public.community_suggestion_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_suggestion_votes_suggestion ON public.community_suggestion_votes(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_community_suggestion_votes_type ON public.community_suggestion_votes(vote_type);
CREATE INDEX IF NOT EXISTS idx_community_suggestion_votes_unique ON public.community_suggestion_votes(user_id, suggestion_id);

-- 3. Enable RLS on voting table
ALTER TABLE public.community_suggestion_votes ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for voting table
DO $$ BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_suggestion_votes' AND policyname = 'Users can view all votes') THEN
    CREATE POLICY "Users can view all votes" ON public.community_suggestion_votes FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_suggestion_votes' AND policyname = 'Users can create their own votes') THEN
    CREATE POLICY "Users can create their own votes" ON public.community_suggestion_votes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
  END IF;
END $$;

DO $$ BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_suggestion_votes' AND policyname = 'Users can update their own votes') THEN
    CREATE POLICY "Users can update their own votes" ON public.community_suggestion_votes FOR UPDATE USING (auth.uid()::text = user_id::text);
  END IF;
END $$;

DO $$ BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_suggestion_votes' AND policyname = 'Users can delete their own votes') THEN
    CREATE POLICY "Users can delete their own votes" ON public.community_suggestion_votes FOR DELETE USING (auth.uid()::text = user_id::text);
  END IF;
END $$;

-- 5. Grant permissions
DO $$ BEGIN 
  BEGIN 
    GRANT ALL ON public.community_suggestion_votes TO authenticated;
  EXCEPTION WHEN OTHERS THEN NULL; 
  END; 
END $$;

-- 6. Drop existing function and create new foolproof voting function
DROP FUNCTION IF EXISTS public.vote_on_suggestion(uuid, text);

CREATE OR REPLACE FUNCTION public.vote_on_suggestion(
  p_suggestion_id uuid,
  p_vote_type text
)
RETURNS json AS $$
DECLARE
  v_user_id uuid;
  v_existing_vote record;
  v_result json;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  -- Check if suggestion exists
  IF NOT EXISTS (SELECT 1 FROM public.community_suggestions WHERE id = p_suggestion_id) THEN
    RETURN json_build_object('success', false, 'error', 'Suggestion not found');
  END IF;
  
  -- Check if vote type is valid
  IF p_vote_type NOT IN ('upvote', 'downvote') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid vote type');
  END IF;
  
  -- Check if user already voted on this suggestion
  SELECT * INTO v_existing_vote 
  FROM public.community_suggestion_votes 
  WHERE user_id = v_user_id AND suggestion_id = p_suggestion_id;
  
  IF v_existing_vote IS NOT NULL THEN
    -- User already voted, update their vote
    IF v_existing_vote.vote_type = p_vote_type THEN
      -- Same vote type, remove the vote (toggle off)
      DELETE FROM public.community_suggestion_votes 
      WHERE user_id = v_user_id AND suggestion_id = p_suggestion_id;
      
      -- Update suggestion vote count
      IF p_vote_type = 'upvote' THEN
        UPDATE public.community_suggestions SET votes = votes - 1 WHERE id = p_suggestion_id;
      ELSE
        UPDATE public.community_suggestions SET votes = votes + 1 WHERE id = p_suggestion_id;
      END IF;
      
      v_result := json_build_object('success', true, 'action', 'removed', 'vote_type', p_vote_type);
    ELSE
      -- Different vote type, change the vote
      UPDATE public.community_suggestion_votes 
      SET vote_type = p_vote_type, updated_at = now() 
      WHERE user_id = v_user_id AND suggestion_id = p_suggestion_id;
      
      -- Update suggestion vote count (remove old vote, add new vote)
      IF v_existing_vote.vote_type = 'upvote' AND p_vote_type = 'downvote' THEN
        UPDATE public.community_suggestions SET votes = votes - 2 WHERE id = p_suggestion_id;
      ELSIF v_existing_vote.vote_type = 'downvote' AND p_vote_type = 'upvote' THEN
        UPDATE public.community_suggestions SET votes = votes + 2 WHERE id = p_suggestion_id;
      END IF;
      
      v_result := json_build_object('success', true, 'action', 'changed', 'vote_type', p_vote_type);
    END IF;
  ELSE
    -- User hasn't voted yet, create new vote
    INSERT INTO public.community_suggestion_votes (user_id, suggestion_id, vote_type)
    VALUES (v_user_id, p_suggestion_id, p_vote_type);
    
    -- Update suggestion vote count
    IF p_vote_type = 'upvote' THEN
      UPDATE public.community_suggestions SET votes = votes + 1 WHERE id = p_suggestion_id;
    ELSE
      UPDATE public.community_suggestions SET votes = votes - 1 WHERE id = p_suggestion_id;
    END IF;
    
    v_result := json_build_object('success', true, 'action', 'added', 'vote_type', p_vote_type);
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permission on the function
DO $$ BEGIN 
  BEGIN 
    GRANT EXECUTE ON FUNCTION public.vote_on_suggestion TO authenticated;
  EXCEPTION WHEN OTHERS THEN NULL; 
  END; 
END $$;

-- 8. Create function to get user's vote on a suggestion
CREATE OR REPLACE FUNCTION public.get_user_vote_on_suggestion(p_suggestion_id uuid)
RETURNS text AS $$
DECLARE
  v_user_id uuid;
  v_vote_type text;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT vote_type INTO v_vote_type
  FROM public.community_suggestion_votes
  WHERE user_id = v_user_id AND suggestion_id = p_suggestion_id;
  
  RETURN v_vote_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant execute permission on the get vote function
DO $$ BEGIN 
  BEGIN 
    GRANT EXECUTE ON FUNCTION public.get_user_vote_on_suggestion TO authenticated;
  EXCEPTION WHEN OTHERS THEN NULL; 
  END; 
END $$;

-- 10. Create view for suggestions with user vote status
CREATE OR REPLACE VIEW public.community_suggestions_with_votes AS
SELECT 
  cs.*,
  u.name as user_name,
  public.get_user_vote_on_suggestion(cs.id) as user_vote,
  COALESCE(upvotes.count, 0) as upvote_count,
  COALESCE(downvotes.count, 0) as downvote_count
FROM public.community_suggestions cs
LEFT JOIN public.users u ON cs.user_id = u.id
LEFT JOIN (
  SELECT suggestion_id, COUNT(*) as count
  FROM public.community_suggestion_votes
  WHERE vote_type = 'upvote'
  GROUP BY suggestion_id
) upvotes ON cs.id = upvotes.suggestion_id
LEFT JOIN (
  SELECT suggestion_id, COUNT(*) as count
  FROM public.community_suggestion_votes
  WHERE vote_type = 'downvote'
  GROUP BY suggestion_id
) downvotes ON cs.id = downvotes.suggestion_id;

-- 11. Grant permissions on the view
DO $$ BEGIN 
  BEGIN 
    GRANT SELECT ON public.community_suggestions_with_votes TO authenticated;
  EXCEPTION WHEN OTHERS THEN NULL; 
  END; 
END $$;

-- 12. Update existing suggestions to have proper vote counts
UPDATE public.community_suggestions 
SET votes = 0 
WHERE votes IS NULL OR votes < 0;

-- 13. Add some sample votes for testing (if users exist)
INSERT INTO public.community_suggestion_votes (user_id, suggestion_id, vote_type)
SELECT 
  u.id,
  cs.id,
  CASE 
    WHEN cs.id::text LIKE '%1%' THEN 'upvote'
    WHEN cs.id::text LIKE '%2%' THEN 'upvote'
    ELSE 'downvote'
  END
FROM public.users u
CROSS JOIN public.community_suggestions cs
WHERE u.id IS NOT NULL 
  AND cs.id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.community_suggestion_votes csv 
    WHERE csv.user_id = u.id AND csv.suggestion_id = cs.id
  )
LIMIT 5
ON CONFLICT (user_id, suggestion_id) DO NOTHING;

-- 14. Update vote counts based on actual votes
UPDATE public.community_suggestions cs
SET votes = (
  SELECT COALESCE(SUM(
    CASE 
      WHEN csv.vote_type = 'upvote' THEN 1
      WHEN csv.vote_type = 'downvote' THEN -1
      ELSE 0
    END
  ), 0)
  FROM public.community_suggestion_votes csv
  WHERE csv.suggestion_id = cs.id
);
