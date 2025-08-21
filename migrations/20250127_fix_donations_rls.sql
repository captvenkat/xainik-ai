-- Fix Donations RLS Policy for Anonymous Donations
-- Migration: 20250127_fix_donations_rls.sql

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS v_donations_owner ON donations;

-- Create a new policy that allows anonymous donations
CREATE POLICY v_donations_owner ON donations
  FOR ALL USING (
    -- Allow if user_id matches current user OR if it's an anonymous donation (user_id is null)
    user_id = auth.uid() OR user_id IS NULL
  ) WITH CHECK (
    -- Same logic for INSERT/UPDATE
    user_id = auth.uid() OR user_id IS NULL
  );

-- Also ensure the public view policy exists
CREATE POLICY IF NOT EXISTS v_donations_public ON donations
  FOR SELECT USING (true);

-- Grant necessary permissions
GRANT ALL ON public.donations TO authenticated;
GRANT SELECT ON public.donations TO anon;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'DONATIONS RLS POLICY FIXED!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '✅ Anonymous donations now allowed (user_id IS NULL)';
  RAISE NOTICE '✅ Authenticated users can still manage their own donations';
  RAISE NOTICE '✅ Public can view all donations';
  RAISE NOTICE '✅ Donation form should now work correctly';
  RAISE NOTICE '============================================================================';
END $$;
