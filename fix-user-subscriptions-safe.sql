-- Safe fix for user_subscriptions relationship
-- This script checks if the constraint exists before trying to add it

-- Check if user_subscriptions table exists
DO $$
BEGIN
    -- Only add the constraint if it doesn't already exist
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_subscriptions' 
        AND table_schema = 'public'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_subscriptions_user_id' 
        AND table_name = 'user_subscriptions'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_subscriptions 
        ADD CONSTRAINT fk_user_subscriptions_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint fk_user_subscriptions_user_id';
    ELSE
        RAISE NOTICE 'Constraint fk_user_subscriptions_user_id already exists or table does not exist';
    END IF;
END $$;

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
    AND tc.table_name IN ('pitches', 'endorsements', 'referrals', 'user_subscriptions')
ORDER BY tc.table_name, kcu.column_name;
