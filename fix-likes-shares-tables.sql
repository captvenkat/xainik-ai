-- Fix Likes and Shares Tables
-- This script adds missing columns and fixes foreign key constraints

BEGIN;

-- =====================================================
-- FIX LIKES TABLE
-- =====================================================

-- Check current likes table structure
SELECT 'CURRENT LIKES STRUCTURE' as info, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'likes'
ORDER BY ordinal_position;

-- Add missing columns to likes table
DO $$
BEGIN
    -- Add pitch_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'likes' 
        AND column_name = 'pitch_id'
    ) THEN
        ALTER TABLE public.likes ADD COLUMN pitch_id UUID REFERENCES public.pitches(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added pitch_id column to likes table';
    END IF;

    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'likes' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.likes ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added user_id column to likes table';
    END IF;
END $$;

-- Fix foreign key constraints for likes table
DO $$
BEGIN
    -- Drop existing constraints if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'likes' 
        AND constraint_name = 'fk_likes_pitch_id'
    ) THEN
        ALTER TABLE public.likes DROP CONSTRAINT fk_likes_pitch_id;
        RAISE NOTICE 'Dropped fk_likes_pitch_id constraint';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'likes' 
        AND constraint_name = 'fk_likes_user_id'
    ) THEN
        ALTER TABLE public.likes DROP CONSTRAINT fk_likes_user_id;
        RAISE NOTICE 'Dropped fk_likes_user_id constraint';
    END IF;

    -- Add new constraints
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'likes' 
        AND column_name = 'pitch_id'
    ) THEN
        ALTER TABLE public.likes ADD CONSTRAINT fk_likes_pitch_id 
          FOREIGN KEY (pitch_id) REFERENCES public.pitches(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added fk_likes_pitch_id constraint';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'likes' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.likes ADD CONSTRAINT fk_likes_user_id 
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added fk_likes_user_id constraint';
    END IF;
END $$;

-- Add indexes for likes table
CREATE INDEX IF NOT EXISTS idx_likes_pitch_id ON public.likes(pitch_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON public.likes(created_at);

-- =====================================================
-- FIX SHARES TABLE
-- =====================================================

-- Check current shares table structure
SELECT 'CURRENT SHARES STRUCTURE' as info, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'shares'
ORDER BY ordinal_position;

-- Add missing columns to shares table
DO $$
BEGIN
    -- Add pitch_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'shares' 
        AND column_name = 'pitch_id'
    ) THEN
        ALTER TABLE public.shares ADD COLUMN pitch_id UUID REFERENCES public.pitches(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added pitch_id column to shares table';
    END IF;

    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'shares' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.shares ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added user_id column to shares table';
    END IF;

    -- Add platform column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'shares' 
        AND column_name = 'platform'
    ) THEN
        ALTER TABLE public.shares ADD COLUMN platform VARCHAR(50);
        RAISE NOTICE 'Added platform column to shares table';
    END IF;

    -- Add share_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'shares' 
        AND column_name = 'share_url'
    ) THEN
        ALTER TABLE public.shares ADD COLUMN share_url TEXT;
        RAISE NOTICE 'Added share_url column to shares table';
    END IF;
END $$;

-- Fix foreign key constraints for shares table
DO $$
BEGIN
    -- Drop existing constraints if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'shares' 
        AND constraint_name = 'fk_shares_pitch_id'
    ) THEN
        ALTER TABLE public.shares DROP CONSTRAINT fk_shares_pitch_id;
        RAISE NOTICE 'Dropped fk_shares_pitch_id constraint';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'shares' 
        AND constraint_name = 'fk_shares_user_id'
    ) THEN
        ALTER TABLE public.shares DROP CONSTRAINT fk_shares_user_id;
        RAISE NOTICE 'Dropped fk_shares_user_id constraint';
    END IF;

    -- Add new constraints
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'shares' 
        AND column_name = 'pitch_id'
    ) THEN
        ALTER TABLE public.shares ADD CONSTRAINT fk_shares_pitch_id 
          FOREIGN KEY (pitch_id) REFERENCES public.pitches(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added fk_shares_pitch_id constraint';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'shares' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.shares ADD CONSTRAINT fk_shares_user_id 
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added fk_shares_user_id constraint';
    END IF;
END $$;

-- Add indexes for shares table
CREATE INDEX IF NOT EXISTS idx_shares_pitch_id ON public.shares(pitch_id);
CREATE INDEX IF NOT EXISTS idx_shares_user_id ON public.shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_created_at ON public.shares(created_at);

-- =====================================================
-- ENABLE RLS AND CREATE POLICIES
-- =====================================================

-- Enable RLS on tables
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for likes table
DROP POLICY IF EXISTS "Users can view likes" ON public.likes;
CREATE POLICY "Users can view likes" ON public.likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create likes" ON public.likes;
CREATE POLICY "Users can create likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own likes" ON public.likes;
CREATE POLICY "Users can delete own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for shares table
DROP POLICY IF EXISTS "Users can view shares" ON public.shares;
CREATE POLICY "Users can view shares" ON public.shares FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create shares" ON public.shares;
CREATE POLICY "Users can create shares" ON public.shares FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Show final structures
SELECT 'FINAL LIKES STRUCTURE' as info, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'likes'
ORDER BY ordinal_position;

SELECT 'FINAL SHARES STRUCTURE' as info, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'shares'
ORDER BY ordinal_position;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
