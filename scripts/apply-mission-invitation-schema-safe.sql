-- =====================================================
-- SAFE MISSION INVITATION SYSTEM MIGRATION
-- This script handles existing objects gracefully
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE MISSION INVITATIONS TABLE (IF NOT EXISTS)
-- =====================================================
CREATE TABLE IF NOT EXISTS mission_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    inviter_role TEXT NOT NULL CHECK (inviter_role IN ('veteran', 'recruiter', 'supporter')),
    invitation_link TEXT UNIQUE NOT NULL,
    invitation_message TEXT DEFAULT 'Join me in supporting veterans!',
    platform TEXT DEFAULT 'direct',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    accepted_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    accepted_user_role TEXT CHECK (accepted_user_role IN ('veteran', 'recruiter', 'supporter')),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE MISSION INVITATION EVENTS TABLE (IF NOT EXISTS)
-- =====================================================
CREATE TABLE IF NOT EXISTS mission_invitation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID NOT NULL REFERENCES mission_invitations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('invitation_sent', 'invitation_viewed', 'invitation_clicked', 'user_registered', 'role_selected')),
    event_data JSONB DEFAULT '{}',
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE MISSION INVITATION ANALYTICS TABLE (IF NOT EXISTS)
-- =====================================================
CREATE TABLE IF NOT EXISTS mission_invitation_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_invitations INTEGER DEFAULT 0,
    pending_invitations INTEGER DEFAULT 0,
    accepted_invitations INTEGER DEFAULT 0,
    declined_invitations INTEGER DEFAULT 0,
    expired_invitations INTEGER DEFAULT 0,
    total_registrations INTEGER DEFAULT 0,
    veteran_registrations INTEGER DEFAULT 0,
    recruiter_registrations INTEGER DEFAULT 0,
    supporter_registrations INTEGER DEFAULT 0,
    last_invitation_at TIMESTAMPTZ,
    first_invitation_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(inviter_id)
);

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE (IF NOT EXISTS)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_mission_invitations_inviter_id ON mission_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_status ON mission_invitations(status);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_link ON mission_invitations(invitation_link);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_expires ON mission_invitations(expires_at);

