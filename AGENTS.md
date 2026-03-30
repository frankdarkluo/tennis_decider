# AGENTS.md

## Project
TennisLevel is being developed in a study-ready mode for SportsHCI-style user research.

## Source of truth
Read repository markdown docs before asking for repeated context.

Current high-priority docs:
- `TennisLevel_EVENT_TRACKING_PLAN_NO_VIDEO.md`
- `TennisLevel_ACTIONABILITY_AND_SORT_FREEZE_PLAN.md`

Also scan for newer or more specific markdown docs that may update or override older requirements, especially docs related to:
- study mode
- event tracking
- actionability
- sorting / rankings
- bilingual / i18n
- Codex workflow

If multiple docs overlap:
- prefer the newest and most specific
- preserve compatible requirements from older docs
- briefly surface real conflicts instead of asking for broad restatement

## Current study scope
Focus on:
- study mode
- event logging
- post-task actionability rating
- frozen `/library` ordering
- frozen `/rankings` ordering
- core bilingual support only when it affects the active task

Current explicit constraint:
- `/video-diagnose` is hidden and excluded from this study phase

Do not implement unrelated product-growth or productization features unless a repo doc explicitly requires them.

## Working style
- Plan first for non-trivial tasks
- Execute one scoped step or one PR at a time
- Do not start later phases early
- Verify before claiming completion
- Keep outputs concise
- Do not restate long repo docs unless necessary

## Preferred workflow
For non-trivial work:
1. read active docs
2. inspect relevant code
3. produce a phased or PR-sized plan
4. implement exactly one scoped unit
5. verify
6. report concise results

## Testing and verification
When appropriate:
- add or update tests with the change
- run the smallest relevant checks first
- verify behavior before claiming completion
- note remaining risks briefly

## Response format
For implementation updates, return only:
1. what changed
2. files touched
3. tests added or updated
4. verification performed
5. remaining risks or ambiguities
6. recommended next reasoning effort

## Checkpoint rule
At every checkpoint, before proposing the next step, recommend the next reasoning effort in exactly this format:

Recommended next effort: <low|medium|high|extra high>
Why: <one short sentence>

If the Codex surface uses `xhigh` instead of `extra high`, treat them as equivalent.

## Workflow guidance
If `Efficiency.md` exists in the repo, use it as additional workflow guidance.
If specialized Skills are available, use them only when they clearly match the current task.