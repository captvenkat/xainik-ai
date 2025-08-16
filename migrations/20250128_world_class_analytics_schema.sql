-- 🌟 WORLD-CLASS ANALYTICS SCHEMA
-- Comprehensive tracking and engagement system for professional platform

-- ========================================
-- ANALYTICS & ENGAGEMENT TABLES
-- ========================================

-- 1. PITCH VIEWS TRACKING
CREATE TABLE IF NOT EXISTS pitch_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    viewer_ip INET,
    user_agent TEXT,
    referrer TEXT,
    session_id TEXT,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    view_duration INTEGER, -- seconds
    is_unique BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PITCH LIKES/REACTIONS
CREATE TABLE IF NOT EXISTS pitch_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'helpful', 'inspiring')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(pitch_id, user_id)
);

-- 3. PITCH SHARES
CREATE TABLE IF NOT EXISTS pitch_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    sharer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    share_platform TEXT NOT NULL CHECK (share_platform IN ('linkedin', 'twitter', 'facebook', 'email', 'whatsapp', 'copy_link')),
    share_url TEXT,
    recipient_email TEXT,
    share_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENDORSEMENTS
CREATE TABLE IF NOT EXISTS endorsements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    endorser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endorsee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endorsement_text TEXT,
    skill_endorsed TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(pitch_id, endorser_id, endorsee_id)
);

-- 5. CONTACT REQUESTS
CREATE TABLE IF NOT EXISTS contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('call', 'email', 'meeting', 'collaboration', 'job_opportunity')),
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
    scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REFERRAL EVENTS
CREATE TABLE IF NOT EXISTS referral_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_email TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('invite_sent', 'invite_accepted', 'signup_completed', 'first_pitch_created')),
    pitch_id UUID REFERENCES pitches(id) ON DELETE SET NULL,
    conversion_value DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. USER ACTIVITY LOG
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_data JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SESSION TRACKING
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    country TEXT,
    city TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    page_views INTEGER DEFAULT 0
);

-- 9. PERFORMANCE METRICS
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,4),
    metric_unit TEXT,
    context JSONB,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ERROR LOGGING
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_agent TEXT,
    ip_address INET,
    url TEXT,
    method TEXT,
    request_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Pitch Views Indexes
CREATE INDEX IF NOT EXISTS idx_pitch_views_pitch_id ON pitch_views(pitch_id);
CREATE INDEX IF NOT EXISTS idx_pitch_views_viewer_id ON pitch_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_pitch_views_viewed_at ON pitch_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_pitch_views_session_id ON pitch_views(session_id);

-- Pitch Likes Indexes
CREATE INDEX IF NOT EXISTS idx_pitch_likes_pitch_id ON pitch_likes(pitch_id);
CREATE INDEX IF NOT EXISTS idx_pitch_likes_user_id ON pitch_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_likes_reaction_type ON pitch_likes(reaction_type);

-- Pitch Shares Indexes
CREATE INDEX IF NOT EXISTS idx_pitch_shares_pitch_id ON pitch_shares(pitch_id);
CREATE INDEX IF NOT EXISTS idx_pitch_shares_sharer_id ON pitch_shares(sharer_id);
CREATE INDEX IF NOT EXISTS idx_pitch_shares_platform ON pitch_shares(share_platform);

-- Endorsements Indexes
CREATE INDEX IF NOT EXISTS idx_endorsements_pitch_id ON endorsements(pitch_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_endorser_id ON endorsements(endorser_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_endorsee_id ON endorsements(endorsee_id);

-- Contact Requests Indexes
CREATE INDEX IF NOT EXISTS idx_contact_requests_pitch_id ON contact_requests(pitch_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_requester_id ON contact_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_recipient_id ON contact_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);

-- Referral Events Indexes
CREATE INDEX IF NOT EXISTS idx_referral_events_referrer_id ON referral_events(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_event_type ON referral_events(event_type);
CREATE INDEX IF NOT EXISTS idx_referral_events_created_at ON referral_events(created_at);

-- Activity Log Indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);

-- Session Indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON performance_metrics(recorded_at);

-- Error Log Indexes
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);

-- ========================================
-- RLS POLICIES FOR SECURITY
-- ========================================

-- Enable RLS on all tables
ALTER TABLE pitch_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Pitch Views Policies
CREATE POLICY "Users can view pitch view analytics" ON pitch_views
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM pitches WHERE id = pitch_id
    ));

