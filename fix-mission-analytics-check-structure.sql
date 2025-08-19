-- =====================================================
-- MISSION ANALYTICS FIX - CHECK STRUCTURE FIRST
-- Fixes 406 error for mission_invitation_summary
-- Checks actual table structure before creating view
-- =====================================================

-- 1. First, check what columns actually exist in mission_invitations table
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'mission_invitations' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Drop the existing mission_invitation_summary TABLE (not view)
DROP TABLE IF EXISTS public.mission_invitation_summary CASCADE;

-- 3. Ensure the mission_invitations table has the correct structure
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

-- 4. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_mission_invitations_inviter_id ON public.mission_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_status ON public.mission_invitations(status);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_accepted_user_id ON public.mission_invitations(accepted_user_id);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_created_at ON public.mission_invitations(created_at);
CREATE INDEX IF NOT EXISTS idx_mission_invitations_invited_role ON public.mission_invitations(invited_role);

-- 5. Enable RLS on mission_invitations table if not already enabled
ALTER TABLE public.mission_invitations ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies if they don't exist
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

-- 7. Grant permissions
DO $$ BEGIN 
  BEGIN 
    GRANT ALL ON public.mission_invitations TO authenticated;
  EXCEPTION WHEN OTHERS THEN NULL; 
  END; 
END $$;

-- 8. NOW create the mission_invitation_summary view (after ensuring all columns exist)
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

-- 9. Grant permissions on the view
DO $$ BEGIN 
  BEGIN 
    GRANT SELECT ON public.mission_invitation_summary TO authenticated;
  EXCEPTION WHEN OTHERS THEN NULL; 
  END; 
END $$;

-- 10. Add some sample data for testing (only if the table has the required columns)
DO $$ 
DECLARE
  has_invitee_email BOOLEAN;
  has_invitee_name BOOLEAN;
  has_invitation_message BOOLEAN;
  has_invitation_link BOOLEAN;
BEGIN
  -- Check if required columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mission_invitations' 
    AND column_name = 'invitee_email'
    AND table_schema = 'public'
  ) INTO has_invitee_email;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mission_invitations' 
    AND column_name = 'invitee_name'
    AND table_schema = 'public'
  ) INTO has_invitee_name;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mission_invitations' 
    AND column_name = 'invitation_message'
    AND table_schema = 'public'
  ) INTO has_invitation_message;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mission_invitations' 
    AND column_name = 'invitation_link'
    AND table_schema = 'public'
  ) INTO has_invitation_link;
  
  -- Only insert sample data if all required columns exist
  IF has_invitee_email AND has_invitee_name AND has_invitation_message AND has_invitation_link THEN
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
    
    RAISE NOTICE 'Added sample invitation data';
  ELSE
    RAISE NOTICE 'Skipping sample data insertion - missing required columns';
  END IF;
END $$;

-- 11. Test the view to make sure it works
SELECT 
  'Mission Analytics Fix Complete' as status,
  COUNT(*) as total_invitations_in_view
FROM public.mission_invitation_summary;
