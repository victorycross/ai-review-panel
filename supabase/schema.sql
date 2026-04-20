-- AI Review Panel — Supabase schema
-- Run this in your Supabase project SQL editor (one-time setup)

-- Assessments: one row per review session
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  system_name text not null,
  vendor text not null default '',
  intake_data jsonb not null,
  clarifying_qa jsonb not null default '[]'::jsonb,
  status text not null default 'complete'
    check (status in ('in_progress', 'complete', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reports: one row per completed assessment (1:1 with assessments)
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references public.assessments(id) on delete cascade not null unique,
  user_id uuid references auth.users(id) on delete cascade not null,
  report_data jsonb not null,
  overall_risk text not null
    check (overall_risk in ('Critical', 'High', 'Medium', 'Low', 'Informational')),
  created_at timestamptz not null default now()
);

-- Indexes
create index assessments_user_id_idx on public.assessments(user_id);
create index assessments_created_at_idx on public.assessments(created_at desc);
create index reports_assessment_id_idx on public.reports(assessment_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger assessments_updated_at
  before update on public.assessments
  for each row execute function update_updated_at();

-- Row Level Security
alter table public.assessments enable row level security;
alter table public.reports enable row level security;

-- All authenticated team members can read all assessments
create policy "team_read_assessments" on public.assessments
  for select using (auth.role() = 'authenticated');

-- Users can only insert their own assessments
create policy "users_insert_assessments" on public.assessments
  for insert with check (auth.uid() = user_id);

-- Users can only update their own assessments
create policy "users_update_assessments" on public.assessments
  for update using (auth.uid() = user_id);

-- All authenticated team members can read all reports
create policy "team_read_reports" on public.reports
  for select using (auth.role() = 'authenticated');

-- Users can only insert their own reports
create policy "users_insert_reports" on public.reports
  for insert with check (auth.uid() = user_id);
