-- =====================================================
-- MISSION INVITATION SYSTEM MIGRATION
-- World-Class Professional Implementation
-- =====================================================

-- Mission Invitations Table
CREATE TABLE IF NOT EXISTS mission_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  inviter_role VARCHAR(50) NOT NULL CHECK (inviter_role IN ('veteran', 'recruiter', 'supporter', 'admin')),
  invitee_email VARCHAR(255) NOT NULL,
  invitee_name VARCHAR(255),
  invited_role VARCHAR(50) NOT NULL CHECK (invited_role IN ('veteran', 'recruiter', 'supporter')),
  invitation_message TEXT,
  invitation_link text NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  accepted_at timestamptz,
  accepted_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  platform VARCHAR(50), -- email, whatsapp, linkedin, direct
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Mission Invitation Events Table
CREATE TABLE IF NOT EXISTS mission_invitation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL REFERENCES mission_invitations(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('invitation_sent', 'invitation_viewed', 'invitation_clicked', 'invitation_accepted', 'invitation_declined', 'invitation_expired', 'user_registered')),
  platform VARCHAR(50),
  user_agent TEXT,
  ip_hash TEXT,
  country VARCHAR(100),
  metadata JSONB,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

-- Mission Invitation Analytics Table
CREATE TABLE IF NOT EXISTS mission_invitation_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  inviter_role VARCHAR(50) NOT NULL,
  total_invitations INTEGER DEFAULT 0,
  pending_invitations INTEGER DEFAULT 0,
  accepted_invitations INTEGER DEFAULT 0,
  declined_invitations INTEGER DEFAULT 0,
  expired_invitations INTEGER DEFAULT 0,
  total_registrations INTEGER DEFAULT 0,
  veteran_registrations INTEGER DEFAULT 0,
  recruiter_registrations INTEGER DEFAULT 0,
  supporter_registrations INTEGER DEFAULT 0,
  last_invitation_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Mission Invitations Indexes
CREATE INDEX IF NOT EXISTS idx_mission_invitations_inviter_id ON mission_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_inviter_role ON mission_invitations(inviter_role);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_invitee_email ON mission_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_status ON mission_invitations(status);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_invitation_link ON mission_invitations(invitation_link);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_expires_at ON mission_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_created_at ON mission_invitations(created_at);

-- Mission Invitation Events Indexes
CREATE INDEX IF NOT EXISTS idx_mission_invitation_events_invitation_id ON mission_invitation_events(invitation_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_events_event_type ON mission_invitation_events(event_type);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_events_occurred_at ON mission_invitation_events(occurred_at);

-- Mission Invitation Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_mission_invitation_analytics_inviter_id ON mission_invitation_analytics(inviter_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_analytics_inviter_role ON mission_invitation_analytics(inviter_role);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Mission Invitations RLS
ALTER TABLE mission_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invitations" ON mission_invitations
  FOR SELECT USING (auth.uid() = inviter_id);

CREATE POLICY "Users can insert their own invitations" ON mission_invitations
  FOR INSERT WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update their own invitations" ON mission_invitations
  FOR UPDATE USING (auth.uid() = inviter_id);

CREATE POLICY "Public can view invitation by link" ON mission_invitations
  FOR SELECT USING (true);

-- Mission Invitation Events RLS
ALTER TABLE mission_invitation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events for their invitations" ON mission_invitation_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mission_invitations 
      WHERE id = mission_invitation_events.invitation_id 
      AND inviter_id = auth.uid()
    )
  );

CREATE POLICY "System can insert invitation events" ON mission_invitation_events
  FOR INSERT WITH CHECK (true);

-- Mission Invitation Analytics RLS
ALTER TABLE mission_invitation_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics" ON mission_invitation_analytics
  FOR SELECT USING (auth.uid() = inviter_id);

