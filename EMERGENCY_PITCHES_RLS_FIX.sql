-- EMERGENCY FIX: RLS Policies for Pitches Table
-- Run this in Supabase SQL Editor to fix pitch creation issues

-- Enable RLS on pitches table
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all active pitches" ON pitches;
DROP POLICY IF EXISTS "Users can create their own pitches" ON pitches;
DROP POLICY IF EXISTS "Users can update their own pitches" ON pitches;
DROP POLICY IF EXISTS "Users can delete their own pitches" ON pitches;
DROP POLICY IF EXISTS "Users can view their own pitches" ON pitches;

-- Create the essential policy for pitch creation
CREATE POLICY "Users can create their own pitches" ON pitches
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy for viewing all active pitches (for browsing)
CREATE POLICY "Users can view all active pitches" ON pitches
    FOR SELECT
    USING (is_active = true);

-- Create policy for viewing own pitches (including inactive)
CREATE POLICY "Users can view their own pitches" ON pitches
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy for updating own pitches
CREATE POLICY "Users can update their own pitches" ON pitches
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy for deleting own pitches
CREATE POLICY "Users can delete their own pitches" ON pitches
    FOR DELETE
    USING (auth.uid() = user_id);

-- Verify the policies were created
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'pitches'
ORDER BY policyname;

-- Test message
SELECT 'RLS policies for pitches table have been created successfully!' as status;
