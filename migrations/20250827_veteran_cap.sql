-- Veteran count RPC (security definer, bypasses RLS safely)
create or replace function public.veteran_count()
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::int from public.profiles where role = 'veteran';
$$;

-- Enforce cap of 50 veterans on insert/update to 'veteran'
create or replace function public.enforce_veteran_cap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if new.role = 'veteran' then
    -- Allow if already veteran and just updating other fields
    if tg_op = 'UPDATE' and old.role = 'veteran' then
      return new;
    end if;
    select count(*) into v_count from public.profiles where role = 'veteran';
    if v_count >= 50 then
      raise exception 'Veteran registrations are closed (cap reached)';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_veteran_cap on public.profiles;
create trigger trg_profiles_veteran_cap
before insert or update of role on public.profiles
for each row execute function public.enforce_veteran_cap();

-- Allow calling the count RPC from clients
grant execute on function public.veteran_count() to anon, authenticated;