CREATE POLICY "System can insert pitch views" ON pitch_views
    FOR INSERT WITH CHECK (true);

-- Pitch Likes Policies
CREATE POLICY "Users can view pitch likes" ON pitch_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own likes" ON pitch_likes
    FOR ALL USING (auth.uid() = user_id);

-- Pitch Shares Policies
CREATE POLICY "Users can view pitch shares" ON pitch_shares
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own shares" ON pitch_shares
    FOR ALL USING (auth.uid() = sharer_id);

-- Endorsements Policies
CREATE POLICY "Users can view public endorsements" ON endorsements
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage their own endorsements" ON endorsements
    FOR ALL USING (auth.uid() = endorser_id);

-- Contact Requests Policies
CREATE POLICY "Users can view their contact requests" ON contact_requests
    FOR SELECT USING (auth.uid() IN (requester_id, recipient_id));

CREATE POLICY "Users can create contact requests" ON contact_requests
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their contact requests" ON contact_requests
    FOR UPDATE USING (auth.uid() IN (requester_id, recipient_id));

-- Referral Events Policies
CREATE POLICY "Users can view their referral events" ON referral_events
    FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "System can insert referral events" ON referral_events
    FOR INSERT WITH CHECK (true);

-- Activity Log Policies
CREATE POLICY "Users can view their own activity" ON user_activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" ON user_activity_log
    FOR INSERT WITH CHECK (true);

-- Session Policies
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage sessions" ON user_sessions
    FOR ALL USING (true);

-- Performance Metrics Policies (Admin only)
CREATE POLICY "Admins can view performance metrics" ON performance_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can insert performance metrics" ON performance_metrics
    FOR INSERT WITH CHECK (true);

-- Error Logs Policies (Admin only)
CREATE POLICY "Admins can view error logs" ON error_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can insert error logs" ON error_logs
    FOR INSERT WITH CHECK (true);

-- ========================================
-- TRIGGERS FOR AUTOMATION
-- ========================================

-- Update pitch engagement counts
CREATE OR REPLACE FUNCTION update_pitch_engagement_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update likes count
        IF TG_TABLE_NAME = 'pitch_likes' THEN
            UPDATE pitches 
            SET likes_count = (
                SELECT COUNT(*) FROM pitch_likes WHERE pitch_id = NEW.pitch_id
            )
            WHERE id = NEW.pitch_id;
        END IF;
        
        -- Update views count
        IF TG_TABLE_NAME = 'pitch_views' THEN
            UPDATE pitches 
            SET views_count = (
                SELECT COUNT(*) FROM pitch_views WHERE pitch_id = NEW.pitch_id
            )
            WHERE id = NEW.pitch_id;
        END IF;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        -- Update likes count on delete
        IF TG_TABLE_NAME = 'pitch_likes' THEN
            UPDATE pitches 
            SET likes_count = (
                SELECT COUNT(*) FROM pitch_likes WHERE pitch_id = OLD.pitch_id
            )
            WHERE id = OLD.pitch_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_pitch_likes_count
    AFTER INSERT OR DELETE ON pitch_likes
    FOR EACH ROW EXECUTE FUNCTION update_pitch_engagement_counts();

CREATE TRIGGER trigger_update_pitch_views_count
    AFTER INSERT ON pitch_views
    FOR EACH ROW EXECUTE FUNCTION update_pitch_engagement_counts();

-- ========================================
-- VIEWS FOR ANALYTICS
-- ========================================

-- Pitch Engagement Summary View
CREATE OR REPLACE VIEW pitch_engagement_summary AS
SELECT 
    p.id as pitch_id,
    p.title,
    p.user_id,
    u.name as creator_name,
    COUNT(DISTINCT pv.id) as total_views,
    COUNT(DISTINCT CASE WHEN pv.is_unique THEN pv.id END) as unique_views,
    COUNT(DISTINCT pl.id) as total_likes,
    COUNT(DISTINCT ps.id) as total_shares,
    COUNT(DISTINCT e.id) as total_endorsements,
    COUNT(DISTINCT cr.id) as total_contact_requests,
    AVG(pv.view_duration) as avg_view_duration,
    p.created_at,
    p.updated_at
FROM pitches p
LEFT JOIN users u ON p.user_id = u.id
LEFT JOIN pitch_views pv ON p.id = pv.pitch_id
LEFT JOIN pitch_likes pl ON p.id = pl.pitch_id
LEFT JOIN pitch_shares ps ON p.id = ps.pitch_id
LEFT JOIN endorsements e ON p.id = e.pitch_id
LEFT JOIN contact_requests cr ON p.id = cr.pitch_id
WHERE p.is_active = true
GROUP BY p.id, p.title, p.user_id, u.name, p.created_at, p.updated_at;

