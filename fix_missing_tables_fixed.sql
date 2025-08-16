-- Fix Missing Tables Migration - CORRECTED VERSION
-- This migration adds the missing tables that are causing database relationship errors
-- Run this in your Supabase SQL Editor

-- First, drop any existing views or tables that might conflict
DROP VIEW IF EXISTS public.mission_invitation_summary CASCADE;
DROP TABLE IF EXISTS public.community_suggestions CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.shares CASCADE;

-- 1. LIKES TABLE (for pitch likes)
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, pitch_id)
);

-- 2. SHARES TABLE (for pitch shares)
CREATE TABLE IF NOT EXISTS public.shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  platform text, -- whatsapp, linkedin, email, direct
  share_link text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, pitch_id, platform)
);

-- 3. COMMUNITY SUGGESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.community_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  suggestion_type text NOT NULL, -- feature, improvement, bug_report
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending', -- pending, approved, rejected, implemented
  priority text DEFAULT 'medium', -- low, medium, high, critical
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. MISSION INVITATION SUMMARY TABLE
CREATE TABLE IF NOT EXISTS public.mission_invitation_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  total_invitations_sent integer DEFAULT 0,
  total_invitations_accepted integer DEFAULT 0,
  total_invitations_declined integer DEFAULT 0,
  total_invitations_pending integer DEFAULT 0,
  last_invitation_sent timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_pitch_id ON public.likes(pitch_id);
CREATE INDEX IF NOT EXISTS idx_shares_user_id ON public.shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_pitch_id ON public.shares(pitch_id);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_user_id ON public.community_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_status ON public.community_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_summary_user_id ON public.mission_invitation_summary(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_invitation_summary ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can view their own shares" ON public.shares;
DROP POLICY IF EXISTS "Users can create their own shares" ON public.shares;
DROP POLICY IF EXISTS "Users can delete their own shares" ON public.shares;
DROP POLICY IF EXISTS "Users can view their own suggestions" ON public.community_suggestions;
DROP POLICY IF EXISTS "Users can create their own suggestions" ON public.community_suggestions;
DROP POLICY IF EXISTS "Users can update their own suggestions" ON public.community_suggestions;
DROP POLICY IF EXISTS "Users can view their own mission summary" ON public.mission_invitation_summary;
DROP POLICY IF EXISTS "Users can update their own mission summary" ON public.mission_invitation_summary;

-- Create RLS policies for LIKES table
CREATE POLICY "Users can view their own likes" ON public.likes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own likes" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for SHARES table
CREATE POLICY "Users can view their own shares" ON public.shares
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shares" ON public.shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shares" ON public.shares
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for COMMUNITY SUGGESTIONS table
CREATE POLICY "Users can view their own suggestions" ON public.community_suggestions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own suggestions" ON public.community_suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestions" ON public.community_suggestions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for MISSION INVITATION SUMMARY table
CREATE POLICY "Users can view their own mission summary" ON public.mission_invitation_summary
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own mission summary" ON public.mission_invitation_summary
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_community_suggestions_updated_at ON public.community_suggestions;
CREATE TRIGGER update_community_suggestions_updated_at
  BEFORE UPDATE ON public.community_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_mission_invitation_summary_updated_at ON public.mission_invitation_summary;
CREATE TRIGGER update_mission_invitation_summary_updated_at
  BEFORE UPDATE ON public.mission_invitation_summary
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.likes TO authenticated;
GRANT ALL ON public.shares TO authenticated;
GRANT ALL ON public.community_suggestions TO authenticated;
GRANT ALL ON public.mission_invitation_summary TO authenticated;

-- Migration completed successfully!
-- All missing tables have been created with proper relationships and RLS policies
