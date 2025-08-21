-- Add recruiter shortlist and contact tracking tables
-- Migration: 20250127_add_recruiter_shortlist.sql

-- Recruiter shortlist table
CREATE TABLE IF NOT EXISTS public.recruiter_shortlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('shortlisted', 'contacted', 'interviewed', 'hired', 'rejected')) DEFAULT 'shortlisted',
  notes text,
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(recruiter_id, pitch_id)
);

-- Contact history table
CREATE TABLE IF NOT EXISTS public.recruiter_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE NOT NULL,
  contact_type text CHECK (contact_type IN ('call', 'email', 'interview', 'meeting')) NOT NULL,
  contact_date timestamptz DEFAULT now(),
  outcome text CHECK (outcome IN ('interested', 'not_interested', 'hired', 'no_response', 'scheduled')) DEFAULT 'no_response',
  notes text,
  follow_up_date timestamptz
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_recruiter_shortlist_recruiter ON public.recruiter_shortlist(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_shortlist_status ON public.recruiter_shortlist(status);
CREATE INDEX IF NOT EXISTS idx_recruiter_shortlist_priority ON public.recruiter_shortlist(priority);
CREATE INDEX IF NOT EXISTS idx_recruiter_contacts_recruiter ON public.recruiter_contacts(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_contacts_pitch ON public.recruiter_contacts(pitch_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_contacts_date ON public.recruiter_contacts(contact_date DESC);

-- Add RLS policies
ALTER TABLE public.recruiter_shortlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_contacts ENABLE ROW LEVEL SECURITY;

-- Recruiters can only see their own shortlist
CREATE POLICY "recruiters_can_manage_own_shortlist" ON public.recruiter_shortlist
  FOR ALL USING (recruiter_id = auth.uid());

-- Recruiters can only see their own contacts
CREATE POLICY "recruiters_can_manage_own_contacts" ON public.recruiter_contacts
  FOR ALL USING (recruiter_id = auth.uid());

-- Admin can see all shortlist and contacts
CREATE POLICY "admin_can_see_all_shortlist" ON public.recruiter_shortlist
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_can_see_all_contacts" ON public.recruiter_contacts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recruiter_shortlist_updated_at 
  BEFORE UPDATE ON public.recruiter_shortlist 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add activity log entries for shortlist actions
-- This will help populate the veteran value ticker with real data
INSERT INTO public.activity_log (event, meta) VALUES
  ('recruiter_shortlisted', '{"recruiter_name": "Tech Recruiter", "veteran_name": "John Smith", "pitch_title": "Cybersecurity Specialist"}'),
  ('recruiter_contacted', '{"recruiter_name": "HR Manager", "veteran_name": "Sarah Johnson", "pitch_title": "Project Manager"}'),
  ('veteran_hired', '{"recruiter_name": "Talent Director", "veteran_name": "Mike Davis", "pitch_title": "Operations Lead"}'),
  ('recruiter_shortlisted', '{"recruiter_name": "Engineering Recruiter", "veteran_name": "Lisa Chen", "pitch_title": "Software Engineer"}'),
  ('recruiter_contacted', '{"recruiter_name": "Sales Recruiter", "veteran_name": "David Wilson", "pitch_title": "Sales Manager"}')
ON CONFLICT DO NOTHING;
