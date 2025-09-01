-- =====================================================
-- XAINIK FUNDRAISING APP DATABASE SCHEMA
-- =====================================================
-- This script creates the essential tables for the fundraising app
-- It handles existing tables by dropping them first

-- =====================================================
-- STEP 1: DROP EXISTING TABLES (if they exist)
-- =====================================================

-- Drop existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.donors CASCADE;
DROP TABLE IF EXISTS public.subscribers CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.badge_tiers CASCADE;

-- Drop existing views
DROP VIEW IF EXISTS public.v_stats CASCADE;
DROP VIEW IF EXISTS public.v_public_feed CASCADE;

-- =====================================================
-- STEP 2: CREATE CORE TABLES
-- =====================================================

-- Donors table
CREATE TABLE public.donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Donations table
CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES public.donors(id) ON DELETE SET NULL,
  amount integer NOT NULL CHECK (amount > 0),          -- in INR rupees
  currency text DEFAULT 'INR',
  order_id text,                                       -- Razorpay order_id
  payment_id text,                                     -- Razorpay payment_id
  status text CHECK (status IN ('created','paid','failed','refunded')) DEFAULT 'created',
  is_anonymous boolean DEFAULT false,
  display_name text,                                   -- what to show on wall/feed
  created_at timestamptz DEFAULT now()
);

-- Subscribers table
CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  source text CHECK (source IN ('stay_connected','post_donation')) DEFAULT 'stay_connected',
  created_at timestamptz DEFAULT now()
);

-- Documents table
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  blurb text,
  public_url text NOT NULL,
  sort_order int DEFAULT 0
);

-- Badge tiers table
CREATE TABLE public.badge_tiers (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,        -- 'Friend', 'Champion', 'Founding Supporter'
  min_amount int NOT NULL           -- rupees
);

-- =====================================================
-- STEP 3: INSERT BADGE TIERS
-- =====================================================

INSERT INTO public.badge_tiers (name, min_amount) VALUES
('Friend', 1), 
('Champion', 10000), 
('Founding Supporter', 25000)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- STEP 4: CREATE VIEWS FOR LIVE METRICS
-- =====================================================

-- Stats view for live metrics (Kolkata timezone)
CREATE VIEW public.v_stats AS
SELECT
  (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE status = 'paid') AS total_raised,
  (SELECT COALESCE(MAX(amount), 0) FROM donations WHERE status = 'paid') AS highest_single,
  (SELECT COALESCE(SUM(amount), 0)
   FROM donations
   WHERE status = 'paid'
     AND (created_at AT TIME ZONE 'Asia/Kolkata')::date = (NOW() AT TIME ZONE 'Asia/Kolkata')::date
  ) AS today_raised,
  (SELECT COUNT(*) FROM donations WHERE status = 'paid') AS total_count;

-- Public feed view (no PII)
CREATE VIEW public.v_public_feed AS
SELECT display_name, amount, created_at
FROM donations
WHERE status = 'paid' AND COALESCE(display_name, '') <> ''
ORDER BY created_at DESC
LIMIT 50;

-- =====================================================
-- STEP 5: SET UP ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_tiers ENABLE ROW LEVEL SECURITY;

-- Public read policies for docs and tiers
CREATE POLICY "read_docs" ON public.documents FOR SELECT USING (true);
CREATE POLICY "read_tiers" ON public.badge_tiers FOR SELECT USING (true);

-- Grant select permissions on views
GRANT SELECT ON public.v_stats TO anon, authenticated;
GRANT SELECT ON public.v_public_feed TO anon, authenticated;

-- Revoke all permissions on main tables (server-side only)
REVOKE ALL ON public.donors FROM anon, authenticated;
REVOKE ALL ON public.donations FROM anon, authenticated;
REVOKE ALL ON public.subscribers FROM anon, authenticated;

-- =====================================================
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index on donor email for lookups
CREATE INDEX IF NOT EXISTS idx_donors_email ON public.donors(email);

-- Index on donation status and created_at for queries
CREATE INDEX IF NOT EXISTS idx_donations_status_created ON public.donations(status, created_at);

-- Index on subscriber email for uniqueness checks
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);

-- Index on documents sort_order for ordering
CREATE INDEX IF NOT EXISTS idx_documents_sort_order ON public.documents(sort_order);

-- =====================================================
-- STEP 7: VERIFICATION QUERIES
-- =====================================================

-- Verify tables were created
SELECT 
    table_name,
    'TABLE' as object_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('donors', 'donations', 'subscribers', 'documents', 'badge_tiers')
ORDER BY table_name;

-- Verify views were created
SELECT 
    table_name,
    'VIEW' as object_type
FROM information_schema.views 
WHERE table_schema = 'public' 
    AND table_name IN ('v_stats', 'v_public_feed')
ORDER BY table_name;

-- Verify badge tiers were inserted
SELECT name, min_amount FROM public.badge_tiers ORDER BY min_amount;

-- =====================================================
-- STEP 8: SUCCESS MESSAGE
-- =====================================================

-- The fundraising app database schema is now ready!
-- Tables: donors, donations, subscribers, documents, badge_tiers
-- Views: v_stats, v_public_feed
-- RLS: Enabled with appropriate policies
-- Indexes: Created for performance
