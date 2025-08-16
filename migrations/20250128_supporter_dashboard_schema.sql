-- =====================================================
-- SUPPORTER DASHBOARD SCHEMA MIGRATION
-- World-Class Professional Implementation
-- =====================================================

-- AI Suggestions Table
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('veteran', 'recruiter', 'supporter')),
  suggestion_type VARCHAR(50) NOT NULL CHECK (suggestion_type IN ('profile', 'engagement', 'skill', 'network', 'impact', 'goal')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  icon VARCHAR(10),
  action_text VARCHAR(100),
  action_type VARCHAR(50),
  action_data JSONB,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at timestamptz,
  is_completed BOOLEAN DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- Supporter Celebrations Table
CREATE TABLE IF NOT EXISTS supporter_celebrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id VARCHAR(255) NOT NULL,
  celebration_type VARCHAR(50) NOT NULL CHECK (celebration_type IN ('milestone', 'achievement', 'anniversary', 'donation', 'referral', 'endorsement')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  impact_score INTEGER,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Supporter Badges Table
CREATE TABLE IF NOT EXISTS supporter_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id VARCHAR(255) NOT NULL,
  badge_type VARCHAR(50) NOT NULL CHECK (badge_type IN ('gold', 'silver', 'bronze', 'first_donation', 'first_referral', 'first_endorsement', 'milestone')),
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  icon VARCHAR(10),
  earned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- User Goals Table
CREATE TABLE IF NOT EXISTS user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('career', 'network', 'skill', 'impact', 'support')),
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  deadline timestamptz,
  milestones JSONB,
  suggestions JSONB,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Goal Progress Tracking
CREATE TABLE IF NOT EXISTS goal_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id uuid NOT NULL REFERENCES user_goals(id) ON DELETE CASCADE,
  progress_value INTEGER NOT NULL,
  progress_percentage INTEGER NOT NULL,
  milestone_achieved VARCHAR(100),
  notes TEXT,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Behavioral Nudges Table
CREATE TABLE IF NOT EXISTS behavioral_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nudge_type VARCHAR(50) NOT NULL CHECK (nudge_type IN ('inactivity', 'goal', 'social_proof', 'achievement', 'engagement')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon VARCHAR(10),
  action_text VARCHAR(100),
  action_type VARCHAR(50),
  action_data JSONB,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  is_snoozed BOOLEAN DEFAULT false,
  snoozed_until timestamptz,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- User Behavior Analytics
CREATE TABLE IF NOT EXISTS user_behavior_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('login', 'browse', 'contact', 'endorse', 'donate', 'refer', 'share', 'view')),
  action_data JSONB,
  session_duration INTEGER, -- in seconds
  page_visited VARCHAR(255),
  time_spent INTEGER, -- in seconds
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Supporter Impact Tracking
CREATE TABLE IF NOT EXISTS supporter_impact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  impact_type VARCHAR(50) NOT NULL CHECK (impact_type IN ('donation', 'referral', 'endorsement', 'view', 'call', 'email')),
  impact_value INTEGER NOT NULL,
  veteran_id uuid REFERENCES users(id) ON DELETE SET NULL,
  pitch_id uuid REFERENCES pitches(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- AI Suggestions Indexes
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_id ON ai_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_type ON ai_suggestions(user_type);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_priority ON ai_suggestions(priority);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_dismissed ON ai_suggestions(is_dismissed);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_created_at ON ai_suggestions(created_at);

-- Supporter Celebrations Indexes
CREATE INDEX IF NOT EXISTS idx_supporter_celebrations_supporter_id ON supporter_celebrations(supporter_id);
CREATE INDEX IF NOT EXISTS idx_supporter_celebrations_type ON supporter_celebrations(celebration_type);
CREATE INDEX IF NOT EXISTS idx_supporter_celebrations_created_at ON supporter_celebrations(created_at);

-- Supporter Badges Indexes
CREATE INDEX IF NOT EXISTS idx_supporter_badges_supporter_id ON supporter_badges(supporter_id);
CREATE INDEX IF NOT EXISTS idx_supporter_badges_type ON supporter_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_supporter_badges_earned_at ON supporter_badges(earned_at);

-- User Goals Indexes
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_type ON user_goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON user_goals(status);
CREATE INDEX IF NOT EXISTS idx_user_goals_deadline ON user_goals(deadline);

-- Goal Progress Indexes
CREATE INDEX IF NOT EXISTS idx_goal_progress_user_id ON goal_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_goal_id ON goal_progress(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_created_at ON goal_progress(created_at);

-- Behavioral Nudges Indexes
CREATE INDEX IF NOT EXISTS idx_behavioral_nudges_user_id ON behavioral_nudges(user_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_nudges_type ON behavioral_nudges(nudge_type);
CREATE INDEX IF NOT EXISTS idx_behavioral_nudges_priority ON behavioral_nudges(priority);
CREATE INDEX IF NOT EXISTS idx_behavioral_nudges_dismissed ON behavioral_nudges(is_dismissed);

-- User Behavior Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_user_behavior_analytics_user_id ON user_behavior_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_analytics_action_type ON user_behavior_analytics(action_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_analytics_created_at ON user_behavior_analytics(created_at);

-- Supporter Impact Indexes
CREATE INDEX IF NOT EXISTS idx_supporter_impact_supporter_id ON supporter_impact(supporter_id);
CREATE INDEX IF NOT EXISTS idx_supporter_impact_type ON supporter_impact(impact_type);
CREATE INDEX IF NOT EXISTS idx_supporter_impact_veteran_id ON supporter_impact(veteran_id);
CREATE INDEX IF NOT EXISTS idx_supporter_impact_created_at ON supporter_impact(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- AI Suggestions RLS
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI suggestions" ON ai_suggestions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI suggestions" ON ai_suggestions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI suggestions" ON ai_suggestions
  FOR INSERT WITH CHECK (true);

-- Supporter Celebrations RLS
ALTER TABLE supporter_celebrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own celebrations" ON supporter_celebrations
  FOR SELECT USING (auth.uid()::text = supporter_id OR supporter_id = 'anonymous');

CREATE POLICY "System can insert celebrations" ON supporter_celebrations
  FOR INSERT WITH CHECK (true);

-- Supporter Badges RLS
ALTER TABLE supporter_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges" ON supporter_badges
  FOR SELECT USING (auth.uid()::text = supporter_id OR supporter_id = 'anonymous');

CREATE POLICY "System can insert badges" ON supporter_badges
  FOR INSERT WITH CHECK (true);

-- User Goals RLS
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals" ON user_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON user_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON user_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Goal Progress RLS
ALTER TABLE goal_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goal progress" ON goal_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal progress" ON goal_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal progress" ON goal_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Behavioral Nudges RLS
ALTER TABLE behavioral_nudges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own nudges" ON behavioral_nudges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own nudges" ON behavioral_nudges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert nudges" ON behavioral_nudges
  FOR INSERT WITH CHECK (true);

-- User Behavior Analytics RLS
ALTER TABLE user_behavior_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own behavior analytics" ON user_behavior_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own behavior analytics" ON user_behavior_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Supporter Impact RLS
ALTER TABLE supporter_impact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own impact" ON supporter_impact
  FOR SELECT USING (auth.uid() = supporter_id);

CREATE POLICY "System can insert supporter impact" ON supporter_impact
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- Unified Supporters Aggregated View
CREATE OR REPLACE VIEW unified_supporters_aggregated AS
WITH supporter_activities AS (
  -- Donors
  SELECT 
    COALESCE(user_id::text, 'anonymous_' || id) as supporter_id,
    COALESCE((SELECT name FROM users WHERE id = donations.user_id), 'Anonymous Supporter') as name,
    (SELECT avatar_url FROM users WHERE id = donations.user_id) as photo_url,
    'donor' as activity_type,
    amount_cents / 100 as impact_value,
    created_at,
    'donation' as activity_category
  FROM donations 
  WHERE user_id IS NOT NULL
  
  UNION ALL
  
  -- Referrers
  SELECT 
    user_id::text as supporter_id,
    u.name,
    u.avatar_url as photo_url,
    'referrer' as activity_type,
    50 as impact_value, -- 50 points per referral
    created_at,
    'referral' as activity_category
  FROM referrals r
  JOIN users u ON r.user_id = u.id
  
  UNION ALL
  
  -- Endorsers
  SELECT 
    endorser_user_id::text as supporter_id,
    u.name,
    u.avatar_url as photo_url,
    'endorser' as activity_type,
    25 as impact_value, -- 25 points per endorsement
    created_at,
    'endorsement' as activity_category
  FROM endorsements e
  JOIN users u ON e.endorser_user_id = u.id
  WHERE endorser_user_id IS NOT NULL
)
SELECT 
  supporter_id as id,
  name,
  photo_url,
  ARRAY_AGG(DISTINCT activity_type) as supporter_types,
  SUM(impact_value) as total_impact_score,
  COUNT(*) as total_activities,
  COUNT(*) FILTER (WHERE activity_category = 'donation') as donation_count,
  COUNT(*) FILTER (WHERE activity_category = 'referral') as referral_count,
  COUNT(*) FILTER (WHERE activity_category = 'endorsement') as endorsement_count,
  MAX(created_at) as last_activity_at,
  MIN(created_at) as first_activity_at,
  CASE 
    WHEN SUM(impact_value) >= 1000 THEN 'platinum'
    WHEN SUM(impact_value) >= 500 THEN 'gold'
    WHEN SUM(impact_value) >= 100 THEN 'silver'
    ELSE 'bronze'
  END as supporter_level
FROM supporter_activities
GROUP BY 
  supporter_id, name, photo_url;

-- Supporter Impact Summary View
CREATE OR REPLACE VIEW supporter_impact_summary AS
SELECT 
  si.supporter_id,
  u.name as supporter_name,
  u.avatar_url as supporter_photo,
  COUNT(*) as total_impacts,
  SUM(si.impact_value) as total_impact_score,
  COUNT(*) FILTER (WHERE si.impact_type = 'donation') as donation_count,
  COUNT(*) FILTER (WHERE si.impact_type = 'referral') as referral_count,
  COUNT(*) FILTER (WHERE si.impact_type = 'endorsement') as endorsement_count,
  COUNT(*) FILTER (WHERE si.impact_type = 'view') as view_count,
  COUNT(*) FILTER (WHERE si.impact_type = 'call') as call_count,
  COUNT(*) FILTER (WHERE si.impact_type = 'email') as email_count,
  MAX(si.created_at) as last_impact_at,
  MIN(si.created_at) as first_impact_at
FROM supporter_impact si
JOIN users u ON si.supporter_id = u.id
GROUP BY si.supporter_id, u.name, u.avatar_url;

-- =====================================================
-- FUNCTIONS FOR AUTOMATION
-- =====================================================

-- Function to calculate supporter impact score
CREATE OR REPLACE FUNCTION calculate_supporter_impact_score(supporter_user_id uuid)
RETURNS INTEGER AS $$
DECLARE
  total_score INTEGER := 0;
BEGIN
  -- Donation impact (1 point per $10 donated)
  SELECT COALESCE(SUM(amount_cents / 1000), 0) INTO total_score
  FROM donations 
  WHERE user_id = supporter_user_id;
  
  -- Referral impact (50 points per referral)
  SELECT total_score + COALESCE(COUNT(*) * 50, 0) INTO total_score
  FROM referrals 
  WHERE user_id = supporter_user_id;
  
  -- Endorsement impact (25 points per endorsement)
  SELECT total_score + COALESCE(COUNT(*) * 25, 0) INTO total_score
  FROM endorsements 
  WHERE endorser_user_id = supporter_user_id;
  
  -- Activity bonus (5 points per activity)
  SELECT total_score + COALESCE(COUNT(*) * 5, 0) INTO total_score
  FROM user_activity_log 
  WHERE user_id = supporter_user_id;
  
  RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Function to trigger supporter celebrations
CREATE OR REPLACE FUNCTION trigger_supporter_celebrations()
RETURNS TRIGGER AS $$
DECLARE
  impact_score INTEGER;
  celebration_count INTEGER;
BEGIN
  -- Calculate current impact score
  impact_score := calculate_supporter_impact_score(NEW.user_id);
  
  -- Check for milestone celebrations
  IF impact_score >= 100 AND impact_score < 200 THEN
    -- Bronze milestone
    SELECT COUNT(*) INTO celebration_count
    FROM supporter_celebrations 
    WHERE supporter_id = NEW.user_id::text 
    AND celebration_type = 'milestone' 
    AND title LIKE '%Bronze%';
    
    IF celebration_count = 0 THEN
      INSERT INTO supporter_celebrations (supporter_id, celebration_type, title, description, impact_score)
      VALUES (NEW.user_id::text, 'milestone', 'Bronze Supporter Achievement! 🥉', 'You''ve reached 100 impact points and earned Bronze status!', impact_score);
    END IF;
  END IF;
  
  IF impact_score >= 500 AND impact_score < 600 THEN
    -- Silver milestone
    SELECT COUNT(*) INTO celebration_count
    FROM supporter_celebrations 
    WHERE supporter_id = NEW.user_id::text 
    AND celebration_type = 'milestone' 
    AND title LIKE '%Silver%';
    
    IF celebration_count = 0 THEN
      INSERT INTO supporter_celebrations (supporter_id, celebration_type, title, description, impact_score)
      VALUES (NEW.user_id::text, 'milestone', 'Silver Supporter Achievement! 🥈', 'You''ve reached 500 impact points and earned Silver status!', impact_score);
    END IF;
  END IF;
  
  IF impact_score >= 1000 AND impact_score < 1100 THEN
    -- Gold milestone
    SELECT COUNT(*) INTO celebration_count
    FROM supporter_celebrations 
    WHERE supporter_id = NEW.user_id::text 
    AND celebration_type = 'milestone' 
    AND title LIKE '%Gold%';
    
    IF celebration_count = 0 THEN
      INSERT INTO supporter_celebrations (supporter_id, celebration_type, title, description, impact_score)
      VALUES (NEW.user_id::text, 'milestone', 'Gold Supporter Achievement! 🥇', 'You''ve reached 1000 impact points and earned Gold status!', impact_score);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS FOR AUTOMATION
-- =====================================================

-- Trigger for supporter celebrations on activity
CREATE TRIGGER trigger_supporter_celebrations_on_activity
  AFTER INSERT ON user_activity_log
  FOR EACH ROW
  WHEN (NEW.user_id IS NOT NULL)
  EXECUTE FUNCTION trigger_supporter_celebrations();

-- Trigger for supporter celebrations on donations
CREATE TRIGGER trigger_supporter_celebrations_on_donations
  AFTER INSERT ON donations
  FOR EACH ROW
  WHEN (NEW.user_id IS NOT NULL)
  EXECUTE FUNCTION trigger_supporter_celebrations();

-- Trigger for supporter celebrations on referrals
CREATE TRIGGER trigger_supporter_celebrations_on_referrals
  AFTER INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION trigger_supporter_celebrations();

-- Trigger for supporter celebrations on endorsements
CREATE TRIGGER trigger_supporter_celebrations_on_endorsements
  AFTER INSERT ON endorsements
  FOR EACH ROW
  WHEN (NEW.endorser_user_id IS NOT NULL)
  EXECUTE FUNCTION trigger_supporter_celebrations();

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample AI suggestions
INSERT INTO ai_suggestions (user_id, user_type, suggestion_type, title, description, priority, icon, action_text, action_type) VALUES
(
  (SELECT id FROM users WHERE role = 'supporter' LIMIT 1),
  'supporter',
  'engagement',
  'Share a Veteran Pitch',
  'Help a veteran get noticed by sharing their pitch with your network',
  'high',
  '🔗',
  'Browse Veterans',
  'browse_veterans'
),
(
  (SELECT id FROM users WHERE role = 'supporter' LIMIT 1),
  'supporter',
  'impact',
  'Make Your First Endorsement',
  'Endorse a veteran to boost their credibility and help them succeed',
  'medium',
  '⭐',
  'Find Veterans',
  'find_veterans'
),
(
  (SELECT id FROM users WHERE role = 'supporter' LIMIT 1),
  'supporter',
  'goal',
  'Set an Impact Goal',
  'Set a goal to help 5 veterans this month and track your progress',
  'medium',
  '🎯',
  'Set Goal',
  'set_goal'
);

-- Insert sample supporter celebrations
INSERT INTO supporter_celebrations (supporter_id, celebration_type, title, description, impact_score) VALUES
(
  (SELECT id::text FROM users WHERE role = 'supporter' LIMIT 1),
  'achievement',
  'First Referral! 🔗',
  'You''ve helped connect a veteran with opportunities!',
  50
),
(
  (SELECT id::text FROM users WHERE role = 'supporter' LIMIT 1),
  'milestone',
  'Bronze Supporter Achievement! 🥉',
  'You''ve reached 100 impact points and earned Bronze status!',
  100
);

-- Insert sample supporter badges
INSERT INTO supporter_badges (supporter_id, badge_type, badge_name, badge_description, icon) VALUES
(
  (SELECT id::text FROM users WHERE role = 'supporter' LIMIT 1),
  'first_referral',
  'First Referral',
  'Made your first veteran referral',
  '🔗'
),
(
  (SELECT id::text FROM users WHERE role = 'supporter' LIMIT 1),
  'bronze',
  'Bronze Supporter',
  'Reached 100 impact points',
  '🥉'
);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE ai_suggestions IS 'AI-powered suggestions and recommendations for all user types';
COMMENT ON TABLE supporter_celebrations IS 'Digital celebrations and achievements for supporters';
COMMENT ON TABLE supporter_badges IS 'Achievement badges and recognition for supporters';
COMMENT ON TABLE user_goals IS 'Personal goals and milestones for users';
COMMENT ON TABLE goal_progress IS 'Progress tracking for user goals';
COMMENT ON TABLE behavioral_nudges IS 'Behavioral nudges and reminders for users';
COMMENT ON TABLE user_behavior_analytics IS 'User behavior tracking for analytics';
COMMENT ON TABLE supporter_impact IS 'Detailed impact tracking for supporters';

COMMENT ON VIEW unified_supporters_aggregated IS 'Unified view of all supporter activities and impact';
COMMENT ON VIEW supporter_impact_summary IS 'Summary view of supporter impact metrics';

COMMENT ON FUNCTION calculate_supporter_impact_score IS 'Calculate total impact score for a supporter';
COMMENT ON FUNCTION trigger_supporter_celebrations IS 'Automatically trigger celebrations based on impact milestones';
