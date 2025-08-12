-- Add shortlist table for recruiter shortlisted pitches
CREATE TABLE IF NOT EXISTS shortlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recruiter_user_id, pitch_id)
);

-- Add RLS policies
ALTER TABLE shortlist ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own shortlisted items
CREATE POLICY "Users can view own shortlisted items" ON shortlist
  FOR SELECT USING (auth.uid() = recruiter_user_id);

-- Policy: Users can only insert their own shortlisted items
CREATE POLICY "Users can insert own shortlisted items" ON shortlist
  FOR INSERT WITH CHECK (auth.uid() = recruiter_user_id);

-- Policy: Users can only update their own shortlisted items
CREATE POLICY "Users can update own shortlisted items" ON shortlist
  FOR UPDATE USING (auth.uid() = recruiter_user_id);

-- Policy: Users can only delete their own shortlisted items
CREATE POLICY "Users can delete own shortlisted items" ON shortlist
  FOR DELETE USING (auth.uid() = recruiter_user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_shortlist_recruiter_user_id ON shortlist(recruiter_user_id);
CREATE INDEX IF NOT EXISTS idx_shortlist_pitch_id ON shortlist(pitch_id);
CREATE INDEX IF NOT EXISTS idx_shortlist_created_at ON shortlist(created_at DESC);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_shortlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shortlist_updated_at
  BEFORE UPDATE ON shortlist
  FOR EACH ROW
  EXECUTE FUNCTION update_shortlist_updated_at();
