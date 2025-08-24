# 🗄️ Database Migration Guide - Enhanced User Profiles

## Executive Summary

This guide explains how to apply the **Enhanced User Profiles Migration** to transform the Xainik platform from a basic user system to a comprehensive veteran hiring platform with rich profile data.

## 🎯 Why This Migration is Essential

### **Current Problem**
The live database only has basic user fields:
- `id`, `email`, `name`, `phone`, `role`, `avatar_url`, `created_at`, `updated_at`

### **What We Need**
A comprehensive veteran hiring platform requires:
- **Military Service**: Branch, rank, years of service, discharge details
- **Education**: Level, certifications, degree field, graduation year
- **Professional**: Employment status, availability, salary expectations
- **Location**: Current location, preferred locations
- **Verification**: Email/phone verification, background checks
- **Privacy**: Notification settings, privacy controls

### **Solution**
Update the database to match the code requirements rather than limiting the code.

## 📋 Migration Overview

### **What Gets Added**
- **25+ new columns** to the `users` table
- **Performance indexes** for fast queries
- **Data validation constraints** for integrity
- **Helper functions** for profile completion
- **Enhanced views** for easy data access

### **Migration Benefits**
- ✅ **Complete veteran profiles** with military service tracking
- ✅ **Advanced search and filtering** capabilities
- ✅ **Profile completion tracking** and gamification
- ✅ **Professional status management** for hiring
- ✅ **Enhanced privacy and notification** controls
- ✅ **Compliance and security** tracking

## 🚀 How to Apply the Migration

### **Option 1: Automated Script (Recommended)**

1. **Ensure you have the required environment variables:**
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Run the migration script:**
   ```bash
   node scripts/apply-enhanced-user-profiles.js
   ```

3. **The script will:**
   - Check current database structure
   - Apply all migration statements
   - Verify the migration was successful
   - Show you what was added

### **Option 2: Manual SQL Execution**

1. **Go to your Supabase Dashboard**
   - Navigate to SQL Editor
   - Copy the contents of `migrations/20250128_enhance_user_profiles.sql`
   - Execute the SQL

2. **Verify the migration:**
   ```sql
   -- Check new columns
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'users' 
   ORDER BY ordinal_position;
   ```

## 📊 What Gets Added

### **Military Service Information**
```sql
military_branch VARCHAR(100)           -- Army, Navy, Air Force, Marines, etc.
military_rank VARCHAR(100)             -- Sergeant, Lieutenant, Captain, etc.
years_of_service INTEGER               -- Years of military service
discharge_date DATE                    -- When they left service
discharge_type VARCHAR(50)             -- Honorable, medical, retirement, etc.
```

### **Education & Certifications**
```sql
education_level VARCHAR(100)           -- High School, Bachelor's, Master's, etc.
certifications TEXT[]                  -- Array of certifications
degree_field VARCHAR(200)              -- Computer Science, Engineering, etc.
graduation_year INTEGER                -- Year of graduation
```

### **Professional Information**
```sql
bio TEXT                              -- Professional summary
location VARCHAR(200)                  -- Current location
preferred_locations TEXT[]             -- Where they want to work
linkedin_url VARCHAR(500)             -- LinkedIn profile
website_url VARCHAR(500)              -- Personal website
github_url VARCHAR(500)               -- GitHub profile
```

### **Account & Verification**
```sql
is_active BOOLEAN                      -- Account active status
email_verified BOOLEAN                 -- Email verification status
phone_verified BOOLEAN                 -- Phone verification status
profile_completed BOOLEAN              -- Profile completion status
last_login_at TIMESTAMPTZ             -- Last login timestamp
login_count INTEGER                    -- Number of logins
```

### **Employment & Availability**
```sql
employment_status VARCHAR(50)          -- Active duty, veteran, seeking, employed
availability_status VARCHAR(50)        -- Immediate, 30 days, 60 days, etc.
desired_salary_min INTEGER            -- Minimum salary expectation
desired_salary_max INTEGER            -- Maximum salary expectation
currency VARCHAR(3)                   -- Salary currency (USD, EUR, etc.)
```

