---
aliases:
  - Boundaries
  - Agent Guardrails
tags:
  - type/policy
  - area/process
  - status/reference
---

# Boundaries — TennisLevel Local Agent Guardrails

## Related docs
- [[index]]
- [[product-principles]]
- [[definition-of-done]]
- [[roadmap/requirements]]
- [[roadmap/current]]

## Absolute no-go zones

Do not autonomously modify any of the following:

1. `supabase/migrations/`
2. auth-related logic
3. `.env*`
4. dependency lists in `package.json`
5. deployment or CI configuration
6. frozen ordering behavior for `/library`
7. frozen ordering behavior for `/rankings`
8. study-event semantics, participant export shape, or research logging meaning
9. the hidden `/video-diagnose` study constraint

If a task needs one of these, stop and ask for human approval with a concrete reason.

## Use caution and discuss first

These are allowed only after the slice plan is explicitly approved:

- route structure changes
- shared layout or shared navigation changes
- large file moves or renames
- changing public component APIs used across multiple pages
- changing diagnosis and plan generation in the same slice
- changing study flow and analytics in the same slice

## Safe autonomous areas

These are good fit tasks for GSD-2:

- one page or one small flow usability fixes
- mobile layout polish on a specific page
- plan template upgrades for a defined set of `problemTag`s
- deterministic copy cleanup
- localized UI key alignment
- data validation scripts
- targeted tests
- single-module bug fixes

## Diagnosis recommendation guardrail

- Diagnose recommendations must come from library-curated direct video sources only.
- Do not recommend platform search-result URLs as videos.
- If no suitable direct library video is available, return no recommendation items for that diagnosis.

## Role boundaries

### GSD-2
- Own one approved functional slice at a time
- Must plan first
- Must wait for approval before editing
- Should avoid broad batch refactors

### Codex
- Best for batch, repetitive, or multi-file rule-driven edits
- Best for refactors, naming alignment, type cleanup, and wide test synchronization

### Copilot
- Best for local editor help on small code sections
- Best for short functions, local fixes, and inline test completion

## Default decision rule

If a task feels like "change behavior across multiple subsystems", do not let GSD-2 run it end to end.
Split it first.
