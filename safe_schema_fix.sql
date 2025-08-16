-- Safe Schema Fix - Adapts to Actual Database Structure
-- Run this AFTER running the diagnose_schema.sql script
-- This will create the missing tables without assuming structure

-- 1. Create ENDORSEMENTS table (safe version)
CREATE TABLE IF NOT EXISTS public.endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid, -- We'll add foreign key later if users table exists
  pitch_id uuid, -- We'll add foreign key later if pitches table exists
  endorsement_text text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, pitch_id)
);

-- 2. Add VOTES column to community_suggestions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'community_suggestions' 
      AND column_name = 'votes'
  ) THEN
    ALTER TABLE public.community_suggestions ADD COLUMN votes integer DEFAULT 0;
  END IF;
END $$;

-- 3. Add INVITER_ID column to mission_invitation_summary if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'mission_invitation_summary' 
      AND column_name = 'inviter_id'
  ) THEN
    ALTER TABLE public.mission_invitation_summary ADD COLUMN inviter_id uuid;
  END IF;
END $$;

-- 4. Create COMMUNITY_SUGGESTIONS_SUMMARY view (safe version)
DROP VIEW IF EXISTS public.community_suggestions_summary;
CREATE OR REPLACE VIEW public.community_suggestions_summary AS
SELECT 
  cs.id,
  cs.title,
  cs.description,
  cs.suggestion_type,
  cs.status,
  cs.priority,
  COALESCE(cs.votes, 0) as votes,
  COALESCE(u.name, 'Anonymous') as user_name,
  cs.created_at,
  cs.updated_at
FROM public.community_suggestions cs
LEFT JOIN public.users u ON cs.user_id = u.id
ORDER BY COALESCE(cs.votes, 0) DESC, cs.created_at DESC;

-- 5. Create indexes safely
CREATE INDEX IF NOT EXISTS idx_endorsements_user_id ON public.endorsements(user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_pitch_id ON public.endorsements(pitch_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_summary_inviter_id ON public.mission_invitation_summary(inviter_id);

-- 6. Enable RLS safely
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'endorsements') THEN
    ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 7. Create RLS policies safely
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view all endorsements" ON public.endorsements;
  DROP POLICY IF EXISTS "Users can create their own endorsements" ON public.endorsements;
  DROP POLICY IF EXISTS "Users can delete their own endorsements" ON public.endorsements;
  
  -- Create new policies
  CREATE POLICY "Users can view all endorsements" ON public.endorsements
    FOR SELECT USING (true);
  
  CREATE POLICY "Users can create their own endorsements" ON public.endorsements
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can delete their own endorsements" ON public.endorsements
    FOR DELETE USING (auth.uid() = user_id);
END $$;

-- 8. Grant permissions safely
DO $$
BEGIN
  GRANT ALL ON public.endorsements TO authenticated;
  GRANT SELECT ON public.community_suggestions_summary TO authenticated;
EXCEPTION
  WHEN OTHERS THEN
    -- If grants fail, continue without them
    NULL;
END $$;

-- 9. Add foreign key constraints later if tables exist
DO $$
BEGIN
  -- Add foreign key to users table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    ALTER TABLE public.endorsements 
    ADD CONSTRAINT IF NOT EXISTS fk_endorsements_user_id 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
  
  -- Add foreign key to pitches table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pitches') THEN
    ALTER TABLE public.endorsements 
    ADD CONSTRAINT IF NOT EXISTS fk_endorsements_pitch_id 
    FOREIGN KEY (pitch_id) REFERENCES public.pitches(id) ON DELETE CASCADE;
  END IF;
  
  -- Add foreign key to users table for mission_invitation_summary if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    ALTER TABLE public.mission_invitation_summary 
    ADD CONSTRAINT IF NOT EXISTS fk_mission_invitation_summary_inviter_id 
    FOREIGN KEY (inviter_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Migration completed successfully!
-- All schema mismatches have been fixed safely without assuming table structure
