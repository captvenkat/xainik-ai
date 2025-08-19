-- Debug Community Suggestions
-- Check what's in the database and fix any issues

-- 1. Check if tables exist
SELECT 
  'Tables Status' as check_type,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'community_suggestions') as community_suggestions_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'mission_invitation_summary') as mission_invitation_summary_exists;

-- 2. Check community_suggestions table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'community_suggestions'
ORDER BY ordinal_position;

-- 3. Check if view exists
SELECT 
  'View Status' as check_type,
  (SELECT COUNT(*) FROM information_schema.views WHERE table_name = 'community_suggestions_summary') as view_exists;

-- 4. Check current data in community_suggestions
SELECT 
  'Current Data' as check_type,
  COUNT(*) as total_suggestions,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_suggestions,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_suggestions
FROM community_suggestions;

-- 5. Show all suggestions
SELECT 
  id,
  title,
  description,
  category,
  suggestion_type,
  status,
  priority,
  votes,
  created_at
FROM community_suggestions
ORDER BY created_at DESC;

-- 6. If no data exists, add some sample data
INSERT INTO community_suggestions (user_id, title, description, category, suggestion_type, status, priority, votes)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid, 
  'Add LinkedIn Integration', 
  'Allow veterans to connect their LinkedIn profiles for better networking', 
  'feature', 
  'feature',
  'pending', 
  'high',
  15
WHERE NOT EXISTS (SELECT 1 FROM community_suggestions WHERE title = 'Add LinkedIn Integration');

INSERT INTO community_suggestions (user_id, title, description, category, suggestion_type, status, priority, votes)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid, 
  'Improve Mobile Experience', 
  'Make the platform more mobile-friendly for veterans on the go', 
  'ui', 
  'ui',
  'approved', 
  'medium',
  23
WHERE NOT EXISTS (SELECT 1 FROM community_suggestions WHERE title = 'Improve Mobile Experience');

INSERT INTO community_suggestions (user_id, title, description, category, suggestion_type, status, priority, votes)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid, 
  'Add Resume Builder', 
  'Help veterans create professional resumes with military experience translation', 
  'feature', 
  'feature',
  'pending', 
  'high',
  31
WHERE NOT EXISTS (SELECT 1 FROM community_suggestions WHERE title = 'Add Resume Builder');

INSERT INTO community_suggestions (user_id, title, description, category, suggestion_type, status, priority, votes)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid, 
  'Veteran Mentorship Program', 
  'Connect new veterans with experienced ones for career guidance', 
  'feature', 
  'feature',
  'pending', 
  'high',
  42
WHERE NOT EXISTS (SELECT 1 FROM community_suggestions WHERE title = 'Veteran Mentorship Program');

-- 7. Recreate the view if it doesn't exist
DROP VIEW IF EXISTS public.community_suggestions_summary CASCADE;
CREATE VIEW public.community_suggestions_summary AS
SELECT 
  COUNT(*) as total_suggestions,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_suggestions,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_suggestions,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_suggestions,
  COALESCE(AVG(votes), 0) as avg_votes,
  COUNT(DISTINCT user_id) as unique_suggesters
FROM public.community_suggestions;

-- 8. Grant permissions
GRANT SELECT ON public.community_suggestions_summary TO authenticated;

-- 9. Final verification
SELECT 
  'Final Status' as check_type,
  (SELECT COUNT(*) FROM community_suggestions) as total_suggestions,
  (SELECT COUNT(*) FROM community_suggestions_summary) as summary_view_works;
