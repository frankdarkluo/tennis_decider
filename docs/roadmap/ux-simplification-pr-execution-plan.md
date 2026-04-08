---
aliases:
  - UX Simplification PR Execution Plan
tags:
  - type/roadmap
  - area/product
  - area/ux
  - status/planning
---

# UX Simplification PR Execution Plan

Source of truth: `docs/roadmap/ux-simplification-plan.md`

This document turns the roadmap into small-to-medium implementation PRs. It does not replace the product principles in the roadmap; it only sequences the work so each PR can be reviewed, tested, and rolled back independently.

## Brainstorming Pass

### Decomposition options considered

| Option | Shape | Decision |
|--------|-------|----------|
| Phase-by-phase PRs | One PR per roadmap phase | Mostly accepted, but one reorder is safer |
| UI-first PRs | Home, diagnosis UI, plan UI before data-flow changes | Accepted for the first three PRs because these are visible and reviewable without changing scoring |
| Data-first PRs | Fix localStorage handoff and assessment weighting first | Rejected as the default because it mixes fragile data transfer with visible UX changes |
| One large UX PR | Apply all simplification work together | Rejected because diagnosis UI, plan UI, handoff, and assessment scoring have different risk profiles |

### Recommended split

The plan uses seven PRs:

1. PR1: Entry ungating and conservative cleanup
2. PR2: Diagnosis result flattening
3. PR3: Plan page prescription view
4. PR4: Plan template coverage audit and fallback hardening
5. PR5: LocalStorage plan-draft handoff
6. PR6: Assessment-to-diagnosis and assessment-to-plan compounding
7. PR7: Assessment scoring/result polish

The only intentional reorder from the roadmap is moving localStorage handoff before assessment compounding. That avoids adding new assessment context to the existing long-URL transfer path and then rewriting it immediately afterward.

### Current repo adjustments

The current codebase already has partial work that the roadmap describes as future work:

| Roadmap item | Current adjustment |
|--------------|-------------------|
| Fill six missing plan templates | `src/data/planTemplates.ts` and `src/__tests__/plan-rationale.test.ts` already reference the six tags. PR4 should verify and harden this, not duplicate templates blindly. |
| Diagnosis reads assessment | `src/app/diagnose/page.tsx` already passes `assessmentResult` into `diagnoseProblem()`. PR6 should check whether this only affects fallback or also affects matched diagnosis confidence. |
| Plan context draft | `src/app/plan/page.tsx` already reads/writes a local study plan draft, but `buildPlanHref()` still encodes `planContext` and `deepContext` into URL params. PR5 should make the short-URL draft handoff the primary mechanism. |
| Assessment gate | `/`, `/diagnose`, and `/plan` currently enforce or depend on assessment completion outside study mode. PR1 should remove the mandatory assessment gate from diagnosis-first flows while preserving the study session gate. |

### Risk points

| Risk | Mitigation |
|------|------------|
| Removing assessment gates could bypass study requirements | Preserve `pendingStudySetup` and study-session redirects. Only remove the non-study assessment requirement. |
| Diagnosis UI flattening could hide low-evidence/narrowing warnings | Keep narrowing as a visible inline callout, and move evidence details into the single expandable "why" section. |
| Plan UI simplification could remove useful prescription detail | Keep warmup/main/pressure/intensity/tempo in a details toggle rather than deleting fields. |
| LocalStorage handoff could break shared links or old URLs | Keep URL fallback parsing for one release. Only shorten newly generated URLs. |
| Assessment weighting could overstate confidence | Use bounded scoring bonuses and preserve evidence-level safeguards. Assessment should nudge, not override user input. |
| Assessment redesign could break stored result compatibility | Keep storage shape compatible where possible and add migration/fallback tests if fields change. |

## Execution Rules

- Execute one PR at a time.
- Preserve study mode infrastructure, event shapes, frozen `/library` and `/rankings` ordering, content data, auth, Supabase, and deployment config.
- Do not reopen `/video-diagnose`.
- Do not add dependencies unless a PR explicitly justifies it.
- Run targeted tests before broader verification.
- Use `npm run build` before marking each implementation PR complete.
- Use `npm run lint` when the PR changes shared UI, types, or app route structure.

## PR1: Entry Ungating and Conservative Cleanup

Recommended effort: medium

### Goal

Make diagnosis-first entry possible without forcing assessment completion, while preserving study session requirements.

### Why this PR exists

