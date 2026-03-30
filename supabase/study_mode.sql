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
  add column if not exists study_id text,
  add column if not exists participant_id text,
  add column if not exists study_mode boolean default false not null,
  add column if not exists language text,
  add column if not exists condition text,
  add column if not exists snapshot_id text,
  add column if not exists snapshot_seed text,
  add column if not exists build_version text;

alter table if exists study_sessions
  add column if not exists study_id text;

create table if not exists study_participants (
  id uuid primary key default gen_random_uuid(),
  study_id text not null,
  participant_id text not null,
  latest_session_id text not null,
  language text not null,
  condition text,
  latest_snapshot_id text not null,
  latest_build_version text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (study_id, participant_id)
);

alter table if exists study_artifacts
  add column if not exists study_id text;

create table if not exists study_sessions (
  id uuid primary key default gen_random_uuid(),
  study_id text,
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
  study_id text,
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

create table if not exists study_task_ratings (
  id bigint generated always as identity primary key,
  study_id text not null,
  participant_id text not null,
  session_id text not null,
  task_id text not null,
  metric_name text not null check (metric_name = 'actionability'),
  score integer not null check (score between 1 and 7),
  language text not null,
  submitted_at timestamptz not null default now()
);

create index if not exists idx_event_logs_participant on event_logs(participant_id);
create index if not exists idx_event_logs_snapshot on event_logs(snapshot_id);
create index if not exists idx_survey_responses_study_id on survey_responses(study_id);
create index if not exists idx_study_participants_study_id on study_participants(study_id);
create index if not exists idx_study_participants_participant on study_participants(participant_id);
create index if not exists idx_study_sessions_participant on study_sessions(participant_id);
create index if not exists idx_study_sessions_study_id on study_sessions(study_id);
create index if not exists idx_study_sessions_snapshot on study_sessions(snapshot_id);
create index if not exists idx_study_artifacts_session on study_artifacts(session_id);
create index if not exists idx_study_artifacts_participant on study_artifacts(participant_id);
create index if not exists idx_study_artifacts_study_id on study_artifacts(study_id);
create index if not exists idx_study_artifacts_type on study_artifacts(artifact_type);
create index if not exists idx_study_task_ratings_session on study_task_ratings(session_id);
create index if not exists idx_study_task_ratings_participant on study_task_ratings(participant_id);
create index if not exists idx_study_task_ratings_study_task on study_task_ratings(study_id, task_id);

alter table study_participants enable row level security;
alter table study_sessions enable row level security;
alter table study_artifacts enable row level security;
alter table study_task_ratings enable row level security;

drop policy if exists "event_logs_insert_study_anon" on event_logs;
create policy "event_logs_insert_study_anon"
  on event_logs for insert
  to anon
  with check (study_mode = true and participant_id is not null);

drop policy if exists "study_participants_insert_anon" on study_participants;
create policy "study_participants_insert_anon"
  on study_participants for insert
  to anon
  with check (participant_id is not null);

drop policy if exists "study_participants_update_anon" on study_participants;
create policy "study_participants_update_anon"
  on study_participants for update
  to anon
  using (participant_id is not null)
  with check (participant_id is not null);

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

drop policy if exists "study_task_ratings_insert_anon" on study_task_ratings;
create policy "study_task_ratings_insert_anon"
  on study_task_ratings for insert
  to anon
  with check (participant_id is not null);

-- Replace the placeholder email below with your real researcher/admin email
drop policy if exists "study_participants_admin_select" on study_participants;
create policy "study_participants_admin_select"
  on study_participants for select
  using ((auth.jwt() ->> 'email') in ('frankluo007@gmail.com'));

drop policy if exists "study_sessions_admin_select" on study_sessions;
create policy "study_sessions_admin_select"
  on study_sessions for select
  using ((auth.jwt() ->> 'email') in ('frankluo007@gmail.com'));

drop policy if exists "study_artifacts_admin_select" on study_artifacts;
create policy "study_artifacts_admin_select"
  on study_artifacts for select
  using ((auth.jwt() ->> 'email') in ('frankluo007@gmail.com'));

drop policy if exists "study_task_ratings_admin_select" on study_task_ratings;
create policy "study_task_ratings_admin_select"
  on study_task_ratings for select
  using ((auth.jwt() ->> 'email') in ('frankluo007@gmail.com'));
