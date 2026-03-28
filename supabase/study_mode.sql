create extension if not exists pgcrypto;

alter table if exists event_logs
  add column if not exists participant_id text,
  add column if not exists study_mode boolean default false not null,
  add column if not exists language text,
  add column if not exists condition text,
  add column if not exists snapshot_id text,
  add column if not exists snapshot_seed text,
  add column if not exists build_version text;

alter table if exists survey_responses
  add column if not exists participant_id text,
  add column if not exists study_mode boolean default false not null,
  add column if not exists language text,
  add column if not exists condition text,
  add column if not exists snapshot_id text,
  add column if not exists snapshot_seed text,
  add column if not exists build_version text;

create table if not exists study_sessions (
  id uuid primary key default gen_random_uuid(),
  participant_id text not null,
  session_id text not null unique,
  study_mode boolean default true not null,
  language text not null,
  condition text,
  snapshot_id text not null,
  snapshot_seed text not null,
  build_version text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  created_at timestamptz default now() not null
);

create table if not exists study_artifacts (
  id uuid primary key default gen_random_uuid(),
  participant_id text not null,
  session_id text not null,
  study_mode boolean default true not null,
  language text not null,
  condition text,
  snapshot_id text not null,
  snapshot_seed text not null,
  build_version text not null,
  artifact_type text not null,
  payload jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_event_logs_participant on event_logs(participant_id);
create index if not exists idx_event_logs_snapshot on event_logs(snapshot_id);
create index if not exists idx_study_sessions_participant on study_sessions(participant_id);
create index if not exists idx_study_sessions_snapshot on study_sessions(snapshot_id);
create index if not exists idx_study_artifacts_session on study_artifacts(session_id);
create index if not exists idx_study_artifacts_participant on study_artifacts(participant_id);
create index if not exists idx_study_artifacts_type on study_artifacts(artifact_type);

alter table study_sessions enable row level security;
alter table study_artifacts enable row level security;

drop policy if exists "event_logs_insert_study_anon" on event_logs;
create policy "event_logs_insert_study_anon"
  on event_logs for insert
  to anon
  with check (study_mode = true and participant_id is not null);

drop policy if exists "study_sessions_insert_anon" on study_sessions;
create policy "study_sessions_insert_anon"
  on study_sessions for insert
  to anon
  with check (study_mode = true and participant_id is not null);

drop policy if exists "study_sessions_update_anon" on study_sessions;
create policy "study_sessions_update_anon"
  on study_sessions for update
  to anon
  using (study_mode = true and participant_id is not null)
  with check (study_mode = true and participant_id is not null);

drop policy if exists "study_artifacts_insert_anon" on study_artifacts;
create policy "study_artifacts_insert_anon"
  on study_artifacts for insert
  to anon
  with check (study_mode = true and participant_id is not null);

-- Replace the placeholder email below with your real researcher/admin email
drop policy if exists "study_sessions_admin_select" on study_sessions;
create policy "study_sessions_admin_select"
  on study_sessions for select
  using ((auth.jwt() ->> 'email') in ('your-email@example.com'));

drop policy if exists "study_artifacts_admin_select" on study_artifacts;
create policy "study_artifacts_admin_select"
  on study_artifacts for select
  using ((auth.jwt() ->> 'email') in ('your-email@example.com'));

