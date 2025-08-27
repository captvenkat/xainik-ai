-- Contact messages table (for overflow after veteran cap)
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  email text,
  name text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename='contact_messages' and policyname='contact_messages_insert_own'
  ) then
    create policy contact_messages_insert_own
    on public.contact_messages
    for insert
    with check (auth.uid() = owner_id or owner_id is null);
  end if;

  if not exists (
    select 1 from pg_policies where tablename='contact_messages' and policyname='contact_messages_select_own'
  ) then
    create policy contact_messages_select_own
    on public.contact_messages
    for select
    using (auth.uid() = owner_id);
  end if;
end $$;
