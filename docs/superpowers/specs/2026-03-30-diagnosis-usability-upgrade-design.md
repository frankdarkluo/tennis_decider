# Diagnosis Specificity And Study-Mode Usability Upgrade Design

**Date:** 2026-03-30

**Owner:** Codex planning pass

## Summary

The next TennisLevel study-phase upgrade should improve two linked weaknesses observed in moderated user testing:

1. text diagnosis and generated practice plans can feel too generic for non-forehand issues, especially backhand, footwork, net play, and volley-related inputs
2. the diagnose-to-plan interaction in study mode still presents too many competing click targets for some older participants

The recommended approach is to keep the current study-ready architecture intact and improve the interaction logic in three coordinated ways:

1. make input guidance more specific rather than merely encouraging longer text
2. expand rule and plan-template coverage for under-served problem categories
3. simplify study-mode progression so each task has one clearly primary next action

This design intentionally does not introduce a new LLM-first diagnosis layer in the first pass. The current rule-based system is already instrumented, testable, and compatible with the frozen study setup. The highest-leverage next step is to make that system easier to feed with useful input and better able to return specific, actionable outputs.

## Current Context

The current codebase is already a functioning study-ready build with:

- study session lifecycle
- event logging
- task-level actionability capture
- frozen library and rankings order
- bilingual study behavior
- continuation flows and researcher tooling

`PROJECT_PROGRESS_SUMMARY.md` already identifies the next phase as interaction-logic refinement rather than more infrastructure work. This design follows that direction and narrows it to diagnosis quality and moderated-study usability.

Relevant current implementation characteristics:

- text diagnosis is rule-based and uses keyword/synonym scoring, not open-ended model reasoning
- fallback behavior already exists and is logged
- training plans are template-driven and then adjusted with preferred content IDs
- study mode already captures `queryLength`, rule matching, fallback usage, actionability ratings, and exportable derived metrics

## Problem Statement

### 1. Diagnosis specificity is uneven across problem types

Forehand-related inputs tend to feel more accurate than broader inputs such as:

- "反手总是下网"
- "脚步总是慢半拍"
- net-play and volley complaints

This is not only a content-pool problem. The current system can recommend content for many of these tags, but diagnosis quality is constrained by rule granularity and by whether the user input contains terms the rules can match confidently.

### 2. More text helps only when it adds structure

The current product may give the impression that "longer input is always better." That is not accurate enough for this system.

Under the current rule-based architecture, better results come from more specific input, not necessarily more verbose input. An input becomes more useful when it includes details like:

- which stroke or situation
- what the ball outcome is
- when the problem gets worse
- whether the issue is timing, contact, confidence, or positioning

Therefore the UI should encourage structured specificity, not simply longer answers.

### 3. Practice plans feel generic when diagnosis-to-template coverage is incomplete

Some diagnosis tags have strong dedicated templates, while other tags rely on weaker template matching or generic fallback behavior. This creates a visible quality gap between diagnosis output and plan output. A participant can feel "the diagnosis kind of understood me, but the plan still looks general."

### 4. Study-mode interaction still has too many competing CTAs

On diagnose result surfaces in study mode, users can encounter multiple possible next clicks:

- expand more detail
- generate a plan
- go to library
- go to rankings
- sometimes other product-adjacent affordances

Younger users may tolerate this well, but some older participants interpret multiple clickable paths as uncertainty about what the app expects them to do next.

## Design Goals

- Improve diagnosis specificity for backhand, movement, net-play, and volley-adjacent complaints without destabilizing the study infrastructure.
- Improve perceived usefulness of generated 7-day plans for those same problem areas.
- Make study-mode progression visually obvious enough that participants need less facilitator explanation.
- Preserve current study task structure and export compatibility.
- Keep the system bilingual where the touched surfaces already are bilingual.
- Make the improvements measurable using existing research logs plus small additive instrumentation.

## Non-Goals

- redesign frozen library ordering
- redesign frozen rankings ordering
- reopen `/video-diagnose` for the current study phase
- replace the current diagnosis system with a fully generative LLM pipeline
- make breaking Supabase schema or export changes
- broaden into unrelated product growth work

## Options Considered

### Option A: UI-copy-only refresh

Change the input placeholder, helper text, and CTA wording, but keep current rules and plan-template coverage mostly unchanged.

Pros:

- fastest
- lowest implementation risk

Cons:

