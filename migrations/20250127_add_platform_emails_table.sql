-- Create platform_emails table
CREATE TABLE IF NOT EXISTS platform_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'read', 'replied', 'archived')),
  read_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_platform_emails_pitch_id ON platform_emails(pitch_id);
CREATE INDEX IF NOT EXISTS idx_platform_emails_sender_id ON platform_emails(sender_id);
CREATE INDEX IF NOT EXISTS idx_platform_emails_recipient_id ON platform_emails(recipient_id);
CREATE INDEX IF NOT EXISTS idx_platform_emails_status ON platform_emails(status);
CREATE INDEX IF NOT EXISTS idx_platform_emails_created_at ON platform_emails(created_at);

-- Create RLS policies
ALTER TABLE platform_emails ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view emails they sent or received
CREATE POLICY "Users can view their own emails" ON platform_emails
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

-- Policy: Users can create emails
CREATE POLICY "Users can create emails" ON platform_emails
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

-- Policy: Recipients can update email status (mark as read, etc.)
CREATE POLICY "Recipients can update emails" ON platform_emails
  FOR UPDATE USING (
    auth.uid() = recipient_id
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_platform_emails_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_platform_emails_updated_at
  BEFORE UPDATE ON platform_emails
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_emails_updated_at();
