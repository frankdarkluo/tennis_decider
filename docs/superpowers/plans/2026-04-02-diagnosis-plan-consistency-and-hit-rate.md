# 2026-04-02 Diagnosis→Plan Consistency and Hit-Rate Plan

**Goal:** Improve the consistency between diagnosis output and generated plans, while raising deterministic diagnosis hit rate for colloquial tennis phrasing.

**Why now:** Current docs already require a single `primaryNextStep` to carry from diagnosis into the plan. The codebase has that wiring in place, but the contract is still loose: diagnosis evidence lives in `src/lib/diagnosis.ts`, while plan generation still centers on template lookup and content seeding in `src/lib/plans.ts`.

## Current findings

1. `diagnoseProblem()` already produces stable `problemTag`, `primaryNextStep`, `evidenceLevel`, and narrowed fallback behavior.
2. `getPlanTemplate()` and `getPlanFromDiagnosis()` already accept `primaryNextStep`, but the strongest tests still focus more on template selection and content coverage than on end-to-end contract fidelity.
3. `diagnosis-matching.test.ts` is strong on parsing and rule ranking, but there is not yet a single regression layer that locks "same diagnosis in, same plan focus and Day 1 done criteria out."
4. Full parallel implementation is risky today because diagnosis ranking, modifier handling, and support-fallback logic still live mostly in one large file: `src/lib/diagnosis.ts`.

## Recommended execution shape

Use two implementation slices plus one short integration pass:

### Slice A
**Theme:** Diagnosis→plan contract hardening

**Goal:** Make the plan feel like a continuation of the diagnosis, not a separate template lookup.

**Primary changes**
- Lock one explicit contract from diagnosis to plan:
  - same `problemTag`
  - same `primaryNextStep`
  - Day 1 goal and success criteria reflect that same main action
- Tighten plan generation so diagnosis-origin plans prefer diagnosis intent over generic same-tag fallback copy.
- Ensure the diagnosis result page and plan page display the same main focus wording.

**Likely files**
- `src/lib/plans.ts`
- `src/components/diagnose/DiagnoseResult.tsx`
- `src/types/plan.ts`
- `src/__tests__/content-display.test.ts`
- `src/__tests__/app-smoke.test.tsx`

**Acceptance**
- A diagnosis with a clear `primaryNextStep` produces a plan whose Day 1 focus, goal, and success criteria stay on that same action.
- The diagnosis CTA and the plan page show one shared main target instead of drifting into template-generic wording.
- Existing plan fallback behavior still works for low-evidence or sparse-template tags.

### Slice B
**Theme:** Diagnosis hit-rate expansion

**Goal:** Improve deterministic matching for mixed complaints, colloquial phrases, and modifier-heavy inputs without making fallback copy look falsely precise.

**Primary changes**
- Expand the regression corpus with real user-style phrases that currently miss or land on weaker tags.
- Improve alias extraction, signal weighting, and rule priority for mixed-input complaints.
- Prefer slot-consistent technical tags over broader mental or generic fallbacks when evidence is present.

**Likely files**
- `src/lib/diagnosis.ts`
- `src/data/diagnosisRules.ts`
- `src/__tests__/diagnosis-matching.test.ts`

**Acceptance**
- Newly added real-phrase regressions pass in both zh and en where applicable.
- Mixed complaints still land on one deterministic winner.
- Low-evidence support-only inputs continue to narrow instead of pretending to diagnose precisely.

### Slice C
**Theme:** Integration audit

**Goal:** Reconcile the two slices and lock the contract in tests.

**Primary changes**
- Add end-to-end assertions that diagnosis winner, plan focus, and early-day success criteria stay aligned after hit-rate changes.
- Re-check that expanded hit-rate patterns do not accidentally weaken plan candidate relevance.

**Likely files**
- `src/__tests__/content-display.test.ts`
- `src/__tests__/app-smoke.test.tsx`
- `src/__tests__/diagnosis-matching.test.ts`

## Parallelization assessment

### Safe recommendation: hybrid parallel

Two subagents can help, but not by freely editing the same diagnosis core at the same time.

**Subagent 1 owns Slice A contract work**
- `src/lib/plans.ts`
- `src/types/plan.ts`
- `src/components/diagnose/DiagnoseResult.tsx`
- plan-facing tests

**Subagent 2 owns Slice B regression discovery first**
- `src/__tests__/diagnosis-matching.test.ts`
- `src/data/diagnosisRules.ts`
- diagnosis phrase inventory and expected winners

**Integration rule**
- If Subagent 2 needs to edit `src/lib/diagnosis.ts`, merge or rebase after Slice A lands, then do one final integration pass.

### Not recommended: full simultaneous implementation

It is not safe to let both subagents freely modify `src/lib/diagnosis.ts` and plan behavior in parallel right now. The diagnosis file still holds:
- signal extraction
- slot inference
- modifier handling
- fallback routing
- recommendation seeding

Those concerns overlap directly with the data that plans consume.

## Suggested order

1. Write the missing contract tests for diagnosis→plan consistency.
2. Implement Slice A until the diagnosis-to-plan path is visibly stable.
3. In parallel or immediately after, expand hit-rate regressions and rule coverage for Slice B.
4. Run one integration pass to confirm new diagnosis winners still produce coherent plans.

## Verification target

- `npm test -- src/__tests__/content-display.test.ts src/__tests__/diagnosis-matching.test.ts src/__tests__/app-smoke.test.tsx`
- `npm run build`

## Recommendation

Proceed with a hybrid split, not a fully independent two-agent build.

That gives us the speed benefit of parallel discovery and test growth, while keeping the high-risk shared diagnosis core from diverging.
