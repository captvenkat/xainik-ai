-- =====================================================
-- FIX RELATIONSHIPS AND REFRESH SCHEMA CACHE
-- This creates proper foreign key relationships between tables
-- =====================================================

-- 1. ADD FOREIGN KEY RELATIONSHIPS

-- Endorsements table - link to pitches and users
ALTER TABLE public.endorsements 
ADD CONSTRAINT fk_endorsements_pitch_id 
FOREIGN KEY (pitch_id) REFERENCES public.pitches(id) ON DELETE CASCADE;

-- Note: We can't add user_id foreign key yet since we don't know the exact users table structure
-- But this will fix the immediate relationship issue

-- Likes table - link to pitches
ALTER TABLE public.likes 
ADD CONSTRAINT fk_likes_pitch_id 
FOREIGN KEY (pitch_id) REFERENCES public.pitches(id) ON DELETE CASCADE;

-- Shares table - link to pitches
ALTER TABLE public.shares 
ADD CONSTRAINT fk_shares_pitch_id 
FOREIGN KEY (pitch_id) REFERENCES public.pitches(id) ON DELETE CASCADE;

-- 2. REFRESH SUPABASE SCHEMA CACHE
-- This tells Supabase to recognize the new relationships
NOTIFY pgrst, 'reload schema';

-- 3. VERIFY RELATIONSHIPS
SELECT 
    'RELATIONSHIPS' as check_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN ('endorsements', 'likes', 'shares')
ORDER BY tc.table_name, kcu.column_name;

-- 4. SUCCESS MESSAGE
SELECT 'Relationships created successfully! Schema cache refreshed.' as status;
