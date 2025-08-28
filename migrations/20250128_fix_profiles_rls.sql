-- Fix RLS policies on profiles table to allow new users to create profiles
-- The current policy only allows read/write if profile exists, but new users need to create their first profile

-- Drop the restrictive policy
drop policy if exists "Profiles: owner read/write" on public.profiles;

-- Create a more permissive policy that allows profile creation
create policy "Profiles: owner read/write"
on public.profiles
using (auth.uid() = id)
with check (
  -- Allow insert if user is creating their own profile
  (auth.uid() = id) OR
  -- Allow insert if no profile exists yet (for new users)
  (not exists (
    select 1 from public.profiles where id = auth.uid()
  ))
);

-- Also ensure the trigger function can bypass RLS
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, status)
  values (new.id, new.email, 'pending')
  on conflict (id) do nothing;
  return new;
end $$;

-- Ensure the trigger is properly attached
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
