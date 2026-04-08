# Deep Diagnosis Skill-Policy Design

## Goal

Refactor deep-diagnosis follow-up question selection so that the scene-reconstruction flow obeys tennis-specific skill logic instead of a universal generic slot ladder. The system must never surface a follow-up question family that is invalid for the current tennis skill category.

## Problem Statement

The current deep-diagnosis follow-up flow has the right high-level pipeline but the wrong abstraction boundary.

Today:

- `ScenarioState` already carries `stroke`
- runtime computes one shared list of missing slots
- selector treats any missing slot as potentially askable
- the LLM only ranks within that already-eligible set

This means the system can know that the complaint is about serve, but still ask a question like "when set vs when moving" because `context.movement` is still missing in the generic slot model. The issue is not a missing serve special case. The issue is that question legality is derived from missing slots instead of tennis technique validity.

## Design Principles

1. Preserve the current deep-flow pipeline.
   Keep the existing parse -> infer -> select -> answer -> handoff flow and the existing `ScenarioState` shape where possible.

2. Add one explicit tennis-logic policy layer before selection.
   The policy layer becomes the single source of truth for what question families are legal for each skill category.

3. Be conservative under uncertainty.
   If the system cannot infer a reliable skill category, it must fall back to a deliberately tiny safe subset rather than guess a technique-specific path.

4. Prefer schema/data-driven behavior over scattered conditionals.
   The goal is an extensible constraint system, not a growing set of exclusions.

5. Keep user-facing follow-up concise but more logically correct.
   This change improves trust and information quality, not UI density through more questioning.

## Current Abstraction Failure in Repo Terms

The problem currently sits in these layers:

- `src/lib/scenarioReconstruction/runtime.ts`
  `getMissingSlots()` computes a universal slot ladder.
- `src/lib/scenarioReconstruction/schema.ts`
  `scenarioCriticalSlotOrder` encodes a shared global priority order.
- `src/lib/scenarioReconstruction/selector.ts`
  `getEligibleQuestions()` only checks whether a target slot is missing.
- `src/data/scenarioReconstruction/questionBank.ts`
  Questions are stored as a generic bank without tennis-skill legality constraints.

Because of this, `stroke` is informative but not authoritative. The selector can still surface follow-ups that are incompatible with the actual tennis technique.

## Target Architecture

Keep the existing runtime and introduce a new skill-policy layer between parsed scenario state and question selection.

High-level flow:

1. Parse scenario text into `ScenarioState`
2. Infer a tennis `SkillCategory` from scenario evidence
3. Load the `SkillCategoryPolicy` for that category
4. Filter the shared question bank by allowed `QuestionFamily`
5. Within the legal set only, apply missing-slot checks, priority ordering, and optional LLM ranking
6. Finalize progress and hand off downstream when the policy says enough evidence is present

The important change is step 4. Illegal question families never enter the eligible pool.

## Data Model

### 1. SkillCategory

Introduce an explicit skill-category type for follow-up policy:

- `serve`
- `return`
- `groundstroke_set`
- `groundstroke_on_move`
- `volley`
- `overhead`
- `slice`
- `contextual_match_situation`
- `generic_safe_fallback`

`generic_safe_fallback` is a deliberately constrained policy mode. It is not a generic diagnosis category.

### 2. QuestionFamily

Each follow-up question must belong to a stable tennis-specific family. Families should stay semantically narrow.

Initial family set for this refactor should cover current behavior and the near-term extension path:

- `session_context`
- `pressure_context`
- `broad_shot_family_clarification`
- `movement_context`
- `outcome_pattern`
- `incoming_ball_depth`
- `serve_variant`
- `serve_toss`
- `serve_contact`
- `serve_side`
- `serve_spin_control`
- `return_positioning`
- `return_first_ball_goal`
- `groundstroke_side`
- `groundstroke_contact_height`
- `volley_side`
- `volley_height`
- `volley_racket_face`
- `overhead_contact`
- `slice_response_pattern`

### V1 implementation scope

This implementation pass should only fully operationalize the families needed to fix the current class of errors and validate the new policy boundary:

