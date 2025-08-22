-- Add additional profile fields to recruiters table
-- Migration: 20250127_add_recruiter_profile_fields.sql

-- Add bio, website, and linkedin_url fields to recruiters table
ALTER TABLE public.recruiters 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS linkedin_url text;

-- Add comments for documentation
COMMENT ON COLUMN public.recruiters.bio IS 'Company description and culture information';
COMMENT ON COLUMN public.recruiters.website IS 'Company website URL';
COMMENT ON COLUMN public.recruiters.linkedin_url IS 'Recruiter LinkedIn profile URL';
