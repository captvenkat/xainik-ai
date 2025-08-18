-- Fix user_subscriptions relationship issue
-- Run this in your Supabase SQL Editor to fix the database relationship error

-- Check if user_subscriptions table exists and has the right structure
DO $$
BEGIN
    -- Add foreign key constraint between user_subscriptions and users if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_subscriptions_user_id' 
        AND table_name = 'user_subscriptions'
    ) THEN
        ALTER TABLE user_subscriptions 
        ADD CONSTRAINT fk_user_subscriptions_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Verify the relationship is working
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
    AND tc.table_name = 'user_subscriptions'
    AND tc.table_schema = 'public';
