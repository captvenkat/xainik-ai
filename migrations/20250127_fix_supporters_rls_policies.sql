-- Fix Supporters RLS Policies Migration
-- Migration: 20250127_fix_supporters_rls_policies.sql
-- Fixes RLS policies to allow supporters to manage their own profiles

-- Enable RLS on supporters table if not already enabled
ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Supporters can view own profile" ON public.supporters;
DROP POLICY IF EXISTS "Supporters can insert own profile" ON public.supporters;
DROP POLICY IF EXISTS "Supporters can update own profile" ON public.supporters;
DROP POLICY IF EXISTS "Supporters can delete own profile" ON public.supporters;

-- Create policy for supporters to view their own profile
CREATE POLICY "Supporters can view own profile" ON public.supporters
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy for supporters to insert their own profile
CREATE POLICY "Supporters can insert own profile" ON public.supporters
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy for supporters to update their own profile
CREATE POLICY "Supporters can update own profile" ON public.supporters
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy for supporters to delete their own profile
CREATE POLICY "Supporters can delete own profile" ON public.supporters
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supporters TO authenticated;

-- Also ensure users table has proper RLS for location updates
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing user policies if they exist
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create policy for users to update their own profile (including location)
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Grant necessary permissions to authenticated users for users table
GRANT SELECT, UPDATE ON public.users TO authenticated;
