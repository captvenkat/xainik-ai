-- Magic Mode Database Migration
-- Migration: 2025-08-26_magic_mode.sql
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. STORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id uuid NOT NULL REFERENCES public.pitches(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  summary text NOT NULL,
  body_md text NOT NULL,
  source_spans jsonb,
  status text NOT NULL CHECK (status IN ('draft','queued','published')) DEFAULT 'draft',
  scheduled_for date,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS stories_pitch_slug_uidx ON public.stories(pitch_id, slug);

-- =====================================================
-- 2. PITCH EXTENSIONS
-- =====================================================

ALTER TABLE IF EXISTS public.pitches
  ADD COLUMN IF NOT EXISTS objective text,
  ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}';

-- =====================================================
-- 3. ANALYTICS: OPTIONAL STORY_ID REFERENCE
-- =====================================================

-- Check if analytics_events table exists before adding column
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'analytics_events') THEN
    ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS story_id uuid NULL REFERENCES public.stories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =====================================================
-- 4. RESUME REQUESTS: RECRUITER REASON
-- =====================================================

-- Check if resume_requests table exists before adding column
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'resume_requests') THEN
    ALTER TABLE public.resume_requests ADD COLUMN IF NOT EXISTS reason text;
  END IF;
END $$;

-- =====================================================
-- 5. INDEXES FOR OPTIMAL PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_stories_pitch_id ON public.stories(pitch_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON public.stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_published_at ON public.stories(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_scheduled_for ON public.stories(scheduled_for);

-- =====================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Stories: Users can only see their own stories, public can read published stories
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Users can view their own stories
DROP POLICY IF EXISTS "Users can view their own stories" ON public.stories;
CREATE POLICY "Users can view their own stories" ON public.stories
  FOR ALL USING (
    pitch_id IN (SELECT id FROM public.pitches WHERE user_id = auth.uid())
  );

-- Public can read published stories
DROP POLICY IF EXISTS "Public can read published stories" ON public.stories;
CREATE POLICY "Public can read published stories" ON public.stories
  FOR SELECT USING (status = 'published');

-- =====================================================
-- 7. FUNCTIONS FOR STORY MANAGEMENT
-- =====================================================

-- Function to generate story slug
CREATE OR REPLACE FUNCTION generate_story_slug(title text, pitch_id uuid)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Convert title to slug
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'story';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.stories WHERE slug = final_slug AND pitch_id = $2) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to publish story (enforce 1/day policy)
CREATE OR REPLACE FUNCTION publish_story(story_uuid uuid)
RETURNS json AS $$
DECLARE
  story_record public.stories%ROWTYPE;
  pitch_record public.pitches%ROWTYPE;
  today_published_count integer;
  result json;
BEGIN
  -- Get story and pitch details
  SELECT * INTO story_record FROM public.stories WHERE id = story_uuid;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Story not found');
  END IF;
  
  SELECT * INTO pitch_record FROM public.pitches WHERE id = story_record.pitch_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Pitch not found');
  END IF;
  
  -- Check if another story was already published today
  SELECT COUNT(*) INTO today_published_count 
  FROM public.stories 
  WHERE pitch_id = story_record.pitch_id 
    AND status = 'published' 
    AND DATE(published_at) = CURRENT_DATE;
  
  IF today_published_count > 0 THEN
    -- Queue for tomorrow
    UPDATE public.stories 
    SET status = 'queued', scheduled_for = CURRENT_DATE + INTERVAL '1 day'
    WHERE id = story_uuid;
    
    RETURN json_build_object(
      'success', true, 
      'status', 'queued', 
      'message', 'Story queued for tomorrow 12:00 AM IST',
      'scheduled_for', CURRENT_DATE + INTERVAL '1 day'
    );
  ELSE
    -- Publish immediately
    UPDATE public.stories 
    SET status = 'published', published_at = NOW()
    WHERE id = story_uuid;
    
    RETURN json_build_object(
      'success', true, 
      'status', 'published', 
      'message', 'Story published successfully',
      'published_at', NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to auto-generate slug when story is created
CREATE OR REPLACE FUNCTION auto_generate_story_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_story_slug(NEW.title, NEW.pitch_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_story_slug ON public.stories;
CREATE TRIGGER trigger_auto_generate_story_slug
  BEFORE INSERT ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_story_slug();

-- =====================================================
-- 9. SUCCESS MESSAGE
-- =====================================================

SELECT '✅ Magic Mode database setup completed successfully!' as status;
