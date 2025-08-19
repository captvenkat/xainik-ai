-- =====================================================
-- MISSION ANALYTICS FIX - FINAL CORRECTED VERSION
-- Fixes 406 error for mission_invitation_summary
-- Checks and adds columns BEFORE creating view
-- =====================================================

-- 1. First, ensure the mission_invitations table has the correct structure
-- Add any missing columns BEFORE creating the view
DO $$ BEGIN
  -- Add invited_role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mission_invitations' 
    AND column_name = 'invited_role'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.mission_invitations ADD COLUMN invited_role VARCHAR(50);
    RAISE NOTICE 'Added invited_role column to mission_invitations table';
  END IF;
  
  -- Add accepted_user_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mission_invitations' 
    AND column_name = 'accepted_user_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.mission_invitations ADD COLUMN accepted_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added accepted_user_id column to mission_invitations table';
  END IF;
  
  -- Add accepted_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mission_invitations' 
    AND column_name = 'accepted_at'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.mission_invitations ADD COLUMN accepted_at timestamptz;
    RAISE NOTICE 'Added accepted_at column to mission_invitations table';
  END IF;
  
  -- Add declined_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mission_invitations' 
    AND column_name = 'declined_at'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.mission_invitations ADD COLUMN declined_at timestamptz;
    RAISE NOTICE 'Added declined_at column to mission_invitations table';
  END IF;
  
  -- Add expired_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mission_invitations' 
    AND column_name = 'expired_at'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.mission_invitations ADD COLUMN expired_at timestamptz;
    RAISE NOTICE 'Added expired_at column to mission_invitations table';
  END IF;
  
  -- Add platform column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mission_invitations' 
    AND column_name = 'platform'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.mission_invitations ADD COLUMN platform VARCHAR(50) DEFAULT 'web';
    RAISE NOTICE 'Added platform column to mission_invitations table';
  END IF;
END $$;

-- 2. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_mission_invitations_inviter_id ON public.mission_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_status ON public.mission_invitations(status);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_accepted_user_id ON public.mission_invitations(accepted_user_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_created_at ON public.mission_invitations(created_at);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_invited_role ON public.mission_invitations(invited_role);

-- 3. Enable RLS on mission_invitations table if not already enabled
ALTER TABLE public.mission_invitations ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies if they don't exist
DO $$ BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_invitations' AND policyname = 'Users can view their own invitations') THEN
    CREATE POLICY "Users can view their own invitations" ON public.mission_invitations FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = accepted_user_id);
  END IF;
END $$;

DO $$ BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_invitations' AND policyname = 'Users can create invitations') THEN
    CREATE POLICY "Users can create invitations" ON public.mission_invitations FOR INSERT WITH CHECK (auth.uid() = inviter_id);
  END IF;
END $$;

DO $$ BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_invitations' AND policyname = 'Users can update their own invitations') THEN
    CREATE POLICY "Users can update their own invitations" ON public.mission_invitations FOR UPDATE USING (auth.uid() = inviter_id OR auth.uid() = accepted_user_id);
  END IF;
END $$;

-- 5. Grant permissions
DO $$ BEGIN 
  BEGIN 
    GRANT ALL ON public.mission_invitations TO authenticated;
  EXCEPTION WHEN OTHERS THEN NULL; 
  END; 
END $$;

-- 6. NOW create the mission_invitation_summary view (after ensuring all columns exist)
CREATE OR REPLACE VIEW public.mission_invitation_summary AS
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
FROM public.mission_invitations mi
LEFT JOIN public.users u ON mi.inviter_id = u.id
GROUP BY mi.inviter_id, u.name, u.avatar_url, mi.inviter_role;

-- 7. Grant permissions on the view
DO $$ BEGIN 
  BEGIN 
    GRANT SELECT ON public.mission_invitation_summary TO authenticated;
  EXCEPTION WHEN OTHERS THEN NULL; 
  END; 
END $$;

-- 8. Add some sample data for testing (if users exist and no invitations exist)
INSERT INTO public.mission_invitations (
  inviter_id, 
  inviter_role, 
  invitee_email, 
  invitee_name, 
  invited_role, 
  invitation_message, 
  invitation_link, 
  status
)
SELECT 
  u.id,
  'veteran',
  'test@example.com',
  'Test User',
  'veteran',
  'Join our mission to support veterans!',
  'https://xainik.com/join/' || gen_random_uuid()::text,
  'pending'
FROM public.users u
WHERE u.id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.mission_invitations WHERE inviter_id = u.id)
LIMIT 1
ON CONFLICT DO NOTHING;