CREATE INDEX IF NOT EXISTS idx_mission_invitation_events_invitation_id ON mission_invitation_events(invitation_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_events_type ON mission_invitation_events(event_type);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_events_created ON mission_invitation_events(created_at);

CREATE INDEX IF NOT EXISTS idx_mission_invitation_analytics_inviter_id ON mission_invitation_analytics(inviter_id);

-- =====================================================
-- 5. CREATE VIEWS FOR ANALYTICS (OR REPLACE)
-- =====================================================

-- Mission Invitation Summary View
CREATE OR REPLACE VIEW mission_invitation_summary AS
SELECT 
    mi.inviter_id,
    COUNT(*) as total_invitations,
    COUNT(CASE WHEN mi.status = 'pending' THEN 1 END) as pending_invitations,
    COUNT(CASE WHEN mi.status = 'accepted' THEN 1 END) as accepted_invitations,
    COUNT(CASE WHEN mi.status = 'declined' THEN 1 END) as declined_invitations,
    COUNT(CASE WHEN mi.status = 'expired' THEN 1 END) as expired_invitations,
    COUNT(CASE WHEN mi.accepted_user_id IS NOT NULL THEN 1 END) as total_registrations,
    COUNT(CASE WHEN mi.accepted_user_role = 'veteran' THEN 1 END) as veteran_registrations,
    COUNT(CASE WHEN mi.accepted_user_role = 'recruiter' THEN 1 END) as recruiter_registrations,
    COUNT(CASE WHEN mi.accepted_user_role = 'supporter' THEN 1 END) as supporter_registrations,
    MAX(mi.created_at) as last_invitation_at,
    MIN(mi.created_at) as first_invitation_at
FROM mission_invitations mi
GROUP BY mi.inviter_id;

-- Mission Invitation Performance View
CREATE OR REPLACE VIEW mission_invitation_performance AS
SELECT 
    mia.inviter_id,
    u.name as inviter_name,
    u.role as inviter_role,
    mia.total_invitations,
    mia.total_registrations,
    CASE 
        WHEN mia.total_invitations > 0 
        THEN ROUND((mia.total_registrations::DECIMAL / mia.total_invitations) * 100, 2)
        ELSE 0 
    END as conversion_rate,
    mia.veteran_registrations,
    mia.recruiter_registrations,
    mia.supporter_registrations,
    mia.last_invitation_at,
    mia.first_invitation_at
FROM mission_invitation_analytics mia
JOIN users u ON mia.inviter_id = u.id;

-- =====================================================
-- 6. CREATE FUNCTIONS (OR REPLACE)
-- =====================================================

-- Create Mission Invitation Function
CREATE OR REPLACE FUNCTION create_mission_invitation(
    p_inviter_id UUID,
    p_inviter_role TEXT,
    p_invitation_message TEXT DEFAULT 'Join me in supporting veterans!',
    p_platform TEXT DEFAULT 'direct'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invitation_id UUID;
    v_invitation_link TEXT;
BEGIN
    -- Generate unique invitation link
    v_invitation_link := 'https://xainik.org/join/' || encode(gen_random_bytes(16), 'hex');
    
    -- Create invitation
    INSERT INTO mission_invitations (
        inviter_id,
        inviter_role,
        invitation_link,
        invitation_message,
        platform
    ) VALUES (
        p_inviter_id,
        p_inviter_role,
        v_invitation_link,
        p_invitation_message,
        p_platform
    ) RETURNING id INTO v_invitation_id;
    
    -- Update analytics
    INSERT INTO mission_invitation_analytics (
        inviter_id,
        total_invitations,
        pending_invitations,
        last_invitation_at,
        first_invitation_at
    ) VALUES (
        p_inviter_id,
        1,
        1,
        NOW(),
        NOW()
    )
    ON CONFLICT (inviter_id) DO UPDATE SET
        total_invitations = mission_invitation_analytics.total_invitations + 1,
        pending_invitations = mission_invitation_analytics.pending_invitations + 1,
        last_invitation_at = NOW();
    
    -- Log event
    INSERT INTO mission_invitation_events (
        invitation_id,
        event_type,
        event_data
    ) VALUES (
        v_invitation_id,
        'invitation_sent',
        jsonb_build_object('inviter_role', p_inviter_role, 'platform', p_platform)
    );
    
    RETURN v_invitation_id;
END;
$$;

-- Accept Mission Invitation Function
CREATE OR REPLACE FUNCTION accept_mission_invitation(
    p_invitation_link TEXT,
    p_accepted_user_id UUID,
    p_accepted_user_role TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invitation_id UUID;
    v_inviter_id UUID;
BEGIN
    -- Find invitation by link
    SELECT id, inviter_id INTO v_invitation_id, v_inviter_id
    FROM mission_invitations 
    WHERE invitation_link = p_invitation_link 
    AND status = 'pending'
    AND expires_at > NOW();
    
    IF v_invitation_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Update invitation status
    UPDATE mission_invitations SET
        status = 'accepted',
        accepted_user_id = p_accepted_user_id,
        accepted_user_role = p_accepted_user_role,
        updated_at = NOW()
    WHERE id = v_invitation_id;
    
    -- Update analytics
    UPDATE mission_invitation_analytics SET
        accepted_invitations = accepted_invitations + 1,
        pending_invitations = GREATEST(pending_invitations - 1, 0),
        total_registrations = total_registrations + 1,
        updated_at = NOW()
    WHERE inviter_id = v_inviter_id;
    
    -- Add role-specific registration count
    IF p_accepted_user_role = 'veteran' THEN
        UPDATE mission_invitation_analytics SET
            veteran_registrations = veteran_registrations + 1
        WHERE inviter_id = v_inviter_id;
    ELSIF p_accepted_user_role = 'recruiter' THEN
        UPDATE mission_invitation_analytics SET
            recruiter_registrations = recruiter_registrations + 1
        WHERE inviter_id = v_inviter_id;
    ELSIF p_accepted_user_role = 'supporter' THEN
        UPDATE mission_invitation_analytics SET
            supporter_registrations = supporter_registrations + 1
        WHERE inviter_id = v_inviter_id;
    END IF;
    
    -- Log event
    INSERT INTO mission_invitation_events (
        invitation_id,
        event_type,
        event_data
    ) VALUES (
        v_invitation_id,
        'user_registered',
        jsonb_build_object('accepted_user_role', p_accepted_user_role)
    );
    
    RETURN TRUE;
END;
$$;

-- Expire Old Invitations Function
CREATE OR REPLACE FUNCTION expire_old_mission_invitations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_expired_count INTEGER;
    v_inviter_id UUID;
BEGIN
    -- Get count of expired invitations
    SELECT COUNT(*) INTO v_expired_count
    FROM mission_invitations 
    WHERE status = 'pending' AND expires_at <= NOW();
    
    -- Update expired invitations
    UPDATE mission_invitations SET
        status = 'expired',
        updated_at = NOW()
    WHERE status = 'pending' AND expires_at <= NOW();
    
    -- Update analytics for each inviter
    FOR v_inviter_id IN 
        SELECT DISTINCT inviter_id 
        FROM mission_invitations 
        WHERE status = 'expired' AND updated_at = NOW()
    LOOP
        UPDATE mission_invitation_analytics SET
            expired_invitations = expired_invitations + (
                SELECT COUNT(*) 
                FROM mission_invitations 
                WHERE inviter_id = v_inviter_id 
                AND status = 'expired' 
                AND updated_at = NOW()
            ),
            pending_invitations = GREATEST(
                pending_invitations - (
                    SELECT COUNT(*) 
                    FROM mission_invitations 
                    WHERE inviter_id = v_inviter_id 
                    AND status = 'expired' 
                    AND updated_at = NOW()
                ), 0
            ),
            updated_at = NOW()
        WHERE inviter_id = v_inviter_id;
    END LOOP;
    
    RETURN v_expired_count;
END;
$$;

-- =====================================================
-- 7. CREATE TRIGGERS (SAFELY)
-- =====================================================

-- Function for updated_at trigger
CREATE OR REPLACE FUNCTION update_mission_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS trigger_mission_invitations_updated_at ON mission_invitations;
CREATE TRIGGER trigger_mission_invitations_updated_at
    BEFORE UPDATE ON mission_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_mission_invitations_updated_at();

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on tables
ALTER TABLE mission_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_invitation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_invitation_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own invitations" ON mission_invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON mission_invitations;
DROP POLICY IF EXISTS "Users can update own invitations" ON mission_invitations;
DROP POLICY IF EXISTS "Admins can manage all invitations" ON mission_invitations;

-- Create new policies
CREATE POLICY "Users can view own invitations" ON mission_invitations
    FOR SELECT USING (auth.uid() = inviter_id);

CREATE POLICY "Users can create invitations" ON mission_invitations
    FOR INSERT WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update own invitations" ON mission_invitations
    FOR UPDATE USING (auth.uid() = inviter_id);

CREATE POLICY "Admins can manage all invitations" ON mission_invitations
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin'));

-- Events policies
CREATE POLICY "Users can view own invitation events" ON mission_invitation_events
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM mission_invitations WHERE id = invitation_id AND inviter_id = auth.uid())
    );

CREATE POLICY "Users can create invitation events" ON mission_invitation_events
    FOR INSERT WITH CHECK (true);

-- Analytics policies
CREATE POLICY "Users can view own analytics" ON mission_invitation_analytics
    FOR SELECT USING (auth.uid() = inviter_id);

CREATE POLICY "Users can update own analytics" ON mission_invitation_analytics
    FOR UPDATE USING (auth.uid() = inviter_id);

CREATE POLICY "Admins can manage all analytics" ON mission_invitation_analytics
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin'));

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON mission_invitations TO authenticated;
GRANT SELECT, INSERT ON mission_invitation_events TO authenticated;
GRANT SELECT, UPDATE ON mission_invitation_analytics TO authenticated;

-- Grant permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =====================================================
-- 10. VERIFICATION
-- =====================================================

-- Check what was created
SELECT 
    'Mission Invitation System deployed successfully!' as status,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('mission_invitations', 'mission_invitation_events', 'mission_invitation_analytics');

SELECT 
    'Views created successfully!' as status,
    COUNT(*) as view_count
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('mission_invitation_summary', 'mission_invitation_performance');

SELECT 
    'Functions created successfully!' as status,
    COUNT(*) as function_count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_mission_invitation', 'accept_mission_invitation', 'expire_old_mission_invitations');

-- Test the system
SELECT 'System ready for testing!' as status;
