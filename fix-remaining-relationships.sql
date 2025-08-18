-- Fix Remaining Database Relationships
-- This script fixes the missing user_subscriptions relationship

-- Add foreign key constraint between user_subscriptions and users
ALTER TABLE user_subscriptions 
ADD CONSTRAINT fk_user_subscriptions_user_id 
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- Add foreign key constraint between user_subscriptions and pitches (if needed)
-- This depends on your schema - uncomment if user_subscriptions has a pitch_id column
-- ALTER TABLE user_subscriptions 
-- ADD CONSTRAINT fk_user_subscriptions_pitch_id 
-- FOREIGN KEY (pitch_id) REFERENCES pitches(id)
-- ON DELETE CASCADE;

-- Verify all relationships are working
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
