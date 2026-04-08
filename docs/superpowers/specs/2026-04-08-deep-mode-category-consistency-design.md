# Deep Mode Category Consistency Design

## Goal

Extend the approved Deep Mode completeness design so that Deep Mode category grounding survives handoff and becomes a hard downstream diagnosis constraint instead of a weak post-hoc hint.

## Concrete abstraction failure

The current system has two different truths:

1. Deep Mode can infer a tennis skill category from structured scenario state.
2. Downstream diagnosis still chooses from the full global rule space before that structured category is applied.

In repo terms:

- `src/lib/scenarioReconstruction/inferSkillCategory.ts` can infer a category from the scenario.
- `src/components/diagnose/DeepScenarioModule.tsx` returns structured scenario state to the diagnose page.
- `src/app/diagnose/page.tsx` still calls `diagnoseProblem(trimmedText, ...)` on the raw handoff text before category gating exists.
- `src/lib/diagnose/enrichedContext.ts` builds a rich context only after diagnosis already picked a rule and `problemTag`.
- `src/lib/diagnosis.ts` still ranks across `diagnosisRules` globally through `findBestDiagnosisRule()`.

This is why a serve scene can still silently end as a forehand diagnosis. The structured Deep Mode category is not part of the diagnosis contract at the time the rule is selected.

## Boundary

Do not patch this by adding serve-only exclusions in diagnosis ranking.

Instead:

1. Deep Mode continues to own tennis-valid scene grounding.
2. Handoff produces an explicit diagnosis contract with category and confidence.
3. Diagnosis consumes that contract before rule ranking.
4. Recommendations, rationale, and plan context all stay inside the same gated category lane.
5. A final consistency guard rejects any cross-category result that somehow escapes gating.

## Target handoff contract

Introduce an explicit Deep Mode handoff object, built before diagnosis selection, containing at least:

- scene summary text
- inferred `skillCategory`
- category confidence
- normalized stroke family
- deep readiness / capped-stop state
- structured grounding signals needed for downstream gating

This object should not depend on a downstream `problemTag` to exist.

## Downstream diagnosis rule gating

When Deep Mode provides a reliable category:

- diagnosis rule candidates must be filtered to that category lane before ranking
- content recommendation seeding must inherit the same gated rule/result
- plan context and rationale must reuse the same gated diagnosis result

When category confidence is weak:

- do not fake a precise category
- either fall back to a safe/general lane or surface an explicit conflict/ambiguity state

## Consistency guard

Add a final guard after diagnosis selection:

- if the handoff contract says `serve` with reliable confidence, a result like `forehand-out` must not pass silently
- the system should either:
  - return a gated, category-consistent rule
  - or surface a category-conflict / ambiguity result honestly

## Non-goal

This does not redesign the whole diagnosis engine. It only moves the Deep Mode category from an after-the-fact annotation to a pre-selection constraint and consistency guard.
