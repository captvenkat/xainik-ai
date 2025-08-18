-- Revert to Consistent user_id Naming
-- This migration reverts the semantic naming back to consistent user_id
-- for better code maintainability and to avoid breaking existing code

BEGIN;

-- 1. Revert column name changes back to user_id
-- Revert pitches table - change veteran_id back to user_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'veteran_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.pitches RENAME COLUMN veteran_id TO user_id;
        RAISE NOTICE 'Reverted pitches.veteran_id back to user_id';
    ELSE
        RAISE NOTICE 'Pitches table already has user_id column';
    END IF;
END $$;

-- Revert endorsements table - change veteran_id back to user_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'veteran_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.endorsements RENAME COLUMN veteran_id TO user_id;
        RAISE NOTICE 'Reverted endorsements.veteran_id back to user_id';
    ELSE
        RAISE NOTICE 'Endorsements table already has user_id column';
    END IF;
END $$;

-- Revert endorsements table - change endorser_id back to endorser_user_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'endorser_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'endorser_user_id'
    ) THEN
        ALTER TABLE public.endorsements RENAME COLUMN endorser_id TO endorser_user_id;
        RAISE NOTICE 'Reverted endorsements.endorser_id back to endorser_user_id';
    ELSE
        RAISE NOTICE 'Endorsements table already has endorser_user_id column';
    END IF;
END $$;

-- 2. Update foreign key constraints to match new column names
DO $$
BEGIN
    -- Drop existing foreign key constraints if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND constraint_name = 'pitches_veteran_id_fkey'
    ) THEN
        ALTER TABLE public.pitches DROP CONSTRAINT pitches_veteran_id_fkey;
        RAISE NOTICE 'Dropped pitches_veteran_id_fkey constraint';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND constraint_name = 'endorsements_veteran_id_fkey'
    ) THEN
        ALTER TABLE public.endorsements DROP CONSTRAINT endorsements_veteran_id_fkey;
        RAISE NOTICE 'Dropped endorsements_veteran_id_fkey constraint';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND constraint_name = 'endorsements_endorser_id_fkey'
    ) THEN
        ALTER TABLE public.endorsements DROP CONSTRAINT endorsements_endorser_id_fkey;
        RAISE NOTICE 'Dropped endorsements_endorser_id_fkey constraint';
    END IF;
    
    -- Add new foreign key constraints with user_id naming
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'user_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND constraint_name = 'pitches_user_id_fkey'
    ) THEN
        ALTER TABLE public.pitches ADD CONSTRAINT pitches_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added pitches_user_id_fkey constraint';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'user_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND constraint_name = 'endorsements_user_id_fkey'
    ) THEN
        ALTER TABLE public.endorsements ADD CONSTRAINT endorsements_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added endorsements_user_id_fkey constraint';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'endorser_user_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND constraint_name = 'endorsements_endorser_user_id_fkey'
    ) THEN
        ALTER TABLE public.endorsements ADD CONSTRAINT endorsements_endorser_user_id_fkey 
          FOREIGN KEY (endorser_user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added endorsements_endorser_user_id_fkey constraint';
    END IF;
END $$;

-- 3. Update indexes to match new column names
DROP INDEX IF EXISTS idx_pitches_veteran_id;
DROP INDEX IF EXISTS idx_endorsements_veteran_id;
DROP INDEX IF EXISTS idx_endorsements_endorser_id;

CREATE INDEX IF NOT EXISTS idx_pitches_user_id ON public.pitches(user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_user_id ON public.endorsements(user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_endorser_user_id ON public.endorsements(endorser_user_id);

-- 4. Update RLS policies to use user_id naming
DO $$
BEGIN
    -- Drop existing policies that use veteran_id
    DROP POLICY IF EXISTS "Veterans can create own pitches" ON public.pitches;
    DROP POLICY IF EXISTS "Veterans can update own pitches" ON public.pitches;
    DROP POLICY IF EXISTS "Users can create endorsements" ON public.endorsements;
    
    -- Create new policies with user_id naming
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pitches' AND policyname = 'Users can create own pitches') THEN
        CREATE POLICY "Users can create own pitches" ON public.pitches FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pitches' AND policyname = 'Users can update own pitches') THEN
        CREATE POLICY "Users can update own pitches" ON public.pitches FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'endorsements' AND policyname = 'Users can create endorsements') THEN
        CREATE POLICY "Users can create endorsements" ON public.endorsements FOR INSERT WITH CHECK (auth.uid() = endorser_user_id);
    END IF;
END $$;

-- 5. Refresh schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