The roadmap says the home page should always show the hero/problem input and assessment should be secondary. In the current repo, removing only the home gate is not enough because `/diagnose` and `/plan` also redirect non-study users without an assessment. This PR establishes the entry-flow baseline before UI redesign work.

### Main files/modules likely to change

| Area | Files |
|------|-------|
| Home entry | `src/app/page.tsx`, possibly `src/components/home/HeroSection.tsx` |
| Diagnosis gate | `src/app/diagnose/page.tsx` |
| Plan gate | `src/app/plan/page.tsx` |
| Optional cleanup | `.gitignore`, clearly obsolete root planning docs moved to `docs/roadmap/archive/` |
| Tests | `src/__tests__/app-smoke.test.tsx`, route/home tests if present |

### Expected UI/logic changes

- `/` always renders the hero/problem input after study setup checks finish.
- Assessment is shown as a secondary helper path, not a blocking gate.
- `/diagnose` works without stored assessment data and still hydrates assessment context when available.
- `/plan` allows diagnosis-origin plans without assessment completion.
- Empty/direct `/plan` still shows a safe empty state with links back to assessment/diagnosis.
- Study setup redirects remain unchanged.
- Cleanup only removes or archives files that are clearly obsolete and not the active roadmap.

### Dependencies

- None.

### Validation/testing checklist

- Confirm no assessment result in localStorage still allows `/` and `/diagnose` to render.
- Confirm study mode with pending setup still redirects to `/study/start`.
- Confirm assessment context is still used when present.
- Run `npm test -- src/__tests__/app-smoke.test.tsx`.
- Run `npm run lint` because app route structure changes.
- Run `npm run build`.

### Rollback/risk notes

- If study setup behavior regresses, revert only the gate changes and keep cleanup separate if already safe.
- Do not delete `docs/roadmap/ux-simplification-plan.md`; it remains the active source of truth during execution.

## PR2: Diagnosis Result Flattening

Recommended effort: high

### Goal

Replace the current three-layer diagnosis result with one default answer and one expandable "why this" section.

### Why this PR exists

The diagnosis result currently hides the plan CTA behind expansion and shows too many blocks before the user sees the primary action. This PR makes the diagnosis surface match the roadmap principle: one answer first, depth on request.

### Main files/modules likely to change

| Area | Files |
|------|-------|
| Diagnosis UI | `src/components/diagnose/DiagnoseResult.tsx` |
| i18n | `src/lib/i18n/dictionaries/zh.ts`, `src/lib/i18n/dictionaries/en.ts` |
| Tests | `src/__tests__/app-smoke.test.tsx`, `src/__tests__/deep-diagnose-result.test.tsx`, `src/__tests__/deep-diagnose-orchestrator.test.tsx`, `src/__tests__/bilingual-rendering.test.tsx` |

### Expected UI/logic changes

- Default view shows title, summary or one cause, `primaryNextStep`, plan CTA, and one featured video when available.
- Plan CTA is visible without clicking expand.
- The evidence bar, detailed summary, full causes, drills, deep-mode scene recap, specificity reasons, and additional videos move into one expandable section.
- Remove `layer` state and layer-specific event handling.
- Keep a narrowing callout visible when evidence is too thin.
- Keep fallback messaging, but make it less visually dominant than the next action.
- Replace `diagnose.result.expand1` / `diagnose.result.expand2` usage with a single `diagnose.result.whyExpand`-style key.
- Do not surface `/video-diagnose` as part of this PR.

### Dependencies

- PR1 should land first so diagnosis can be reached without assessment.

### Validation/testing checklist

- Diagnosis with a specific query like `正手出界` shows plan CTA without expansion.
- Low-evidence diagnosis still asks the user to clarify instead of pretending to be precise.
- Deep-mode result still exposes scene recap and specificity reasons inside the expandable section.
- Featured video is visible by default when recommendations are allowed.
- Additional videos are not shown by default.
- Run `npm test -- src/__tests__/app-smoke.test.tsx src/__tests__/deep-diagnose-result.test.tsx src/__tests__/deep-diagnose-orchestrator.test.tsx src/__tests__/bilingual-rendering.test.tsx`.
- Run `npm run lint`.
- Run `npm run build`.

### Rollback/risk notes

- Keep the old recommendation-card helper structure if possible; only restructure placement.
- If tests reveal too much behavior coupling, split rendering helpers inside `DiagnoseResult.tsx` first, then flatten layout.

