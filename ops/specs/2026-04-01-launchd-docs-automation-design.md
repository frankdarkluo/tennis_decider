# Launchd Docs Automation Design

**Date:** 2026-04-01

## Goal

Automate daily and weekly project-document summarization on the local Mac using `launchd`, while keeping the canonical prompt docs in `docs/prompts/` and ensuring scheduled runs only modify files under `docs/`.

## Scope

This design covers:

- automatic daily progress generation at `23:30` in `America/Edmonton`
- automatic weekly review generation at `23:00` every Sunday in `America/Edmonton`
- use of the existing Codex CLI installed locally
- strict write scope limited to `docs/`
- no automatic commits or pushes

This design does not cover:

- GitHub Actions or remote scheduling
- database or web service scheduling
- automatic commit, branch, or PR workflows
- adding any new canonical workflow docs under `docs/` beyond the existing prompt/template files

## Constraints

- Canonical prompt instructions remain in:
  - `docs/prompts/DAILY_PROGRESS_PROMPT.md`
  - `docs/prompts/WEEKLY_REVIEW_PROMPT.md`
  - `docs/prompts/ORGANIZE.md`
- Scheduled automation must not modify files outside `docs/`.
- The implementation itself should avoid adding extra low-value files under `docs/`.
- Timezone behavior must follow `America/Edmonton`, not the machine default when different.

## Architecture

Use a three-layer structure:

1. `launchd` as the scheduler
2. repo-local wrapper shell scripts as the execution layer
3. existing prompt docs in `docs/prompts/` as the instruction source

`launchd` should never contain large embedded prompts. It should only invoke stable wrapper scripts. The wrapper scripts should compose a runtime instruction that tells Codex to read the canonical prompt doc and update only the expected files in `docs/`.

## Files

### Repo files to add

- `scripts/run-daily-progress.sh`
- `scripts/run-weekly-review.sh`
- `scripts/install-docs-automation.sh`
- `ops/launchd/com.tennislevel.daily-progress.plist`
- `ops/launchd/com.tennislevel.weekly-review.plist`

### Files intentionally not added

- no new docs files under `docs/`
- no new prompt copies under machine-local Codex folders
- no new tracking database or automation state inside the repo

### External machine-local files created by install

- `~/Library/LaunchAgents/com.tennislevel.daily-progress.plist`
- `~/Library/LaunchAgents/com.tennislevel.weekly-review.plist`
- local log directory outside the repo, defaulting to `~/.codex/automation-logs/tennis_level/`
- the install script should allow overriding the log directory via `CODEX_LOG_DIR`

## Execution model

### Daily job

Schedule:
- every day at `23:30`
- timezone forced to `America/Edmonton`

Behavior:
- run in repo root
- invoke `codex exec`
- provide Codex with concrete progress inputs for the reporting window, primarily:
  - recent git commit log covering the current day in `America/Edmonton`
  - current working tree status and changed file list
  - the existing daily note for the same date if it already exists
  - any lightweight build or validation output the wrapper chooses to capture without broadening scope
- instruct Codex to:
  - read `docs/prompts/DAILY_PROGRESS_PROMPT.md`
  - create or update only `docs/progress/YYYY-MM-DD.md`
  - apply `docs/prompts/ORGANIZE.md` only if explicit organization criteria are met and the resulting edits remain limited to `docs/`
  - avoid modifying non-`docs/` files

### Weekly job

Schedule:
- every Sunday at `23:00`
- timezone forced to `America/Edmonton`

Behavior:
- run in repo root
- invoke `codex exec`
- provide Codex with concrete progress inputs for the reporting window, primarily:
  - recent git commit log covering the current week in `America/Edmonton`
  - current working tree status and changed file list
  - the current week’s daily notes from `docs/progress/`
  - any lightweight build or validation output the wrapper chooses to capture without broadening scope
- instruct Codex to:
  - read `docs/prompts/WEEKLY_REVIEW_PROMPT.md`
  - create or update only `docs/weekly/YYYY-Www.md`
  - read the current week’s progress notes from `docs/progress/`
  - apply `docs/prompts/ORGANIZE.md` only if explicit organization criteria are met and the resulting edits remain limited to `docs/`
  - avoid modifying non-`docs/` files

## Guardrails

- Use `codex exec --cd /Users/gluo/Desktop/tennis_level`.
- Pass a runtime instruction that explicitly forbids non-`docs/` edits.
- Keep all scheduler logs outside the repo.
- Default logs to `~/.codex/automation-logs/tennis_level/`, with `CODEX_LOG_DIR` as the override hook.
- Do not run `git commit`, `git push`, or branch commands.
- Do not move canonical prompt docs out of `docs/prompts/`.
- Do not invoke `docs/prompts/ORGANIZE.md` speculatively. It should run only when Codex detects criteria defined by that prompt, such as broken internal wiki links, stale references to deleted notes, dangling skill or prompt references, or orphaned operational notes with no backlinks.

## Prompting strategy

The wrapper scripts should not duplicate the full prompt text. They should issue a short runtime instruction such as:

- read the canonical prompt doc
- follow it as the task spec
- use the wrapper-provided git and note context as the source material for the summary
- operate only inside `docs/`
- update the single target daily or weekly file
- invoke `docs/prompts/ORGANIZE.md` only when explicit criteria are met
- if organization work is allowed, keep it within `docs/`

This keeps one source of truth for prompt logic and avoids drift.

## Error handling

- If Codex exits non-zero, `launchd` should not retry aggressively.
- The next scheduled run should proceed normally.
- stdout and stderr should be captured to local machine logs for inspection.
- Manual rerun should be possible by executing the wrapper scripts directly.

## Verification plan

1. Dry-run daily wrapper manually.
2. Confirm only `docs/` files change.
3. Dry-run weekly wrapper manually.
4. Confirm only `docs/` files change.
5. Install LaunchAgents into `~/Library/LaunchAgents/`.
6. Load them with `launchctl`.
7. Trigger them once manually with `launchctl kickstart`.
8. Confirm expected output files are created or updated.
9. Inspect local logs.
10. Run `npm run build` after setup to confirm repo remains healthy.

## Non-obvious decisions

### Why not put prompt copies in a machine-local folder

That would split the source of truth. The repo’s canonical workflow prompts belong in `docs/prompts/` because they are part of project knowledge and your Obsidian graph.

### Why not store automation state in the repo

The jobs are schedule-driven and file-output-driven. Extra state files would add clutter and failure modes without clear benefit for this use case.

### Why not let jobs commit automatically

You explicitly want scheduled jobs to only update files in `docs/`. Auto-commits would expand scope and create history churn without review.

## Acceptance criteria

- Daily summary runs automatically at `23:30` Edmonton time.
- Weekly summary runs automatically at `23:00` Sunday Edmonton time.
- Prompt source of truth remains under `docs/prompts/`.
- Scheduled runs only modify files under `docs/`.
- No extra low-value files are introduced under `docs/`.
- Manual installation and rerun are straightforward.
