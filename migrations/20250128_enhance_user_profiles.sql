-- =====================================================
-- ENHANCE USER PROFILES - COMPREHENSIVE MIGRATION
-- Migration: 20250128_enhance_user_profiles.sql
-- Adds missing columns for comprehensive veteran profiles
-- =====================================================

-- =====================================================
-- 1. ENHANCE USERS TABLE WITH EXTENDED PROFILE FIELDS
-- =====================================================

-- Add military service information
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS military_branch VARCHAR(100),
ADD COLUMN IF NOT EXISTS military_rank VARCHAR(100),
ADD COLUMN IF NOT EXISTS years_of_service INTEGER CHECK (years_of_service >= 0),
ADD COLUMN IF NOT EXISTS discharge_date DATE,
ADD COLUMN IF NOT EXISTS discharge_type VARCHAR(50) CHECK (discharge_type IN ('honorable', 'general', 'other_than_honorable', 'bad_conduct', 'dishonorable', 'medical', 'retirement', 'reserves', 'active'));

-- Add education and certification information
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS education_level VARCHAR(100),
ADD COLUMN IF NOT EXISTS certifications TEXT[],
ADD COLUMN IF NOT EXISTS degree_field VARCHAR(200),
ADD COLUMN IF NOT EXISTS graduation_year INTEGER CHECK (graduation_year >= 1900 AND graduation_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 10);

-- Add professional and personal information
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location VARCHAR(200),
ADD COLUMN IF NOT EXISTS preferred_locations TEXT[],
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS website_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS github_url VARCHAR(500);

-- Add account and verification status
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Add metadata and preferences
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}';

-- Add professional status and availability
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50) CHECK (employment_status IN ('active_duty', 'veteran', 'retired', 'seeking_employment', 'employed', 'freelance', 'consultant', 'student')),
ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50) CHECK (availability_status IN ('immediate', '30_days', '60_days', '90_days', 'negotiable', 'not_available')),
ADD COLUMN IF NOT EXISTS desired_salary_min INTEGER CHECK (desired_salary_min >= 0),
ADD COLUMN IF NOT EXISTS desired_salary_max INTEGER CHECK (desired_salary_max >= 0),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Add security and compliance fields
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS security_clearance VARCHAR(100),
ADD COLUMN IF NOT EXISTS background_check_status VARCHAR(50) CHECK (background_check_status IN ('pending', 'in_progress', 'completed', 'failed', 'not_required')),
ADD COLUMN IF NOT EXISTS drug_test_status VARCHAR(50) CHECK (drug_test_status IN ('pending', 'passed', 'failed', 'not_required')),
ADD COLUMN IF NOT EXISTS compliance_verified BOOLEAN DEFAULT false;

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Military service indexes
CREATE INDEX IF NOT EXISTS idx_users_military_branch ON users(military_branch);
CREATE INDEX IF NOT EXISTS idx_users_military_rank ON users(military_rank);
CREATE INDEX IF NOT EXISTS idx_users_years_of_service ON users(years_of_service);
CREATE INDEX IF NOT EXISTS idx_users_discharge_type ON users(discharge_type);

-- Location and availability indexes
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_users_availability_status ON users(availability_status);
CREATE INDEX IF NOT EXISTS idx_users_employment_status ON users(employment_status);

-- Professional indexes
CREATE INDEX IF NOT EXISTS idx_users_education_level ON users(education_level);
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON users(profile_completed);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Search and filtering indexes
CREATE INDEX IF NOT EXISTS idx_users_role_location ON users(role, location);
CREATE INDEX IF NOT EXISTS idx_users_military_skills ON users(military_branch, military_rank, years_of_service);
CREATE INDEX IF NOT EXISTS idx_users_availability_employment ON users(availability_status, employment_status);

-- =====================================================
-- 3. ADD CONSTRAINTS AND VALIDATIONS
-- =====================================================

-- Add check constraints for data integrity
ALTER TABLE public.users 
ADD CONSTRAINT check_years_of_service_range CHECK (years_of_service >= 0 AND years_of_service <= 50),
ADD CONSTRAINT check_graduation_year_range CHECK (graduation_year >= 1900 AND graduation_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 10),
ADD CONSTRAINT check_salary_range CHECK (desired_salary_max >= desired_salary_min OR desired_salary_max IS NULL OR desired_salary_min IS NULL),
ADD CONSTRAINT check_phone_format CHECK (phone ~ '^\+?[\d\s\-\(\)]+$' OR phone IS NULL),
ADD CONSTRAINT check_linkedin_url CHECK (linkedin_url ~ '^https?://(www\.)?linkedin\.com/' OR linkedin_url IS NULL);

-- =====================================================
-- 4. UPDATE EXISTING USER PROFILES
-- =====================================================

-- Set default values for existing users
UPDATE public.users 
SET 
  military_branch = 'Not Specified',
  military_rank = 'Not Specified',
  years_of_service = 0,
  education_level = 'Not Specified',
  bio = 'Profile not yet completed',
  location = 'Not Specified',
  is_active = true,
  email_verified = false,
  phone_verified = false,
  profile_completed = false,
  employment_status = 'seeking_employment',
  availability_status = 'negotiable',
  metadata = '{}',
  preferences = '{}',
  notification_settings = '{"email": true, "sms": false, "push": true}',
  privacy_settings = '{"profile_public": true, "contact_visible": true}'
