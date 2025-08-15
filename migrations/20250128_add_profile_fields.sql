-- Add missing profile fields to users table for veteran profiles
-- This migration adds fields that are referenced in the VeteranProfileTab component

-- Add military and profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS military_branch VARCHAR(100),
ADD COLUMN IF NOT EXISTS military_rank VARCHAR(100),
ADD COLUMN IF NOT EXISTS years_of_service INTEGER CHECK (years_of_service >= 0),
ADD COLUMN IF NOT EXISTS discharge_date DATE,
ADD COLUMN IF NOT EXISTS education_level VARCHAR(100),
ADD COLUMN IF NOT EXISTS certifications TEXT[],
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_military_branch ON users(military_branch);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_users_years_of_service ON users(years_of_service);

-- Add comments for documentation
COMMENT ON COLUMN users.phone IS 'Phone number for contact purposes';
COMMENT ON COLUMN users.location IS 'Current location/city of the user';
COMMENT ON COLUMN users.military_branch IS 'Military branch the veteran served in';
COMMENT ON COLUMN users.military_rank IS 'Military rank achieved';
COMMENT ON COLUMN users.years_of_service IS 'Number of years served in military';
COMMENT ON COLUMN users.discharge_date IS 'Date of military discharge';
COMMENT ON COLUMN users.education_level IS 'Highest education level achieved';
COMMENT ON COLUMN users.certifications IS 'Array of professional certifications';
COMMENT ON COLUMN users.bio IS 'Personal bio and career summary';

-- Update RLS policies to include new fields
-- Ensure users can read and update their own profile data
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Ensure profile data is properly secured
-- Only allow users to update their own profile fields
CREATE POLICY IF NOT EXISTS "Users can update own profile fields" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add validation constraints
ALTER TABLE users 
ADD CONSTRAINT check_phone_format 
CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$');

ALTER TABLE users 
ADD CONSTRAINT check_years_of_service_range 
CHECK (years_of_service IS NULL OR (years_of_service >= 0 AND years_of_service <= 50));

-- Create a view for profile data that can be used by the frontend
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  id,
  email,
  name,
  phone,
  location,
  military_branch,
  military_rank,
  years_of_service,
  discharge_date,
  education_level,
  certifications,
  bio,
  role,
  created_at,
  updated_at
FROM users
WHERE role = 'veteran';

-- Grant appropriate permissions
GRANT SELECT ON user_profiles TO authenticated;
GRANT UPDATE ON users TO authenticated;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