-- 9. Create mission_invitation_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.mission_invitation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid REFERENCES public.mission_invitations(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  platform text DEFAULT 'web',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- 10. Create indexes for events table
CREATE INDEX IF NOT EXISTS idx_mission_invitation_events_invitation_id ON public.mission_invitation_events(invitation_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_events_event_type ON public.mission_invitation_events(event_type);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_events_created_at ON public.mission_invitation_events(created_at);

-- 11. Enable RLS on events table
ALTER TABLE public.mission_invitation_events ENABLE ROW LEVEL SECURITY;

-- 12. Create RLS policies for events table
DO $$ BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_invitation_events' AND policyname = 'Users can view invitation events') THEN
    CREATE POLICY "Users can view invitation events" ON public.mission_invitation_events FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_invitation_events' AND policyname = 'Users can create invitation events') THEN
    CREATE POLICY "Users can create invitation events" ON public.mission_invitation_events FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 13. Grant permissions on events table
DO $$ BEGIN 
  BEGIN 
    GRANT ALL ON public.mission_invitation_events TO authenticated;
  EXCEPTION WHEN OTHERS THEN NULL; 
  END; 
END $$;

-- 14. Create mission_invitation_analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.mission_invitation_analytics (
  inviter_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  inviter_role text NOT NULL,
  total_invitations integer DEFAULT 0,
  pending_invitations integer DEFAULT 0,
  accepted_invitations integer DEFAULT 0,
  declined_invitations integer DEFAULT 0,
  expired_invitations integer DEFAULT 0,
  total_registrations integer DEFAULT 0,
  veteran_registrations integer DEFAULT 0,
  recruiter_registrations integer DEFAULT 0,
  supporter_registrations integer DEFAULT 0,
  last_invitation_at timestamptz,
  first_invitation_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 15. Create indexes for analytics table
CREATE INDEX IF NOT EXISTS idx_mission_invitation_analytics_inviter_id ON public.mission_invitation_analytics(inviter_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitation_analytics_inviter_role ON public.mission_invitation_analytics(inviter_role);

-- 16. Enable RLS on analytics table
ALTER TABLE public.mission_invitation_analytics ENABLE ROW LEVEL SECURITY;

-- 17. Create RLS policies for analytics table
DO $$ BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_invitation_analytics' AND policyname = 'Users can view their own analytics') THEN
    CREATE POLICY "Users can view their own analytics" ON public.mission_invitation_analytics FOR SELECT USING (auth.uid() = inviter_id);
  END IF;
END $$;

DO $$ BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_invitation_analytics' AND policyname = 'Users can update their own analytics') THEN
    CREATE POLICY "Users can update their own analytics" ON public.mission_invitation_analytics FOR UPDATE USING (auth.uid() = inviter_id);
  END IF;
END $$;

DO $$ BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_invitation_analytics' AND policyname = 'Users can insert their own analytics') THEN
    CREATE POLICY "Users can insert their own analytics" ON public.mission_invitation_analytics FOR INSERT WITH CHECK (auth.uid() = inviter_id);
  END IF;
END $$;

-- 18. Grant permissions on analytics table
DO $$ BEGIN 
  BEGIN 
    GRANT ALL ON public.mission_invitation_analytics TO authenticated;
  EXCEPTION WHEN OTHERS THEN NULL; 
  END; 
END $$;

-- 19. Initialize analytics for existing invitations
INSERT INTO public.mission_invitation_analytics (
  inviter_id, inviter_role, total_invitations, pending_invitations, 
  accepted_invitations, declined_invitations, expired_invitations,
  total_registrations, veteran_registrations, recruiter_registrations, 
  supporter_registrations, last_invitation_at, first_invitation_at
)
SELECT 
  mi.inviter_id,
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
FROM public.mission_invitations mi
GROUP BY mi.inviter_id, mi.inviter_role
ON CONFLICT (inviter_id) DO UPDATE SET
  total_invitations = EXCLUDED.total_invitations,
  pending_invitations = EXCLUDED.pending_invitations,
  accepted_invitations = EXCLUDED.accepted_invitations,
  declined_invitations = EXCLUDED.declined_invitations,
  expired_invitations = EXCLUDED.expired_invitations,
  total_registrations = EXCLUDED.total_registrations,
  veteran_registrations = EXCLUDED.veteran_registrations,
  recruiter_registrations = EXCLUDED.recruiter_registrations,
  supporter_registrations = EXCLUDED.supporter_registrations,
  last_invitation_at = EXCLUDED.last_invitation_at,
  first_invitation_at = EXCLUDED.first_invitation_at,
  updated_at = now();

-- 20. Test the view to make sure it works
SELECT 
  'Mission Analytics Fix Complete' as status,
  COUNT(*) as total_invitations_in_view
FROM public.mission_invitation_summary;
