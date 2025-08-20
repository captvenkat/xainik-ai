-- Create resume_requests table
CREATE TABLE IF NOT EXISTS resume_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  veteran_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'expired')),
  response_message TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resume_requests_pitch_id ON resume_requests(pitch_id);
CREATE INDEX IF NOT EXISTS idx_resume_requests_requester_id ON resume_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_resume_requests_veteran_id ON resume_requests(veteran_id);
CREATE INDEX IF NOT EXISTS idx_resume_requests_status ON resume_requests(status);
CREATE INDEX IF NOT EXISTS idx_resume_requests_created_at ON resume_requests(created_at);

-- Create RLS policies
ALTER TABLE resume_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view resume requests they sent or received
CREATE POLICY "Users can view their own resume requests" ON resume_requests
  FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = veteran_id
  );

-- Policy: Users can create resume requests
CREATE POLICY "Users can create resume requests" ON resume_requests
  FOR INSERT WITH CHECK (
    auth.uid() = requester_id
  );

-- Policy: Veterans can update resume requests they received
CREATE POLICY "Veterans can update resume requests" ON resume_requests
  FOR UPDATE USING (
    auth.uid() = veteran_id
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_resume_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_resume_requests_updated_at
  BEFORE UPDATE ON resume_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_resume_requests_updated_at();