- does not fix uneven category coverage
- likely improves comprehension more than actual specificity
- risks overpromising better diagnosis without enough backend support

### Option B: Guided-input plus rule/template coverage plus single-primary-CTA flow

Improve input quality, extend diagnosis coverage where it is weak, add missing or weak plan-template support, and simplify study-mode next-step logic.

Pros:

- directly addresses both major user-test findings
- fits the current architecture
- preserves study comparability
- testable with the current suite and research logs

Cons:

- touches multiple connected files
- requires careful copy, logic, and instrumentation coordination

### Option C: Add an LLM interpretation layer now

Use a model to infer a more structured problem representation from user text before diagnosis and plan generation.

Pros:

- highest theoretical ceiling for nuanced inputs
- could handle broader phrasing without many new rules

Cons:

- adds a major new study variable
- harder to keep deterministic and validate in the current research phase
- broader implementation and QA surface than needed right now

## Recommendation

Adopt Option B.

This is the best fit for the current study phase because it improves both perceived and actual usefulness while staying within the existing architecture and instrumentation. It also aligns with the current project direction in `PROJECT_PROGRESS_SUMMARY.md`, which already prioritizes interaction-logic refinement over new infrastructure.

## Proposed Design

### 1. Guided diagnosis input that rewards specificity

Both the home hero input and the `/diagnose` input should shift from "tell us the problem" toward "tell us the problem in a more useful structure."

The UI should explicitly guide users toward a simple pattern:

- action area: which stroke or situation
- failure mode: what keeps going wrong
- worsening context: when it gets worse

Example guidance:

- `反手总下网，尤其来球一快就更容易失误`
- `脚步总慢半拍，左右移动时最明显`
- `网前截击老冒高，双打时一紧张更明显`

Important product decision:

- the copy should say that more specific descriptions help
- the copy should not claim that longer descriptions alone help

To support this, both the home hero input and the `/diagnose` input should add:

- one short helper line under the input
- one row of structured example chips by category

This phase will not add a multi-step form or separate required fields. It remains a single text-entry task that better teaches the user what a useful answer looks like.

### 2. Diagnosis rule expansion for under-served categories

The current diagnosis system should remain rule-based for this phase, but the rules should be expanded where user feedback shows the most weakness.

Priority categories:

- backhand
- footwork / movement / preparation
- net play / volley

The upgrade should focus on:

- additional synonyms and phrasing variants in Chinese and English
- clearer separation between related tags where needed
- better mapping between generic complaints and the most useful specific tag

Examples:

- distinguish "脚步慢" from broader "击球点晚" when the user is clearly describing movement initiation
- distinguish "网前怕、截击乱、截击动作太大、网前站位不清" inside the existing `net-confidence` family instead of collapsing all net complaints into one vague bucket
- strengthen backhand phrases beyond the strongest existing canonical cases

This phase should prefer additive rule coverage over introducing a second reasoning system.

Explicit scope decision:

- this pass keeps the current top-level net-play diagnosis tag family and does not introduce a brand-new volley-only `problemTag`

### 3. Plan-template coverage must catch up to diagnosis coverage

Diagnosis quality will still feel weak if matched problems feed into generic or weakly differentiated 7-day plans.

The plan system should therefore add or strengthen dedicated templates for the missing or under-served diagnosis tags most likely to surface in study mode:

- `movement-slow`
- `late-contact`
- `net-confidence`

Plan-template goals:

- each plan should feel like a direct continuation of the diagnosis
- day focuses should reflect the same failure mode language users saw in diagnosis
- drills should stay simple and study-friendly, not advanced or coach-dependent

This should reduce the current experience where the diagnose page feels reasonably specific but the plan page reverts to generic training rhythm.

### 4. Single-primary-CTA study-mode progression

Study mode should optimize for clarity over optional exploration.

Design rule:

- each study task completion state should expose one clearly primary next action
- secondary exploration paths remain available only if they do not compete with the main task flow

For diagnose results in study mode:

- primary CTA: generate training plan
- secondary options: library, rankings, and deeper exploration should move into a visually separate "more options" block below the primary CTA rather than sharing the same main action row

For assessment result in study mode:

- primary CTA should remain the most direct next study action

For plan view in study mode:

- primary CTA should indicate the next expected study action or completion state

This simplification should apply to all study participants, not only older users. A universal simpler flow is preferred over age-specific branching because it keeps the study path consistent and lowers moderator overhead.

### 5. Task framing should continue the direction already identified in the project summary

