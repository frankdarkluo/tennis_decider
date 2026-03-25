create extension if not exists pgcrypto;

create table if not exists assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  level text not null,
  scores jsonb not null,
  strengths text[] default '{}'::text[] not null,
  weaknesses text[] default '{}'::text[] not null,
  uncertain text[] default '{}'::text[] not null,
  summary text,
  created_at timestamptz default now() not null
);

create table if not exists diagnosis_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  input_text text not null,
  matched_rule_id text,
  problem_label text,
  created_at timestamptz default now() not null
);

create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  content_id text not null,
  created_at timestamptz default now() not null,
  unique(user_id, content_id)
);

create table if not exists saved_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  plan_data jsonb not null,
  source_type text,
  source_label text,
  created_at timestamptz default now() not null
);

create index if not exists assessment_results_user_id_created_at_idx on assessment_results(user_id, created_at desc);
create index if not exists diagnosis_history_user_id_created_at_idx on diagnosis_history(user_id, created_at desc);
create index if not exists bookmarks_user_id_created_at_idx on bookmarks(user_id, created_at desc);
create index if not exists saved_plans_user_id_created_at_idx on saved_plans(user_id, created_at desc);

alter table assessment_results enable row level security;
alter table diagnosis_history enable row level security;
alter table bookmarks enable row level security;
alter table saved_plans enable row level security;

drop policy if exists "assessment_results_select_own" on assessment_results;
create policy "assessment_results_select_own"
  on assessment_results for select
  using (auth.uid() = user_id);

drop policy if exists "assessment_results_insert_own" on assessment_results;
create policy "assessment_results_insert_own"
  on assessment_results for insert
  with check (auth.uid() = user_id);

drop policy if exists "diagnosis_history_select_own" on diagnosis_history;
create policy "diagnosis_history_select_own"
  on diagnosis_history for select
  using (auth.uid() = user_id);

drop policy if exists "diagnosis_history_insert_own" on diagnosis_history;
create policy "diagnosis_history_insert_own"
  on diagnosis_history for insert
  with check (auth.uid() = user_id);

drop policy if exists "bookmarks_select_own" on bookmarks;
create policy "bookmarks_select_own"
  on bookmarks for select
  using (auth.uid() = user_id);

drop policy if exists "bookmarks_insert_own" on bookmarks;
create policy "bookmarks_insert_own"
  on bookmarks for insert
  with check (auth.uid() = user_id);

drop policy if exists "bookmarks_delete_own" on bookmarks;
create policy "bookmarks_delete_own"
  on bookmarks for delete
  using (auth.uid() = user_id);

drop policy if exists "saved_plans_select_own" on saved_plans;
create policy "saved_plans_select_own"
  on saved_plans for select
  using (auth.uid() = user_id);

drop policy if exists "saved_plans_insert_own" on saved_plans;
create policy "saved_plans_insert_own"
  on saved_plans for insert
  with check (auth.uid() = user_id);
