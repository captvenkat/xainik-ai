-- Fix AI-Powered Pitch Creation - Complete Database Schema
-- This script adds all missing columns needed for both AI-first and optimized pitch creators

BEGIN;

-- =====================================================
-- FIX PITCHES TABLE - Add all missing columns
-- =====================================================

DO $$
BEGIN
    -- Add all missing columns to pitches table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'resume_url'
    ) THEN
        ALTER TABLE public.pitches ADD COLUMN resume_url TEXT;
        RAISE NOTICE 'Added resume_url column to pitches table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'resume_share_enabled'
    ) THEN
        ALTER TABLE public.pitches ADD COLUMN resume_share_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added resume_share_enabled column to pitches table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'linkedin_url'
    ) THEN
        ALTER TABLE public.pitches ADD COLUMN linkedin_url TEXT;
        RAISE NOTICE 'Added linkedin_url column to pitches table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'location_preferred'
    ) THEN
        ALTER TABLE public.pitches ADD COLUMN location_preferred TEXT[];
        RAISE NOTICE 'Added location_preferred column to pitches table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'experience_years'
    ) THEN
        ALTER TABLE public.pitches ADD COLUMN experience_years INTEGER CHECK (experience_years >= 0);
        RAISE NOTICE 'Added experience_years column to pitches table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'views_count'
    ) THEN
        ALTER TABLE public.pitches ADD COLUMN views_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added views_count column to pitches table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.pitches ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added metadata column to pitches table';
    END IF;

    -- Add email column if it doesn't exist (for optimized form)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.pitches ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Added email column to pitches table';
    END IF;

    -- Add end_date column if it doesn't exist (for optimized form)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pitches' 
        AND column_name = 'end_date'
    ) THEN
        ALTER TABLE public.pitches ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added end_date column to pitches table';
    END IF;
END $$;

-- =====================================================
-- FIX USERS TABLE - Add missing profile columns
-- =====================================================

DO $$
BEGIN
    -- Add missing profile columns to users table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'location'
    ) THEN
        ALTER TABLE public.users ADD COLUMN location VARCHAR(255);
        RAISE NOTICE 'Added location column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'military_branch'
    ) THEN
        ALTER TABLE public.users ADD COLUMN military_branch VARCHAR(100);
        RAISE NOTICE 'Added military_branch column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'military_rank'
    ) THEN
        ALTER TABLE public.users ADD COLUMN military_rank VARCHAR(100);
        RAISE NOTICE 'Added military_rank column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'years_of_service'
    ) THEN
        ALTER TABLE public.users ADD COLUMN years_of_service INTEGER;
        RAISE NOTICE 'Added years_of_service column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'discharge_date'
    ) THEN
        ALTER TABLE public.users ADD COLUMN discharge_date DATE;
        RAISE NOTICE 'Added discharge_date column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'education_level'
    ) THEN
        ALTER TABLE public.users ADD COLUMN education_level VARCHAR(100);
        RAISE NOTICE 'Added education_level column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'certifications'
    ) THEN
        ALTER TABLE public.users ADD COLUMN certifications TEXT[];
        RAISE NOTICE 'Added certifications column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'bio'
    ) THEN
        ALTER TABLE public.users ADD COLUMN bio TEXT;
        RAISE NOTICE 'Added bio column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.users ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE public.users ADD COLUMN email_verified BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added email_verified column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'phone_verified'
    ) THEN
        ALTER TABLE public.users ADD COLUMN phone_verified BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added phone_verified column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'last_login_at'
    ) THEN
        ALTER TABLE public.users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added last_login_at column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.users ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added metadata column to users table';
    END IF;
END $$;

-- =====================================================
-- FIX VETERANS TABLE - Add missing columns
-- =====================================================

DO $$
BEGIN
    -- Add missing columns to veterans table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'veterans' 
        AND column_name = 'location_current'
    ) THEN
        ALTER TABLE public.veterans ADD COLUMN location_current VARCHAR(255);
        RAISE NOTICE 'Added location_current column to veterans table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'veterans' 
        AND column_name = 'years_experience'
    ) THEN
        ALTER TABLE public.veterans ADD COLUMN years_experience INTEGER DEFAULT 0;
        RAISE NOTICE 'Added years_experience column to veterans table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'veterans' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.veterans ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to veterans table';
    END IF;
END $$;

-- =====================================================
-- FIX RECRUITERS AND SUPPORTERS TABLES
-- =====================================================

DO $$
BEGIN
    -- Add updated_at to recruiters table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'recruiters' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.recruiters ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to recruiters table';
    END IF;

    -- Add updated_at to supporters table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'supporters' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.supporters ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to supporters table';
    END IF;
END $$;

-- =====================================================
-- CREATE MISSING TABLES
-- =====================================================

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_type VARCHAR(50) NOT NULL DEFAULT 'veteran',
    profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, profile_type)
);

-- Create resume_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS resume_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recruiter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pitch_id UUID REFERENCES pitches(id) ON DELETE SET NULL,
    job_role VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'expired')),
    message TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    response_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ADD INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_pitches_user_id ON public.pitches(user_id);
CREATE INDEX IF NOT EXISTS idx_pitches_is_active ON public.pitches(is_active);
CREATE INDEX IF NOT EXISTS idx_pitches_created_at ON public.pitches(created_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_veterans_user_id ON public.veterans(user_id);

-- =====================================================
-- ENABLE RLS AND CREATE POLICIES
-- =====================================================

-- Enable RLS on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for pitches table
DROP POLICY IF EXISTS "Users can create own pitches" ON public.pitches;
CREATE POLICY "Users can create own pitches" ON public.pitches FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view all active pitches" ON public.pitches;
CREATE POLICY "Users can view all active pitches" ON public.pitches FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can update own pitches" ON public.pitches;
CREATE POLICY "Users can update own pitches" ON public.pitches FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for veterans table
DROP POLICY IF EXISTS "Users can manage own veteran profile" ON public.veterans;
CREATE POLICY "Users can manage own veteran profile" ON public.veterans FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for user_profiles table
DROP POLICY IF EXISTS "Users can manage own profiles" ON public.user_profiles;
CREATE POLICY "Users can manage own profiles" ON public.user_profiles FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for resume_requests table
DROP POLICY IF EXISTS "Users can create resume requests" ON public.resume_requests;
CREATE POLICY "Users can create resume requests" ON public.resume_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own resume requests" ON public.resume_requests;
CREATE POLICY "Users can view own resume requests" ON public.resume_requests FOR SELECT USING (auth.uid() = user_id OR auth.uid() = recruiter_user_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
