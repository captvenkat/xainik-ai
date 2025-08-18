-- Fix Database Relationships
-- This script fixes the missing foreign key relationships that are causing errors

-- 1. Add foreign key constraint between pitches and users
ALTER TABLE pitches 
ADD CONSTRAINT fk_pitches_user_id 
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- 2. Add foreign key constraint between endorsements and users
ALTER TABLE endorsements 
ADD CONSTRAINT fk_endorsements_user_id 
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- 3. Add foreign key constraint between endorsements and pitches
ALTER TABLE endorsements 
ADD CONSTRAINT fk_endorsements_pitch_id 
FOREIGN KEY (pitch_id) REFERENCES pitches(id)
ON DELETE CASCADE;

-- 4. Add foreign key constraint between referrals and users
ALTER TABLE referrals 
ADD CONSTRAINT fk_referrals_user_id 
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- 5. Add foreign key constraint between referrals and pitches
ALTER TABLE referrals 
ADD CONSTRAINT fk_referrals_pitch_id 
FOREIGN KEY (pitch_id) REFERENCES pitches(id)
ON DELETE CASCADE;

-- 6. Add foreign key constraint between referral_events and referrals
ALTER TABLE referral_events 
ADD CONSTRAINT fk_referral_events_referral_id 
FOREIGN KEY (referral_id) REFERENCES referrals(id)
ON DELETE CASCADE;

-- 7. Add foreign key constraint between shared_pitches and users
ALTER TABLE shared_pitches 
ADD CONSTRAINT fk_shared_pitches_user_id 
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- 8. Add foreign key constraint between shared_pitches and pitches
ALTER TABLE shared_pitches 
ADD CONSTRAINT fk_shared_pitches_pitch_id 
FOREIGN KEY (pitch_id) REFERENCES pitches(id)
ON DELETE CASCADE;

-- 9. Add foreign key constraint between donations and users (optional, for anonymous donations)
ALTER TABLE donations 
ADD CONSTRAINT fk_donations_user_id 
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE SET NULL;

-- 10. Add foreign key constraint between resume_requests and users
ALTER TABLE resume_requests 
ADD CONSTRAINT fk_resume_requests_user_id 
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- 11. Add foreign key constraint between resume_requests and pitches
ALTER TABLE resume_requests 
ADD CONSTRAINT fk_resume_requests_pitch_id 
FOREIGN KEY (pitch_id) REFERENCES pitches(id)
ON DELETE CASCADE;

-- 12. Add foreign key constraint between notifications and users
ALTER TABLE notifications 
ADD CONSTRAINT fk_notifications_user_id 
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- 13. Add foreign key constraint between notification_prefs and users
ALTER TABLE notification_prefs 
ADD CONSTRAINT fk_notification_prefs_user_id 
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- 14. Add foreign key constraint between email_logs and users
ALTER TABLE email_logs 
ADD CONSTRAINT fk_email_logs_user_id 
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- Verify the relationships are working
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
