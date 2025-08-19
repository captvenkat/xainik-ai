-- Fix Foreign Key Relationships
-- This script creates the proper foreign key constraints that the queries expect

-- 1. DROP EXISTING FOREIGN KEYS IF THEY EXIST (to avoid conflicts)
DO $$ 
BEGIN
  -- Drop foreign keys if they exist
  ALTER TABLE public.referrals DROP CONSTRAINT IF EXISTS referrals_pitch_id_fkey CASCADE;
  ALTER TABLE public.referrals DROP CONSTRAINT IF EXISTS referrals_user_id_fkey CASCADE;
  ALTER TABLE public.referrals DROP CONSTRAINT IF EXISTS referrals_supporter_id_fkey CASCADE;
  
  ALTER TABLE public.referral_events DROP CONSTRAINT IF EXISTS referral_events_referral_id_fkey CASCADE;
  
  ALTER TABLE public.community_suggestions DROP CONSTRAINT IF EXISTS community_suggestions_user_id_fkey CASCADE;
END $$;

-- 2. CREATE PROPER FOREIGN KEY CONSTRAINTS
-- Referrals table foreign keys
ALTER TABLE public.referrals 
ADD CONSTRAINT referrals_pitch_id_fkey 
FOREIGN KEY (pitch_id) REFERENCES public.pitches(id) ON DELETE CASCADE;

ALTER TABLE public.referrals 
ADD CONSTRAINT referrals_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.referrals 
ADD CONSTRAINT referrals_supporter_id_fkey 
FOREIGN KEY (supporter_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Referral events table foreign keys
ALTER TABLE public.referral_events 
ADD CONSTRAINT referral_events_referral_id_fkey 
FOREIGN KEY (referral_id) REFERENCES public.referrals(id) ON DELETE CASCADE;

-- Community suggestions table foreign keys
ALTER TABLE public.community_suggestions 
ADD CONSTRAINT community_suggestions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 3. VERIFY THE CONSTRAINTS WERE CREATED
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('referrals', 'referral_events', 'community_suggestions')
ORDER BY tc.table_name, tc.constraint_name;

-- 4. ADD SAMPLE DATA TO TEST THE RELATIONSHIPS
-- First, make sure we have a pitch to reference
INSERT INTO public.pitches (id, user_id, title, pitch_text, skills, experience_years, created_at)
SELECT 
  gen_random_uuid(),
  '4c5a525f-77d7-4350-b4e3-eb6459abecdc'::uuid,
  'Sample Veteran Pitch',
  'Experienced military leader seeking civilian opportunities',
  ARRAY['Leadership', 'Management', 'Strategy'],
  10,
  now()
WHERE NOT EXISTS (SELECT 1 FROM public.pitches WHERE user_id = '4c5a525f-77d7-4350-b4e3-eb6459abecdc'::uuid);

-- Add a referral record
INSERT INTO public.referrals (user_id, supporter_id, pitch_id)
SELECT 
  '4c5a525f-77d7-4350-b4e3-eb6459abecdc'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  (SELECT id FROM public.pitches WHERE user_id = '4c5a525f-77d7-4350-b4e3-eb6459abecdc'::uuid LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.referrals WHERE user_id = '4c5a525f-77d7-4350-b4e3-eb6459abecdc'::uuid)
AND EXISTS (SELECT 1 FROM public.pitches WHERE user_id = '4c5a525f-77d7-4350-b4e3-eb6459abecdc'::uuid);

-- Add a referral event
INSERT INTO public.referral_events (referral_id, event_type, platform)
SELECT 
  (SELECT id FROM public.referrals WHERE user_id = '4c5a525f-77d7-4350-b4e3-eb6459abecdc'::uuid LIMIT 1),
  'view',
  'web'
WHERE NOT EXISTS (SELECT 1 FROM public.referral_events LIMIT 1)
AND EXISTS (SELECT 1 FROM public.referrals WHERE user_id = '4c5a525f-77d7-4350-b4e3-eb6459abecdc'::uuid);

-- 5. TEST THE RELATIONSHIPS WITH THE SAME QUERIES THAT ARE FAILING
-- Test referrals query
SELECT 
  'Testing Referrals Query' as test_name,
  COUNT(*) as result_count
FROM public.referrals r
JOIN public.pitches p ON r.pitch_id = p.id
WHERE p.user_id = '4c5a525f-77d7-4350-b4e3-eb6459abecdc'::uuid;

-- Test referral_events query
SELECT 
  'Testing Referral Events Query' as test_name,
  COUNT(*) as result_count
FROM public.referral_events re
JOIN public.referrals r ON re.referral_id = r.id
JOIN public.pitches p ON r.pitch_id = p.id
WHERE p.user_id = '4c5a525f-77d7-4350-b4e3-eb6459abecdc'::uuid
AND re.occurred_at >= now() - interval '30 days';

-- Test community_suggestions query
SELECT 
  'Testing Community Suggestions Query' as test_name,
  COUNT(*) as result_count
FROM public.community_suggestions;

-- 6. FINAL VERIFICATION
SELECT 
  'Foreign Key Relationships Fixed' as status,
  (SELECT COUNT(*) FROM public.referrals) as referrals_count,
  (SELECT COUNT(*) FROM public.referral_events) as referral_events_count,
  (SELECT COUNT(*) FROM public.pitches) as pitches_count,
  (SELECT COUNT(*) FROM public.community_suggestions) as community_suggestions_count;