- `session_context`
- `pressure_context`
- `broad_shot_family_clarification`
- `movement_context`
- `outcome_pattern`
- `incoming_ball_depth`
- `serve_variant`

V1 should also explicitly wire the corresponding categories needed for the current acceptance criteria:

- `serve`
- `return` only if already cleanly inferable from current parsing signals
- `groundstroke_set`
- `groundstroke_on_move`
- `volley` only if already cleanly inferable from current parsing signals
- `contextual_match_situation`
- `generic_safe_fallback`

The following families and categories are reserved in the model for future extension, but should not be overbuilt in this pass unless they are needed by an already-written regression test:

- families:
  `serve_toss`, `serve_contact`, `serve_side`, `serve_spin_control`, `return_positioning`, `return_first_ball_goal`, `groundstroke_side`, `groundstroke_contact_height`, `volley_side`, `volley_height`, `volley_racket_face`, `overhead_contact`, `slice_response_pattern`
- categories:
  `overhead`, `slice`, and any technique-specific subtype that current parsing cannot yet infer reliably

The rule for implementation scope is: build the smallest complete policy system that prevents invalid follow-up families from surfacing in current deep-diagnosis flows, while keeping the data model extensible for those future families.

### 3. ScenarioQuestion shape

Keep one shared question bank, but each question must explicitly declare:

- `family`
- `fillsSlots`

`fillsSlots` must stay narrow and deterministic per question. A question should map to a small set of concrete slots, not broad conceptual meaning.

### 4. SkillCategoryPolicy

Define one policy object per skill category. This policy is the single source of truth for follow-up legality.

Each policy should contain:

- `allowedQuestionFamilies`
- `requiredSlots`
- `optionalSlots`
- `doneWhen`
- `fallbackPriority`

`allowedQuestionFamilies` is the primary constraint.

`doneWhen` must be explicit and conservative, because it decides when scene reconstruction is sufficiently grounded to stop asking and hand off downstream.

Avoid redundant policy fields unless they are needed for compatibility or debugging. The design should not depend on a second parallel "blocked family" system if the allowed-family model is sufficient.

## Category Inference Rules

Introduce a dedicated inference module that returns:

- `category`
- `confidence`
- `reasons`

Suggested type:

```ts
type SkillCategoryInference = {
  category: SkillCategory;
  confidence: "high" | "medium" | "low";
  reasons: string[];
};
```

Inference should use evidence in this order:

1. grounded `ScenarioState.stroke`
2. grounded scenario context fields
3. raw user text cues
4. optional diagnosis context if already available at the orchestrator boundary
5. fallback to `generic_safe_fallback`

### Rule intent by category

- `serve`
  Requires clear serve-family evidence such as `stroke === "serve"` or raw text mentioning serve-family phrases.
- `return`
  Requires explicit return-family evidence.
- `volley`
  Requires explicit volley or net-first volley evidence.
- `overhead`
  Requires explicit overhead/smash evidence.
- `slice`
  Requires explicit slice-family evidence.
- `groundstroke_on_move`
  Requires forehand/backhand evidence plus grounded moving evidence.
- `groundstroke_set`
  Requires forehand/backhand evidence plus grounded set/stationary evidence.
- `contextual_match_situation`
  Use when the complaint is mainly pressure, match execution, or scoreboard context rather than a clearly grounded stroke mechanic.
- `generic_safe_fallback`
  Use when technique-specific inference is too weak to safely constrain follow-ups.

### Conflict resolution rules

Inference must resolve conflicting signals conservatively.

1. Explicit stroke-family evidence beats generic contextual evidence.
   If raw text or grounded scenario state clearly indicates serve, return, forehand, or backhand, do not let generic match/pressure context override it into a non-technique category.

2. Grounded scenario state beats weak free-text hints.
   If `ScenarioState.stroke` is already confidently grounded, weak textual cues like "着急" or "关键分" should only affect pressure-related context, not replace the technique category.

3. Movement only specializes a grounded groundstroke family.
   Movement cues may split `groundstroke_set` vs `groundstroke_on_move` only when a groundstroke-family signal is already strong enough. Movement mentions alone must not create a technique-specific category.

