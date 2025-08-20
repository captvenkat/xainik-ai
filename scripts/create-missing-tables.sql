-- =====================================================
-- CREATE MISSING TABLES
-- Xainik Platform - Add pitch_likes and pitch_shares
-- =====================================================

-- Create pitch_likes table
CREATE TABLE IF NOT EXISTS public.pitch_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    pitch_id UUID NOT NULL REFERENCES public.pitches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, pitch_id)
);

-- Create pitch_shares table
CREATE TABLE IF NOT EXISTS public.pitch_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    pitch_id UUID NOT NULL REFERENCES public.pitches(id) ON DELETE CASCADE,
    share_platform TEXT NOT NULL, -- 'twitter', 'linkedin', 'facebook', 'email', etc.
    share_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for pitch_likes
ALTER TABLE public.pitch_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all pitch likes" ON public.pitch_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like their own pitches" ON public.pitch_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" ON public.pitch_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for pitch_shares
ALTER TABLE public.pitch_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all pitch shares" ON public.pitch_shares
    FOR SELECT USING (true);

CREATE POLICY "Users can share pitches" ON public.pitch_shares
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pitch_likes_user_id ON public.pitch_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_likes_pitch_id ON public.pitch_likes(pitch_id);
CREATE INDEX IF NOT EXISTS idx_pitch_likes_created_at ON public.pitch_likes(created_at);

CREATE INDEX IF NOT EXISTS idx_pitch_shares_user_id ON public.pitch_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_shares_pitch_id ON public.pitch_shares(pitch_id);
CREATE INDEX IF NOT EXISTS idx_pitch_shares_created_at ON public.pitch_shares(created_at);
CREATE INDEX IF NOT EXISTS idx_pitch_shares_platform ON public.pitch_shares(share_platform);

-- Add sample data for testing
INSERT INTO public.pitch_likes (user_id, pitch_id) 
SELECT 
    u.id as user_id,
    p.id as pitch_id
FROM public.users u
CROSS JOIN public.pitches p
WHERE u.id = p.user_id
LIMIT 3
ON CONFLICT (user_id, pitch_id) DO NOTHING;

INSERT INTO public.pitch_shares (user_id, pitch_id, share_platform, share_url)
SELECT 
    u.id as user_id,
    p.id as pitch_id,
    CASE 
        WHEN random() < 0.3 THEN 'twitter'
        WHEN random() < 0.6 THEN 'linkedin'
        ELSE 'facebook'
    END as share_platform,
    'https://example.com/share/' || p.id as share_url
FROM public.users u
CROSS JOIN public.pitches p
WHERE u.id = p.user_id
LIMIT 5
ON CONFLICT DO NOTHING;

-- Verify tables were created
SELECT 
    'pitch_likes' as table_name,
    COUNT(*) as record_count
FROM public.pitch_likes
UNION ALL
SELECT 
    'pitch_shares' as table_name,
    COUNT(*) as record_count
FROM public.pitch_shares;