### **Security & Compliance**
```sql
security_clearance VARCHAR(100)        -- Security clearance level
background_check_status VARCHAR(50)    -- Background check status
drug_test_status VARCHAR(50)          -- Drug test status
compliance_verified BOOLEAN            -- Overall compliance status
```

### **Settings & Preferences**
```sql
metadata JSONB                         -- Flexible metadata storage
preferences JSONB                      -- User preferences
notification_settings JSONB             -- Email, SMS, push notifications
privacy_settings JSONB                 -- Profile visibility controls
```

## 🔍 Performance Optimizations

### **Indexes Created**
```sql
-- Military service indexes
CREATE INDEX idx_users_military_branch ON users(military_branch);
CREATE INDEX idx_users_military_rank ON users(military_rank);
CREATE INDEX idx_users_years_of_service ON users(years_of_service);

-- Location and availability indexes
CREATE INDEX idx_users_location ON users(location);
CREATE INDEX idx_users_availability_status ON users(availability_status);

-- Search and filtering indexes
CREATE INDEX idx_users_role_location ON users(role, location);
CREATE INDEX idx_users_military_skills ON users(military_branch, military_rank, years_of_service);
```

### **Performance Benefits**
- **Fast veteran searches** by military branch, rank, location
- **Efficient filtering** by availability, employment status
- **Quick profile completion** calculations
- **Optimized location-based** queries

## 🛡️ Data Integrity & Security

### **Constraints Added**
```sql
-- Military service validation
CHECK (years_of_service >= 0 AND years_of_service <= 50)

-- Salary validation
CHECK (desired_salary_max >= desired_salary_min OR desired_salary_max IS NULL)

-- Phone format validation
CHECK (phone ~ '^\+?[\d\s\-\(\)]+$' OR phone IS NULL)

-- LinkedIn URL validation
CHECK (linkedin_url ~ '^https?://(www\.)?linkedin\.com/' OR linkedin_url IS NULL)
```

### **Security Features**
- **Data validation** at the database level
- **Proper permissions** for authenticated users
- **Secure function definitions** with SECURITY DEFINER
- **Input sanitization** and format checking

## 🔧 Helper Functions & Views

### **Profile Completion Function**
```sql
CREATE FUNCTION calculate_profile_completion(user_id UUID)
RETURNS INTEGER AS $$
-- Automatically calculates profile completion percentage
-- Based on filled fields vs. required fields
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Enhanced User Profiles View**
```sql
CREATE VIEW enhanced_user_profiles AS
SELECT 
  -- All user fields
  -- Computed experience level
  CASE 
    WHEN years_of_service >= 20 THEN 'Senior Veteran'
    WHEN years_of_service >= 10 THEN 'Mid-Career Veteran'
    WHEN years_of_service >= 5 THEN 'Early-Career Veteran'
    ELSE 'Civilian'
  END as experience_level,
  -- Profile completion percentage
  calculate_profile_completion(id) as profile_completion_percentage
FROM users;
```

## 📱 Code Integration

### **Updated createUser Function**
The `createUser` function in `src/lib/auth.ts` now supports all the new fields:

```typescript
const { data: user, error } = await supabaseAction
  .from('users')
  .insert({
    id: crypto.randomUUID(),
    email: userData.email,
    name: userData.name || 'Unknown User',
    phone: '',
    role: userData.role || 'veteran',
    avatar_url: null,
    // Enhanced profile fields
    military_branch: '',
    military_rank: '',
    years_of_service: 0,
    discharge_type: 'veteran',
    education_level: '',
    bio: '',
    location: '',
    is_active: true,
    employment_status: 'seeking_employment',
    availability_status: 'negotiable',
    // ... and many more fields
  })
  .select()
  .single();
