---
aliases:
  - Study Remote Migration Checklist
tags:
  - type/research
  - area/study
  - status/checklist
---

# TennisLevel Study Remote Migration Checklist

## Related docs
- [[index]]
- [[research/study-mode]]
- [[research/study-snapshot-note]]
- [[weekly/project-progress-summary]]

This file is local-only and should not be committed.

## Goal

Bring the remote Supabase project up to the schema expected by study mode, then verify real writes with the existing validator.

## Confirmed Remote Status

As verified on 2026-03-29 by running:

```bash
npm run validate:study-remote
```

the remote project is still missing:

- tables:
  - `study_participants`
  - `study_sessions`
  - `study_task_ratings`
  - `study_artifacts`
- columns:
  - `event_logs.build_version`
  - `survey_responses.build_version`

The validator currently recommends:

1. run `supabase/research_infra.sql`
2. run `supabase/study_mode.sql`
3. rerun `npm run validate:study-remote`

## Before You Start

1. Choose the real researcher/admin email you want to use for export access.
2. Open the target Supabase project dashboard.
3. Go to `SQL Editor`.
4. Keep these local files open:
   - [research_infra.sql](/Users/gluo/Desktop/tennis_level/supabase/research_infra.sql)
   - [study_mode.sql](/Users/gluo/Desktop/tennis_level/supabase/study_mode.sql)
   - [p2_user_data.sql](/Users/gluo/Desktop/tennis_level/supabase/p2_user_data.sql)

## Important Dependency Check

`research_infra.sql` creates admin select policies on:

- `assessment_results`
- `diagnosis_history`

Those two tables are created by:

- [p2_user_data.sql](/Users/gluo/Desktop/tennis_level/supabase/p2_user_data.sql)

So before running `research_infra.sql`, check whether the remote project already has both tables.

If they do not exist, use one of these paths:

1. Recommended: run `supabase/p2_user_data.sql` first.
2. Temporary workaround: comment out the `assessment_results_admin_select` and `diagnosis_history_admin_select` blocks in `research_infra.sql`, then add them later after `p2_user_data.sql` has been applied.

## Step 1: Replace Placeholder Emails

In both files below, replace every `your-email@example.com` with the real researcher/admin email:

- [research_infra.sql](/Users/gluo/Desktop/tennis_level/supabase/research_infra.sql)
- [study_mode.sql](/Users/gluo/Desktop/tennis_level/supabase/study_mode.sql)

Search target:

```text
your-email@example.com
```

## Step 2: Run SQL In This Order

### 2.1 Optional but recommended when missing

Run first if `assessment_results` or `diagnosis_history` do not already exist:

- [p2_user_data.sql](/Users/gluo/Desktop/tennis_level/supabase/p2_user_data.sql)

### 2.2 Research base tables

Run:

- [research_infra.sql](/Users/gluo/Desktop/tennis_level/supabase/research_infra.sql)

This creates:

- `event_logs`
- `survey_responses`

### 2.3 Study mode schema

Run:

- [study_mode.sql](/Users/gluo/Desktop/tennis_level/supabase/study_mode.sql)

This adds or creates:

- columns on `event_logs`
- columns on `survey_responses`
- `study_participants`
- `study_sessions`
- `study_artifacts`
- `study_task_ratings`
- RLS policies for study inserts and admin selects

## Step 3: Quick SQL Sanity Checks

After the SQL runs, execute this in Supabase SQL Editor:

```sql
select
  to_regclass('public.event_logs') as event_logs,
  to_regclass('public.survey_responses') as survey_responses,
  to_regclass('public.study_participants') as study_participants,
  to_regclass('public.study_sessions') as study_sessions,
  to_regclass('public.study_artifacts') as study_artifacts,
  to_regclass('public.study_task_ratings') as study_task_ratings;
```

Then verify the added columns:

```sql
select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'event_logs' and column_name in ('participant_id', 'study_mode', 'language', 'condition', 'snapshot_id', 'snapshot_seed', 'build_version'))
    or
    (table_name = 'survey_responses' and column_name in ('study_id', 'participant_id', 'study_mode', 'language', 'condition', 'snapshot_id', 'snapshot_seed', 'build_version'))
  )
order by table_name, column_name;
```

## Step 4: Re-run Real Write Validation

Back in the repo, run:

```bash
npm run validate:study-remote
```

## Expected Success Shape

You want the validator output to look like this:

```json
{
  "diagnosis": {
    "ready": true,
    "missingTables": [],
    "missingColumns": [],
    "recommendedSqlFiles": []
  },
  "results": [
    { "name": "study_participants", "ok": true, "message": "ok" },
    { "name": "study_sessions", "ok": true, "message": "ok" },
    { "name": "event_logs", "ok": true, "message": "ok" },
    { "name": "study_task_ratings", "ok": true, "message": "ok" },
    { "name": "study_artifacts", "ok": true, "message": "ok" },
    { "name": "survey_responses", "ok": true, "message": "ok" }
  ]
}
```

## If Something Still Fails

- Missing `study_*` tables:
  - rerun [study_mode.sql](/Users/gluo/Desktop/tennis_level/supabase/study_mode.sql)
- Missing `event_logs.*` or `survey_responses.*` study columns:
  - rerun [research_infra.sql](/Users/gluo/Desktop/tennis_level/supabase/research_infra.sql) first, then [study_mode.sql](/Users/gluo/Desktop/tennis_level/supabase/study_mode.sql)
- Policy error mentioning `assessment_results` or `diagnosis_history`:
  - run [p2_user_data.sql](/Users/gluo/Desktop/tennis_level/supabase/p2_user_data.sql), then rerun the failed policy block
- Insert succeeds locally but export page cannot read:
  - check that the admin email placeholder was replaced correctly in both SQL files

## Study-Phase Scope Reminder

For the current study phase, `/video-diagnose` is hidden and excluded, so:

- `video_diagnosis.sql` is not required for unblocking `PR0`
- do not wait on video tables before rerunning `npm run validate:study-remote`