CREATE POLICY "System can insert analytics" ON mission_invitation_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update analytics" ON mission_invitation_analytics
  FOR UPDATE USING (true);

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- Mission Invitation Summary View
CREATE OR REPLACE VIEW mission_invitation_summary AS
SELECT 
  mi.inviter_id,
  u.name as inviter_name,
  u.avatar_url as inviter_avatar,
  mi.inviter_role,
  COUNT(*) as total_invitations,
  COUNT(*) FILTER (WHERE mi.status = 'pending') as pending_invitations,
  COUNT(*) FILTER (WHERE mi.status = 'accepted') as accepted_invitations,
  COUNT(*) FILTER (WHERE mi.status = 'declined') as declined_invitations,
  COUNT(*) FILTER (WHERE mi.status = 'expired') as expired_invitations,
  COUNT(*) FILTER (WHERE mi.accepted_user_id IS NOT NULL) as total_registrations,
  COUNT(*) FILTER (WHERE mi.accepted_user_id IS NOT NULL AND mi.invited_role = 'veteran') as veteran_registrations,
  COUNT(*) FILTER (WHERE mi.accepted_user_id IS NOT NULL AND mi.invited_role = 'recruiter') as recruiter_registrations,
  COUNT(*) FILTER (WHERE mi.accepted_user_id IS NOT NULL AND mi.invited_role = 'supporter') as supporter_registrations,
  MAX(mi.created_at) as last_invitation_at,
  MIN(mi.created_at) as first_invitation_at
FROM mission_invitations mi
JOIN users u ON mi.inviter_id = u.id
GROUP BY mi.inviter_id, u.name, u.avatar_url, mi.inviter_role;

-- Mission Invitation Performance View
CREATE OR REPLACE VIEW mission_invitation_performance AS
SELECT 
  inviter_role,
  COUNT(*) as total_invitations,
  COUNT(*) FILTER (WHERE status = 'accepted') as accepted_invitations,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'accepted')::DECIMAL / COUNT(*)) * 100, 2
  ) as acceptance_rate,
  COUNT(*) FILTER (WHERE accepted_user_id IS NOT NULL) as total_registrations,
  ROUND(
    (COUNT(*) FILTER (WHERE accepted_user_id IS NOT NULL)::DECIMAL / COUNT(*)) * 100, 2
  ) as registration_rate
FROM mission_invitations
GROUP BY inviter_role;

-- =====================================================
-- FUNCTIONS FOR AUTOMATION
-- =====================================================

-- Function to create mission invitation
CREATE OR REPLACE FUNCTION create_mission_invitation(
  p_inviter_id uuid,
  p_inviter_role text,
  p_invitee_email text,
  p_invitee_name text,
  p_invited_role text,
  p_invitation_message text,
  p_platform text
)
RETURNS uuid AS $$
DECLARE
  v_invitation_id uuid;
  v_invitation_link text;
BEGIN
  -- Generate unique invitation link
  v_invitation_link := 'https://xainik.com/join/' || gen_random_uuid()::text;
  
  -- Create invitation
  INSERT INTO mission_invitations (
    inviter_id, inviter_role, invitee_email, invitee_name, 
    invited_role, invitation_message, invitation_link, platform
  ) VALUES (
    p_inviter_id, p_inviter_role, p_invitee_email, p_invitee_name,
    p_invited_role, p_invitation_message, v_invitation_link, p_platform
  ) RETURNING id INTO v_invitation_id;
  
  -- Log invitation sent event
  INSERT INTO mission_invitation_events (
    invitation_id, event_type, platform
  ) VALUES (
    v_invitation_id, 'invitation_sent', p_platform
  );
  
  -- Update analytics
  INSERT INTO mission_invitation_analytics (
    inviter_id, inviter_role, total_invitations, pending_invitations, last_invitation_at
  ) VALUES (
    p_inviter_id, p_inviter_role, 1, 1, now()
  )
  ON CONFLICT (inviter_id) DO UPDATE SET
    total_invitations = mission_invitation_analytics.total_invitations + 1,
    pending_invitations = mission_invitation_analytics.pending_invitations + 1,
    last_invitation_at = now(),
    updated_at = now();
  
  RETURN v_invitation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to accept mission invitation
CREATE OR REPLACE FUNCTION accept_mission_invitation(
  p_invitation_id uuid,
  p_accepted_user_id uuid
)
RETURNS boolean AS $$
DECLARE
  v_invitation mission_invitations%ROWTYPE;
