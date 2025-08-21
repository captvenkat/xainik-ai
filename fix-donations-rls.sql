-- Fix Donations RLS Policy for Anonymous Donations
-- This fixes the issue where anonymous donations were being blocked

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

-- Ensure the public view policy exists
CREATE POLICY IF NOT EXISTS v_donations_public ON donations
  FOR SELECT USING (true);

-- Grant necessary permissions
GRANT ALL ON public.donations TO authenticated;
GRANT SELECT ON public.donations TO anon;
