-- SIMPLE FIX: Remove Availability Constraint
-- Run this in Supabase SQL Editor to allow any availability value

-- Drop the problematic constraint
ALTER TABLE pitches DROP CONSTRAINT IF EXISTS pitches_availability_check;

-- Verify the constraint is gone
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'pitches'::regclass 
AND conname = 'pitches_availability_check';

-- Test that we can now insert with "30 days"
INSERT INTO pitches (
    user_id, 
    title, 
    pitch_text, 
    skills, 
    job_type, 
    availability, 
    location, 
    is_active
) VALUES (
    '4c5a525f-77d7-4350-b4e3-eb6459abecdc',
    'Test - 30 days',
    'Test pitch',
    ARRAY['test'],
    'full-time',
    '30 days',
    'Test Location',
    true
);

-- Clean up the test record
DELETE FROM pitches WHERE title = 'Test - 30 days';

-- Success message
SELECT 'Availability constraint removed successfully! Pitch creation should now work.' as status;
