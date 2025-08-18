-- Fix Indexes Only
-- This script fixes the indexes that still have old column names

BEGIN;

-- Step 1: Drop old indexes with veteran_id names
DROP INDEX IF EXISTS idx_pitches_veteran_id;
DROP INDEX IF EXISTS idx_endorsements_veteran_id;
DROP INDEX IF EXISTS idx_endorsements_endorser_id;

-- Step 2: Create new indexes with user_id names
CREATE INDEX IF NOT EXISTS idx_pitches_user_id ON public.pitches(user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_user_id ON public.endorsements(user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_endorser_user_id ON public.endorsements(endorser_user_id);

-- Step 3: Verify the indexes were created
-- This will show you the new indexes
SELECT 'NEW INDEXES CREATED' as status, 
       tablename, 
       indexname
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('pitches', 'endorsements')
  AND indexname LIKE '%user_id%'
ORDER BY tablename, indexname;

COMMIT;