## PR3: Plan Page Prescription View

Recommended effort: medium

### Goal

Make the plan page scan like a short prescription instead of a full syllabus.

### Why this PR exists

The roadmap says a 3.0-3.5 player should see what to practice, what counts as done, and one video, with details available on demand. This PR reduces default density without losing training detail.

### Main files/modules likely to change

| Area | Files |
|------|-------|
| Plan summary | `src/components/plan/PlanSummary.tsx` |
| Plan day card | `src/components/plan/DayPlanCard.tsx` |
| Plan page layout | `src/app/plan/page.tsx` |
| i18n | `src/lib/i18n/dictionaries/zh.ts`, `src/lib/i18n/dictionaries/en.ts` |
| Tests | `src/__tests__/surface-localization.test.tsx`, `src/__tests__/bilingual-rendering.test.tsx`, `src/__tests__/app-smoke.test.tsx` |

### Expected UI/logic changes

- Plan summary defaults to target problem and level only.
- Rationale/focus text is either removed from default view or moved to a non-dominant details area if still needed for assessment-origin plans.
- Step 1 is expanded by default.
- Steps 2-7 are collapsed by default.
- Each visible step shows focus, success criteria, one video, and duration.
- Warmup/main/pressure/intensity/tempo remain available behind a `详细安排` / details toggle.
- Bottom follow-up CTAs to diagnosis/profile are removed or demoted; keep save and regenerate as the main actions.
- Remove subtitle availability badges and secondary-title clutter from default plan cards unless tests show they are required elsewhere.

### Dependencies

- PR1 should land first.
- PR2 is not a hard dependency, but it is preferable so diagnosis and plan density move in the same direction.

### Validation/testing checklist

- First plan step is expanded and later steps are collapsed.
- A user can see focus, criteria, duration, and one video without expanding full details.
- Details toggle reveals warmup/main/pressure/intensity/tempo.
- Bilingual labels render correctly.
- Run `npm test -- src/__tests__/surface-localization.test.tsx src/__tests__/bilingual-rendering.test.tsx src/__tests__/app-smoke.test.tsx`.
- Run `npm run lint`.
- Run `npm run build`.

### Rollback/risk notes

- Do not delete plan fields from data models; hide them behind disclosure.
- If subtitle or secondary-title tests fail, move those details into the expanded area rather than removing them globally.

## PR4: Plan Template Coverage Audit and Fallback Hardening

Recommended effort: medium

### Goal

Ensure the six common diagnosis tags have dedicated plan templates and do not fall back to generic plans.

### Why this PR exists

The roadmap identifies six common problem tags that should not waste diagnosis precision by falling into the generic plan. The current repo already appears to include this work, so this PR is a coverage and regression-hardening milestone.

### Main files/modules likely to change

| Area | Files |
|------|-------|
| Templates | `src/data/planTemplates.ts` |
| Plan generation | `src/lib/plans.ts` if fallback selection needs tightening |
| Tests | `src/__tests__/plan-rationale.test.ts`, `src/__tests__/plan-fixtures.test.ts`, `src/__tests__/plan-microcycle.test.ts` |

### Expected UI/logic changes

- Dedicated templates exist for `rally-consistency`, `forehand-no-power`, `balls-too-short`, `return-under-pressure`, `cant-hit-lob`, and `stamina-drop`.
- `stamina-drop` has both lower and higher level coverage if the plan system distinguishes `3.0` and `4.0`.
- Template summaries remain diagnosis-driven and actionable.
- No new content-library edits are required unless a direct existing content ID is already available and tests prove it is safe.

### Dependencies

- None hard.
- This can land before or after PR3, but it should land before PR6 so assessment-to-plan work has reliable templates.

### Validation/testing checklist

- Verify each of the six tags returns `source: "template"`, not the generic fallback.
- Verify all plan templates still have 7 days and valid content IDs.
- Run `npm test -- src/__tests__/plan-rationale.test.ts src/__tests__/plan-fixtures.test.ts src/__tests__/plan-microcycle.test.ts`.
- Run `npm run build`.

### Rollback/risk notes

- If a template is weak or unreviewable, split that tag into a smaller follow-up PR instead of landing six large content edits blindly.
- Do not modify `src/data/contents.ts`, `src/data/expandedContents.ts`, or creator data as part of this PR.

## PR5: LocalStorage Plan-Draft Handoff

Recommended effort: high

### Goal

