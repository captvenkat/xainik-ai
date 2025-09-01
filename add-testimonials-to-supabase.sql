-- =====================================================
-- ADD TESTIMONIALS TABLE TO XAINIK SUPABASE SCHEMA
-- =====================================================
-- This script adds the testimonials functionality to the existing database

-- =====================================================
-- STEP 1: CREATE TESTIMONIALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,                    -- Google user ID from NextAuth
  name text NOT NULL,                       -- User's display name
  email text NOT NULL,                      -- User's email
  message text NOT NULL,                    -- The testimonial message
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for status-based queries (moderation)
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON public.testimonials(status);

-- Index for user-based queries
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON public.testimonials(user_id);

-- Index for chronological ordering
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON public.testimonials(created_at DESC);

-- Index for email-based queries (admin)
CREATE INDEX IF NOT EXISTS idx_testimonials_email ON public.testimonials(email);

-- =====================================================
-- STEP 3: CREATE UPDATED_AT TRIGGER
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 4: GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT ON public.testimonials TO authenticated;
GRANT INSERT ON public.testimonials TO authenticated;

-- Grant all permissions to service role (for API operations)
GRANT ALL ON public.testimonials TO service_role;

-- =====================================================
-- STEP 5: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view approved testimonials
CREATE POLICY "Users can view approved testimonials" ON public.testimonials
    FOR SELECT USING (status = 'approved');

-- Policy: Users can insert their own testimonials
CREATE POLICY "Users can insert testimonials" ON public.testimonials
    FOR INSERT WITH CHECK (true);

-- Policy: Users can update their own testimonials (if needed)
CREATE POLICY "Users can update own testimonials" ON public.testimonials
    FOR UPDATE USING (user_id = current_user);

-- Policy: Service role has full access (for admin operations)
CREATE POLICY "Service role full access" ON public.testimonials
    FOR ALL USING (true);

-- =====================================================
-- STEP 6: VERIFICATION QUERY
-- =====================================================

-- Test query to verify the table was created correctly
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'testimonials' 
ORDER BY ordinal_position;
