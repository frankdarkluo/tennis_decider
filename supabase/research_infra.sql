create extension if not exists pgcrypto;

create table if not exists event_logs (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id uuid references auth.users(id),
  timestamp timestamptz not null default now(),
  page text not null,
  event_type text not null,
  event_data jsonb default '{}'::jsonb not null,
  duration_ms integer,
  created_at timestamptz default now() not null
);

create table if not exists survey_responses (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  user_id uuid references auth.users(id),
  responses jsonb not null,
  sus_score numeric,
  created_at timestamptz default now() not null
);

create index if not exists idx_event_logs_session on event_logs(session_id);
create index if not exists idx_event_logs_user on event_logs(user_id);
create index if not exists idx_event_logs_type on event_logs(event_type);
create index if not exists idx_event_logs_time on event_logs(timestamp);
create index if not exists idx_survey_responses_created_at on survey_responses(created_at desc);

alter table event_logs enable row level security;
alter table survey_responses enable row level security;

drop policy if exists "event_logs_insert_authenticated" on event_logs;
create policy "event_logs_insert_authenticated"
  on event_logs for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "survey_responses_insert_anon" on survey_responses;
create policy "survey_responses_insert_anon"
  on survey_responses for insert
  to anon
  with check (true);

drop policy if exists "survey_responses_insert_authenticated" on survey_responses;
create policy "survey_responses_insert_authenticated"
  on survey_responses for insert
  to authenticated
  with check (user_id = auth.uid() or user_id is null);

-- Replace the placeholder email below with your real researcher/admin email
drop policy if exists "event_logs_admin_select" on event_logs;
create policy "event_logs_admin_select"
  on event_logs for select
  using ((auth.jwt() ->> 'email') in ('your-email.com'));

drop policy if exists "survey_responses_admin_select" on survey_responses;
create policy "survey_responses_admin_select"
  on survey_responses for select
  using ((auth.jwt() ->> 'email') in ('your-email.com'));

drop policy if exists "assessment_results_admin_select" on assessment_results;
create policy "assessment_results_admin_select"
  on assessment_results for select
  using ((auth.jwt() ->> 'email') in ('your-email.com'));

drop policy if exists "diagnosis_history_admin_select" on diagnosis_history;
create policy "diagnosis_history_admin_select"
  on diagnosis_history for select
  using ((auth.jwt() ->> 'email') in ('your-email.com'));
