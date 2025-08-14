-- Impact Analytics Migration
-- Creates views, tables, and RLS policies for Impact analytics feature

-- Create impact_calls table
CREATE TABLE IF NOT EXISTS impact_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  supporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  call_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_minutes INTEGER,
  outcome TEXT CHECK (outcome IN ('interested', 'not_interested', 'follow_up', 'no_answer', 'wrong_number')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create impact_outcomes table
CREATE TABLE IF NOT EXISTS impact_outcomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  supporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  outcome_type TEXT NOT NULL CHECK (outcome_type IN ('job_offer', 'interview', 'referral', 'networking', 'mentorship', 'other')),
  outcome_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  value_usd DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create impact_keywords table
CREATE TABLE IF NOT EXISTS impact_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  keyword_phrase TEXT NOT NULL,
  applied_to_headline BOOLEAN DEFAULT FALSE,
  applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create impact_nudges table
CREATE TABLE IF NOT EXISTS impact_nudges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  nudge_type TEXT NOT NULL CHECK (nudge_type IN ('share_pitch', 'invite_supporter', 'update_headline', 'add_photo', 'request_endorsement')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_url TEXT,
  priority INTEGER DEFAULT 1,
  actioned BOOLEAN DEFAULT FALSE,
  actioned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_impact_calls_pitch_id ON impact_calls(pitch_id);
CREATE INDEX IF NOT EXISTS idx_impact_calls_supporter_id ON impact_calls(supporter_id);
CREATE INDEX IF NOT EXISTS idx_impact_outcomes_pitch_id ON impact_outcomes(pitch_id);
CREATE INDEX IF NOT EXISTS idx_impact_outcomes_supporter_id ON impact_outcomes(supporter_id);
CREATE INDEX IF NOT EXISTS idx_impact_keywords_pitch_id ON impact_keywords(pitch_id);
CREATE INDEX IF NOT EXISTS idx_impact_nudges_pitch_id ON impact_nudges(pitch_id);
CREATE INDEX IF NOT EXISTS idx_impact_nudges_actioned ON impact_nudges(actioned);

-- Create impact_channel_stats view
CREATE OR REPLACE VIEW impact_channel_stats AS
SELECT 
  p.id as pitch_id,
  p.title as pitch_title,
  u.id as veteran_id,
  u.name as veteran_name,
  COUNT(DISTINCT r.id) as total_referrals,
  COUNT(DISTINCT re.id) as total_opens,
  COUNT(DISTINCT CASE WHEN re.event_type = 'LINK_OPENED' THEN re.id END) as unique_opens,
  COUNT(DISTINCT CASE WHEN re.event_type = 'SHARE_RESHARED' THEN re.id END) as total_shares,
  COUNT(DISTINCT CASE WHEN re.platform = 'whatsapp' THEN re.id END) as whatsapp_shares,
  COUNT(DISTINCT CASE WHEN re.platform = 'linkedin' THEN re.id END) as linkedin_shares,
  COUNT(DISTINCT CASE WHEN re.platform = 'email' THEN re.id END) as email_shares,
  COUNT(DISTINCT ic.id) as total_calls,
  COUNT(DISTINCT io.id) as total_outcomes,
  COALESCE(SUM(io.value_usd), 0) as total_value_usd
FROM pitches p
JOIN users u ON p.user_id = u.id
LEFT JOIN referrals r ON p.id = r.pitch_id
LEFT JOIN referral_events re ON r.id = re.referral_id
LEFT JOIN impact_calls ic ON p.id = ic.pitch_id
LEFT JOIN impact_outcomes io ON p.id = io.pitch_id
GROUP BY p.id, p.title, u.id, u.name;

-- Create impact_supporter_stats view
CREATE OR REPLACE VIEW impact_supporter_stats AS
SELECT 
  p.id as pitch_id,
  p.title as pitch_title,
  s.id as supporter_id,
  s.name as supporter_name,
  s.email as supporter_email,
  COUNT(DISTINCT r.id) as referrals_generated,
  COUNT(DISTINCT re.id) as total_opens,
  COUNT(DISTINCT ic.id) as calls_made,
  COUNT(DISTINCT io.id) as outcomes_achieved,
  COALESCE(SUM(io.value_usd), 0) as value_generated_usd,
  MAX(ic.call_date) as last_call_date,
  MAX(io.outcome_date) as last_outcome_date
FROM pitches p
JOIN users v ON p.user_id = v.id
LEFT JOIN referrals r ON p.id = r.pitch_id
LEFT JOIN users s ON r.user_id = s.id
LEFT JOIN referral_events re ON r.id = re.referral_id
LEFT JOIN impact_calls ic ON p.id = ic.pitch_id AND s.id = ic.supporter_id
LEFT JOIN impact_outcomes io ON p.id = io.pitch_id AND s.id = io.supporter_id
WHERE s.role = 'supporter'
GROUP BY p.id, p.title, s.id, s.name, s.email;

-- Create impact_funnel view
CREATE OR REPLACE VIEW impact_funnel AS
SELECT 
  p.id as pitch_id,
  p.title as pitch_title,
  COUNT(DISTINCT r.id) as total_referrals,
  COUNT(DISTINCT re.id) as total_opens,
  COUNT(DISTINCT CASE WHEN re.event_type = 'LINK_OPENED' THEN re.id END) as unique_opens,
  COUNT(DISTINCT ic.id) as total_calls,
  COUNT(DISTINCT CASE WHEN ic.outcome = 'interested' THEN ic.id END) as interested_calls,
  COUNT(DISTINCT CASE WHEN ic.outcome = 'follow_up' THEN ic.id END) as follow_up_calls,
  COUNT(DISTINCT io.id) as total_outcomes,
  COUNT(DISTINCT CASE WHEN io.outcome_type = 'job_offer' THEN io.id END) as job_offers,
  COUNT(DISTINCT CASE WHEN io.outcome_type = 'interview' THEN io.id END) as interviews,
  COUNT(DISTINCT CASE WHEN io.outcome_type = 'referral' THEN io.id END) as referrals,
  COALESCE(SUM(io.value_usd), 0) as total_value_usd
FROM pitches p
LEFT JOIN referrals r ON p.id = r.pitch_id
LEFT JOIN referral_events re ON r.id = re.referral_id
LEFT JOIN impact_calls ic ON p.id = ic.pitch_id
LEFT JOIN impact_outcomes io ON p.id = io.pitch_id
GROUP BY p.id, p.title;

-- Enable RLS on new tables
ALTER TABLE impact_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_nudges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for impact_calls
CREATE POLICY "Users can view impact_calls for their own pitches" ON impact_calls
  FOR SELECT USING (
    pitch_id IN (
      SELECT id FROM pitches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert impact_calls for their own pitches" ON impact_calls
  FOR INSERT WITH CHECK (
    pitch_id IN (
      SELECT id FROM pitches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update impact_calls for their own pitches" ON impact_calls
  FOR UPDATE USING (
    pitch_id IN (
      SELECT id FROM pitches WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for impact_outcomes
CREATE POLICY "Users can view impact_outcomes for their own pitches" ON impact_outcomes
  FOR SELECT USING (
    pitch_id IN (
      SELECT id FROM pitches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert impact_outcomes for their own pitches" ON impact_outcomes
  FOR INSERT WITH CHECK (
    pitch_id IN (
      SELECT id FROM pitches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update impact_outcomes for their own pitches" ON impact_outcomes
  FOR UPDATE USING (
    pitch_id IN (
      SELECT id FROM pitches WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for impact_keywords
CREATE POLICY "Users can view impact_keywords for their own pitches" ON impact_keywords
  FOR SELECT USING (
    pitch_id IN (
      SELECT id FROM pitches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert impact_keywords for their own pitches" ON impact_keywords
  FOR INSERT WITH CHECK (
    pitch_id IN (
      SELECT id FROM pitches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update impact_keywords for their own pitches" ON impact_keywords
  FOR UPDATE USING (
    pitch_id IN (
      SELECT id FROM pitches WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for impact_nudges
CREATE POLICY "Users can view impact_nudges for their own pitches" ON impact_nudges
  FOR SELECT USING (
    pitch_id IN (
      SELECT id FROM pitches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert impact_nudges for their own pitches" ON impact_nudges
  FOR INSERT WITH CHECK (
    pitch_id IN (
      SELECT id FROM pitches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update impact_nudges for their own pitches" ON impact_nudges
  FOR UPDATE USING (
    pitch_id IN (
      SELECT id FROM pitches WHERE user_id = auth.uid()
    )
  );

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_impact_calls_updated_at BEFORE UPDATE ON impact_calls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_impact_outcomes_updated_at BEFORE UPDATE ON impact_outcomes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_impact_keywords_updated_at BEFORE UPDATE ON impact_keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_impact_nudges_updated_at BEFORE UPDATE ON impact_nudges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