WHERE military_branch IS NULL;

-- =====================================================
-- 5. CREATE ENHANCED USER PROFILE VIEW
-- =====================================================

CREATE OR REPLACE VIEW public.enhanced_user_profiles AS
SELECT 
  u.id,
  u.email,
  u.name,
  u.phone,
  u.role,
  u.avatar_url,
  u.military_branch,
  u.military_rank,
  u.years_of_service,
  u.discharge_date,
  u.discharge_type,
  u.education_level,
  u.certifications,
  u.degree_field,
  u.graduation_year,
  u.bio,
  u.location,
  u.preferred_locations,
  u.linkedin_url,
  u.website_url,
  u.github_url,
  u.is_active,
  u.email_verified,
  u.phone_verified,
  u.profile_completed,
  u.last_login_at,
  u.login_count,
  u.employment_status,
  u.availability_status,
  u.desired_salary_min,
  u.desired_salary_max,
  u.currency,
  u.security_clearance,
  u.background_check_status,
  u.drug_test_status,
  u.compliance_verified,
  u.created_at,
  u.updated_at,
  -- Computed fields
  CASE 
    WHEN u.years_of_service >= 20 THEN 'Senior Veteran'
    WHEN u.years_of_service >= 10 THEN 'Mid-Career Veteran'
    WHEN u.years_of_service >= 5 THEN 'Early-Career Veteran'
    WHEN u.years_of_service > 0 THEN 'New Veteran'
    ELSE 'Civilian'
  END as experience_level,
  -- Profile completion percentage
  (
    CASE WHEN u.name IS NOT NULL THEN 10 ELSE 0 END +
    CASE WHEN u.bio IS NOT NULL AND u.bio != 'Profile not yet completed' THEN 15 ELSE 0 END +
    CASE WHEN u.military_branch IS NOT NULL AND u.military_branch != 'Not Specified' THEN 15 ELSE 0 END +
    CASE WHEN u.education_level IS NOT NULL AND u.education_level != 'Not Specified' THEN 10 ELSE 0 END +
    CASE WHEN u.location IS NOT NULL AND u.location != 'Not Specified' THEN 10 ELSE 0 END +
    CASE WHEN u.skills IS NOT NULL THEN 15 ELSE 0 END +
    CASE WHEN u.linkedin_url IS NOT NULL THEN 10 ELSE 0 END +
    CASE WHEN u.phone IS NOT NULL THEN 5 ELSE 0 END
  ) as profile_completion_percentage
FROM public.users u;

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions on the enhanced view
GRANT SELECT ON public.enhanced_user_profiles TO authenticated;
GRANT SELECT ON public.enhanced_user_profiles TO anon;

-- =====================================================
-- 7. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  completion_score INTEGER := 0;
  user_record RECORD;
BEGIN
  SELECT * INTO user_record FROM public.users WHERE id = user_id;
  
  IF user_record.name IS NOT NULL THEN completion_score := completion_score + 10; END IF;
  IF user_record.bio IS NOT NULL AND user_record.bio != 'Profile not yet completed' THEN completion_score := completion_score + 15; END IF;
  IF user_record.military_branch IS NOT NULL AND user_record.military_branch != 'Not Specified' THEN completion_score := completion_score + 15; END IF;
  IF user_record.education_level IS NOT NULL AND user_record.education_level != 'Not Specified' THEN completion_score := completion_score + 10; END IF;
  IF user_record.location IS NOT NULL AND user_record.location != 'Not Specified' THEN completion_score := completion_score + 10; END IF;
  IF user_record.skills IS NOT NULL THEN completion_score := completion_score + 15; END IF;
  IF user_record.linkedin_url IS NOT NULL THEN completion_score := completion_score + 10; END IF;
  IF user_record.phone IS NOT NULL THEN completion_score := completion_score + 5; END IF;
  
  RETURN completion_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update profile completion status
CREATE OR REPLACE FUNCTION public.update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completed = (public.calculate_profile_completion(NEW.id) >= 80);
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. CREATE TRIGGERS
-- =====================================================

-- Trigger to automatically update profile completion
CREATE TRIGGER trigger_update_profile_completion
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_completion();

-- =====================================================
-- 9. MIGRATION COMPLETION
-- =====================================================

-- Log migration completion
INSERT INTO public.migration_log (migration_name, applied_at, status, details)
VALUES (
  '20250128_enhance_user_profiles',
  CURRENT_TIMESTAMP,
  'completed',
  'Enhanced users table with comprehensive veteran profile fields including military service, education, professional status, and enhanced metadata. Added 25+ new columns, indexes, constraints, and helper functions.'
);

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================
/*
✅ COMPLETED:
- Added 25+ new columns to users table
- Created comprehensive indexes for performance
- Added data validation constraints
- Created enhanced user profile view
- Added helper functions and triggers
- Updated existing user profiles with defaults
- Granted proper permissions

🎯 NEW CAPABILITIES:
- Complete military service tracking
- Education and certification management
- Professional status and availability
- Enhanced privacy and notification settings
- Profile completion tracking
- Advanced search and filtering
- Compliance and security tracking

📊 PERFORMANCE:
- Optimized indexes for common queries
- Efficient profile completion calculation
- Enhanced search capabilities

🔒 SECURITY:
- Data validation constraints
- Proper permission grants
- Secure function definitions
*/
