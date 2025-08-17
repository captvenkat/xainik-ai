-- Final Complete Fix - Ensure All Column Names Are user_id
-- This script will fix all remaining issues

BEGIN;

-- Step 1: Force rename columns (with error handling)
DO $$
BEGIN
    -- Fix pitches table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'veteran_id'
    ) THEN
        ALTER TABLE public.pitches RENAME COLUMN veteran_id TO user_id;
        RAISE NOTICE 'Renamed pitches.veteran_id to user_id';
    ELSE
        RAISE NOTICE 'Pitches table already has user_id column';
    END IF;
    
    -- Fix endorsements table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'veteran_id'
    ) THEN
        ALTER TABLE public.endorsements RENAME COLUMN veteran_id TO user_id;
        RAISE NOTICE 'Renamed endorsements.veteran_id to user_id';
    ELSE
        RAISE NOTICE 'Endorsements table already has user_id column';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'endorser_id'
    ) THEN
        ALTER TABLE public.endorsements RENAME COLUMN endorser_id TO endorser_user_id;
        RAISE NOTICE 'Renamed endorsements.endorser_id to endorser_user_id';
    ELSE
        RAISE NOTICE 'Endorsements table already has endorser_user_id column';
    END IF;
END $$;

-- Step 2: Drop all old constraints
ALTER TABLE public.pitches DROP CONSTRAINT IF EXISTS pitches_veteran_id_fkey;
ALTER TABLE public.endorsements DROP CONSTRAINT IF EXISTS endorsements_veteran_id_fkey;
ALTER TABLE public.endorsements DROP CONSTRAINT IF EXISTS endorsements_endorser_id_fkey;

-- Step 3: Add new constraints
ALTER TABLE public.pitches ADD CONSTRAINT pitches_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.endorsements ADD CONSTRAINT endorsements_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.endorsements ADD CONSTRAINT endorsements_endorser_user_id_fkey 
  FOREIGN KEY (endorser_user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Step 4: Drop all old indexes
DROP INDEX IF EXISTS idx_pitches_veteran_id;
DROP INDEX IF EXISTS idx_endorsements_veteran_id;
DROP INDEX IF EXISTS idx_endorsements_endorser_id;

-- Step 5: Create new indexes
CREATE INDEX IF NOT EXISTS idx_pitches_user_id ON public.pitches(user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_user_id ON public.endorsements(user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_endorser_user_id ON public.endorsements(endorser_user_id);

-- Step 6: Drop old RLS policies
DROP POLICY IF EXISTS "Veterans can create own pitches" ON public.pitches;
DROP POLICY IF EXISTS "Veterans can update own pitches" ON public.pitches;
DROP POLICY IF EXISTS "Users can create endorsements" ON public.endorsements;

-- Step 7: Create new RLS policies
CREATE POLICY "Users can create own pitches" ON public.pitches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pitches" ON public.pitches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create endorsements" ON public.endorsements FOR INSERT WITH CHECK (auth.uid() = endorser_user_id);

-- Step 8: Verify the changes
SELECT 'VERIFICATION' as step,
       'PITCHES COLUMNS' as table_name,
       column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pitches'
AND column_name IN ('user_id', 'veteran_id')
ORDER BY column_name;

SELECT 'VERIFICATION' as step,
       'ENDORSEMENTS COLUMNS' as table_name,
       column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'endorsements'
AND column_name IN ('user_id', 'veteran_id', 'endorser_user_id', 'endorser_id')
ORDER BY column_name;

-- Step 9: Refresh schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
