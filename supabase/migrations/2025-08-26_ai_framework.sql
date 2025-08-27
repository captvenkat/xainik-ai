-- AI Framework Database Migration
-- Append-only changes for Magic Mode AI enhancements

-- Facets to drive story uniqueness
create table if not exists public.resume_facets (
  id uuid primary key default gen_random_uuid(),
  pitch_id uuid not null references public.pitches(id) on delete cascade,
  facet_key text not null,
  facet_label text not null,
  span_start int,
  span_end int,
  created_at timestamptz default now(),
  unique (pitch_id, facet_key)
);

-- Stories coverage and style for uniqueness and variety
alter table if exists public.stories
  add column if not exists coverage_facets jsonb default '[]',
  add column if not exists style_seed jsonb,
  add column if not exists coverage_notes text;

-- Profile: service tenure + contact suggestions
alter table if exists public.profiles
  add column if not exists service_start_date date,
  add column if not exists service_end_date date,
  add column if not exists years_of_service int,
  add column if not exists is_veteran boolean,
  add column if not exists retirement_type text,
  add column if not exists discharge_reason text,
  add column if not exists full_name text,
  add column if not exists location text,
  add column if not exists phone text,
  add column if not exists linkedin_url text,
  add column if not exists alt_email text,            -- optional, separate from auth email
  add column if not exists pii_confirmed boolean default false,
  add column if not exists suggestions jsonb default '{}'::jsonb;

-- Indexes for performance
create index if not exists idx_resume_facets_pitch_id on public.resume_facets(pitch_id);
create index if not exists idx_stories_coverage_facets on public.stories using gin(coverage_facets);
create index if not exists idx_profiles_suggestions on public.profiles using gin(suggestions);

-- RLS policies for resume_facets (mirror stories)
alter table if exists public.resume_facets enable row level security;

-- Owner can manage their own facets
create policy if not exists "Users can manage their own resume facets"
  on public.resume_facets
  for all
  using (
    pitch_id in (
      select id from public.pitches where user_id = auth.uid()
    )
  );

-- Public can read facets for published stories
create policy if not exists "Public can read resume facets for published content"
  on public.resume_facets
  for select
  using (
    pitch_id in (
      select p.id from public.pitches p
      join public.stories s on s.pitch_id = p.id
      where s.status = 'published'
    )
  );
