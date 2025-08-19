-- Fix Dashboard Database Relationships
-- This script fixes all the 400 Bad Request errors

-- 1. CHECK AND FIX REFERRALS TABLE RELATIONSHIPS

-- First, let's see what columns exist in referrals table
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'referrals'
ORDER BY ordinal_position;

-- 2. FIX REFERRALS TABLE STRUCTURE
-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add pitch_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'referrals' 
    AND column_name = 'pitch_id'
  ) THEN
    ALTER TABLE public.referrals ADD COLUMN pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE;
  END IF;
  
  -- Add user_id if it doesn't exist (instead of supporter_id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'referrals' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.referrals ADD COLUMN user_id uuid REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
  
  -- Add supporter_id if it doesn't exist (for backward compatibility)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'referrals' 
    AND column_name = 'supporter_id'
  ) THEN
    ALTER TABLE public.referrals ADD COLUMN supporter_id uuid REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. FIX REFERRAL_EVENTS TABLE STRUCTURE
-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add referral_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'referral_events' 
    AND column_name = 'referral_id'
  ) THEN
    ALTER TABLE public.referral_events ADD COLUMN referral_id uuid REFERENCES public.referrals(id) ON DELETE CASCADE;
  END IF;
  
  -- Add event_type if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'referral_events' 
    AND column_name = 'event_type'
  ) THEN
    ALTER TABLE public.referral_events ADD COLUMN event_type text DEFAULT 'view';
  END IF;
  
  -- Add platform if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'referral_events' 
    AND column_name = 'platform'
  ) THEN
    ALTER TABLE public.referral_events ADD COLUMN platform text DEFAULT 'web';
  END IF;
  
  -- Add occurred_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'referral_events' 
    AND column_name = 'occurred_at'
  ) THEN
    ALTER TABLE public.referral_events ADD COLUMN occurred_at timestamptz DEFAULT now();
  END IF;
END $$;

-- 4. FIX PITCHES TABLE STRUCTURE
-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add photo_url if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitches' 
    AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE public.pitches ADD COLUMN photo_url text;
  END IF;
  
  -- Add experience_years if it doesn't exist (instead of experience)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitches' 
    AND column_name = 'experience_years'
  ) THEN
    ALTER TABLE public.pitches ADD COLUMN experience_years integer;
  END IF;
  
  -- Add pitch_text if it doesn't exist (instead of content)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitches' 
    AND column_name = 'pitch_text'
  ) THEN
    ALTER TABLE public.pitches ADD COLUMN pitch_text text;
  END IF;
END $$;

-- 5. CREATE MISSING TABLES IF THEY DON'T EXIST

-- Create referrals table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  supporter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create referral_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.referral_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid REFERENCES public.referrals(id) ON DELETE CASCADE,
  event_type text DEFAULT 'view',
  platform text DEFAULT 'web',
  occurred_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON public.referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_supporter_id ON public.referrals(supporter_id);
CREATE INDEX IF NOT EXISTS idx_referrals_pitch_id ON public.referrals(pitch_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_referral_id ON public.referral_events(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_occurred_at ON public.referral_events(occurred_at);

-- 7. ENABLE RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;

-- 8. CREATE RLS POLICIES
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can create referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can view referral events" ON public.referral_events;
DROP POLICY IF EXISTS "Users can create referral events" ON public.referral_events;

CREATE POLICY "Users can view their own referrals" ON public.referrals FOR SELECT USING (
  auth.uid() = user_id OR auth.uid() = supporter_id
);
CREATE POLICY "Users can create referrals" ON public.referrals FOR INSERT WITH CHECK (
  auth.uid() = user_id OR auth.uid() = supporter_id
);

CREATE POLICY "Users can view referral events" ON public.referral_events FOR SELECT USING (true);
CREATE POLICY "Users can create referral events" ON public.referral_events FOR INSERT WITH CHECK (true);

-- 9. GRANT PERMISSIONS
GRANT ALL ON public.referrals TO authenticated;
GRANT ALL ON public.referral_events TO authenticated;

-- 10. ADD SAMPLE DATA FOR TESTING
INSERT INTO public.referrals (user_id, supporter_id, pitch_id)
SELECT 
  '4c5a525f-77d7-4350-b4e3-eb6459abecdc'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  (SELECT id FROM public.pitches LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.referrals LIMIT 1)
AND EXISTS (SELECT 1 FROM public.pitches LIMIT 1);

-- 11. VERIFICATION QUERY
SELECT 
  'Database Relationships Fixed' as status,
  (SELECT COUNT(*) FROM public.referrals) as referrals_count,
  (SELECT COUNT(*) FROM public.referral_events) as referral_events_count,
  (SELECT COUNT(*) FROM public.pitches) as pitches_count,
  (SELECT COUNT(*) FROM public.community_suggestions) as community_suggestions_count;
