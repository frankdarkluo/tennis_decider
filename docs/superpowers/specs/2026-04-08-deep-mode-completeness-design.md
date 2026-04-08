# Deep Mode Completeness Design

## Goal

Revise deep diagnosis / scene reconstruction so that Deep Mode behaves like a thorough, tennis-logic-aware grounding flow. In Deep Mode, the system should keep asking valid category-specific follow-up questions until category-required information is resolved, explicitly skipped, explicitly marked as unavailable, or a hard safety cap is reached.

## Problem Statement

The current Deep Mode already has a category-first legality layer, but its completion model still optimizes for minimum sufficiency.

Today:

- category legality is enforced before question selection
- missing slots are still computed through a lightweight required/optional model
- `isDone()` still answers "is this minimally analyzable?"
- the UI exposes "ready for downstream analysis" as soon as that minimal rule passes

That means Deep Mode can hand off while category-relevant fields remain unresolved. The result is a flow that asks better questions than before, but still stops too early to justify the "Deep Mode" label.

## Design Principles

1. Deep Mode optimizes for grounding completeness, not early handoff.
   Minimum sufficiency is appropriate for a lightweight flow, not for Deep Mode.

2. Tennis legality still comes first.
   Asking more questions must not reintroduce invalid cross-technique dimensions.

3. Completion must be category-specific and conservative.
   A serve flow, a moving-groundstroke flow, and a contextual pressure flow do not need the same amount or type of grounding.

4. Unresolved required information must stay visible.
   Reaching a safety cap or receiving user skips does not mean the scene is fully complete.

5. Unknown source states must be explicit.
   The system must distinguish not asked, skipped, and cannot answer so downstream analysis can interpret uncertainty honestly.

## Current Failure Points in Repo Terms

The early-handoff behavior is spread across these files:

- `src/lib/scenarioReconstruction/skillPolicy.ts`
  `requiredSlots`, `optionalSlots`, `maxFollowups`, and `isDone()` still encode minimal sufficiency.
- `src/lib/scenarioReconstruction/runtime.ts`
  `getMissingSlots()` returns required missing first, then optional missing, and `isScenarioMinimallyAnalyzable()` delegates to the lightweight completion rule.
- `src/lib/scenarioReconstruction/selector.ts`
  eligible questions are legal by category, but still shaped by the lightweight missing-slot model and follow-up cap.
- `src/lib/scenarioReconstruction/answer.ts`
  answer state only mutates slot values; it does not preserve whether a field was skipped or genuinely unavailable.
- `src/components/diagnose/scenario/ScenarioQuestionCard.tsx`
  `done` immediately turns into a proceed CTA.
- `src/components/diagnose/scenario/ScenarioSummaryCard.tsx`
  the summary shows a flat missing-slot list and cannot explain required vs optional unresolved fields.
- `src/lib/scenarioReconstruction/bilingual.ts`
  completion copy still says the scene is sufficient for downstream analysis even when Deep Mode has only reached a lightweight threshold.

## Target Architecture

Keep the existing pipeline and extend it with a deeper completion model:

1. parse text into `ScenarioState`
2. infer a conservative `SkillCategory`
3. load the category policy
4. derive Deep Mode progress state from:
   - allowed question families
   - required Deep Mode slots
   - optional Deep Mode slots
   - slot resolution states
   - hard safety cap
5. select the next legal question, prioritizing unresolved required fields first
6. expose proceed CTA only when Deep Mode is genuinely ready to hand off

The main change is that Deep Mode completion is no longer "minimum analyzable." It becomes "category-required grounding has been resolved as far as honestly possible."

## Data Model Changes

### 1. Slot Resolution State

Deep Mode needs explicit resolution state per askable slot. At minimum:

- `unasked`
- `answered`
- `skipped`
- `cannot_answer`

This state should live alongside `ScenarioState` in a way that survives each follow-up turn.

The distinction matters:

- `cannot_answer` means the information is not available to the player
- `skipped` means the player chose not to answer even though the question was available

These two cases should remain distinct all the way to downstream analysis.

### 2. Deep Progress Shape

Introduce a Deep Mode progress result that is richer than a flat `done: boolean`.

Suggested shape:

```ts
type DeepModeProgress = {
  deepReady: boolean;
  stoppedByCap: boolean;
  requiredRemaining: MissingSlotPath[];
  optionalRemaining: MissingSlotPath[];
  unresolvedRequiredBecauseOfSkip: MissingSlotPath[];
  unresolvedRequiredBecauseUnavailable: MissingSlotPath[];
};
```

`deepReady` must only become `true` when category-required fields are resolved through answered, skipped, or cannot-answer states in a way the policy accepts.

`stoppedByCap` must never silently upgrade the scene to complete. A capped handoff is an honest handoff with unresolved required fields, not a fake completion.

### 3. Policy Shape

Extend the current category policy to support Deep Mode directly.

Suggested additions:

- `deepRequiredSlots`
- `deepOptionalSlots`
- `maxDeepFollowups`
- `isDeepReady(...)`
- `canStopAfterCap(...)`

`allowedQuestionFamilies` remains the single source of truth for legality.

## Category-Specific Deep Completeness Rules

These rules should remain conservative. Deep Mode should ask more than the lightweight flow, but only where the dimension is genuinely diagnostic for the current category.

### Serve

Deep Mode should aim to ground:

- `context.session_type`
- `outcome.primary_error`
- `context.serve_variant`
- one pressure / rushed-tight signal that helps distinguish context

