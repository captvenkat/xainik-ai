-- =====================================================
-- FIX PITCHES TABLE TO MATCH UI REQUIREMENTS
-- =====================================================

-- Add missing columns to pitches table
ALTER TABLE pitches 
ADD COLUMN IF NOT EXISTS endorsements_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS allow_resume_requests BOOLEAN DEFAULT false;

-- Update existing pitches to have proper counts
UPDATE pitches 
SET endorsements_count = (
  SELECT COUNT(*) FROM endorsements 
  WHERE endorsements.user_id = pitches.user_id
),
shares_count = 0,
allow_resume_requests = false
WHERE endorsements_count IS NULL;

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_pitches_search 
ON pitches (is_active, created_at DESC, location, job_type);

CREATE INDEX IF NOT EXISTS idx_pitches_skills 
ON pitches USING GIN (skills);

-- Create view for pitch cards with all required data
CREATE OR REPLACE VIEW pitch_cards_view AS
SELECT 
  p.id,
  p.user_id,
  p.title,
  p.pitch_text,
  p.skills,
  p.job_type,
  p.location,
  p.experience_years,
  p.availability,
  p.linkedin_url,
  p.phone,
  p.photo_url,
  p.resume_url,
  p.resume_share_enabled,
  p.plan_tier,
  p.plan_expires_at,
  p.is_active,
  p.likes_count,
  p.views_count,
  p.endorsements_count,
  p.shares_count,
  p.allow_resume_requests,
  p.created_at,
  p.updated_at,
  p.metadata,
  u.name as user_name,
  u.email as user_email,
  u.avatar_url as user_avatar_url,
  u.role as user_role,
  up.profile_data as user_profile_data
FROM pitches p
JOIN users u ON p.user_id = u.id
LEFT JOIN user_profiles up ON p.user_id = up.user_id AND up.profile_type = 'veteran' AND up.is_active = true
WHERE p.is_active = true;

-- Grant permissions
GRANT SELECT ON pitch_cards_view TO authenticated;
GRANT SELECT ON pitch_cards_view TO anon;

-- Create function to update pitch counts
CREATE OR REPLACE FUNCTION update_pitch_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update endorsements count when new endorsement is added
    UPDATE pitches 
    SET endorsements_count = endorsements_count + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update endorsements count when endorsement is deleted
    UPDATE pitches 
    SET endorsements_count = GREATEST(endorsements_count - 1, 0)
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for endorsements
DROP TRIGGER IF EXISTS trigger_update_pitch_counts ON endorsements;
CREATE TRIGGER trigger_update_pitch_counts
  AFTER INSERT OR DELETE ON endorsements
  FOR EACH ROW
  EXECUTE FUNCTION update_pitch_counts();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_pitch_views(pitch_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE pitches 
  SET views_count = views_count + 1
  WHERE id = pitch_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_pitch_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_pitch_views(UUID) TO anon;