This design should build directly on the existing "stronger task framing" direction already documented in the project summary:

- show current task
- show completion state
- show next expected action

The diagnose and plan surfaces should therefore make the task state legible before optional exploration. The user should not have to infer whether they are still "inside the task" or already browsing optional material.

### 6. Instrumentation and evaluation

The good news is that the repo already logs much of what is needed.

Existing useful signals:

- `queryLength`
- `diagnose.rule_matched`
- `diagnose.fallback_used`
- `diagnose.result_viewed`
- `diagnose.plan_cta_clicked`
- actionability ratings
- exportable derived metrics

This design should reuse existing events and, if extra observability is necessary during implementation, add only additive payload fields rather than new tables or export sections. The preferred additional fields are:

- whether a structured prompt chip was used
- whether the participant expanded optional choices before using the primary CTA
- whether a diagnose result in study mode presented a simplified single-primary CTA layout

Success should be evaluated with both behavioral and qualitative signals:

- lower fallback rate for targeted categories
- higher plan-generation follow-through from diagnose
- higher actionability on `task_1_problem_entry` and `task_3_action_or_revisit`
- fewer open-feedback comments indicating "too general" or "did not know where to click"
- moderator observation that participants need less prompting

## Architecture And File Impact

Primary affected areas:

- home input guidance
- diagnose input guidance and rule usage
- diagnosis rules and helper logic
- plan-template coverage
- study-mode CTA prioritization and task framing
- additive logging and export interpretation where helpful

Most likely files:

- `src/components/home/HeroSection.tsx`
- `src/components/diagnose/DiagnoseInput.tsx`
- `src/components/diagnose/DiagnoseResult.tsx`
- `src/app/diagnose/page.tsx`
- `src/app/plan/page.tsx`
- `src/data/diagnosisRules.ts`
- `src/lib/diagnosis.ts`
- `src/data/planTemplates.ts`
- `src/lib/plans.ts`
- `src/lib/i18n/dictionaries/zh.ts`
- `src/lib/i18n/dictionaries/en.ts`
- `src/types/research.ts`
- targeted tests under `src/__tests__`

The study schema and frozen snapshot logic should remain unchanged in this phase unless a tiny additive field becomes absolutely necessary. The default assumption is no schema change.

## Error Handling And Safety

- If a user still enters broad text, the system should continue returning a valid diagnosis result rather than blocking submission.
- Fallback behavior should remain explicit and honest in the UI.
- Study-mode simplification should not remove access to essential recovery paths already relied on by moderators.
- New copy must stay bilingual and avoid implying that the app has model-level understanding it does not actually have.

## Testing Strategy

### Unit and logic tests

- diagnosis rule matching tests for new backhand, movement, and net/volley phrases
- fallback tests to ensure broad inputs still degrade gracefully
- plan-template tests to ensure newly supported tags resolve to dedicated plans rather than generic fallback

### UI and smoke tests

- home and diagnose input helper text rendering
- study-mode diagnose result with one clearly primary CTA
- actionability prompt placement still reading as task completion rather than interruption
- bilingual rendering on updated study surfaces

### Research validation

- one quick internal moderator dry run
- one or more pilot sessions focused on older participants
- export review after pilot to confirm actionability, fallback, and CTA-flow metrics are interpretable

## Acceptance Criteria

- Users understand that specificity helps diagnosis quality, without being told they must write a long paragraph.
- Backhand, movement, and net-play complaints produce noticeably more specific diagnosis output than before.
- The corresponding plan page feels like a direct continuation of the diagnosis instead of a generic weekly plan.
- In study mode, participants can identify the next click without facilitator explanation in most diagnose and plan states.
- Existing study exports remain compatible and the current task structure remains intact.

## Rollout Sequence

This design should fit into the existing next-phase sequencing rather than replace it.

Recommended order:

1. keep the existing operator-safe study start work first if it is not already complete enough for the next moderated round
2. implement diagnosis specificity uplift and plan-template coverage
3. implement guided input and study-mode CTA simplification together
4. run a focused validation pass using the existing export and researcher workflow

## Final Decisions Captured In This Spec

- The first pass will not add a new LLM-first diagnosis layer.
- The product will encourage more specific input, not simply longer input.
- Study mode will move toward a universal single-primary-CTA pattern instead of branching by age group.
- Missing diagnosis-plan continuity will be addressed by extending plan-template coverage, not only by changing UI copy.
