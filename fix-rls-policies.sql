-- Fix RLS Policies for User Access
-- Run this in Supabase SQL Editor to fix the 406 errors

-- First, drop existing problematic policies
DROP POLICY IF EXISTS "Users can manage own profile" ON public.users;
DROP POLICY IF EXISTS "Admin can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can create profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can read basic user info" ON public.users;

-- Create new policies that allow users to access their own records
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to create their own profile during signup
CREATE POLICY "Users can create profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NOT NULL);

-- Allow authenticated users to read other users' basic info (for navigation, etc.)
CREATE POLICY "Authenticated users can read basic user info" ON public.users
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- Test the policies by checking if they were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users' 
AND schemaname = 'public';
