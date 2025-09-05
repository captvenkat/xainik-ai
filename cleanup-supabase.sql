-- Cleanup and setup for Xainik Military Skills Meme Generator

-- Drop existing tables if they exist
DROP TABLE IF EXISTS memes CASCADE;

-- Create memes table for military skills meme generator
CREATE TABLE memes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL CHECK (mode IN ('humor', 'inspiration')),
  line TEXT NOT NULL,
  bg_key TEXT NOT NULL,
  image_url TEXT NOT NULL,
  creator_name TEXT NOT NULL DEFAULT 'Supporter of Military',
  parent_id UUID REFERENCES memes(id),
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  remix_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_memes_mode ON memes(mode);
CREATE INDEX idx_memes_created_at ON memes(created_at DESC);
CREATE INDEX idx_memes_likes ON memes(likes DESC);
CREATE INDEX idx_memes_shares ON memes(shares DESC);
CREATE INDEX idx_memes_remix_count ON memes(remix_count DESC);
CREATE INDEX idx_memes_parent_id ON memes(parent_id);

-- Create function to increment counters
CREATE OR REPLACE FUNCTION increment(row_id UUID, column_name TEXT)
RETURNS INTEGER AS $$
BEGIN
  EXECUTE format('UPDATE memes SET %I = %I + 1 WHERE id = $1 RETURNING %I', column_name, column_name, column_name)
  INTO row_id;
  RETURN row_id;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample military backgrounds (these would be uploaded to Supabase Storage)
-- The actual images should be uploaded to the 'backgrounds/military/' bucket
-- with dimensions 1080x1350 and footer+QR already included

-- Sample data for testing
INSERT INTO memes (mode, line, bg_key, image_url, creator_name) VALUES
('inspiration', 'THE MILITARY REPEATS UNTIL FLAWLESS.', 'military-01.webp', '/api/og?line=THE%20MILITARY%20REPEATS%20UNTIL%20FLAWLESS.&bg=military-01.webp', 'Supporter of Military'),
('humor', 'IF THE MILITARY RAN MEETINGS: 10 MINUTES, NO SLIDES.', 'military-02.webp', '/api/og?line=IF%20THE%20MILITARY%20RAN%20MEETINGS%3A%2010%20MINUTES%2C%20NO%20SLIDES.&bg=military-02.webp', 'Supporter of Military'),
('inspiration', 'THE MILITARY NEVER ACCEPTS MEDIOCRITY.', 'military-03.webp', '/api/og?line=THE%20MILITARY%20NEVER%20ACCEPTS%20MEDIOCRITY.&bg=military-03.webp', 'Supporter of Military');

-- Enable Row Level Security (RLS)
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON memes
  FOR SELECT USING (true);

-- Create policies for authenticated users to insert
CREATE POLICY "Allow authenticated users to insert" ON memes
  FOR INSERT WITH CHECK (true);

-- Create policies for authenticated users to update their own memes
CREATE POLICY "Allow users to update their own memes" ON memes
  FOR UPDATE USING (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON memes TO authenticated;
GRANT SELECT ON memes TO anon;