4. Pressure context can refine but not redefine technique.
   If the complaint clearly says serve under pressure, keep `serve`; do not collapse it to `contextual_match_situation`.

5. If technique evidence conflicts without a clear winner, fall back.
   Example: raw text weakly implies serve, scenario fields remain generic, and diagnosis context mainly signals pressure. In this case the system should choose `generic_safe_fallback` or `contextual_match_situation` only if technique evidence remains below the threshold for a technique-specific category.

6. Ambiguous broad-shot phrasing should prefer `generic_safe_fallback` plus clarification.
   If the complaint is too vague to distinguish serve vs groundstroke vs volley safely, use the fallback policy and, if enabled in v1, allow only `broad_shot_family_clarification` before any technique-specific family becomes available.

## Confidence and Uncertainty Handling

Confidence should be strict and simple:

- `high`
  Technique family is explicit and technique-specific questioning is safe.
- `medium`
  Technique family is reasonably clear, but some sub-mode detail is inferred instead of explicit.
- `low`
  The system does not have enough evidence for a technique-specific category.

Policy rule:

- `high` or `medium` -> use the inferred category policy
- `low` -> force `generic_safe_fallback`

This is the guardrail that prevents the system from guessing a category just to keep asking questions.

## Safe Fallback Subset

`generic_safe_fallback` must be intentionally tiny.

Allowed families:

- `session_context`
- `pressure_context`
- `outcome_pattern`

Optional future candidate only if phrased safely and generically:

- `broad_shot_family_clarification`
  phrased as a safe broad classification question such as "which broad shot family is this closer to?"

Disallowed in fallback:

- `movement_context`
- `incoming_ball_depth`
- any serve-only family
- any volley-only family
- any overhead-only family
- any slice-only family
- any other technique-specific family

Fallback exists to preserve trust, not to maximize the number of questions asked.

## Selector Contract

Refactor selector behavior so that legality is enforced before ranking:

1. infer category
2. load category policy
3. filter question bank to allowed families only
4. among legal questions, filter by `fillsSlots` against missing/needed slots
5. apply existing priority order or policy-aware priority
6. optionally allow LLM ranking only within the already-legal set

The selector must never be able to surface a disallowed family even if:

- the corresponding slot is missing
- the LLM ranks it first
- a legacy slot-priority rule would previously have preferred it

## Completion Logic

`doneWhen` should move from an implicit generic notion of "core scene + one disambiguator" to an explicit per-policy conservative rule.

Examples:

- `serve`
  May be done once serve-family complaint, outcome, and one valid serve disambiguator are grounded, without requiring movement or incoming-ball properties.
- `groundstroke_on_move`
  May require movement-grounded evidence because movement is valid for that category.
- `generic_safe_fallback`
  May stop earlier with lower evidence rather than force an invalid technique-specific follow-up.

The system should prefer an early honest handoff over an invalid extra question.

### V1 operational stop rules

V1 should translate `doneWhen` into small, testable rules per active category:

- `serve`
  Done when:
  - serve-family category is grounded
  - `outcome_pattern` is grounded
  - at least one valid serve/context disambiguator is grounded
    (`session_context`, `pressure_context`, or `serve_variant`)
  Not required:
  - `movement_context`
  - `incoming_ball_depth`

- `groundstroke_set`
  Done when:
  - groundstroke-set category is grounded
  - `outcome_pattern` is grounded
  - `session_context` is grounded
  Optional:
  - `pressure_context`
  - `incoming_ball_depth`
  Not required:
  - further technique-specific questions once the scene is already coherent

- `groundstroke_on_move`
  Done when:
  - groundstroke-on-move category is grounded
  - `movement_context` is grounded
  - `outcome_pattern` is grounded
  - `session_context` is grounded
  Optional:
  - `incoming_ball_depth`
  - `pressure_context`

- `contextual_match_situation`
  Done when:
  - match/pressure context is grounded enough to preserve the complaint faithfully
  - `outcome_pattern` is grounded if safely knowable
  The system should stop early rather than force a stroke-mechanics question.

