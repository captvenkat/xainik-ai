-- =====================================================
-- COMMUNITY EMPOWERMENT PHASE 1 - MIGRATION SCRIPT
-- Apply this to transform Xainik into a self-sustaining platform
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. COMMUNITY GOVERNANCE SYSTEM
-- =====================================================

-- Community proposals table for feature requests and improvements
CREATE TABLE IF NOT EXISTS community_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    proposal_type TEXT NOT NULL CHECK (proposal_type IN ('feature', 'improvement', 'policy', 'content')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'approved', 'rejected', 'implemented', 'archived')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    votes_for INTEGER DEFAULT 0,
    votes_against INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    impact_score INTEGER DEFAULT 0 CHECK (impact_score >= 0 AND impact_score <= 10),
    implementation_effort INTEGER DEFAULT 0 CHECK (implementation_effort >= 1 AND implementation_effort <= 10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    implemented_at TIMESTAMPTZ,
    implemented_by UUID REFERENCES auth.users(id)
);

-- Community voting system
CREATE TABLE IF NOT EXISTS community_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES community_proposals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('for', 'against', 'abstain')),
    vote_weight INTEGER DEFAULT 1 CHECK (vote_weight >= 1 AND vote_weight <= 5),
    reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(proposal_id, user_id)
);

