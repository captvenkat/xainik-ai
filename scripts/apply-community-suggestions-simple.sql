-- =====================================================
-- COMMUNITY SUGGESTIONS - MINIMALISTIC APPEND-ONLY SYSTEM
-- Adds to existing system without any disruption
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. SINGLE TABLE: COMMUNITY SUGGESTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS community_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    suggestion TEXT NOT NULL,
    category TEXT DEFAULT 'improvement' CHECK (category IN ('feature', 'improvement', 'bug')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'implemented', 'rejected')),
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. SIMPLE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_community_suggestions_user_id ON community_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_status ON community_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_community_suggestions_created ON community_suggestions(created_at);

-- =====================================================
-- 3. SIMPLE VIEW FOR ANALYTICS
-- =====================================================

CREATE OR REPLACE VIEW community_suggestions_summary AS
SELECT 
    COUNT(*) as total_suggestions,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_suggestions,
    COUNT(CASE WHEN status = 'implemented' THEN 1 END) as implemented_suggestions,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_suggestions,
    AVG(votes) as avg_votes,
    COUNT(DISTINCT user_id) as unique_suggesters
FROM community_suggestions;

-- =====================================================
-- 4. SIMPLE FUNCTION FOR VOTING
-- =====================================================

CREATE OR REPLACE FUNCTION vote_on_suggestion(
    p_suggestion_id UUID,
    p_vote_type TEXT DEFAULT 'upvote'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_vote_type = 'upvote' THEN
        UPDATE community_suggestions 
        SET votes = votes + 1, updated_at = NOW()
        WHERE id = p_suggestion_id;
    ELSIF p_vote_type = 'downvote' THEN
        UPDATE community_suggestions 
        SET votes = GREATEST(votes - 1, 0), updated_at = NOW()
        WHERE id = p_suggestion_id;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- =====================================================
-- 5. TRIGGER FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_community_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_community_suggestions_updated_at
    BEFORE UPDATE ON community_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_community_suggestions_updated_at();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE community_suggestions ENABLE ROW LEVEL SECURITY;

-- Users can view all suggestions
CREATE POLICY "Users can view all suggestions" ON community_suggestions
    FOR SELECT USING (true);

-- Users can create their own suggestions
CREATE POLICY "Users can create their own suggestions" ON community_suggestions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own suggestions
CREATE POLICY "Users can update their own suggestions" ON community_suggestions
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can manage all suggestions
CREATE POLICY "Admins can manage all suggestions" ON community_suggestions
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON community_suggestions TO authenticated;

-- Grant permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================

-- Verify the setup
SELECT 
    'Community Suggestions deployed successfully!' as status,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'community_suggestions';

SELECT 
    'Views created successfully!' as status,
    COUNT(*) as view_count
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'community_suggestions_summary';

SELECT 
    'Functions created successfully!' as status,
    COUNT(*) as function_count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('vote_on_suggestion', 'update_community_suggestions_updated_at');
