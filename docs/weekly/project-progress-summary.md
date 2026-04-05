---
aliases:
  - Project Progress Summary
tags:
  - type/weekly
  - area/process
  - status/log
---

# TennisLevel Research Build Progress Summary

Living summary of the current research-ready build state. Update this after major milestones; daily detail lives in `progress/`.

## Related docs
- [[index]]
- [[roadmap/current]]
- [[research/study-mode]]
- [[engineering/diagnosis-observability]]
- [[weekly/2026-W14]]
- [[progress/2026-04-04]]
- [[progress/2026-04-02]]
- [[progress/2026-04-01]]

## As Of March 29, 2026

- Branch / deploy target: `main`
- Latest production commit: `b147b71`
- Production domain: `https://tennis-decider.vercel.app`
- Current study ID: `sportshci_2026_no_video_v1`
- Current frozen snapshot:
  - `snapshotId = 2026-03-29-v1`
  - `seed = 20260329`
  - `buildVersion = 2026-03-29-v1`
- Current research scope:
  - study mode
  - event logging
  - post-task actionability rating
  - frozen `/library` ordering
  - frozen `/rankings` ordering
  - core bilingual consistency where it affects the study flow
- Current explicit constraint:
  - `/video-diagnose` is hidden in study mode and excluded from this study phase

## What The Current Codebase Actually Supports

### 1. Study session lifecycle is implemented end to end

- `/study` redirects to `/study/start`
- `/study/start` captures:
  - `participantId`
  - locked language choice
  - consent
  - coarse anonymous background profile
- Starting a session creates:
  - local active study session
  - `study_participants` registry entry
  - `study_sessions` row
- `/study/end` records session completion and offers local cleanup
- Study language is locked once a session is active

Relevant files:

- `src/app/study/page.tsx`
- `src/app/study/start/page.tsx`
- `src/app/study/end/page.tsx`
- `src/components/study/StudyProvider.tsx`
- `src/app/api/study/session/start/route.ts`
- `src/app/api/study/session/end/route.ts`

### 2. Core study tasks are instrumented

The current research flow is effectively:

1. `Task 1`: problem entry / text diagnosis
2. `Task 2`: adaptive assessment + result interpretation
3. `Task 3`: action or revisit via plan / library / rankings / profile

Currently wired study surfaces include:

- `/assessment`
- `/assessment/result`
- `/diagnose`
- `/plan`
- `/library`
- `/rankings`
- `/profile`
- `/survey`

Study-mode behavior now includes:

- page enter / leave logging
- study banner metadata
- frozen snapshot context on library / rankings
- per-task actionability prompts
- survey capture
- explicit study resume / continue entry points

Relevant files:

- `src/components/research/EventLoggerProvider.tsx`
- `src/components/study/ActionabilityPrompt.tsx`
- `src/app/assessment/result/page.tsx`
- `src/app/diagnose/page.tsx`
- `src/app/plan/page.tsx`
- `src/app/profile/page.tsx`
- `src/app/survey/page.tsx`

### 3. Study data persistence and export are working

Remote study data now writes to Supabase tables for:

- `study_participants`
- `study_sessions`
- `study_artifacts`
- `study_task_ratings`
- `event_logs`
- `survey_responses`

The current export path supports:

- per-table export
- filtered study bundle export by `participantId`, `sessionId`, or `snapshotId`
- derived metrics
- actionability summaries
- open-feedback rows extracted from survey responses

Study bundle output currently includes:

- participant registry
- study sessions
- study artifacts
- task ratings
- events
- `derivedMetrics`
- `actionabilitySummary`
- `openFeedbackRows`

Relevant files:

- `src/app/admin/export/page.tsx`
- `src/lib/researchData.ts`
- `src/types/study.ts`
- `supabase/research_infra.sql`
- `supabase/study_mode.sql`

### 4. Bilingual study behavior is substantially improved

The current codebase now has:

- study-language lock at provider level
- survey copy that follows `session.language`
- reduced English leftovers in key Chinese study surfaces
- bilingual content cues on main recommendation surfaces
- `Original title` labeling for cross-language content browsing

Bilingual content cues now appear across:

- library cards
- diagnose recommendation cards
- plan content cards
- creator modal content cards
- homepage hot content cards

Relevant files:

