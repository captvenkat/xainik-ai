-- Fix Pitch Creation - Add Missing Columns
-- This script adds the missing columns that the AI-first pitch creator needs

BEGIN;

-- Add missing columns to pitches table
DO $$
BEGIN
    -- Add resume_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'resume_url'
    ) THEN
        ALTER TABLE public.pitches ADD COLUMN resume_url TEXT;
        RAISE NOTICE 'Added resume_url column to pitches table';
    END IF;

    -- Add resume_share_enabled column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'resume_share_enabled'
    ) THEN
        ALTER TABLE public.pitches ADD COLUMN resume_share_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added resume_share_enabled column to pitches table';
    END IF;

    -- Add linkedin_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'linkedin_url'
    ) THEN
        ALTER TABLE public.pitches ADD COLUMN linkedin_url TEXT;
        RAISE NOTICE 'Added linkedin_url column to pitches table';
    END IF;

    -- Add location_preferred column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'location_preferred'
    ) THEN
        ALTER TABLE public.pitches ADD COLUMN location_preferred TEXT[];
        RAISE NOTICE 'Added location_preferred column to pitches table';
    END IF;

    -- Add experience_years column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'experience_years'
    ) THEN
        ALTER TABLE public.pitches ADD COLUMN experience_years INTEGER CHECK (experience_years >= 0);
        RAISE NOTICE 'Added experience_years column to pitches table';
    END IF;

    -- Add views_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'views_count'
    ) THEN
        ALTER TABLE public.pitches ADD COLUMN views_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added views_count column to pitches table';
    END IF;

    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.pitches ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added metadata column to pitches table';
    END IF;
END $$;

-- Fix foreign key constraints for likes table
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'likes' 
        AND constraint_name = 'fk_likes_user_id'
    ) THEN
        ALTER TABLE public.likes DROP CONSTRAINT fk_likes_user_id;
        RAISE NOTICE 'Dropped fk_likes_user_id constraint';
    END IF;

    -- Add new constraint
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

-- Fix foreign key constraints for shares table
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'shares' 
        AND constraint_name = 'fk_shares_user_id'
    ) THEN
        ALTER TABLE public.shares DROP CONSTRAINT fk_shares_user_id;
        RAISE NOTICE 'Dropped fk_shares_user_id constraint';
    END IF;

    -- Add new constraint
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

-- Fix foreign key constraints for community_suggestions table
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'community_suggestions' 
        AND constraint_name = 'fk_community_suggestions_user_id'
    ) THEN
        ALTER TABLE public.community_suggestions DROP CONSTRAINT fk_community_suggestions_user_id;
        RAISE NOTICE 'Dropped fk_community_suggestions_user_id constraint';
    END IF;

    -- Add new constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'community_suggestions' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.community_suggestions ADD CONSTRAINT fk_community_suggestions_user_id 
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added fk_community_suggestions_user_id constraint';
    END IF;
END $$;

-- Fix foreign key constraints for mission_invitation_summary table
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'mission_invitation_summary' 
        AND constraint_name = 'fk_mission_invitation_summary_user_id'
    ) THEN
        ALTER TABLE public.mission_invitation_summary DROP CONSTRAINT fk_mission_invitation_summary_user_id;
        RAISE NOTICE 'Dropped fk_mission_invitation_summary_user_id constraint';
    END IF;

    -- Add new constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mission_invitation_summary' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.mission_invitation_summary ADD CONSTRAINT fk_mission_invitation_summary_user_id 
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added fk_mission_invitation_summary_user_id constraint';
    END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
