-- Fix Endorsements Table Structure
-- This script adds missing columns to the endorsements table

BEGIN;

-- Check current endorsements table structure
SELECT 'CURRENT ENDORSEMENTS STRUCTURE' as info, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'endorsements'
ORDER BY ordinal_position;

-- Add missing columns to endorsements table
DO $$
BEGIN
    -- Add pitch_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'pitch_id'
    ) THEN
        ALTER TABLE public.endorsements ADD COLUMN pitch_id UUID REFERENCES public.pitches(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added pitch_id column to endorsements table';
    END IF;

    -- Add endorser_user_id column if it doesn't exist (rename from endorser_id if needed)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'endorser_user_id'
    ) THEN
        -- Check if endorser_id exists and rename it
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'endorsements' 
            AND column_name = 'endorser_id'
        ) THEN
            ALTER TABLE public.endorsements RENAME COLUMN endorser_id TO endorser_user_id;
            RAISE NOTICE 'Renamed endorser_id to endorser_user_id in endorsements table';
        ELSE
            ALTER TABLE public.endorsements ADD COLUMN endorser_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
            RAISE NOTICE 'Added endorser_user_id column to endorsements table';
        END IF;
    END IF;

    -- Add rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'rating'
    ) THEN
        ALTER TABLE public.endorsements ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
        RAISE NOTICE 'Added rating column to endorsements table';
    END IF;

    -- Add is_public column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'is_public'
    ) THEN
        ALTER TABLE public.endorsements ADD COLUMN is_public BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_public column to endorsements table';
    END IF;

    -- Add endorser_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'endorser_name'
    ) THEN
        ALTER TABLE public.endorsements ADD COLUMN endorser_name VARCHAR(255);
        RAISE NOTICE 'Added endorser_name column to endorsements table';
    END IF;

    -- Add endorser_email column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'endorser_email'
    ) THEN
        ALTER TABLE public.endorsements ADD COLUMN endorser_email VARCHAR(255);
        RAISE NOTICE 'Added endorser_email column to endorsements table';
    END IF;

    -- Add is_anonymous column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'is_anonymous'
    ) THEN
        ALTER TABLE public.endorsements ADD COLUMN is_anonymous BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_anonymous column to endorsements table';
    END IF;
END $$;

-- Fix foreign key constraints for endorsements table
DO $$
BEGIN
    -- Drop existing constraints if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND constraint_name = 'endorsements_user_id_fkey'
    ) THEN
        ALTER TABLE public.endorsements DROP CONSTRAINT endorsements_user_id_fkey;
        RAISE NOTICE 'Dropped endorsements_user_id_fkey constraint';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND constraint_name = 'endorsements_endorser_user_id_fkey'
    ) THEN
        ALTER TABLE public.endorsements DROP CONSTRAINT endorsements_endorser_user_id_fkey;
        RAISE NOTICE 'Dropped endorsements_endorser_user_id_fkey constraint';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND constraint_name = 'endorsements_pitch_id_fkey'
    ) THEN
        ALTER TABLE public.endorsements DROP CONSTRAINT endorsements_pitch_id_fkey;
        RAISE NOTICE 'Dropped endorsements_pitch_id_fkey constraint';
    END IF;

    -- Add new constraints
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'user_id'
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
    ) THEN
        ALTER TABLE public.endorsements ADD CONSTRAINT endorsements_endorser_user_id_fkey 
          FOREIGN KEY (endorser_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added endorsements_endorser_user_id_fkey constraint';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'endorsements' 
        AND column_name = 'pitch_id'
    ) THEN
        ALTER TABLE public.endorsements ADD CONSTRAINT endorsements_pitch_id_fkey 
          FOREIGN KEY (pitch_id) REFERENCES public.pitches(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added endorsements_pitch_id_fkey constraint';
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_endorsements_user_id ON public.endorsements(user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_endorser_user_id ON public.endorsements(endorser_user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_pitch_id ON public.endorsements(pitch_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_created_at ON public.endorsements(created_at);

-- Enable RLS and create policies
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view endorsements" ON public.endorsements;
CREATE POLICY "Users can view endorsements" ON public.endorsements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create endorsements" ON public.endorsements;
CREATE POLICY "Users can create endorsements" ON public.endorsements FOR INSERT WITH CHECK (true);

-- Show final structure
SELECT 'FINAL ENDORSEMENTS STRUCTURE' as info, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'endorsements'
ORDER BY ordinal_position;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
