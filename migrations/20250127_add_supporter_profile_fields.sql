-- Add Supporter Profile Fields Migration
-- Migration: 20250127_add_supporter_profile_fields.sql
-- Adds fields needed for ultrashort, crisp supporter profiles

-- Add new fields to supporters table
ALTER TABLE public.supporters 
ADD COLUMN IF NOT EXISTS professional_title text,
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS areas_of_support text[];

-- Add location field to users table if it doesn't exist (for supporter location)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS location text;

-- Create index on supporter areas of support for efficient querying
CREATE INDEX IF NOT EXISTS idx_supporters_areas_of_support 
ON public.supporters USING GIN (areas_of_support);

-- Create index on supporter industry for filtering
CREATE INDEX IF NOT EXISTS idx_supporters_industry 
ON public.supporters (industry);

-- Create index on users location for location-based queries
CREATE INDEX IF NOT EXISTS idx_users_location 
ON public.users (location);

-- Add comment to document the new fields
COMMENT ON COLUMN public.supporters.professional_title IS 'Professional title/role of the supporter';
COMMENT ON COLUMN public.supporters.company IS 'Company or organization where supporter works';
COMMENT ON COLUMN public.supporters.industry IS 'Industry domain of the supporter';
COMMENT ON COLUMN public.supporters.bio IS 'Short mission statement/bio of the supporter';
COMMENT ON COLUMN public.supporters.linkedin_url IS 'LinkedIn profile URL for verification';
COMMENT ON COLUMN public.supporters.areas_of_support IS 'Array of areas where supporter can help veterans';
COMMENT ON COLUMN public.users.location IS 'Current location of the user (city, country)';
