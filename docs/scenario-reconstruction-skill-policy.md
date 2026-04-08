# Scenario Reconstruction Skill Policy

## Why the universal follow-up template was insufficient

The original deep-diagnosis follow-up flow treated question selection as a generic missing-slot problem. That meant a slot like `context.movement` could become the next question even when the current tennis complaint was about serve, where "set vs moving" is not a valid diagnostic dimension.

The failure was not one bad serve rule. The failure was that tennis-skill legality lived too low in the stack, after the system had already decided which generic questions were eligible.

## What the new skill-category layer does

The refactor keeps the existing scenario reconstruction pipeline and adds one policy layer before selection:

1. infer a conservative tennis `SkillCategory`
2. load the single policy for that category
3. filter the shared question bank by allowed `QuestionFamily`
4. only then apply missing-slot checks, priority, and optional LLM ranking

This makes legality category-first instead of slot-first.

## Why Deep Mode now optimizes for completeness

Deep Mode is not a lightweight "good enough" pass. Its job is to ground the scene more fully before downstream analysis.

That means Deep Mode now keeps asking category-valid follow-ups until one of these is true:

- category-required information has been answered
- the player explicitly skipped it
- the player explicitly cannot answer it
- a hard follow-up cap is reached

The hard cap is an honest stop, not fake completion. If the system stops because it hit the cap, it should preserve that unresolved state instead of claiming the scene is fully reconstructed.

## Required vs optional grounding

Each skill category now defines:

- allowed question families
- Deep Mode required slots
- Deep Mode optional slots
- a hard follow-up cap

Required slots are what block Deep Mode handoff while they are still askable. Optional slots can still improve context, but they should not be treated as hidden blockers.

This keeps completeness category-specific. A serve complaint and a moving-groundstroke complaint should not require the same dimensions.

## Skip and cannot-answer provenance

Deep Mode now distinguishes:

- `unasked`
- `answered`
- `skipped`
- `cannot_answer`

`skipped` and `cannot_answer` are not interchangeable:

- `skipped` means the player chose not to answer
- `cannot_answer` means the information is unavailable to the player

Downstream analysis should preserve that difference instead of flattening both into generic "unknown."

## Safe fallback behavior

When technique inference is weak, the system does not guess. It switches to a deliberately small safe fallback policy and only allows broad context questions such as:

- practice vs match
- broad shot-family clarification
- broad outcome pattern
- pressure/rushed-vs-tight context

It does not reuse technique-specific generic questions like movement or incoming-ball depth in that fallback mode.

## How to extend it safely

When adding a new tennis technique or follow-up:

1. add or refine a `QuestionFamily`
2. add or refine a `SkillCategory`
3. update the single policy source of truth in `skillPolicy.ts`
4. add regression tests showing invalid families can never surface for that category

Do not add one-off exclusions directly inside selector ranking logic. If a question is invalid for a category, the policy layer should make it ineligible before ranking starts.
