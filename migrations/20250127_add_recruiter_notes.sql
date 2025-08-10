-- Add recruiter_notes table for dashboard functionality
-- Migration: 20250127_add_recruiter_notes.sql

-- Create recruiter_notes table
CREATE TABLE IF NOT EXISTS public.recruiter_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_recruiter_notes_recruiter ON public.recruiter_notes(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_notes_pitch ON public.recruiter_notes(pitch_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_notes_created ON public.recruiter_notes(created_at DESC);

-- Add RLS policies
ALTER TABLE public.recruiter_notes ENABLE ROW LEVEL SECURITY;

-- Recruiter can only see their own notes
CREATE POLICY "recruiter_notes_select_policy" ON public.recruiter_notes
  FOR SELECT USING (recruiter_id = auth.uid());

-- Recruiter can insert their own notes
CREATE POLICY "recruiter_notes_insert_policy" ON public.recruiter_notes
  FOR INSERT WITH CHECK (recruiter_id = auth.uid());

-- Recruiter can update their own notes
CREATE POLICY "recruiter_notes_update_policy" ON public.recruiter_notes
  FOR UPDATE USING (recruiter_id = auth.uid());

-- Recruiter can delete their own notes
CREATE POLICY "recruiter_notes_delete_policy" ON public.recruiter_notes
  FOR DELETE USING (recruiter_id = auth.uid());

-- Admin can see all notes
CREATE POLICY "recruiter_notes_admin_policy" ON public.recruiter_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
