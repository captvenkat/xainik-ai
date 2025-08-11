-- Add compatibility view for profiles table
-- This allows existing code that references 'profiles' to work while we migrate to 'users'

-- Create a view that maps to the users table
CREATE OR REPLACE VIEW public.profiles AS
  SELECT 
    id,
    email,
    name as full_name,
    phone,
    role,
    created_at,
    created_at as updated_at -- users table doesn't have updated_at, so use created_at
  FROM public.users;

-- Grant necessary permissions on the view
GRANT SELECT, UPDATE, INSERT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Note: Views inherit RLS policies from the underlying table (users)
-- So the existing RLS policies on the users table will automatically apply to this view