- `src/components/study/StudyProvider.tsx`
- `src/app/survey/page.tsx`
- `src/components/library/ContentCard.tsx`
- `src/components/diagnose/DiagnoseResult.tsx`
- `src/components/plan/DayPlanCard.tsx`
- `src/components/rankings/CreatorDetailModal.tsx`
- `src/components/home/HotContentSection.tsx`
- `src/lib/i18n/dictionaries/en.ts`
- `src/lib/i18n/dictionaries/zh.ts`

### 5. Profile has been reshaped into a study continuation hub

`/profile` now supports three explicit continuation entry points:

- continue last practice
- revisit saved plan
- revisit last diagnosis

This exists in:

- study mode
- signed-in non-study profile

Study progress now stores dedicated diagnosis recovery metadata instead of relying only on last visited path.

Relevant files:

- `src/app/profile/page.tsx`
- `src/app/diagnose/page.tsx`
- `src/types/study.ts`

### 6. Researcher support tooling exists

The repo now includes:

- env-gated researcher overlay
- study doc consistency validation
- remote write validation

The overlay can show:

- participant ID
- inferred task ID
- language
- snapshot version
- actionability completion state
- SUS completion state

Relevant files:

- `src/components/study/ResearcherOverlay.tsx`
- `src/lib/study/docConsistency.ts`
- `scripts/validate-study-docs.ts`
- `scripts/verify-study-remote.ts`
- `.env.example`

## What Was Completed Across The Recent PR Wave

### PR0 / PR1 foundation

- study-mode schema and APIs
- session start / end
- local + remote study session persistence
- participant registry
- study artifact structure

### PR2 research instrumentation

- page-level event logging
- task actionability prompt
- remote task rating persistence
- deterministic snapshot logging
- study export bundle foundation

### PR3 lightweight recommendation explanation layer

- `why this viewed` interactions for:
  - diagnosis content
  - content cards
  - creator recommendations
- export metrics now count explanation views by target type

### PR4 bilingual study consistency

- language lock behavior fixed
- survey language follows session
- active study language overrides stale app-language storage
- Chinese residual study labels cleaned up

### PR5 bilingual content surface polish

- language badges
- subtitle badges
- `Original title` metadata
- content-language filtering in library
- bilingual cues propagated beyond library

### PR6 continue-practice recovery

- explicit continue cards in profile
- study diagnosis resume metadata
- non-study profile aligned with study profile for practice re-entry

### PR7 researcher operations and export closure

- researcher overlay
- `openFeedbackRows` in export
- study doc consistency validation
- repaired research doc entry points

## Current Confirmed Production / Data State

- `main` is deployed on Vercel production
- real study rows now write to Supabase
- real event logs now appear for participants such as `P001`
- current production snapshot is `2026-03-29-v1`

Important operational reality:

- when server-side Supabase env is missing, `/api/study/session/start` returns:
  - `{"ok":true,"persisted":false}`
- after Vercel production env was corrected, real rows started appearing in:
  - `study_participants`
  - `study_sessions`
  - `event_logs`

This means the current remote pipeline is now usable, but this failure mode is still important for future UX hardening.

## Known Current Constraints And Pain Points

### 1. Study-start persistence failure is too silent

The code path still allows local study start even if remote persistence is unavailable.
That was operationally risky during pilot setup because the participant could proceed while the researcher believed data was being stored remotely.

Relevant files:

- `src/app/api/study/session/start/route.ts`
- `src/lib/study/client.ts`
- `src/components/study/StudyProvider.tsx`

### 2. Participant ID can be unintentionally reused

`/study/start` defaults `participantId` from:

- query param
- otherwise active local study session

This is useful for resume, but risky for moderated testing on a shared machine.
It already caused confusion during manual validation because the field appeared to be “stuck” on a previous participant.

Relevant files:

- `src/app/study/start/page.tsx`
- `src/lib/study/session.ts`
- `src/lib/study/config.ts`

### 3. Study-phase task framing is still implicit

The system now logs tasks correctly, but participants still need facilitator guidance to understand:

- what counts as Task 1 / 2 / 3
- when they are “done” with a task
- what to do next

This is a product-logic gap more than a data gap.

### 4. `/video-diagnose` is hidden for study, but residual product logic remains

The study phase correctly blocks video diagnose itself, and some study-mode surfaces hide its CTA.
However, the overall codebase still contains non-study video-diagnose logic and history surfaces.

So the repo is in a hybrid state:

- research scope says “exclude video diagnose”
- product code still keeps it alive for non-study mode

That is acceptable, but it means any interaction refactor must be careful about:

- study-mode gating
- non-study fallback behavior
- lingering copy that assumes video diagnose is a normal next step

Relevant files:

- `src/app/video-diagnose/page.tsx`
- `src/components/home/HeroSection.tsx`
- `src/components/diagnose/DiagnoseResult.tsx`
- `src/app/profile/page.tsx`
- `src/components/layout/Header.tsx`

### 5. Some local docs may lag the code

The current code should be treated as the source of truth over local notes.
When in doubt, verify against `src/` rather than docs.

- [[research/study-mode]] — check for `/video-diagnose` references if the pilot flow is updated
- [[research/study-snapshot]] — verify snapshot identifiers match current `snapshotId`

## Best Candidates For The Next Interaction-Logic Upgrade

### Priority A: operator-safe study start

This is the most urgent interaction upgrade area.

Best improvements:

- surface remote persistence status directly on `/study/start`
- block progression if remote persistence fails in research mode
- add an explicit “switch participant / clear prior session” action
- make the active participant / session state more visible before the test begins

### Priority B: stronger task framing for moderated studies

Participants still benefit from facilitator explanation because the app does not yet strongly telegraph:

- current task
- completion state
- next expected action

Best improvements:

- add visible task framing in study mode
- add “you have completed this task” transitions
- add more explicit next-step CTA wording between assessment, diagnose, plan, and survey

### Priority C: cleaner study-only navigation logic

The codebase is now functional, but study mode still rides on top of a broader product shell.
A tighter study-only navigation layer would reduce confusion and remove dead-end paths.

Best improvements:

- audit all study-mode CTAs for scope consistency
- reduce residual non-study affordances during active sessions
- make allowed next routes more deliberate

### Priority D: researcher feedback and QA visibility

The overlay is useful, but still minimal.

Best improvements:

- expose remote write health more clearly
- show session creation success more explicitly
- give researchers a lighter-weight live checklist view during moderated sessions

## Concrete Files Most Likely To Matter For The Next UX Pass

### Session start / session state

- `src/app/study/start/page.tsx`
- `src/components/study/StudyProvider.tsx`
- `src/lib/study/client.ts`
- `src/lib/study/session.ts`
- `src/lib/study/config.ts`

### Task flow and transitions

- `src/app/assessment/page.tsx`
- `src/app/assessment/result/page.tsx`
- `src/app/diagnose/page.tsx`
- `src/app/plan/page.tsx`
- `src/app/profile/page.tsx`
- `src/app/survey/page.tsx`

### Study logging / export consequences

- `src/components/research/EventLoggerProvider.tsx`
- `src/lib/eventLogger.ts`
- `src/lib/researchData.ts`
- `src/components/study/ActionabilityPrompt.tsx`
- `src/components/study/ResearcherOverlay.tsx`

### Study gating and residual product entry points

- `src/components/home/HeroSection.tsx`
- `src/components/diagnose/DiagnoseResult.tsx`
- `src/components/layout/Header.tsx`
- `src/app/video-diagnose/page.tsx`

## Bottom-Line Assessment

The repo is no longer just a prototype with scattered research hooks.
It is now a working study-ready build with:

- reproducible study sessions
- remote research persistence
- structured event logging
- task-level actionability capture
- filtered export bundles
- bilingual study support
- continuation flows for moderated tasks
- basic researcher tooling

The next phase should therefore not be “add more infrastructure.”
The next phase should be **interaction-logic refinement**:

- make study start safer
- make task boundaries more legible
- make next actions more explicit
- reduce hybrid product/study confusion

That is the highest-leverage path for the next round of user-testing upgrades.

## Next Interaction Upgrade PR Plan

This section converts the upgrade directions above into an execution-ready PR sequence.
The goal is to improve moderated-study usability without reopening already-stable research infrastructure.

### Planning Rules For This Next Phase

- Keep snapshot, export shape, and Supabase schema stable unless a PR explicitly requires a small additive field.
- Do not broaden scope into ranking logic, recommendation algorithms, or non-study growth features.
- Preserve the current study task structure:
  - `task_1_problem_entry`
  - `task_2_assessment_entry`
  - `task_3_action_or_revisit`
- Treat `/video-diagnose` as out of scope for study mode, even if non-study code remains.
- Prefer incremental PRs that can be tested in production-like pilot conditions immediately after merge.

### PR1: Operator-Safe Study Start

**Goal**