Reserved serve families like toss, contact, side, and spin/control stay part of the extensible model, but they should only become Deep Mode required in a later pass when the question bank and answer model support them cleanly.

### Return

Deep Mode should aim to ground:

- `context.session_type`
- `outcome.primary_error`
- one pressure / rushed-tight signal

Do not ask serve-only or volley-only mechanics.

### Groundstroke Set / On Move

Deep Mode should aim to ground:

- `context.session_type`
- `context.movement`
- `outcome.primary_error`
- one pressure / rushed-tight signal

`incoming_ball.depth` is a category-specific but conservative required candidate:

- require it only when the current groundstroke category and question family make it genuinely diagnostic
- do not force it as a universal groundstroke requirement in every case

This keeps the system from drifting into a new generic ladder.

### Volley

Deep Mode should aim to ground:

- `context.session_type`
- `outcome.primary_error`
- one pressure / rushed-tight signal

Later volley-specific families can extend this safely, but must remain category-legal.

### Overhead

Deep Mode should aim to ground:

- `context.session_type`
- `outcome.primary_error`
- one pressure / rushed-tight signal

Do not allow serve-variant questioning here.

### Slice

Deep Mode should aim to ground:

- `context.session_type`
- `outcome.primary_error`
- one pressure / rushed-tight signal

### Contextual Match Situation

Deep Mode should aim to ground:

- `context.session_type`
- a pressure-context signal
- either a broad shot family or a concrete stroke signal
- a broad outcome signal when available

### Generic Safe Fallback

Fallback remains deliberately small:

- `context.session_type`
- `broad_shot_family_clarification`
- `outcome.primary_error`
- pressure / rushed-tight context

No technique-specific families become legal here.

## Completion Rules

Deep Mode completion should follow these rules:

1. If unresolved Deep Mode required slots remain and none have been resolved through answer/skip/cannot-answer, continue asking.
2. If unresolved required slots remain but the player explicitly skips or cannot answer them, those fields remain visible as unresolved provenance, but they no longer block eventual handoff.
3. If the hard cap is reached, stop asking and hand off honestly with `deepReady = false` and `stoppedByCap = true`.
4. The proceed CTA must never appear as if the scene is fully reconstructed when `deepReady = false`.

This yields three distinct stop conditions:

- `deepReady = true`
- `deepReady = false` because user skips / cannot answer have resolved the askability boundary
- `deepReady = false` because hard cap forced an honest stop

## Selector Rules

Question selection should proceed in this order:

1. infer skill category
2. load category policy
3. filter by `allowedQuestionFamilies`
4. remove already-asked families/questions as needed
5. prioritize unresolved required Deep Mode slots
6. then prioritize unresolved optional slots
7. then apply ranking inside that legal pool only

The LLM or tie-breaker logic must never resurrect an illegal or already-disqualified question.

## UI Behavior

Deep Mode UI should change in four ways:

1. Completion messaging
   Replace "ready for downstream analysis" copy with copy that reflects one of:
   - fully grounded for Deep Mode
   - still gathering required information
   - stopped with unresolved required fields

2. Proceed CTA visibility
   Hide or disable the proceed CTA while required Deep Mode fields remain unresolved and askable.

3. Summary transparency
   Show required vs optional unresolved items separately when useful, or at least visually distinguish them.

4. Skip / cannot answer actions
   The active question UI should let the user explicitly say:
   - skip
   - cannot answer / not sure

These actions should be concise and bilingual, not verbose.

## Bilingual Copy Requirements

Chinese and English copy should stay aligned but natural.

Key updates needed:

- Deep completion state copy
- stop-because-capped copy
- skip / cannot-answer labels
- any new question wording introduced for broader completeness

Avoid literal translations that sound robotic in Chinese.

## Test Strategy

Add or update tests for four layers.

### 1. Policy and runtime

- category-specific Deep Mode required slots are computed correctly
- `deepReady` stays false while required fields remain unresolved
- cap stops do not flip `deepReady` to true
- skipped and cannot-answer states remain distinct

### 2. Selector legality and priority

- invalid cross-technique questions still never appear
- required Deep Mode fields are prioritized before optional ones
- safe fallback remains small and technique-safe

### 3. Route / orchestration

- serve flows continue asking valid serve questions until required Deep Mode information is resolved, skipped, unavailable, or capped
- groundstroke flows continue asking valid groundstroke questions under the same rule
- route responses do not expose a proceed-ready state while required askable fields remain unresolved

### 4. UI

- proceed CTA is hidden or disabled while required fields remain unresolved
- UI copy does not claim full readiness too early
- changing complaint text still resets the active flow correctly
- skip / cannot-answer actions update progress honestly

## Acceptance Criteria

1. Deep Mode does not claim the scene is ready for downstream analysis while category-required fields remain unresolved and not explicitly skipped or marked unavailable.
2. Serve Deep Mode no longer stops after only one weak disambiguator when other category-required grounding fields are still open.
3. All supported skill categories follow category-specific completeness rules.
4. Invalid cross-technique questions still never appear.
5. Hard-cap stops are honest stops, not fake completion.
6. Downstream analysis can distinguish answered, skipped, and unavailable information.

## Non-Goals

- reverting to a generic universal question ladder
- rebuilding the entire deep-diagnosis pipeline
- broad product redesign outside Deep Mode completeness
- operationalizing every reserved tennis family in one pass

## Implementation Notes

Keep the current runtime framework and policy-first legality model. This change should be the smallest complete architecture revision that makes Deep Mode genuinely deeper without sacrificing tennis-specific validity.
