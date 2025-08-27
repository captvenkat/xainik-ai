-- Profiles table + trigger + RLS for routing
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text check (role in ('veteran','supporter','recruiter')),
  status text not null default 'pending' check (status in ('pending','approved','blocked')),
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, status)
  values (new.id, new.email, 'pending')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename='profiles' and policyname='Profiles: owner read/write'
  ) then
    create policy "Profiles: owner read/write"
    on public.profiles
    using (auth.uid() = id)
    with check (auth.uid() = id);
  end if;
end $$;