Make `/study/start` safe for moderated testing by preventing silent bad starts, making the active participant/session obvious, and giving the moderator an explicit reset path.

**Why First**

- This is the highest-risk operational gap.
- It directly affects data validity before any downstream interaction improvements matter.

**Dependencies**

- none beyond current `main`

**Primary files**

- Modify: `src/app/study/start/page.tsx`
- Modify: `src/components/study/StudyProvider.tsx`
- Modify: `src/lib/study/client.ts`
- Modify: `src/lib/study/session.ts`
- Modify: `src/lib/study/localData.ts`
- Modify: `src/lib/i18n/dictionaries/en.ts`
- Modify: `src/lib/i18n/dictionaries/zh.ts`
- Test: `src/__tests__/study-session-start-route.test.ts`
- Test: `src/__tests__/language-switcher.test.tsx`
- Test: `src/__tests__/app-smoke.test.tsx`
- Add or update: a focused `study-start` interaction test if current coverage is too indirect

**Intended changes**

- Show whether study start was:
  - created locally only
  - persisted remotely
- If remote persistence fails, block the “successful start” path for formal study mode instead of letting the participant continue silently.
- Show a visible active-session panel before start when local session data exists:
  - participant ID
  - language
  - session ID
  - snapshot
- Add a moderator-facing reset / switch-participant action on the start page.
- Make it obvious when the participant field was prefilled from an existing session.

**Acceptance criteria**

- A moderator can clearly tell whether the session is safe to use for formal data collection.
- A participant cannot accidentally continue into a formal study flow after `persisted:false`.
- A reused local session is visibly explained and can be cleared from the start page.
- Starting a fresh participant in the same browser is no longer ambiguous.

**Verification**

- targeted `vitest` tests for start-page success, failure, and reused-session states
- `npm test -- src/__tests__/study-session-start-route.test.ts src/__tests__/app-smoke.test.tsx`
- manual browser check:
  - fresh start
  - reused local session
  - simulated remote failure path

### PR2: Explicit Task Framing And Transition States

**Goal**

Make the study task boundaries legible to participants by showing where they are, what the current task is, and what the expected next action should be after each milestone.

**Why Second**

- Once safe session start exists, the next biggest usability gap is participant confusion about what to do next.
- This is the most direct interaction-logic improvement for moderated sessions.

**Dependencies**

- PR1 recommended first, but not blocked by schema work

**Primary files**

- Modify: `src/app/assessment/page.tsx`
- Modify: `src/app/assessment/result/page.tsx`
- Modify: `src/app/diagnose/page.tsx`
- Modify: `src/app/plan/page.tsx`
- Modify: `src/app/profile/page.tsx`
- Modify: `src/app/survey/page.tsx`
- Modify: `src/components/study/StudyBanner.tsx`
- Modify: `src/components/study/ActionabilityPrompt.tsx`
- Modify: `src/lib/i18n/dictionaries/en.ts`
- Modify: `src/lib/i18n/dictionaries/zh.ts`
- Test: `src/__tests__/app-smoke.test.tsx`
- Test: `src/__tests__/actionability-prompt.test.tsx`
- Test: `src/__tests__/survey-localization.test.tsx`

**Intended changes**

- Add explicit study-task framing in active study mode:
  - current task label
  - one-line task instruction
  - completion state
- Add clearer task completion transitions after:
  - diagnosis result viewed
  - assessment result viewed
  - plan generated / revisit completed
- Tighten CTA copy so each step says what to do next instead of relying on generic navigation wording.
- Ensure the actionability prompt reads as part of the task flow, not as a detached extra question.

**Acceptance criteria**

- Participants can tell which task they are currently doing without facilitator explanation.
- After each task milestone, the next recommended action is visually unambiguous.
- The actionability prompt feels like the formal end of a task rather than a surprise interruption.

**Verification**

- smoke tests for the new study-task framing across assessment, diagnose, and plan
- language tests to ensure framing remains consistent in `zh` and `en`
- quick moderated dry run with one pilot participant or researcher acting as participant

### PR3: Study-Only Navigation Cleanup

**Goal**

Reduce hybrid product/study confusion by making active study navigation more deliberate and suppressing irrelevant affordances during an active research session.

**Why Third**

- Task framing should land before broader navigation cleanup, otherwise the product shell changes are harder to evaluate.

**Dependencies**

- PR2 preferred first because task framing informs which routes should remain prominent

**Primary files**

- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/home/HeroSection.tsx`
- Modify: `src/components/diagnose/DiagnoseResult.tsx`
- Modify: `src/app/profile/page.tsx`
- Modify: `src/app/video-diagnose/page.tsx`
- Modify: `src/lib/i18n/dictionaries/en.ts`
- Modify: `src/lib/i18n/dictionaries/zh.ts`
- Test: `src/__tests__/app-smoke.test.tsx`
- Test: `src/__tests__/surface-localization.test.tsx`

**Intended changes**

- Audit all study-mode CTAs and suppress ones that point participants toward out-of-scope or ambiguous flows.
- Decide which top-level nav items remain available during study mode and which should be visually de-emphasized or hidden.
- Ensure any remaining `/video-diagnose` references are:
  - absent in study mode where possible
  - clearly blocked where they must remain for shared code paths
- Tighten profile and diagnosis surfaces so they reinforce the study flow rather than the general product catalog.

**Acceptance criteria**

- An active study participant no longer sees confusing invitations into out-of-scope flows.
- Study-mode header and page CTAs feel like one coherent research route.
- Residual `/video-diagnose` references in study mode are either removed or intentionally explained.

**Verification**

- smoke tests covering study-mode CTA visibility
- localization regression checks for `zh` and `en`
- manual pass through:
  - `/`
  - `/diagnose`
  - `/profile`
  - `/video-diagnose`
  under active study mode

### PR4: Researcher Live QA And Session Health Feedback

**Goal**

Turn the existing researcher overlay into a more practical live QA aid for moderated sessions.

**Why Fourth**

- This is useful, but not strictly required to keep participants on task.
- It becomes more valuable after PR1-PR3 make the participant-facing flow cleaner.

**Dependencies**

- PR1 strongly recommended because remote-write health should reuse the safer study-start semantics

**Primary files**

- Modify: `src/components/study/ResearcherOverlay.tsx`
- Modify: `src/components/study/StudyProvider.tsx`
- Modify: `src/lib/study/client.ts`
- Modify: `src/lib/study/localData.ts`
- Modify: `src/lib/eventLogger.ts`
- Modify: `src/lib/i18n/dictionaries/en.ts`
- Modify: `src/lib/i18n/dictionaries/zh.ts`
- Test: `src/__tests__/researcher-overlay.test.tsx`
- Test: `src/__tests__/app-smoke.test.tsx`

**Intended changes**

- Add visible session health states such as:
  - remote session persisted
  - actionability submitted for current task
  - survey completed
- Consider a lightweight “checklist” or “current step” hint for moderators.
- Make it faster to detect:
  - wrong participant
  - wrong language
  - missing remote persistence
  - incomplete end-of-study capture

**Acceptance criteria**

- A moderator can glance at the screen and confirm whether the current participant/session is valid.
- The overlay reduces the need to alt-tab into Supabase during active moderated sessions.
- The overlay remains optional and fully gated behind env configuration.

**Verification**

- overlay tests for enabled / disabled states
- task-state tests for actionability and survey completion summaries
- manual QA with `NEXT_PUBLIC_ENABLE_RESEARCHER_OVERLAY=true`

## Suggested Execution Order

1. PR1: Operator-safe study start
2. PR2: Explicit task framing and transition states
3. PR3: Study-only navigation cleanup
4. PR4: Researcher live QA and session health feedback

This order keeps the most data-validity-sensitive work first, then improves participant comprehension, then tightens the shell, then improves moderator tooling.

## Non-Goals For This Plan

- changing frozen ranking logic
- changing frozen library ordering
- redesigning diagnosis rules
- changing export schema in a breaking way
- reactivating `/video-diagnose` for study mode
- broad non-study product redesign

## Open Ambiguities To Resolve Before Coding

- Should PR1 fully hard-block study progression on remote persistence failure, or allow a clearly labeled “local dry run only” path for internal debugging?
- Should task framing be shown only in study mode, or also softly reused in non-study flows?
- In PR3, should the study header become a stricter reduced nav, or should full nav remain visible but selectively disabled?
- In PR4, should researcher health status come only from local state, or should it also reflect server-confirmed write success where available?

## Definition Of Done For The Interaction Upgrade Phase

- Moderated study sessions can be started safely without accidental participant carry-over.
- Participants can understand the current task and next step with minimal facilitator explanation.
- Study-mode navigation no longer exposes confusing product affordances.
- Researchers can quickly confirm session validity and task-completion health during live testing.
