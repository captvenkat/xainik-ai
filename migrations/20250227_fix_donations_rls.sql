-- =====================================================
-- FIX DONATIONS RLS POLICY FOR ANONYMOUS DONATIONS
-- =====================================================

BEGIN;

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS v_donations_owner ON donations;

-- Create new policy that allows anonymous donations
CREATE POLICY v_donations_insert ON donations
  FOR INSERT WITH CHECK (
    -- Allow anonymous donations (user_id IS NULL)
    user_id IS NULL 
    OR 
    -- Allow authenticated users to donate for themselves
    user_id = auth.uid()
  );

-- Create policy for users to view their own donations
CREATE POLICY v_donations_select ON donations
  FOR SELECT USING (
    -- Allow viewing anonymous donations (public)
    user_id IS NULL 
    OR 
    -- Allow users to view their own donations
    user_id = auth.uid()
  );

-- Create policy for users to update their own donations
CREATE POLICY v_donations_update ON donations
  FOR UPDATE USING (
    -- Only allow updates if user_id matches authenticated user
    user_id = auth.uid()
  ) WITH CHECK (
    -- Only allow updates if user_id matches authenticated user
    user_id = auth.uid()
  );

COMMIT;
