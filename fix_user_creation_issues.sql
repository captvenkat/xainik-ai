-- Fix user creation issues and check RLS policies
-- Run this in your Supabase SQL Editor

-- 1. Check current RLS policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- 2. Check if there are any constraints on the users table
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- 3. Check the users table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Test inserting a user with proper date handling
-- This will help identify if the issue is with date fields
INSERT INTO public.users (
  id,
  email,
  name,
  phone,
  role,
  location,
  military_branch,
  military_rank,
  years_of_service,
  discharge_date,
  education_level,
  certifications,
  bio,
  avatar_url,
  is_active,
  email_verified,
  phone_verified,
  last_login_at,
  metadata
) VALUES (
  'test-user-' || gen_random_uuid(),
  'test@example.com',
  'Test User',
  '',
  'veteran',
  '',
  '',
  '',
  0,
  NULL, -- discharge_date as NULL instead of empty string
  '',
  NULL,
  '',
  NULL,
  true,
  false,
  false,
  NULL, -- last_login_at as NULL
  '{}'
) ON CONFLICT (id) DO NOTHING;

-- 5. Clean up test data
DELETE FROM public.users WHERE email = 'test@example.com';

-- 6. Check if there are any triggers that might be causing issues
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- 7. Verify RLS is working correctly
-- This should return the current user's data if RLS is working
SELECT id, email, role FROM public.users LIMIT 5;
