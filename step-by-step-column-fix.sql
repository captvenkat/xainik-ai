-- Step-by-Step Column Name Fix
-- Run this in your Supabase SQL Editor to fix column names

BEGIN;

-- Step 1: Fix pitches table
-- Change veteran_id back to user_id
ALTER TABLE public.pitches RENAME COLUMN veteran_id TO user_id;

-- Step 2: Fix endorsements table
-- Change veteran_id back to user_id
ALTER TABLE public.endorsements RENAME COLUMN veteran_id TO user_id;

-- Step 3: Fix endorsements table
-- Change endorser_id back to endorser_user_id
ALTER TABLE public.endorsements RENAME COLUMN endorser_id TO endorser_user_id;

-- Step 4: Drop old foreign key constraints
ALTER TABLE public.pitches DROP CONSTRAINT IF EXISTS pitches_veteran_id_fkey;
ALTER TABLE public.endorsements DROP CONSTRAINT IF EXISTS endorsements_veteran_id_fkey;
ALTER TABLE public.endorsements DROP CONSTRAINT IF EXISTS endorsements_endorser_id_fkey;

-- Step 5: Add new foreign key constraints
ALTER TABLE public.pitches ADD CONSTRAINT pitches_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.endorsements ADD CONSTRAINT endorsements_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.endorsements ADD CONSTRAINT endorsements_endorser_user_id_fkey 
  FOREIGN KEY (endorser_user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Step 6: Drop old indexes
DROP INDEX IF EXISTS idx_pitches_veteran_id;
DROP INDEX IF EXISTS idx_endorsements_veteran_id;
DROP INDEX IF EXISTS idx_endorsements_endorser_id;

-- Step 7: Create new indexes
CREATE INDEX IF NOT EXISTS idx_pitches_user_id ON public.pitches(user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_user_id ON public.endorsements(user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_endorser_user_id ON public.endorsements(endorser_user_id);

-- Step 8: Drop old RLS policies
DROP POLICY IF EXISTS "Veterans can create own pitches" ON public.pitches;
DROP POLICY IF EXISTS "Veterans can update own pitches" ON public.pitches;
DROP POLICY IF EXISTS "Users can create endorsements" ON public.endorsements;

-- Step 9: Create new RLS policies
CREATE POLICY "Users can create own pitches" ON public.pitches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pitches" ON public.pitches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create endorsements" ON public.endorsements FOR INSERT WITH CHECK (auth.uid() = endorser_user_id);

-- Step 10: Refresh schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