Move diagnosis/assessment-to-plan context transfer from long encoded URLs to a stable localStorage draft, while keeping URL fallback compatibility.

### Why this PR exists

The roadmap calls the current query-param handoff fragile because `planContext` and `deepContext` can be large. This PR creates the safer carrier before adding more assessment-driven context in PR6.

### Main files/modules likely to change

| Area | Files |
|------|-------|
| Plan draft helpers | `src/lib/plans.ts` and/or a focused helper such as `src/lib/planDraft.ts` if extracting is cleaner |
| Diagnosis CTA | `src/components/diagnose/DiagnoseResult.tsx` |
| Assessment result CTA | `src/app/assessment/result/page.tsx` |
| Plan page read path | `src/app/plan/page.tsx` |
| Study local data | `src/lib/study/localData.ts` only if reusing existing draft storage is appropriate |
| Tests | `src/__tests__/plan-context.test.ts`, `src/__tests__/assessment-plan-linkage.test.ts`, `src/__tests__/study-plan-draft.test.ts`, `src/__tests__/app-smoke.test.tsx` |

### Expected UI/logic changes

- Diagnosis plan CTA writes a normalized draft containing `problemTag`, `level`, `preferredContentIds`, `sourceType`, `primaryNextStep`, `planContext`, and `deepContext`.
- Assessment plan CTA writes a normalized draft containing `problemTag`, `level`, `preferredContentIds`, `sourceType`, and assessment-derived `planContext`.
- Newly generated plan URLs include only short shareable params such as `problemTag`, `level`, and `source`.
- `/plan` reads localStorage draft first, then falls back to legacy URL params, then falls back to existing study draft.
- `buildPlanHref()` no longer adds `planContext` or `deepContext` to newly generated URLs.
- `parsePlanContext()` and legacy decoding can remain until old URLs are no longer needed.

### Dependencies

- PR2 should land first because `DiagnoseResult.tsx` CTA placement changes.
- PR3 is useful but not required.
- PR4 should land before PR6, but not necessarily before PR5.

### Validation/testing checklist

- Diagnosis CTA produces a short URL and `/plan` still receives the correct primary next step and deep context.
- Assessment CTA produces a short URL and `/plan` still receives weak/observation dimensions.
- Legacy URLs containing `planContext` and `deepContext` still work.
- Refreshing `/plan` still restores the same draft.
- Study-mode progress draft still works and event artifact shape does not change.
- Run `npm test -- src/__tests__/plan-context.test.ts src/__tests__/assessment-plan-linkage.test.ts src/__tests__/study-plan-draft.test.ts src/__tests__/app-smoke.test.tsx`.
- Run `npm run lint`.
- Run `npm run build`.

### Rollback/risk notes

- Keep the legacy URL fallback until after one stable release.
- Do not remove study-local draft helpers unless they are clearly redundant and tests cover the replacement.
- If localStorage and study draft conflict, prefer the explicit URL source plus freshest draft timestamp.

## PR6: Assessment-to-Diagnosis and Assessment-to-Plan Compounding

Recommended effort: high

### Goal

Make assessment weak dimensions visibly and safely shape diagnosis and plan generation.

### Why this PR exists

The roadmap principle is that assessment and diagnosis should compound, not run in parallel. The current repo already passes `assessmentResult` into diagnosis, but this PR should verify and complete the actual scoring/plan effects.

### Main files/modules likely to change

| Area | Files |
|------|-------|
| Diagnosis scoring | `src/lib/diagnosis.ts`, possibly `src/data/diagnosisRules.ts` only if rule metadata already supports it |
| Diagnosis page | `src/app/diagnose/page.tsx` if query context or copy changes are needed |
| Plan generation | `src/lib/plans.ts` |
| Assessment result CTA | `src/app/assessment/result/page.tsx` |
| Types | `src/types/diagnosis.ts`, `src/types/plan.ts` only if the existing shapes cannot carry needed metadata |
| Tests | `src/__tests__/diagnosis-matching.test.ts`, `src/__tests__/assessment-plan-linkage.test.ts`, `src/__tests__/plan-rationale.test.ts`, `src/__tests__/content-display.test.ts` |

### Expected UI/logic changes

- If an assessment weak dimension matches the user's problem family, diagnosis may receive a bounded score/confidence nudge.
- Assessment context must not override explicit user input.
- If the user input is vague, assessment may guide fallback direction, but copy remains tentative.
- Assessment result page uses one primary CTA to diagnosis, with plan/library actions secondary.
- Plans can add dimension-specific warmup/focus when weak dimensions exist.
- Assessment-origin plan rationale stays separate from diagnosis-origin summary so plan copy does not claim unsupported precision.

