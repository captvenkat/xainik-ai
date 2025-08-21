-- Delete user venky24aug@gmail.com from database
-- This script will remove the user from all related tables

-- First, find the user ID
DO $$
DECLARE
    user_id_to_delete uuid;
BEGIN
    -- Get the user ID for venky24aug@gmail.com
    SELECT id INTO user_id_to_delete 
    FROM public.users 
    WHERE email = 'venky24aug@gmail.com';
    
    IF user_id_to_delete IS NOT NULL THEN
        RAISE NOTICE 'Found user with ID: %', user_id_to_delete;
        
        -- Delete from resume_requests (both as recruiter and user)
        DELETE FROM public.resume_requests 
        WHERE recruiter_user_id = user_id_to_delete OR user_id = user_id_to_delete;
        RAISE NOTICE 'Deleted resume requests for user';
        
        -- Delete from endorsements (both as veteran and endorser)
        DELETE FROM public.endorsements 
        WHERE veteran_user_id = user_id_to_delete OR endorser_user_id = user_id_to_delete;
        RAISE NOTICE 'Deleted endorsements for user';
        
        -- Delete from pitches
        DELETE FROM public.pitches 
        WHERE user_id = user_id_to_delete;
        RAISE NOTICE 'Deleted pitches for user';
        
        -- Delete from user_profiles
        DELETE FROM public.user_profiles 
        WHERE user_id = user_id_to_delete;
        RAISE NOTICE 'Deleted user profiles for user';
        
        -- Finally, delete from users table
        DELETE FROM public.users 
        WHERE id = user_id_to_delete;
        RAISE NOTICE 'Deleted user from users table';
        
        RAISE NOTICE 'User deletion completed successfully';
    ELSE
        RAISE NOTICE 'User with email venky24aug@gmail.com not found';
    END IF;
END $$;