-- Community feedback collection
CREATE TABLE IF NOT EXISTS community_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug_report', 'feature_request', 'improvement', 'general', 'praise')),
    category TEXT NOT NULL CHECK (category IN ('ui_ux', 'performance', 'functionality', 'content', 'community', 'other')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES auth.users(id),
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. PEER-TO-PEER SUPPORT SYSTEM
-- =====================================================

-- Peer support sessions
CREATE TABLE IF NOT EXISTS peer_support_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL CHECK (session_type IN ('resume_review', 'interview_prep', 'career_guidance', 'pitch_feedback', 'skill_mentoring', 'networking')),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('requested', 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    scheduled_at TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 30 CHECK (duration_minutes >= 15 AND duration_minutes <= 120),
    meeting_link TEXT,
    notes TEXT,
    mentee_rating INTEGER CHECK (mentee_rating >= 1 AND mentee_rating <= 5),
    mentee_feedback TEXT,
    mentor_rating INTEGER CHECK (mentor_rating >= 1 AND mentor_rating <= 5),
    mentor_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Mentor profiles and availability
CREATE TABLE IF NOT EXISTS mentor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expertise_areas TEXT[] NOT NULL,
    experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
    bio TEXT,
    hourly_rate_credits INTEGER DEFAULT 0,
    availability_schedule JSONB,
    total_sessions INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- 3. COMMUNITY RECOGNITION SYSTEM
-- =====================================================

-- Achievement system
CREATE TABLE IF NOT EXISTS community_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL CHECK (achievement_type IN ('invitation_master', 'helpful_supporter', 'mentor_expert', 'feedback_champion', 'community_builder', 'veteran_advocate')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT,
    points_awarded INTEGER DEFAULT 0,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community points system
CREATE TABLE IF NOT EXISTS community_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points_type TEXT NOT NULL CHECK (points_type IN ('earned', 'spent', 'bonus', 'penalty')),
    amount INTEGER NOT NULL,
    source TEXT NOT NULL,
    description TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community leaderboard
CREATE TABLE IF NOT EXISTS community_leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    rank_position INTEGER,
    achievements_count INTEGER DEFAULT 0,
    sessions_mentored INTEGER DEFAULT 0,
    sessions_attended INTEGER DEFAULT 0,
    invitations_sent INTEGER DEFAULT 0,
    feedback_provided INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- 4. ENHANCED ENGAGEMENT LOOPS
-- =====================================================

-- User activity tracking for engagement loops
CREATE TABLE IF NOT EXISTS user_engagement_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('login', 'invitation_sent', 'invitation_accepted', 'feedback_provided', 'proposal_voted', 'session_attended', 'session_mentored', 'achievement_unlocked')),
    event_data JSONB DEFAULT '{}',
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community challenges and campaigns
CREATE TABLE IF NOT EXISTS community_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    challenge_type TEXT NOT NULL CHECK (challenge_type IN ('invitation', 'mentoring', 'feedback', 'engagement', 'growth')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    target_metric TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    reward_points INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('upcoming', 'active', 'completed', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. INDEXES FOR PERFORMANCE
-- =====================================================

-- Community proposals indexes
CREATE INDEX IF NOT EXISTS idx_community_proposals_user_id ON community_proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_community_proposals_status ON community_proposals(status);
CREATE INDEX IF NOT EXISTS idx_community_proposals_type ON community_proposals(proposal_type);
CREATE INDEX IF NOT EXISTS idx_community_proposals_priority ON community_proposals(priority);
CREATE INDEX IF NOT EXISTS idx_community_proposals_created ON community_proposals(created_at);

-- Community votes indexes
CREATE INDEX IF NOT EXISTS idx_community_votes_proposal_id ON community_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_user_id ON community_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_type ON community_votes(vote_type);

-- Peer support indexes
CREATE INDEX IF NOT EXISTS idx_peer_support_mentor_id ON peer_support_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_peer_support_mentee_id ON peer_support_sessions(mentee_id);
CREATE INDEX IF NOT EXISTS idx_peer_support_status ON peer_support_sessions(status);
CREATE INDEX IF NOT EXISTS idx_peer_support_scheduled ON peer_support_sessions(scheduled_at);

-- Mentor profiles indexes
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user_id ON mentor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_expertise ON mentor_profiles USING GIN(expertise_areas);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_active ON mentor_profiles(is_active);

-- Community recognition indexes
CREATE INDEX IF NOT EXISTS idx_community_achievements_user_id ON community_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_community_achievements_type ON community_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_community_points_user_id ON community_points(user_id);
CREATE INDEX IF NOT EXISTS idx_community_points_type ON community_points(points_type);

-- Engagement tracking indexes
CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON user_engagement_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_engagement_type ON user_engagement_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_engagement_created ON user_engagement_events(created_at);

-- =====================================================
-- 6. VIEWS FOR ANALYTICS
-- =====================================================

-- Community health dashboard
CREATE OR REPLACE VIEW community_health_dashboard AS
SELECT 
    COUNT(DISTINCT cp.user_id) as active_proposers,
    COUNT(DISTINCT cv.user_id) as active_voters,
    COUNT(DISTINCT ps.mentor_id) as active_mentors,
    COUNT(DISTINCT ps.mentee_id) as active_mentees,
    AVG(cp.impact_score) as avg_proposal_impact,
    AVG(ps.mentee_rating) as avg_mentor_rating,
    COUNT(*) as total_proposals,
    COUNT(CASE WHEN cp.status = 'implemented' THEN 1 END) as implemented_proposals
FROM community_proposals cp
LEFT JOIN community_votes cv ON cp.id = cv.proposal_id
LEFT JOIN peer_support_sessions ps ON cp.user_id = ps.mentor_id OR cp.user_id = ps.mentee_id;

-- User engagement summary
CREATE OR REPLACE VIEW user_engagement_summary AS
SELECT 
    ue.user_id,
    COUNT(*) as total_events,
    COUNT(CASE WHEN ue.event_type = 'invitation_sent' THEN 1 END) as invitations_sent,
    COUNT(CASE WHEN ue.event_type = 'feedback_provided' THEN 1 END) as feedback_provided,
    COUNT(CASE WHEN ue.event_type = 'proposal_voted' THEN 1 END) as proposals_voted,
    COUNT(CASE WHEN ue.event_type = 'session_attended' THEN 1 END) as sessions_attended,
    SUM(ue.points_earned) as total_points_earned,
    MAX(ue.created_at) as last_activity
FROM user_engagement_events ue
GROUP BY ue.user_id;

-- Community leaderboard view
CREATE OR REPLACE VIEW community_leaderboard_view AS
SELECT 
    cl.user_id,
    u.email,
    p.name,
    cl.total_points,
    cl.rank_position,
    cl.achievements_count,
    cl.sessions_mentored,
    cl.sessions_attended,
    cl.invitations_sent,
    cl.feedback_provided,
    cl.last_updated
FROM community_leaderboard cl
JOIN auth.users u ON cl.user_id = u.id
LEFT JOIN profiles p ON cl.user_id = p.user_id
ORDER BY cl.total_points DESC, cl.rank_position ASC;

-- =====================================================
-- 7. FUNCTIONS FOR AUTOMATION
-- =====================================================

-- Function to update proposal vote counts
CREATE OR REPLACE FUNCTION update_proposal_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update vote counts when new vote is added
        UPDATE community_proposals 
        SET 
            votes_for = (SELECT COUNT(*) FROM community_votes WHERE proposal_id = NEW.proposal_id AND vote_type = 'for'),
            votes_against = (SELECT COUNT(*) FROM community_votes WHERE proposal_id = NEW.proposal_id AND vote_type = 'against'),
            total_votes = (SELECT COUNT(*) FROM community_votes WHERE proposal_id = NEW.proposal_id)
        WHERE id = NEW.proposal_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update vote counts when vote is modified
        UPDATE community_proposals 
        SET 
            votes_for = (SELECT COUNT(*) FROM community_votes WHERE proposal_id = NEW.proposal_id AND vote_type = 'for'),
            votes_against = (SELECT COUNT(*) FROM community_votes WHERE proposal_id = NEW.proposal_id AND vote_type = 'against'),
            total_votes = (SELECT COUNT(*) FROM community_votes WHERE proposal_id = NEW.proposal_id)
        WHERE id = NEW.proposal_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update vote counts when vote is deleted
        UPDATE community_proposals 
        SET 
            votes_for = (SELECT COUNT(*) FROM community_votes WHERE proposal_id = OLD.proposal_id AND vote_type = 'for'),
            votes_against = (SELECT COUNT(*) FROM community_votes WHERE proposal_id = OLD.proposal_id AND vote_type = 'against'),
            total_votes = (SELECT COUNT(*) FROM community_votes WHERE proposal_id = OLD.proposal_id)
        WHERE id = OLD.proposal_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to award points for engagement
CREATE OR REPLACE FUNCTION award_engagement_points(
    p_user_id UUID,
    p_event_type TEXT,
    p_points INTEGER DEFAULT 0
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_points_to_award INTEGER;
BEGIN
    -- Determine points based on event type
    CASE p_event_type
        WHEN 'invitation_sent' THEN v_points_to_award := 10;
        WHEN 'invitation_accepted' THEN v_points_to_award := 25;
        WHEN 'feedback_provided' THEN v_points_to_award := 15;
        WHEN 'proposal_voted' THEN v_points_to_award := 5;
        WHEN 'session_attended' THEN v_points_to_award := 20;
        WHEN 'session_mentored' THEN v_points_to_award := 30;
        WHEN 'achievement_unlocked' THEN v_points_to_award := 50;
        ELSE v_points_to_award := COALESCE(p_points, 0);
    END CASE;
    
    -- Award points if any
    IF v_points_to_award > 0 THEN
        INSERT INTO community_points (user_id, points_type, amount, source, description)
        VALUES (p_user_id, 'earned', v_points_to_award, p_event_type, 'Engagement reward');
        
        -- Update leaderboard
        INSERT INTO community_leaderboard (user_id, total_points)
        VALUES (p_user_id, v_points_to_award)
        ON CONFLICT (user_id) DO UPDATE SET
            total_points = community_leaderboard.total_points + v_points_to_award,
            last_updated = NOW();
    END IF;
    
    RETURN v_points_to_award;
END;
$$;

-- =====================================================
-- 8. TRIGGERS FOR AUTOMATION
-- =====================================================

-- Trigger to update vote counts automatically
CREATE TRIGGER trigger_update_proposal_vote_counts
    AFTER INSERT OR UPDATE OR DELETE ON community_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_proposal_vote_counts();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_community_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_community_proposals_updated_at
    BEFORE UPDATE ON community_proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_community_tables_updated_at();

CREATE TRIGGER trigger_community_votes_updated_at
    BEFORE UPDATE ON community_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_community_tables_updated_at();

CREATE TRIGGER trigger_community_feedback_updated_at
    BEFORE UPDATE ON community_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_community_tables_updated_at();

CREATE TRIGGER trigger_peer_support_sessions_updated_at
    BEFORE UPDATE ON peer_support_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_community_tables_updated_at();

CREATE TRIGGER trigger_mentor_profiles_updated_at
    BEFORE UPDATE ON mentor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_community_tables_updated_at();

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE community_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_support_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_proposals
CREATE POLICY "Users can view all proposals" ON community_proposals FOR SELECT USING (true);
CREATE POLICY "Users can create their own proposals" ON community_proposals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own proposals" ON community_proposals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all proposals" ON community_proposals FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS Policies for community_votes
CREATE POLICY "Users can view all votes" ON community_votes FOR SELECT USING (true);
CREATE POLICY "Users can create their own votes" ON community_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON community_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON community_votes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for peer_support_sessions
CREATE POLICY "Users can view their own sessions" ON peer_support_sessions FOR SELECT USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);
CREATE POLICY "Users can create sessions" ON peer_support_sessions FOR INSERT WITH CHECK (auth.uid() = mentor_id OR auth.uid() = mentee_id);
CREATE POLICY "Users can update their own sessions" ON peer_support_sessions FOR UPDATE USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- RLS Policies for mentor_profiles
CREATE POLICY "Users can view all mentor profiles" ON mentor_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage their own profile" ON mentor_profiles FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for community_achievements
CREATE POLICY "Users can view all achievements" ON community_achievements FOR SELECT USING (true);
CREATE POLICY "System can manage achievements" ON community_achievements FOR ALL USING (true);

-- RLS Policies for community_points
CREATE POLICY "Users can view their own points" ON community_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage points" ON community_points FOR ALL USING (true);

-- RLS Policies for community_leaderboard
CREATE POLICY "Users can view leaderboard" ON community_leaderboard FOR SELECT USING (true);
CREATE POLICY "System can manage leaderboard" ON community_leaderboard FOR ALL USING (true);

-- RLS Policies for user_engagement_events
CREATE POLICY "Users can view their own events" ON user_engagement_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage events" ON user_engagement_events FOR ALL USING (true);

-- RLS Policies for community_challenges
CREATE POLICY "Users can view challenges" ON community_challenges FOR SELECT USING (true);
CREATE POLICY "Admins can manage challenges" ON community_challenges FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON community_proposals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON community_votes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON community_feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE ON peer_support_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON mentor_profiles TO authenticated;
GRANT SELECT ON community_achievements TO authenticated;
GRANT SELECT ON community_points TO authenticated;
GRANT SELECT ON community_leaderboard TO authenticated;
GRANT SELECT ON user_engagement_events TO authenticated;
GRANT SELECT ON community_challenges TO authenticated;

-- Grant permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================

-- Verify the setup
SELECT 
    'Community Empowerment Phase 1 deployed successfully!' as status,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'community_proposals', 'community_votes', 'community_feedback',
    'peer_support_sessions', 'mentor_profiles', 'community_achievements',
    'community_points', 'community_leaderboard', 'user_engagement_events',
    'community_challenges'
);

SELECT 
    'Views created successfully!' as status,
    COUNT(*) as view_count
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN (
    'community_health_dashboard', 'user_engagement_summary', 'community_leaderboard_view'
);

SELECT 
    'Functions created successfully!' as status,
    COUNT(*) as function_count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'update_proposal_vote_counts', 'award_engagement_points', 'update_community_tables_updated_at'
);
