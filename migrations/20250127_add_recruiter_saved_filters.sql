-- Add recruiter saved filters table
-- Migration: 20250127_add_recruiter_saved_filters.sql

CREATE TABLE IF NOT EXISTS public.recruiter_saved_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  filters jsonb NOT NULL, -- Store filter criteria as JSON
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.recruiter_saved_filters ENABLE ROW LEVEL SECURITY;

-- Recruiters can only see their own saved filters
CREATE POLICY "recruiters_can_manage_own_filters" ON public.recruiter_saved_filters
  FOR ALL USING (recruiter_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_recruiter_saved_filters_recruiter ON public.recruiter_saved_filters(recruiter_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recruiter_saved_filters_updated_at 
  BEFORE UPDATE ON public.recruiter_saved_filters 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
