-- 3.1 Core tables
create table public.donors (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  is_public boolean default true,
  created_at timestamptz default now()
);

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references public.donors(id) on delete set null,
  amount integer not null check (amount > 0),          -- in INR rupees
  currency text default 'INR',
  order_id text,                                       -- Razorpay order_id
  payment_id text,                                     -- Razorpay payment_id
  status text check (status in ('created','paid','failed','refunded')) default 'created',
  is_anonymous boolean default false,
  display_name text,                                   -- what to show on wall/feed
  created_at timestamptz default now()
);

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text check (source in ('stay_connected','post_donation')) default 'stay_connected',
  created_at timestamptz default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  blurb text,
  public_url text not null,
  sort_order int default 0
);

-- Optional: simple badge tiers by threshold
create table public.badge_tiers (
  id serial primary key,
  name text unique not null,        -- 'Friend', 'Champion', 'Founding Supporter'
  min_amount int not null           -- rupees
);

insert into public.badge_tiers (name, min_amount) values
('Friend', 1), ('Champion', 10000), ('Founding Supporter', 25000)
on conflict do nothing;

-- 3.2 views for live metrics (Kolkata day)
create view public.v_stats as
select
  (select coalesce(sum(amount),0) from donations where status='paid') as total_raised,
  (select coalesce(max(amount),0) from donations where status='paid') as highest_single,
  (select coalesce(sum(amount),0)
   from donations
   where status='paid'
     and (created_at at time zone 'Asia/Kolkata')::date = (now() at time zone 'Asia/Kolkata')::date
  ) as today_raised,
  (select count(*) from donations where status='paid') as total_count;

-- 3.3 simple public read, server-side write RLS
alter table donors enable row level security;
alter table donations enable row level security;
alter table subscribers enable row level security;
alter table documents enable row level security;
alter table badge_tiers enable row level security;

-- Public can read docs, tiers, aggregated view
create policy "read_docs" on documents for select using (true);
create policy "read_tiers" on badge_tiers for select using (true);

-- Public read metrics via view: grant select explicitly
grant select on public.v_stats to anon, authenticated;

-- Inserts go through server API with service key (no public insert policies)
revoke all on donors from anon, authenticated;
revoke all on donations from anon, authenticated;
revoke all on subscribers from anon, authenticated;

-- Allow read donation wall/feed without PII (only display_name, amount, created_at)
create view public.v_public_feed as
select display_name, amount, created_at
from donations
where status='paid' and coalesce(display_name,'') <> ''
order by created_at desc
limit 50;

grant select on public.v_public_feed to anon, authenticated;
