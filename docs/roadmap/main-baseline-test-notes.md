# Baseline Test Notes for `main`

Date: 2026-04-08

## Scope

This note records the accepted post-7-step baseline on `main` and the intentionally deferred red or skipped test surfaces that are outside the active product checkpoint.

## Accepted checkpoint

- User-facing plan semantics are now `Step 1-7`, not `Day 1-7`.
- The current `main` smoke realignment is accepted.
- The remaining red suite is not being treated as one cleanup project.

## Explicit stale-flow smoke defers

The following `app-smoke` cases were intentionally converted to skipped stale-flow coverage because they no longer represent accepted supported `main` behavior:

- `shows the actionability prompt after a study diagnosis result is shown`
- `stores the exact diagnose query path in study progress after a study diagnosis`
- `shows the actionability prompt on plan page in study mode`

Reason:
- the diagnose and plan actionability prompts were removed from the accepted surface
- exact diagnose-path persistence is no longer treated as a supported smoke-level product contract

## Remaining deferred red

- `src/__tests__/content-display.test.ts`
  - classification: `pre-existing`, `deferred`
  - reason: content/template hygiene, not blocking the accepted supported `main` surface
