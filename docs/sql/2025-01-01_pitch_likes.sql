-- pitch_likes table and like Pitch function (idempotent)
create table if not exists public.pitch_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  pitch_id uuid not null references public.pitches(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, pitch_id)
);

alter table public.pitch_likes enable row level security;

-- Policy: authenticated users can like
create policy if not exists pitch_likes_insert on public.pitch_likes
  for insert to authenticated
  with check (true);

create policy if not exists pitch_likes_select on public.pitch_likes
  for select using (true);

-- Ensure likes only on active pitches
create or replace function public.like_pitch(p_user_id uuid, p_pitch_id uuid)
returns table (liked boolean, likes_count integer)
language plpgsql
as $$
declare
  v_exists boolean;
begin
  -- ensure pitch is active
  if not exists (
    select 1 from public.pitches
    where id = p_pitch_id and is_active = true and plan_expires_at > now()
  ) then
    raise exception 'Pitch not active'
      using errcode = 'P0001';
  end if;

  -- insert like if missing
  insert into public.pitch_likes(user_id, pitch_id)
  values (p_user_id, p_pitch_id)
  on conflict do nothing;

  select exists(
    select 1 from public.pitch_likes where user_id = p_user_id and pitch_id = p_pitch_id
  ) into v_exists;

  -- recompute aggregate
  update public.pitches p
  set likes_count = sub.c
  from (
    select count(*)::int as c from public.pitch_likes where pitch_id = p_pitch_id
  ) sub
  where p.id = p_pitch_id;

  return query
  select v_exists as liked,
         (select count(*)::int from public.pitch_likes where pitch_id = p_pitch_id) as likes_count;
end;
$$;
