-- Fix RLS policies for pitches table
-- This migration ensures users can create and manage their own pitches

-- First, let's check if RLS is enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'pitches'
    ) THEN
        RAISE EXCEPTION 'Pitches table does not exist';
    END IF;
END $$;

-- Enable RLS on pitches table if not already enabled
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all active pitches" ON pitches;
DROP POLICY IF EXISTS "Users can create their own pitches" ON pitches;
DROP POLICY IF EXISTS "Users can update their own pitches" ON pitches;
DROP POLICY IF EXISTS "Users can delete their own pitches" ON pitches;
DROP POLICY IF EXISTS "Users can view their own pitches" ON pitches;

-- Create comprehensive RLS policies for pitches table

-- Policy 1: Users can view all active pitches (for browsing)
CREATE POLICY "Users can view all active pitches" ON pitches
    FOR SELECT
    USING (is_active = true);

-- Policy 2: Users can view their own pitches (including inactive ones)
CREATE POLICY "Users can view their own pitches" ON pitches
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 3: Users can create their own pitches
CREATE POLICY "Users can create their own pitches" ON pitches
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can update their own pitches
CREATE POLICY "Users can update their own pitches" ON pitches
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 5: Users can delete their own pitches
CREATE POLICY "Users can delete their own pitches" ON pitches
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON POLICY "Users can view all active pitches" ON pitches IS 'Allows users to browse active pitches';
COMMENT ON POLICY "Users can view their own pitches" ON pitches IS 'Allows users to view their own pitches (including inactive)';
COMMENT ON POLICY "Users can create their own pitches" ON pitches IS 'Allows authenticated users to create pitches';
COMMENT ON POLICY "Users can update their own pitches" ON pitches IS 'Allows users to update their own pitches';
COMMENT ON POLICY "Users can delete their own pitches" ON pitches IS 'Allows users to delete their own pitches';

-- Verify the policies were created
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
WHERE tablename = 'pitches'
ORDER BY policyname;

-- Test the policies by checking if they exist
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'pitches';
    
    RAISE NOTICE 'Created % RLS policies for pitches table', policy_count;
END $$;