### Dependencies

- PR4 should land first so common diagnosis tags have dedicated plan templates.
- PR5 should land first so extra assessment context is not added to the old long-URL transfer path.

### Validation/testing checklist

- A weak `serve` assessment plus serve-related input nudges serve diagnosis without affecting unrelated forehand input.
- Vague input with assessment uses assessment-guided fallback with honest confidence.
- No-assessment diagnosis still works.
- Assessment result primary CTA points to diagnosis and logs the correct action.
- Assessment-origin plan includes weak/observation dimensions in a restrained way.
- Run `npm test -- src/__tests__/diagnosis-matching.test.ts src/__tests__/assessment-plan-linkage.test.ts src/__tests__/plan-rationale.test.ts src/__tests__/content-display.test.ts`.
- Run `npm run lint`.
- Run `npm run build`.

### Rollback/risk notes

- Keep score bonuses small and test that they cannot flip a clearly matched unrelated rule.
- If the scoring logic becomes complex, split this into two PRs: diagnosis weighting first, then plan weighting.

## PR7: Assessment Scoring and Result Polish

Recommended effort: xhigh

### Goal

Bring the assessment module in line with the roadmap's final assessment improvements while preserving stored result compatibility.

### Why this PR exists

The roadmap calls out assessment branch scoring, clearer weak-dimension summaries, and result presentation as a later, higher-risk phase. This should be executed after the main UX and data-flow simplification work is stable.

### Main files/modules likely to change

| Area | Files |
|------|-------|
| Assessment engine | `src/lib/assessment.ts` |
| Assessment questions | `src/data/assessmentQuestions.ts` |
| Assessment storage/draft | `src/lib/assessmentDraft.ts`, `src/lib/assessmentStorage.ts` only if result shape changes |
| Assessment UI | `src/components/assessment/ResultSummary.tsx`, `src/components/assessment/SkillBreakdown.tsx`, `src/app/assessment/page.tsx`, `src/app/assessment/result/page.tsx` |
| Tests | `src/__tests__/assessment-engine.test.ts`, `src/__tests__/assessment-flow.test.tsx`, `src/__tests__/assessment-plan-linkage.test.ts` |

### Expected UI/logic changes

- Verify or correct Branch C scoring thresholds: low branch maps to `3.5`, mid to `4.0`, high to `4.5` as specified by the roadmap.
- Expand or refine branch questions only if the current question ladder does not already satisfy the 8-10 question ladder target.
- Result summary uses top weak dimensions rather than only level-generic copy.
- `待提升` / score-2 dimension tier has distinct visual treatment.
- Assessment result keeps diagnosis as the primary next action.
- Stored older assessment results still render safely.

### Dependencies

- PR6 should land first so assessment output has downstream behavior to verify.

### Validation/testing checklist

- Run targeted assessment engine tests for every branch threshold.
- Run assessment flow UI tests.
- Verify existing localStorage assessment result can still be read.
- Verify assessment result CTA still routes through the PR5 localStorage/short-URL plan handoff when choosing direct plan.
- Run `npm test -- src/__tests__/assessment-engine.test.ts src/__tests__/assessment-flow.test.tsx src/__tests__/assessment-plan-linkage.test.ts`.
- Run `npm run lint`.
- Run `npm run build`.

### Rollback/risk notes

- Treat scoring changes and question copy changes as separable commits inside the PR.
- If question expansion causes too many test rewrites, split this into PR7A scoring compatibility and PR7B question/result UI polish.

## Final Acceptance Criteria

- A no-assessment user can type a problem from `/` and reach a diagnosis result.
- Diagnosis result shows one clear next action, one reason, a visible plan CTA, and one featured video without expansion.
- Low-evidence diagnosis still asks for clarification and avoids false precision.
- Plan page shows step 1 expanded and later steps collapsed, with details hidden behind a toggle.
- Common diagnosis tags use dedicated plan templates instead of generic fallback.
- Diagnosis-to-plan and assessment-to-plan handoff uses short URLs plus localStorage draft, with legacy URL fallback.
- Assessment weak dimensions influence diagnosis/plan in bounded, test-covered ways.
- Assessment remains stable after final scoring/result polish.
