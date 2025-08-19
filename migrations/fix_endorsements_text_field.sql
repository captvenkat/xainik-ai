-- Quick fix for endorsements table - add missing text field
-- This should be run if the main migration didn't add the text field properly

-- Add the missing text field to endorsements table
ALTER TABLE public.endorsements ADD COLUMN IF NOT EXISTS text text;

-- Add other missing fields that might not have been added
ALTER TABLE public.endorsements ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.endorsements ADD COLUMN IF NOT EXISTS endorser_user_id uuid;
ALTER TABLE public.endorsements ADD COLUMN IF NOT EXISTS pitch_id uuid;
ALTER TABLE public.endorsements ADD COLUMN IF NOT EXISTS endorser_name text;
ALTER TABLE public.endorsements ADD COLUMN IF NOT EXISTS endorser_email text;
ALTER TABLE public.endorsements ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false;

-- Verify the fields were added
SELECT 'Endorsements table fields fixed successfully!' as result;
