-- AI Database Wiring - Append-only migration
-- Extends Magic Mode with database persistence for all AI outputs

-- Stories table extensions (if not already present)
alter table if exists public.stories
  add column if not exists coverage_facets jsonb default '[]',
  add column if not exists style_seed jsonb,
  add column if not exists coverage_notes text;

-- Persist corpify bullets (private, optional UI)
create table if not exists public.corporate_bullets (
  id uuid primary key default gen_random_uuid(),
  pitch_id uuid not null references public.pitches(id) on delete cascade,
  text text not null,
  competency text not null,
  metrics_present boolean default false,
  used_military_term boolean default false,
  created_at timestamptz default now()
);

-- Track regen attempts (diversity + debugging)
create table if not exists public.ai_regen_logs (
  id uuid primary key default gen_random_uuid(),
  pitch_id uuid null references public.pitches(id) on delete set null,
  route text not null,             -- e.g., "auto-pitch" | "suggest-stories" | "expand-story" | "corpify-resume" | "modify-resume"
  regen_token text null,
  avoid_list jsonb default '[]',
  inputs_hash text null,
  outputs_hash text null,
  reason text null,                -- e.g., "similarity", "bad_span", "band_violation", "insufficient_source"
  created_at timestamptz default now()
);

-- Profiles extensions (if not already present)
alter table if exists public.profiles
  add column if not exists suggestions jsonb default '{}'::jsonb,
  add column if not exists full_name text,
  add column if not exists location text,
  add column if not exists phone text,
  add column if not exists linkedin_url text,
  add column if not exists alt_email text,
  add column if not exists pii_confirmed boolean default false,
  add column if not exists service_start_date date,
  add column if not exists service_end_date date,
  add column if not exists years_of_service int,
  add column if not exists is_veteran boolean,
  add column if not exists retirement_type text,
  add column if not exists discharge_reason text;

-- Resume facets drive uniqueness for stories
create table if not exists public.resume_facets (
  id uuid primary key default gen_random_uuid(),
  pitch_id uuid not null references public.pitches(id) on delete cascade,
  facet_key text not null,
  facet_label text not null,
  span_start int,
  span_end int,
  created_at timestamptz default now(),
  unique(pitch_id, facet_key)
);

-- Indexes for performance
create index if not exists idx_stories_pitch_status on public.stories(pitch_id, status);
create index if not exists idx_stories_published_at on public.stories(published_at);
create index if not exists idx_ai_regen_logs_pitch_route on public.ai_regen_logs(pitch_id, route);
create index if not exists idx_corporate_bullets_pitch on public.corporate_bullets(pitch_id);
create index if not exists idx_resume_facets_pitch on public.resume_facets(pitch_id);

-- RLS policies (mirror from pitches table)
-- TODO: Add RLS policies if they exist on pitches table