-- User Activity Summary View
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.role,
    COUNT(DISTINCT p.id) as total_pitches,
    COUNT(DISTINCT pv.id) as total_views_received,
    COUNT(DISTINCT pl.id) as total_likes_received,
    COUNT(DISTINCT ps.id) as total_shares_received,
    COUNT(DISTINCT e.id) as total_endorsements_received,
    COUNT(DISTINCT cr.id) as total_contact_requests_received,
    COUNT(DISTINCT ual.id) as total_activities,
    u.created_at as joined_at,
    MAX(ual.created_at) as last_activity
FROM users u
LEFT JOIN pitches p ON u.id = p.user_id AND p.is_active = true
LEFT JOIN pitch_views pv ON p.id = pv.pitch_id
LEFT JOIN pitch_likes pl ON p.id = pl.pitch_id
LEFT JOIN pitch_shares ps ON p.id = ps.pitch_id
LEFT JOIN endorsements e ON p.id = e.pitch_id
LEFT JOIN contact_requests cr ON p.id = cr.pitch_id
LEFT JOIN user_activity_log ual ON u.id = ual.user_id
GROUP BY u.id, u.name, u.email, u.role, u.created_at;

-- ========================================
-- FUNCTIONS FOR ANALYTICS
-- ========================================

-- Function to get user engagement metrics
CREATE OR REPLACE FUNCTION get_user_engagement_metrics(user_uuid UUID)
RETURNS TABLE (
    metric_name TEXT,
    metric_value BIGINT,
    metric_period TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'total_pitches'::TEXT,
        COUNT(DISTINCT p.id)::BIGINT,
        'all_time'::TEXT
    FROM pitches p
    WHERE p.user_id = user_uuid AND p.is_active = true
    
    UNION ALL
    
    SELECT 
        'total_views_received'::TEXT,
        COUNT(DISTINCT pv.id)::BIGINT,
        'all_time'::TEXT
    FROM pitches p
    JOIN pitch_views pv ON p.id = pv.pitch_id
    WHERE p.user_id = user_uuid AND p.is_active = true
    
    UNION ALL
    
    SELECT 
        'total_likes_received'::TEXT,
        COUNT(DISTINCT pl.id)::BIGINT,
        'all_time'::TEXT
    FROM pitches p
    JOIN pitch_likes pl ON p.id = pl.pitch_id
    WHERE p.user_id = user_uuid AND p.is_active = true
    
    UNION ALL
    
    SELECT 
        'total_shares_received'::TEXT,
        COUNT(DISTINCT ps.id)::BIGINT,
        'all_time'::TEXT
    FROM pitches p
    JOIN pitch_shares ps ON p.id = ps.pitch_id
    WHERE p.user_id = user_uuid AND p.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track user activity
CREATE OR REPLACE FUNCTION track_user_activity(
    activity_type_param TEXT,
    activity_data_param JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO user_activity_log (
        user_id,
        activity_type,
        activity_data,
        ip_address,
        user_agent,
        session_id
    ) VALUES (
        auth.uid(),
        activity_type_param,
        activity_data_param,
        inet_client_addr(),
        current_setting('request.headers')::json->>'user-agent',
        current_setting('request.headers')::json->>'x-session-id'
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE pitch_views IS 'Tracks all views of pitches with detailed analytics';
COMMENT ON TABLE pitch_likes IS 'Tracks user reactions and likes on pitches';
COMMENT ON TABLE pitch_shares IS 'Tracks when users share pitches on different platforms';
COMMENT ON TABLE endorsements IS 'Tracks skill endorsements between users';
COMMENT ON TABLE contact_requests IS 'Tracks contact requests between users';
COMMENT ON TABLE referral_events IS 'Tracks referral program events and conversions';
COMMENT ON TABLE user_activity_log IS 'Comprehensive user activity tracking for analytics';
COMMENT ON TABLE user_sessions IS 'User session tracking for engagement analysis';
COMMENT ON TABLE performance_metrics IS 'System performance metrics for monitoring';
COMMENT ON TABLE error_logs IS 'Error logging for debugging and monitoring';

-- Success message
SELECT '🌟 World-class analytics schema created successfully!' as status;
