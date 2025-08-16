-- EMERGENCY FIX: Availability Constraint for Pitches Table
-- Run this in Supabase SQL Editor to fix availability constraint issues

-- First, let's see what the current constraint looks like
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'pitches'::regclass 
AND conname = 'pitches_availability_check';

-- Drop the existing constraint
ALTER TABLE pitches DROP CONSTRAINT IF EXISTS pitches_availability_check;

-- Create a new constraint that accepts the values we're using
ALTER TABLE pitches ADD CONSTRAINT pitches_availability_check 
CHECK (availability IN ('Immediate', '30 days', '60 days', '90 days', 'immediate', '30 Days', '60 Days', '90 Days'));

-- Alternative: Make it more flexible with a pattern match
-- ALTER TABLE pitches ADD CONSTRAINT pitches_availability_check 
-- CHECK (availability ~* '^(immediate|30\s*days?|60\s*days?|90\s*days?)$');

-- Verify the new constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'pitches'::regclass 
AND conname = 'pitches_availability_check';

-- Test the constraint with our values
DO $$
DECLARE
    test_values TEXT[] := ARRAY['Immediate', '30 days', '60 days', '90 days', 'immediate', '30 Days', '60 Days', '90 Days'];
    test_value TEXT;
BEGIN
    FOREACH test_value IN ARRAY test_values
    LOOP
        BEGIN
            -- Try to insert a test record
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
                'Test - ' || test_value,
                'Test pitch',
                ARRAY['test'],
                'full-time',
                test_value,
                'Test Location',
                true
            );
            
            RAISE NOTICE '✅ "%" - ACCEPTED', test_value;
            
            -- Clean up
            DELETE FROM pitches WHERE title = 'Test - ' || test_value;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ "%" - REJECTED: %', test_value, SQLERRM;
        END;
    END LOOP;
END $$;

-- Show success message
SELECT 'Availability constraint has been fixed successfully!' as status;
