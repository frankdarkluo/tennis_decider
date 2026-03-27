create extension if not exists pgcrypto;

create table if not exists video_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  success_count integer default 0 not null,
  failed_count integer default 0 not null,
  is_pro boolean default false not null,
  updated_at timestamptz default now() not null,
  unique(user_id)
);

create table if not exists video_diagnosis_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  user_description text,
  selected_stroke text,
  selected_scene text,
  observation jsonb not null,
  result jsonb not null,
  confidence numeric,
  created_at timestamptz default now() not null
);

create index if not exists video_usage_user_updated_at_idx on video_usage(user_id, updated_at desc);
create index if not exists video_diagnosis_history_user_created_at_idx on video_diagnosis_history(user_id, created_at desc);

alter table video_usage enable row level security;
alter table video_diagnosis_history enable row level security;

drop policy if exists "video_usage_select_own" on video_usage;
create policy "video_usage_select_own"
  on video_usage for select
  using (auth.uid() = user_id);

drop policy if exists "video_usage_insert_own" on video_usage;
create policy "video_usage_insert_own"
  on video_usage for insert
  with check (auth.uid() = user_id);

drop policy if exists "video_usage_update_own" on video_usage;
create policy "video_usage_update_own"
  on video_usage for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "video_diagnosis_history_select_own" on video_diagnosis_history;
create policy "video_diagnosis_history_select_own"
  on video_diagnosis_history for select
  using (auth.uid() = user_id);

drop policy if exists "video_diagnosis_history_insert_own" on video_diagnosis_history;
create policy "video_diagnosis_history_insert_own"
  on video_diagnosis_history for insert
  with check (auth.uid() = user_id);

drop policy if exists "video_diagnosis_history_admin_select" on video_diagnosis_history;
create policy "video_diagnosis_history_admin_select"
  on video_diagnosis_history for select
  using ((auth.jwt() ->> 'email') in ('your-email@example.com'));

drop policy if exists "video_usage_admin_select" on video_usage;
create policy "video_usage_admin_select"
  on video_usage for select
  using ((auth.jwt() ->> 'email') in ('your-email@example.com'));
