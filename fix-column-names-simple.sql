-- Simple Fix: Change column names back to user_id for consistency
-- Run this in your Supabase SQL Editor

BEGIN;

-- 1. Fix pitches table - change veteran_id back to user_id
ALTER TABLE public.pitches RENAME COLUMN veteran_id TO user_id;

-- 2. Fix endorsements table - change veteran_id back to user_id
ALTER TABLE public.endorsements RENAME COLUMN veteran_id TO user_id;

-- 3. Fix endorsements table - change endorser_id back to endorser_user_id
ALTER TABLE public.endorsements RENAME COLUMN endorser_id TO endorser_user_id;

-- 4. Update foreign key constraints
ALTER TABLE public.pitches DROP CONSTRAINT IF EXISTS pitches_veteran_id_fkey;
ALTER TABLE public.endorsements DROP CONSTRAINT IF EXISTS endorsements_veteran_id_fkey;
ALTER TABLE public.endorsements DROP CONSTRAINT IF EXISTS endorsements_endorser_id_fkey;

ALTER TABLE public.pitches ADD CONSTRAINT pitches_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.endorsements ADD CONSTRAINT endorsements_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.endorsements ADD CONSTRAINT endorsements_endorser_user_id_fkey 
  FOREIGN KEY (endorser_user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 5. Update indexes
DROP INDEX IF EXISTS idx_pitches_veteran_id;
DROP INDEX IF EXISTS idx_endorsements_veteran_id;
DROP INDEX IF EXISTS idx_endorsements_endorser_id;

CREATE INDEX IF NOT EXISTS idx_pitches_user_id ON public.pitches(user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_user_id ON public.endorsements(user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_endorser_user_id ON public.endorsements(endorser_user_id);

-- 6. Update RLS policies
DROP POLICY IF EXISTS "Veterans can create own pitches" ON public.pitches;
DROP POLICY IF EXISTS "Veterans can update own pitches" ON public.pitches;
DROP POLICY IF EXISTS "Users can create endorsements" ON public.endorsements;

CREATE POLICY "Users can create own pitches" ON public.pitches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pitches" ON public.pitches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create endorsements" ON public.endorsements FOR INSERT WITH CHECK (auth.uid() = endorser_user_id);

-- 7. Refresh schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