BEGIN
  -- Get invitation details
  SELECT * INTO v_invitation 
  FROM mission_invitations 
  WHERE id = p_invitation_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Update invitation status
  UPDATE mission_invitations SET
    status = 'accepted',
    accepted_at = now(),
    accepted_user_id = p_accepted_user_id,
    updated_at = now()
  WHERE id = p_invitation_id;
  
  -- Log acceptance event
  INSERT INTO mission_invitation_events (
    invitation_id, event_type
  ) VALUES (
    p_invitation_id, 'invitation_accepted'
  );
  
  -- Update analytics
  UPDATE mission_invitation_analytics SET
    pending_invitations = pending_invitations - 1,
    accepted_invitations = accepted_invitations + 1,
    total_registrations = total_registrations + 1,
    updated_at = now()
  WHERE inviter_id = v_invitation.inviter_id;
  
  -- Update role-specific registration counts
  IF v_invitation.invited_role = 'veteran' THEN
    UPDATE mission_invitation_analytics SET
      veteran_registrations = veteran_registrations + 1
    WHERE inviter_id = v_invitation.inviter_id;
  ELSIF v_invitation.invited_role = 'recruiter' THEN
    UPDATE mission_invitation_analytics SET
      recruiter_registrations = recruiter_registrations + 1
    WHERE inviter_id = v_invitation.inviter_id;
  ELSIF v_invitation.invited_role = 'supporter' THEN
    UPDATE mission_invitation_analytics SET
      supporter_registrations = supporter_registrations + 1
    WHERE inviter_id = v_invitation.inviter_id;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to track invitation event
CREATE OR REPLACE FUNCTION track_invitation_event(
  p_invitation_id uuid,
  p_event_type text,
  p_platform text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_ip_hash text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
  INSERT INTO mission_invitation_events (
    invitation_id, event_type, platform, user_agent, ip_hash, country, metadata
  ) VALUES (
    p_invitation_id, p_event_type, p_platform, p_user_agent, p_ip_hash, p_country, p_metadata
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS FOR AUTOMATION
-- =====================================================

-- Trigger to update analytics when invitation status changes
CREATE OR REPLACE FUNCTION update_invitation_analytics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    -- Update analytics based on status change
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
      UPDATE mission_invitation_analytics SET
        pending_invitations = pending_invitations - 1,
        accepted_invitations = accepted_invitations + 1,
        updated_at = now()
      WHERE inviter_id = NEW.inviter_id;
    ELSIF NEW.status = 'declined' AND OLD.status = 'pending' THEN
      UPDATE mission_invitation_analytics SET
        pending_invitations = pending_invitations - 1,
        declined_invitations = declined_invitations + 1,
        updated_at = now()
      WHERE inviter_id = NEW.inviter_id;
    ELSIF NEW.status = 'expired' AND OLD.status = 'pending' THEN
      UPDATE mission_invitation_analytics SET
        pending_invitations = pending_invitations - 1,
        expired_invitations = expired_invitations + 1,
        updated_at = now()
      WHERE inviter_id = NEW.inviter_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invitation_analytics
  AFTER UPDATE ON mission_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_invitation_analytics();

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample mission invitation analytics for existing users
INSERT INTO mission_invitation_analytics (inviter_id, inviter_role, total_invitations, pending_invitations, accepted_invitations, declined_invitations, expired_invitations, total_registrations, veteran_registrations, recruiter_registrations, supporter_registrations)
SELECT 
  id as inviter_id,
  role as inviter_role,
  0 as total_invitations,
  0 as pending_invitations,
  0 as accepted_invitations,
  0 as declined_invitations,
  0 as expired_invitations,
  0 as total_registrations,
  0 as veteran_registrations,
  0 as recruiter_registrations,
  0 as supporter_registrations
FROM users
WHERE role IN ('veteran', 'recruiter', 'supporter', 'admin')
ON CONFLICT (inviter_id) DO NOTHING;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE mission_invitations IS 'Mission invitations sent by users to join the platform';
COMMENT ON TABLE mission_invitation_events IS 'Events tracking invitation interactions and outcomes';
COMMENT ON TABLE mission_invitation_analytics IS 'Aggregated analytics for mission invitation performance';

COMMENT ON VIEW mission_invitation_summary IS 'Summary view of mission invitation performance by user';
COMMENT ON VIEW mission_invitation_performance IS 'Performance metrics by inviter role';

COMMENT ON FUNCTION create_mission_invitation IS 'Create a new mission invitation with tracking';
COMMENT ON FUNCTION accept_mission_invitation IS 'Accept a mission invitation and update analytics';
COMMENT ON FUNCTION track_invitation_event IS 'Track an invitation event for analytics';
COMMENT ON FUNCTION update_invitation_analytics IS 'Automatically update analytics when invitation status changes';