- `generic_safe_fallback`
  Done when:
  - one or two safe broad context questions have been asked and answered, or
  - no further safe family is available
  This category should explicitly prefer early honest handoff over additional questioning.

### Follow-up expansion cap

To keep information density controlled, v1 should cap active follow-up expansion conservatively:

- no more than 2 follow-up questions after the initial parse in normal cases
- if the current category is `generic_safe_fallback`, prefer 0-1 follow-up questions unless a safe clarification clearly improves category grounding

This cap is not meant to be the only stopping rule, but it should guard against the system continuing to ask low-value questions once the complaint is already actionable enough for downstream diagnosis.

## File Boundary Plan

This design should fit the current repo structure without rebuilding the whole module tree.

Likely touched areas:

- `src/types/scenario.ts`
  Add `SkillCategory`, `QuestionFamily`, question metadata, inference result types.
- `src/data/scenarioReconstruction/questionBank.ts`
  Annotate questions with families and narrower slot semantics.
- `src/lib/scenarioReconstruction/skillPolicy.ts`
  New policy module holding category policies and safe fallback rules.
- `src/lib/scenarioReconstruction/inferSkillCategory.ts`
  New conservative category inference module.
- `src/lib/scenarioReconstruction/selector.ts`
  Filter by policy before missing-slot and ranking logic.
- `src/lib/scenarioReconstruction/runtime.ts`
  Adjust missing-slot and "done" behavior to cooperate with policy-defined required evidence.
- `src/lib/scenarioReconstruction/schema.ts`
  Reduce or reshape the global critical-slot assumption so policy rules are authoritative.
- tests under `src/__tests__/scenario-*.test.ts`
  Add category inference, filtering, and route-level regression coverage.

UI files should remain mostly unchanged unless copy updates are required by new families.

## Regression Test Strategy

The tests should lock down class-of-error prevention, not just the serve example.

### Unit coverage

1. Category inference
- serve phrases infer `serve`
- return phrases infer `return`
- volley phrases infer `volley`
- overhead phrases infer `overhead`
- ambiguous pressure-only phrases infer `contextual_match_situation` or fallback
- weak/ambiguous phrases infer `generic_safe_fallback`

2. Policy legality
- serve policy allows serve families and disallows movement/incoming-ball families
- groundstroke-on-move policy allows movement family
- fallback policy exposes only the tiny safe subset

3. Selector filtering
- disallowed families never appear in `eligibleQuestions`
- LLM ranking cannot revive a disallowed question

### Route/runtime coverage

- serve-related parse flow never returns `movement_context`
- serve-related parse flow never returns incoming-ball-depth follow-ups
- groundstroke moving cases can still return movement-context follow-ups
- volley cases never return serve-only families
- overhead cases never return first-vs-second-serve families
- fallback mode never emits technique-specific families

### Bilingual/content integrity

- all active question families maintain aligned `zh/en` copy
- any new tennis-specific question copy reads naturally in both languages

## Acceptance Criteria

1. A serve-related deep-diagnosis flow can never show "when set vs when moving".
2. A serve-related deep-diagnosis flow can never show incoming-ball properties as follow-up questions unless a future explicitly valid serve family is introduced and allowed by policy.
3. Follow-up questions are constrained by tennis-specific technique logic, not just missing slots.
4. Selector legality is enforced before any LLM ranking or generic priority ordering.
5. Ambiguous cases use the tiny safe fallback subset instead of guessing a technique-specific category.
6. The system remains extensible for future categories like return, overhead, slice, and volley without scattered special-case patches.
7. The result improves logical accuracy without broadening scope into unrelated diagnose or UI redesign.

## Non-Goals

- Rebuilding the entire deep-diagnosis pipeline
- Redesigning the diagnose page UI
- Broadening this change into general diagnosis-ranking redesign
- Maximizing follow-up count regardless of semantic safety

## Baseline Note

At spec time, the isolated branch baseline is build-green, but an existing selector test already shows current logic drift for serve scenarios: a serve case is selecting `q_incoming_ball_depth` where earlier expectations assumed `q_movement_state`. This reinforces that the current selector behavior is unstable and grounded in the wrong abstraction, and should be corrected as part of the policy-layer refactor rather than preserved.
