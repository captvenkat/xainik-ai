-- Comprehensive fix for missing database fields
-- This migration adds all fields that our code expects but are missing from the database

-- =====================================================
-- FIX USERS TABLE MISSING FIELDS
-- =====================================================

-- Add missing fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS military_branch VARCHAR(100),
ADD COLUMN IF NOT EXISTS military_rank VARCHAR(100),
ADD COLUMN IF NOT EXISTS years_of_service INTEGER CHECK (years_of_service >= 0),
ADD COLUMN IF NOT EXISTS discharge_date DATE,
ADD COLUMN IF NOT EXISTS education_level VARCHAR(100),
ADD COLUMN IF NOT EXISTS certifications TEXT[],
ADD COLUMN IF NOT EXISTS bio TEXT;

-- =====================================================
-- FIX PITCHES TABLE MISSING FIELDS
-- =====================================================

-- Add missing fields to pitches table
ALTER TABLE pitches 
ADD COLUMN IF NOT EXISTS experience_years INTEGER CHECK (experience_years >= 0),
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS resume_share_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS plan_tier VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- =====================================================
-- ADD INDEXES FOR PERFORMANCE
-- =====================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_military_branch ON users(military_branch);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_users_years_of_service ON users(years_of_service);

-- Pitches table indexes
CREATE INDEX IF NOT EXISTS idx_pitches_user_id ON pitches(user_id);
CREATE INDEX IF NOT EXISTS idx_pitches_is_active ON pitches(is_active);
CREATE INDEX IF NOT EXISTS idx_pitches_job_type ON pitches(job_type);
CREATE INDEX IF NOT EXISTS idx_pitches_location ON pitches(location);
CREATE INDEX IF NOT EXISTS idx_pitches_created_at ON pitches(created_at);

-- =====================================================
-- ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

-- Users table comments
COMMENT ON COLUMN users.phone IS 'Phone number for contact purposes';
COMMENT ON COLUMN users.avatar_url IS 'URL to user profile picture';
COMMENT ON COLUMN users.is_active IS 'Whether the user account is active';
COMMENT ON COLUMN users.email_verified IS 'Whether the email has been verified';
COMMENT ON COLUMN users.phone_verified IS 'Whether the phone has been verified';
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last login';
COMMENT ON COLUMN users.metadata IS 'Additional user metadata in JSON format';
COMMENT ON COLUMN users.location IS 'Current location/city of the user';
COMMENT ON COLUMN users.military_branch IS 'Military branch the veteran served in';
COMMENT ON COLUMN users.military_rank IS 'Military rank achieved';
COMMENT ON COLUMN users.years_of_service IS 'Number of years served in military';
COMMENT ON COLUMN users.discharge_date IS 'Date of military discharge';
COMMENT ON COLUMN users.education_level IS 'Highest education level achieved';
COMMENT ON COLUMN users.certifications IS 'Array of professional certifications';
COMMENT ON COLUMN users.bio IS 'Personal bio and career summary';

-- Pitches table comments
COMMENT ON COLUMN pitches.experience_years IS 'Years of professional experience';
COMMENT ON COLUMN pitches.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN pitches.phone IS 'Contact phone number';
COMMENT ON COLUMN pitches.photo_url IS 'URL to profile photo';
COMMENT ON COLUMN pitches.resume_url IS 'URL to resume file';
COMMENT ON COLUMN pitches.resume_share_enabled IS 'Whether resume sharing is enabled';
COMMENT ON COLUMN pitches.plan_tier IS 'Subscription plan tier';
COMMENT ON COLUMN pitches.plan_expires_at IS 'When the plan expires';
COMMENT ON COLUMN pitches.is_active IS 'Whether the pitch is active';
COMMENT ON COLUMN pitches.likes_count IS 'Number of likes received';
COMMENT ON COLUMN pitches.views_count IS 'Number of views received';
COMMENT ON COLUMN pitches.metadata IS 'Additional pitch metadata in JSON format';

-- =====================================================
-- UPDATE RLS POLICIES
-- =====================================================

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile fields" ON users;

-- Create comprehensive RLS policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for pitches table
DROP POLICY IF EXISTS "Users can view own pitches" ON pitches;
DROP POLICY IF EXISTS "Users can update own pitches" ON pitches;
DROP POLICY IF EXISTS "Users can insert own pitches" ON pitches;
DROP POLICY IF EXISTS "Users can delete own pitches" ON pitches;

CREATE POLICY "Users can view own pitches" ON pitches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own pitches" ON pitches
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own pitches" ON pitches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pitches" ON pitches
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- ADD VALIDATION CONSTRAINTS
-- =====================================================

-- Users table constraints
ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS check_phone_format 
CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$');

ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS check_years_of_service_range 
CHECK (years_of_service IS NULL OR (years_of_service >= 0 AND years_of_service <= 50));

-- Pitches table constraints
ALTER TABLE pitches 
ADD CONSTRAINT IF NOT EXISTS check_experience_years_range 
CHECK (experience_years IS NULL OR (experience_years >= 0 AND experience_years <= 50));

-- =====================================================
-- CREATE VIEWS FOR FRONTEND USE
-- =====================================================

-- Create a comprehensive user profiles view
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  id,
  email,
  name,
  phone,
  avatar_url,
  role,
  is_active,
  email_verified,
  phone_verified,
  location,
  military_branch,
  military_rank,
  years_of_service,
  discharge_date,
  education_level,
  certifications,
  bio,
  created_at,
  updated_at,
  last_login_at,
  metadata
FROM users
WHERE role = 'veteran';

-- Create a comprehensive pitches view
CREATE OR REPLACE VIEW active_pitches AS
SELECT 
  p.id,
  p.user_id,
  p.title,
  p.pitch_text,
  p.skills,
  p.job_type,
  p.location,
  p.experience_years,
  p.availability,
  p.linkedin_url,
  p.phone,
  p.photo_url,
  p.resume_url,
  p.resume_share_enabled,
  p.plan_tier,
  p.plan_expires_at,
  p.is_active,
  p.likes_count,
  p.views_count,
  p.created_at,
  p.updated_at,
  p.metadata,
  u.name as veteran_name,
  u.military_branch,
  u.military_rank,
  u.years_of_service
FROM pitches p
JOIN users u ON p.user_id = u.id
WHERE p.is_active = true AND u.is_active = true;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant appropriate permissions
GRANT SELECT ON user_profiles TO authenticated;
GRANT SELECT ON active_pitches TO authenticated;
GRANT UPDATE ON users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON pitches TO authenticated;

-- =====================================================
-- ADD TRIGGERS
-- =====================================================

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pitches_updated_at ON pitches;
CREATE TRIGGER update_pitches_updated_at 
  BEFORE UPDATE ON pitches 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENABLE RLS ON TABLES
-- =====================================================

-- Enable RLS on tables if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
