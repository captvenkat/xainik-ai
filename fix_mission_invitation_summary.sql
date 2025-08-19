-- Fix mission_invitation_summary table structure
-- Run this in your Supabase SQL Editor

-- First, drop the existing view if it exists
DROP VIEW IF EXISTS public.mission_invitation_summary CASCADE;

-- Create the table with all required columns
CREATE TABLE public.mission_invitation_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  inviter_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  inviter_name text,
  inviter_role text,
  inviter_avatar text,
  total_invitations integer DEFAULT 0,
  pending_invitations integer DEFAULT 0,
  accepted_invitations integer DEFAULT 0,
  declined_invitations integer DEFAULT 0,
  expired_invitations integer DEFAULT 0,
  total_registrations integer DEFAULT 0,
  veteran_registrations integer DEFAULT 0,
  recruiter_registrations integer DEFAULT 0,
  supporter_registrations integer DEFAULT 0,
  last_invitation_at timestamptz,
  first_invitation_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mission_invitation_summary ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own mission summary" ON public.mission_invitation_summary 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own mission summary" ON public.mission_invitation_summary 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mission summary" ON public.mission_invitation_summary 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.mission_invitation_summary TO authenticated;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mission_invitation_summary_user_id ON public.mission_invitation_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_summary_inviter_id ON public.mission_invitation_summary(inviter_id);