```

### **Enhanced User Types**
Update your TypeScript types to include the new fields:

```typescript
interface User {
  id: string
  email: string
  name: string
  phone: string | null
  role: UserRole
  avatar_url: string | null
  
  // Military service
  military_branch: string | null
  military_rank: string | null
  years_of_service: number | null
  discharge_date: string | null
  discharge_type: string | null
  
  // Education
  education_level: string | null
  certifications: string[] | null
  degree_field: string | null
  graduation_year: number | null
  
  // Professional
  bio: string | null
  location: string | null
  linkedin_url: string | null
  
  // Status
  is_active: boolean
  profile_completed: boolean
  employment_status: string | null
  availability_status: string | null
  
  // ... and more fields
}
```

## 🧪 Testing the Migration

### **Verify New Columns**
```sql
-- Check that new columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('military_branch', 'education_level', 'bio', 'location')
ORDER BY column_name;
```

### **Test Profile Creation**
```sql
-- Insert a test user with enhanced profile
INSERT INTO users (
  id, email, name, role,
  military_branch, military_rank, years_of_service,
  education_level, bio, location
) VALUES (
  gen_random_uuid(), 'test@example.com', 'Test Veteran', 'veteran',
  'Army', 'Sergeant', 8,
  'Bachelor''s', 'Experienced veteran seeking opportunities', 'New York, NY'
);
```

### **Test Helper Functions**
```sql
-- Test profile completion calculation
SELECT calculate_profile_completion(id) as completion_percentage
FROM users
WHERE email = 'test@example.com';
```

## 🚨 Troubleshooting

### **Common Issues**

1. **Permission Denied**
   - Ensure you're using the service role key
   - Check that your Supabase user has admin privileges

2. **Column Already Exists**
   - The migration uses `IF NOT EXISTS` so this is safe
   - Check if the migration was already applied

3. **Constraint Violation**
   - Some constraints may need to be added manually
   - Check the error message for specific details

### **Rollback Plan**
If you need to rollback:

```sql
-- Remove new columns (be careful with data loss!)
ALTER TABLE users DROP COLUMN IF EXISTS military_branch;
ALTER TABLE users DROP COLUMN IF EXISTS military_rank;
-- ... repeat for other columns

-- Remove indexes
DROP INDEX IF EXISTS idx_users_military_branch;
DROP INDEX IF EXISTS idx_users_military_rank;
-- ... repeat for other indexes

-- Remove functions
DROP FUNCTION IF EXISTS calculate_profile_completion(UUID);
DROP FUNCTION IF EXISTS update_profile_completion();
```

## 📈 Post-Migration Steps

### **1. Update Your Application**
- Update TypeScript types to include new fields
- Enhance user profile forms
- Update search and filtering logic
- Test profile creation and updates

### **2. Data Migration**
- Set default values for existing users
- Encourage users to complete their profiles
- Implement profile completion incentives

### **3. Feature Development**
- Build advanced veteran search
- Implement profile completion tracking
- Add military service analytics
- Create hiring recommendation systems

## 🎯 Expected Results

After this migration, you'll have:

- ✅ **Complete veteran profiles** with military service tracking
- ✅ **Advanced search capabilities** by branch, rank, location
- ✅ **Profile completion system** for user engagement
- ✅ **Professional status management** for hiring workflows
- ✅ **Enhanced privacy controls** for user preferences
- ✅ **Performance optimized** queries and filtering
- ✅ **Data integrity** with validation constraints

## 📞 Support

If you encounter issues:

1. **Check the migration logs** in your database
2. **Verify environment variables** are correct
3. **Ensure you have admin privileges** in Supabase
4. **Review the error messages** for specific issues
5. **Contact the development team** for assistance

---

*This migration transforms Xainik from a basic platform to a comprehensive veteran hiring solution. The enhanced user profiles will enable advanced features like military service-based search, profile completion tracking, and professional status management.*
