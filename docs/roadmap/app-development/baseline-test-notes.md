# Baseline Test Notes for `app-development`

Date: 2026-04-08

## Scope

This note records the accepted PR1-PR6 checkpoints, the accepted post-PR6 cleanup slices, and the still-red baseline that remains outside the active consumer app branch slices.

## Test infrastructure clarification

The initial import-resolution failures were not reproduced after a clean rerun of the test suite.

Observed cause:
- The first baseline check incorrectly started `npm install` and `npm test` in parallel in the new worktree.
- That likely caused Vitest to run against a partially populated `node_modules`, which produced transient `@testing-library/jest-dom` resolution errors involving `aria-query` and `dom-accessibility-api`.

Current status:
- `npm install` completed successfully in the worktree.
- A clean `npm test` rerun is now runnable and does not show the earlier import-resolution failures.
- `npm run lint` is currently non-blocking for PR1/PR2 checkpointing because `next lint` enters the first-time ESLint setup prompt instead of running non-interactively in this repo.

## Accepted checkpoint

- PR1 consumer-shell changes are accepted in scope and remain isolated in this branch.
- PR2 intake-boundary changes are accepted in scope and remain isolated in this branch.
- PR3 unified consumer diagnose flow is accepted in scope and remains isolated in this branch.
- PR4 deterministic 7-step plan-core refactor is accepted in scope and remains isolated in this branch.
- PR5 content-catalog normalization and shared retrieval/ranking boundary are accepted in scope and remain isolated in this branch.
- PR6 consumer-vs-study boundary hardening is accepted in scope and remains isolated in this branch.
- The post-PR6 study-mode cleanup project is being executed one slice at a time; accepted cleanup slices should keep the PR1-PR6 consumer path stable while reducing legacy study coupling.
- Study-mode code remains present in the branch and is not being deleted as part of PR1 or PR2.
- Unrelated full-suite reds remain intentionally deferred while the cleanup project removes study-mode coupling slice by slice.

## PR2 verification surface

- PR2 uses targeted intake tests plus build verification.
- Passing targeted PR2 tests:
  - `src/__tests__/intake-schema.test.ts`
  - `src/__tests__/intake-normalization.test.ts`
  - `src/__tests__/intake-route.test.ts`
  - `src/__tests__/diagnose-intake-integration.test.ts`

## PR3 verification surface

- PR3 uses targeted diagnose-flow tests plus build verification.
- Passing targeted PR3 tests:
  - `src/__tests__/diagnose-flow-pr3.test.ts`
  - `src/__tests__/consumer-diagnose-pr3.test.tsx`
- Passing combined targeted PR1 + PR2 + PR3 checkpoint:
  - `29 / 29` tests
- `npm run build` passes after PR3.
- Remaining full-suite reds below are still classified as `PR1-touched`, `PR3-touched`, `pre-existing`, or `deferred`; they are not being treated as PR3 blockers unless the PR3 change directly regresses an accepted checkpoint surface.

## PR4 verification surface

- PR4 uses targeted plan-core tests plus the existing plan-context / deep-overlay checks and build verification.
- Passing targeted PR4 tests:
  - `src/__tests__/plan-core-pr4.test.ts`
  - `src/__tests__/plan-scene-specificity-pr4.test.ts`
  - `src/__tests__/deep-plan-overlay.test.ts`
  - `src/__tests__/plan-context.test.ts`
  - `src/__tests__/plan-rationale.test.ts`
- Passing combined targeted PR1 + PR2 + PR3 + PR4 checkpoint:
  - `44 / 44` tests
- `npm run build` passes after PR4.
- `npm run lint` remains non-blocking because `next lint` still enters the first-time ESLint setup prompt instead of running non-interactively in this repo.
- A fresh post-PR4 full-suite inventory still reports the same red-set size as the accepted PR3 checkpoint:
  - `25` failed tests
  - `7` failed files
- No new PR4-only red file was introduced by the deterministic plan-core refactor.

## 7-step semantic revision checkpoint

- User-facing plan semantics are now step-based on both `main` and `app-development`.
- Legacy internal names such as `DayPlan`, `plan.days`, `dayCount`, and `plan.day_expanded` remain temporarily for compatibility with storage, event exports, and accepted handoff contracts.
- Passing targeted app-development checkpoint after the 7-step revision:
  - `49 / 49` tests
  - includes accepted PR1 + PR2 + PR3 + PR4 suites plus `src/__tests__/plan-step-semantics.test.tsx`
- `npm run build` passes after the 7-step revision.
- Fresh post-revision full-suite inventory:
  - `24` failed tests
  - `7` failed files
- `npm run lint` remains non-blocking because `next lint` still enters the first-time ESLint setup prompt instead of running non-interactively in this repo.
- `src/__tests__/deep-diagnose-orchestrator.test.tsx` remains `PR3-touched` and `deferred`.
- No new accepted-checkpoint red file was introduced by the 7-step semantic revision.

## Narrow localization cleanup checkpoint

- The accepted 7-step checkpoint now also includes the supported plan-adjacent localization cleanup for `bilingual-rendering` and `surface-localization`.
- Passing targeted cleanup verification:
  - `src/__tests__/bilingual-rendering.test.tsx`
  - `src/__tests__/surface-localization.test.tsx`
- `npm run build` passes after the cleanup.
- Fresh post-cleanup full-suite inventory:
  - `20` failed tests
  - `5` failed files
- `src/__tests__/bilingual-rendering.test.tsx` is no longer a remaining red file.
- `src/__tests__/surface-localization.test.tsx` is no longer a remaining red file.

## PR5 content-catalog checkpoint

- PR5 introduces a normalized content-catalog layer and a shared retrieval/ranking boundary for diagnosis and plan.
- `ContentItem` remains the current UI-facing shape in this slice.
- PR5 keeps `/library` and `/rankings` frozen; no feed-like UI or live platform integration was added.
- Retrieval remains conservative:
  - capped recommendation count
  - `direct_source` required by default for diagnosis and plan recommendations
  - curated/direct sources ranked ahead of expanded/search-link entries
- Passing targeted PR5 tests:
  - `src/__tests__/content-catalog-normalization.test.ts`
  - `src/__tests__/content-catalog-retrieve.test.ts`
- Passing PR5-adjacent diagnosis regression verification:
  - `src/__tests__/diagnosis-matching.test.ts`
  - `src/__tests__/diagnosis-regression-realphrases.test.ts`
  - `src/__tests__/scenario-handoff.test.ts`
- Passing expanded targeted checkpoint after PR5:
  - `124 / 124` tests
- `npm run build` passes after PR5.
- Fresh post-PR5 full-suite inventory:
  - `19` failed tests
  - `4` failed files
- PR5 does not introduce a new accepted-surface red file in diagnosis, plan, intake, consumer shell, or frozen study ordering.

## PR6 boundary-hardening checkpoint

- PR6 centralizes the consumer-route boundary for pending study setup and active study sessions.
- Accepted consumer routes `/`, `/diagnose`, and `/plan` no longer redirect because `pendingStudySetup` is true without an active study session.
- Header and bottom navigation visibility now follow the route/app boundary instead of leaked study onboarding state.
- Study artifact persistence still runs when an active study session explicitly owns the flow.
- Passing targeted PR6 tests:
  - `src/__tests__/consumer-boundary.test.ts`
  - `src/__tests__/plan-boundary-pr6.test.tsx`
- Passing combined targeted checkpoint after PR6:
  - `126 / 126` tests
- `npm run build` passes after PR6.
- Fresh post-PR6 full-suite inventory:
  - `21` failed tests
  - `4` failed files
- PR6 does not introduce a new remaining red file on an accepted consumer surface.
- The only PR6-intersecting remaining reds are two stale `app-smoke` assertions that still expect missing-session study setup to block consumer routes; they remain deferred.

## Study-mode cleanup Slice A checkpoint

- Slice A decouples the global app shell from `StudyProvider`.
- `AppShellProvider` now owns app language and consumer-shell state for layout-level consumers.
- `Header`, `BottomNav`, and `I18nProvider` no longer require `StudyProvider` to mount.
- `ResearcherOverlay` is no longer mounted globally in the app layout.
- Passing targeted Slice A verification:
  - `src/__tests__/language-switcher.test.tsx`
  - `src/__tests__/consumer-shell-pr1.test.tsx`
  - `src/__tests__/consumer-boundary.test.ts`
  - `src/__tests__/plan-boundary-pr6.test.tsx`
  - `src/__tests__/plan-step-semantics.test.tsx`
  - `src/__tests__/surface-localization.test.tsx`
- Passing accepted targeted checkpoint after Slice A:
  - `126 / 126` tests
- `npm run build` passes after Slice A.
- `npm run lint` remains non-blocking because `next lint` still enters the first-time ESLint setup prompt instead of running non-interactively in this repo.
- Fresh post-Slice A full-suite inventory:
  - `19` failed tests
  - `4` failed files
- Slice A does not introduce a new remaining red file on an accepted consumer surface.

## Study-mode cleanup Slice B checkpoint

- Slice B removes study-only persistence branches from accepted consumer route code in `/diagnose` and `/plan`.
- Consumer-local diagnosis snapshots and plan drafts now live behind an app-shell route-state boundary instead of `src/lib/study/localData.ts`.
- Study artifact persistence for diagnose/plan is now centralized behind a study-owned helper and only runs when an active study session explicitly owns the flow.
- Passing targeted Slice B verification:
  - `src/__tests__/app-shell-route-state.test.ts`
  - `src/__tests__/plan-boundary-pr6.test.tsx`
  - `src/__tests__/consumer-diagnose-pr3.test.tsx`
  - `src/__tests__/diagnose-flow-pr3.test.ts`
  - `src/__tests__/diagnose-intake-integration.test.ts`
  - `src/__tests__/plan-context.test.ts`
- Passing accepted targeted checkpoint after Slice B:
  - `147 / 147` tests
- `npm run build` passes after Slice B.
- `npm run lint` remains non-blocking because `next lint` still enters the first-time ESLint setup prompt instead of running non-interactively in this repo.
- Fresh post-Slice B full-suite inventory:
  - `19` failed tests
  - `4` failed files
- Slice B does not introduce a new remaining red file on an accepted consumer surface.

## Study-mode cleanup Slice C1 checkpoint

- Slice C1 removes study-mode gating, study snapshot logging, study ordering selection, and study bookmark branches from the shared discovery routes `\/library` and `\/rankings`.
- `library` and `rankings` now behave as consumer routes even when legacy study state is present.
- Passing targeted Slice C1 verification:
  - `src/__tests__/discovery-route-boundary-cleanup.test.tsx`
  - `src/__tests__/bilingual-rendering.test.tsx`
  - `src/__tests__/surface-localization.test.tsx`
- Passing accepted targeted checkpoint after Slice C1:
  - `163 / 163` tests
- `npm run build` passes after Slice C1.
- `npm run lint` remains non-blocking because `next lint` still enters the first-time ESLint setup prompt instead of running non-interactively in this repo.
- Fresh post-Slice C1 full-suite inventory:
  - `21` failed tests
  - `4` failed files
- Slice C1 does not introduce a new remaining red file on an accepted consumer surface.

## Study-mode cleanup Slice C2 checkpoint

- Slice C2 removes the remaining study-setup gate and study-only persistence leakage from the shared `\/assessment` and `\/assessment\/result` routes.
- `assessment` and `assessment/result` now behave as consumer routes unless an active study session explicitly owns the flow.
- Passing targeted Slice C2 verification:
  - `src/__tests__/assessment-flow.test.tsx`
  - `src/__tests__/assessment-boundary-cleanup.test.tsx`
- Passing accepted targeted checkpoint after Slice C2:
  - `173 / 173` tests
- `npm run build` passes after Slice C2.
- `npm run lint` remains non-blocking because `next lint` still enters the first-time ESLint setup prompt instead of running non-interactively in this repo.
- Fresh post-Slice C2 full-suite inventory:
  - `23` failed tests
  - `5` failed files
- Slice C2 does not introduce a new accepted-consumer-surface blocker, but it does surface one additional deferred full-suite-only study-route failure in `survey-localization.test.tsx`.

## Study-mode cleanup Slice C3 checkpoint

- Slice C3 removes the study-session dashboard override and direct study-local-data reads from the shared `\/profile` route.
- `profile` now stays on the consumer records surface even when legacy study state exists.
- Passing targeted Slice C3 verification:
  - `src/__tests__/profile-boundary-cleanup.test.tsx`
  - `src/__tests__/surface-localization.test.tsx`
  - `src/__tests__/app-smoke.test.tsx -t "shows the same continue-practice entry points for a signed-in non-study profile"`
- Passing accepted targeted checkpoint after Slice C3:
  - `175 / 175` tests
- `npm run build` passes after Slice C3.
- `npm run lint` remains non-blocking because `next lint` still enters the first-time ESLint setup prompt instead of running non-interactively in this repo.
- Fresh post-Slice C3 full-suite inventory:
  - `26` failed tests
  - `4` failed files
- Slice C3 does not introduce a new accepted-consumer-surface blocker.

## Study-mode cleanup Slice D1 checkpoint

- Slice D1 deletes explicit study-only actionability and researcher surfaces that are no longer part of the accepted consumer app direction.
- Removed explicit study-only code:
  - `src/components/study/ActionabilityPrompt.tsx`
  - `src/components/study/ResearcherOverlay.tsx`
  - `src/components/study/StudyBanner.tsx`
  - `src/app/study/actionability-preview/page.tsx`
  - `src/lib/study/taskRatings.ts`
  - `src/app/api/study/task-ratings/route.ts`
- Removed dedicated tests for those deleted study-only surfaces:
  - `src/__tests__/actionability-prompt.test.tsx`
  - `src/__tests__/researcher-overlay.test.tsx`
  - `src/__tests__/task-ratings.test.ts`
- Updated `src/__tests__/surface-localization.test.tsx` to stop asserting removed study-only UI and keep coverage on supported surfaces.
- Passing targeted Slice D1 verification:
  - `src/__tests__/content-catalog-retrieve.test.ts`
  - `src/__tests__/surface-localization.test.tsx`
  - `src/__tests__/profile-boundary-cleanup.test.tsx`
- Passing accepted targeted checkpoint after Slice D1:
  - `173 / 173` tests
- `npm run build` passes after Slice D1.
- `npm run lint` remains non-blocking because `next lint` still enters the first-time ESLint setup prompt instead of running non-interactively in this repo.
- Fresh post-Slice D1 full-suite inventory:
  - `26` failed tests
  - `4` failed files

## Study-mode cleanup Slice D9 checkpoint

- Slice D9 trims the remaining dead helper surface under `src/lib/study/` without touching accepted consumer routes, the kept legacy `\/video-diagnose` route, or the research/export stack.
- Removed dead study-only helpers that no longer back runtime app state, frozen ordering, hidden legacy routes, or admin export:
  - `src/lib/study/eventPersistence.ts`
  - `src/lib/study/docConsistency.ts`
  - `src/lib/study/remoteValidation.ts`
- Removed their dedicated tests:
  - `src/__tests__/study-doc-consistency.test.ts`
  - `src/__tests__/study-remote-diagnosis.test.ts`
  - `src/__tests__/study-remote-validation.test.ts`
- The remaining `src/lib/study/` surface is intentionally narrower and still limited to:
  - session/app-shell compatibility
  - frozen study snapshot and seeded ordering helpers
  - focused dwell metrics used by product-first event logging
  - legacy local storage keys still referenced by deferred tests
- Passing targeted Slice D9 verification:
  - `src/__tests__/study-provider-cleanup.test.tsx`
  - `src/__tests__/language-switcher.test.tsx`
  - `src/__tests__/study-library-order.test.ts`
  - `src/__tests__/study-rankings-order.test.ts`
  - `src/__tests__/focused-dwell.test.ts`
  - `src/__tests__/study-snapshot.test.ts`
- `npm run build` passes after Slice D9.
- `npm run lint` remains non-blocking because `next lint` still enters the first-time ESLint setup prompt instead of running non-interactively in this repo.

## Study-mode cleanup Slice D10 checkpoint

- Slice D10 trims the last broad legacy storage surface in `src/lib/study/localData.ts` down to the only persisted artifacts still intentionally kept:
  - diagnosis snapshots
  - plan drafts
- Removed dead local-study helpers for:
  - artifacts
  - task ratings
  - survey-session staging
  - bookmarks
  - study progress
  - last-path tracking
  - pending setup flags
  - bulk local-data clearing
- Trimmed `src/lib/study/config.ts` to the keys and study-freeze flags that still have real callers in runtime code or deferred legacy tests.
- Passing targeted Slice D10 verification:
  - `src/__tests__/study-plan-draft.test.ts`
  - `src/__tests__/app-shell-route-state.test.ts`
  - `src/__tests__/study-provider-cleanup.test.tsx`
  - `src/__tests__/language-switcher.test.tsx`
- `npm run build` passes after Slice D10.
- `npm run lint` remains non-blocking because `next lint` still enters the first-time ESLint setup prompt instead of running non-interactively in this repo.
- Slice D1 does not introduce a new accepted-consumer-surface blocker or a new remaining red file.

## Study-mode cleanup Slice D2 checkpoint

- Slice D2 deletes the remaining explicit study routes from the app surface:
  - `src/app/study/page.tsx`
  - `src/app/study/start/page.tsx`
  - `src/app/study/end/page.tsx`
  - `src/app/survey/page.tsx`
- Slice D2 also removes the dedicated `src/__tests__/survey-localization.test.tsx` suite and trims the last supported-surface localization coverage that referenced `StudyEndPage`.
- Shared route and shell cleanup included in this slice:
  - `src/lib/appMode.ts` no longer reserves `/study` or `/survey` as special shell-hiding prefixes
  - `src/lib/appShell/consumerBoundary.ts` no longer blocks any route on `pendingStudySetup`
  - accepted consumer routes no longer carry dead `/study/start` redirect branches in `src/app/diagnose/page.tsx` or `src/app/plan/page.tsx`
  - `src/app/page.tsx` no longer imports study state unnecessarily
- Passing targeted Slice D2 verification:
  - `src/__tests__/consumer-boundary.test.ts`
  - `src/__tests__/language-switcher.test.tsx`
  - `src/__tests__/surface-localization.test.tsx`
  - `src/__tests__/consumer-diagnose-pr3.test.tsx`
  - `src/__tests__/plan-boundary-pr6.test.tsx`
- Passing accepted targeted checkpoint after Slice D2:
  - `172 / 172` tests
- `npm run build` passes after Slice D2.
- `npm run lint` remains non-blocking because `next lint` still enters the first-time ESLint setup prompt instead of running non-interactively in this repo.
- Fresh post-Slice D2 full-suite inventory:
  - `4` failed tests
  - `4` failed files
- Slice D2 does not introduce a new accepted-consumer-surface blocker.

## Study-mode cleanup Slice D3 checkpoint

- Slice D3 removes the remaining dead study session lifecycle from `StudyProvider`.
- `StudyProvider` is now a read-only active-session bridge for app-shell language lock and event-logger session sync.
- Removed provider-owned study setup and session lifecycle responsibilities:
  - no `pendingStudySetup`
  - no `setPendingStudySetup`
  - no `startStudySession`
  - no `endStudySession`
- Deleted dead session start/end API routes:
  - `src/app/api/study/session/start/route.ts`
  - `src/app/api/study/session/end/route.ts`
- Deleted the dedicated session-start route test:
  - `src/__tests__/study-session-start-route.test.ts`
- Removed dead client/event helpers for session start/end transport from:
  - `src/lib/study/client.ts`
  - `src/lib/study/events.ts`
- Added provider cleanup coverage:
  - `src/__tests__/study-provider-cleanup.test.tsx`
- Passing targeted Slice D3 verification:
  - `src/__tests__/study-provider-cleanup.test.tsx`
  - `src/__tests__/language-switcher.test.tsx`
  - `src/__tests__/consumer-shell-pr1.test.tsx`
  - `src/__tests__/consumer-boundary.test.ts`
  - `src/__tests__/consumer-diagnose-pr3.test.tsx`
  - `src/__tests__/plan-boundary-pr6.test.tsx`
- Passing accepted targeted checkpoint after Slice D3:
  - `173 / 173` tests
- `npm run build` passes after Slice D3.
- `npm run lint` remains non-blocking because `next lint` still enters the first-time ESLint setup prompt instead of running non-interactively in this repo.
- Fresh post-Slice D3 full-suite inventory:
  - `4` failed tests
  - `4` failed files
- Slice D3 does not introduce a new accepted-consumer-surface blocker or a new remaining red file.

## Study-mode cleanup Slice D4 checkpoint

- Slice D4 removes the remaining study-artifact persistence path from accepted consumer routes.
- Deleted `src/lib/appShell/studyOwnedPersistence.ts`.
- Accepted consumer routes no longer write study artifacts or local study progress from:
  - `src/app/diagnose/page.tsx`
  - `src/app/plan/page.tsx`
  - `src/app/assessment/page.tsx`
  - `src/app/assessment/result/page.tsx`
- `plan` no longer treats a legacy study session as an already-recorded save state.
- `assessment/result` now uses the same consumer result-loading path even if legacy study session state still exists.
- Passing targeted Slice D4 verification:
  - `src/__tests__/consumer-diagnose-pr3.test.tsx`
  - `src/__tests__/plan-boundary-pr6.test.tsx`
  - `src/__tests__/assessment-boundary-cleanup.test.tsx`
- Passing accepted targeted checkpoint after Slice D4:
  - `140 / 140` tests
- `npm run build` passes after Slice D4.
- `npm run lint` remains non-blocking because `next lint` still enters the first-time ESLint setup prompt instead of running non-interactively in this repo.
- Fresh post-Slice D4 full-suite inventory:
  - `4` failed tests
  - failures remain concentrated in `4` deferred red files
- Slice D4 does not introduce a new accepted-consumer-surface blocker or a new remaining red file.

## Study-mode cleanup Slice D5 checkpoint

- Slice D5 simplifies the global event-logging boundary so the app shell no longer depends on study context just to mount route logging.
- `src/components/research/EventLoggerProvider.tsx` no longer:
  - reads `useStudy()`
  - writes `lastStudyPath`
  - logs study-session abandonment on unload
- The provider now treats global route logging as consumer-first and flushes the queue on unload without study-only branching.
- Added focused cleanup coverage:
  - `src/__tests__/event-logger-provider-cleanup.test.tsx`
- Passing targeted Slice D5 verification:
  - `src/__tests__/event-logger-provider-cleanup.test.tsx`
- Passing accepted targeted checkpoint after Slice D5:
  - `142 / 142` tests
- `npm run build` passes after Slice D5.
- `npm run lint` remains non-blocking because `next lint` still enters the first-time ESLint setup prompt instead of running non-interactively in this repo.
- Fresh post-Slice D5 full-suite inventory:
  - `4` failed tests
  - failures remain concentrated in the same `4` deferred red files
- Slice D5 does not introduce a new accepted-consumer-surface blocker or a new remaining red file.

## Study-mode cleanup Slice D6 checkpoint

- Slice D6 removes the remaining study-session bridge from shared app state and event logging.
- `src/components/study/StudyProvider.tsx` no longer syncs active sessions into the global event logger.
- `src/lib/eventLogger.ts` is now product-first by default:
  - no `currentStudySession` branch
  - no study-event queue or retry flush path
  - no study-session abandonment helper
  - `flushEventQueue()` is now a no-op consumer-safe boundary
  - `getStudyFlushFallbackLogs()` now returns an empty list
- Passing targeted Slice D6 verification:
  - `src/__tests__/study-provider-cleanup.test.tsx`
  - `src/__tests__/event-logger-provider-cleanup.test.tsx`
  - `src/__tests__/language-switcher.test.tsx`
- Passing accepted targeted checkpoint after Slice D6:
  - `142 / 142` tests
- `npm run build` passes after Slice D6.
- `npm run lint` remains non-blocking because `next lint` still enters the first-time ESLint setup prompt instead of running non-interactively in this repo.
- Fresh post-Slice D6 full-suite inventory:
  - `4` failed tests
  - failures remain concentrated in the same `4` deferred red files
- Slice D6 does not introduce a new accepted-consumer-surface blocker or a new remaining red file.

## Study-mode cleanup Slice D7 checkpoint

- Slice D7 deletes the unused write-side study event transport while preserving the read-side export path.
- Removed dead study event write code:
  - `src/app/api/study/event/route.ts`
  - `src/lib/study/events.ts`
  - `src/__tests__/study-events-client.test.ts`
- `src/app/api/study/events/route.ts` now only exposes the paged `GET` export path used by admin export.
- Added route-level cleanup coverage:
  - `src/__tests__/study-events-route.test.ts`
  - now asserts the old `POST` transport is gone
- Passing targeted Slice D7 verification:
  - `src/__tests__/study-events-route.test.ts`
- Passing accepted targeted checkpoint after Slice D7:
  - `145 / 145` tests
- `npm run build` passes after Slice D7.
- `npm run lint` remains non-blocking because `next lint` still enters the first-time ESLint setup prompt instead of running non-interactively in this repo.
- Fresh post-Slice D7 full-suite inventory:
  - `4` failed tests
  - failures remain concentrated in the same `4` deferred red files
- Slice D7 does not introduce a new accepted-consumer-surface blocker or a new remaining red file.

## Study-mode cleanup Slice D8 checkpoint

- Slice D8 deletes the hidden `video-diagnose` study-artifact transport and the now-unused artifact write API.
- Removed dead study artifact write code:
  - `src/lib/study/client.ts`
  - `src/app/api/study/artifact/route.ts`
- `src/app/video-diagnose/page.tsx` no longer imports study artifact transport, local study progress helpers, or the video artifact sanitizer.
- Removed the now-unused `sanitizeVideoDiagnosisArtifact(...)` helper from `src/lib/study/privacy.ts`.
- Added route-boundary regression coverage:
  - `src/__tests__/video-diagnose-boundary-cleanup.test.ts`
  - asserts the hidden video route no longer references the deleted study artifact path
- Passing targeted Slice D8 verification:
  - `src/__tests__/video-diagnose-boundary-cleanup.test.ts`
- Passing accepted targeted checkpoint after Slice D8:
  - `33 / 33` tests across the accepted consumer/checkpoint subset plus the new boundary test
- `npm run build` passes after Slice D8.
- `npm run lint` remains non-blocking because `next lint` still enters the first-time ESLint setup prompt instead of running non-interactively in this repo.
- Fresh post-Slice D8 full-suite inventory:
  - `4` failed tests
  - failures remain concentrated in the same `4` deferred red files
- Slice D8 does not introduce a new accepted-consumer-surface blocker or a new remaining red file.

## Remaining red tests after accepted study-mode cleanup Slice D8

Latest full-suite inventory summary after the accepted study-mode cleanup Slice D8:

- `4` failed tests
- `4` failed files

Classification labels:

- `PR1-touched`: directly intersects PR1 consumer-shell changes
- `PR3-touched`: directly intersects PR3’s removal of visible diagnose modes and promotion of inline follow-up
- `PR5-touched`: directly intersects PR5 content-catalog normalization or the shared retrieval/ranking boundary
- `PR6-touched`: directly intersects PR6 consumer/study route or persistence boundary hardening
- `cleanup-touched`: directly intersects the dedicated post-PR6 study-mode cleanup project
- `7-step-touched`: directly intersects the 7-step semantic revision and still asserts old weekly/day wording
- `pre-existing`: red that existed before the active PR checkpoint
- `deferred`: intentionally out of scope for the active checkpoint

### Resolved during PR1

- `src/__tests__/environment.test.ts`
  - `environment helpers routes post-assessment flow back to home in both environments`
  - status: now passing
- `src/__tests__/language-switcher.test.tsx`
  - `language switcher renders zh | en buttons in the header and switches to English`
  - status: now passing after updating the expectation to the consumer shell nav

### `src/__tests__/app-smoke.test.tsx`

`PR1-touched`
- resolved in a later smoke realignment pass:
  - home no longer gates on missing assessment
  - home no longer redirects because of leaked study state
  - library now shows the assessment-required empty state instead of redirecting
  - diagnose remains accessible without a saved assessment

Reason:
- Those old assertions conflicted directly with PR1 consumer-shell goals around diagnose-first entry and assessment redirect behavior.

`pre-existing`
- `app smoke tests renders assessment page and allows stepping through the simplified flow`
- `app smoke tests still allows an explicit retake even if a saved assessment result exists`
- `app smoke tests returns to the same question after leaving and coming back mid-assessment`
- `app smoke tests shows the actionability prompt after a study diagnosis result is shown`
- `app smoke tests stores the exact diagnose query path in study progress after a study diagnosis`
- `app smoke tests renders the current step-based plan page without crashing`

`deferred`
- All `pre-existing` `app-smoke` reds above are deferred for PR1 because they are not required to implement the consumer shell slice safely.
- The earlier stale missing-session study-gating checks on `/` and `/diagnose` were replaced with supported study-surface smoke coverage and are no longer part of the remaining-red set.

`cleanup-touched`
- resolved in a later smoke realignment pass:
  - library/rankings no longer assert legacy study snapshot logging
  - profile no longer asserts the removed study dashboard or study resume cards
  - assessment-based plan follow-up no longer expects a removed profile CTA

Reason:
- Those old assertions encoded the removed study-first behavior on shared consumer routes that were cleaned toward consumer-only semantics.

`deferred`
- No currently remaining `app-smoke` failure needs to be classified as `cleanup-touched` after the shared-route smoke realignment.

### `src/__tests__/docs-automation.test.ts`

- `pre-existing`
- `deferred`
- Suite currently fails to resolve `../../scripts/automation/lib/docsAutomation.mjs`

Reason:
- Unrelated to app shell, landing, navigation, diagnose entry, or assessment redirect behavior.

### `src/__tests__/deep-diagnose-orchestrator.test.tsx`

- `PR3-touched`
- `deferred`
- `deep diagnose orchestrator shows the inline deep module only in deep mode`
- `deep diagnose orchestrator hydrates deep mode from the route query`
- `deep diagnose orchestrator keeps deep reconstruction inside /diagnose and resets cleanly when leaving deep mode`

Reason:
- PR3 intentionally removes visible quick / standard / deep mode selection from the consumer diagnose flow.
- These tests assert the old separate deep-mode consumer UI and are now obsolete relative to the accepted PR3 direction.

### `src/__tests__/content-display.test.ts`

- `pre-existing`
- `deferred`
- `content display helpers does not leave any search-entry ids in plan template source data`

Reason:
- The only remaining red in this file is the search-entry fixture hygiene assertion, which remains pre-existing and deferred.

### PR5 classification update

- No currently remaining red file is classified as `PR5-touched`.
- The accepted PR5 verification surface is targeted catalog/retrieval tests plus the existing consumer-shell / intake / diagnose / plan checkpoint tests and build.
- Remaining red files continue to be treated as `PR3-touched`, `pre-existing`, or `deferred` unless a later change directly regresses the PR5 retrieval boundary.

### PR6 classification update

- No currently remaining red file is classified as a standalone `PR6-touched` blocker on an accepted consumer surface.
- The accepted PR6 verification surface is the new consumer-boundary tests plus the existing PR1-PR5 checkpoint suites and build.

### Cleanup classification update

- No currently remaining red file is classified as `cleanup-touched` after the accepted study-mode cleanup Slices A and B.
- The accepted cleanup Slice A verification surface is the shell/provider/localization boundary tests plus the existing PR1-PR6 checkpoint suites and build.
- The accepted cleanup Slice B verification surface is the neutral route-state helper tests plus diagnose/plan boundary regression tests, the accepted PR1-PR6 checkpoint suites, and build.
- The accepted cleanup Slice C1 verification surface is the shared discovery-route boundary tests plus the existing PR1-PR6 checkpoint suites and build.
- The accepted cleanup Slice C2 verification surface is the assessment boundary tests plus the existing PR1-PR6 checkpoint suites and build.
- The accepted cleanup Slice C3 verification surface is the profile boundary tests plus the existing PR1-PR6 checkpoint suites and build.
- The accepted cleanup Slice D1 verification surface is the explicit study-only deletion regression checks plus the existing PR1-PR6 checkpoint suites and build.
- The accepted cleanup Slice D2 verification surface is the explicit study-route deletion checks plus the existing PR1-PR6 checkpoint suites and build.
- The accepted cleanup Slice D3 verification surface is the provider/session-lifecycle cleanup checks plus the existing PR1-PR6 checkpoint suites and build.
- The accepted cleanup Slice D8 verification surface is the hidden video-diagnose boundary test plus the existing PR1-PR6 checkpoint subset and build.
- The accepted app-shell boundary-isolation slice verification surface is:
  - `src/__tests__/study-provider-cleanup.test.tsx`
  - `src/__tests__/consumer-diagnose-pr3.test.tsx`
  - `src/__tests__/plan-boundary-pr6.test.tsx`
  - `src/__tests__/assessment-boundary-cleanup.test.tsx`
  - plus the accepted PR1-PR6 checkpoint bundle and build
- The app-shell boundary-isolation slice moved accepted consumer routes and the shared diagnosis result surface off `useStudy()` and onto `useAppShell()`, while leaving `StudyProvider` as a compatibility bridge for legacy paths.
- No new accepted-surface red file remains after the slice.
- The currently remaining `cleanup-touched` red file is `src/__tests__/app-smoke.test.tsx`, now deferred because it still contains legacy smoke coverage that renders migrated consumer pages without the new app-shell test boundary and still mixes stale non-consumer expectations.
- The accepted study-provider isolation follow-up slice verification surface is:
  - `src/__tests__/language-switcher.test.tsx`
  - `src/__tests__/study-provider-cleanup.test.tsx`
  - `src/__tests__/video-diagnose-boundary-cleanup.test.ts`
  - plus the accepted PR1-PR6 checkpoint bundle and build
- The study-provider isolation follow-up slice removed `StudyProvider` from `src/app/layout.tsx` and moved the hidden `/video-diagnose` route onto `useAppShell()`.
- After this slice, no runtime app route imports `useStudy()` or `StudyProvider`.
- The follow-up deletion slice then removed `src/components/study/StudyProvider.tsx` entirely.
- After the deletion slice, the accepted consumer/runtime app no longer carries any mounted or isolated study-provider boundary; only app-shell state remains.

### Resolved during the 7-step cleanup slice

- `src/__tests__/plan-fixtures.test.ts`
  - `plan few-shot fixtures locks the deeper-plan shape for scenario-rich diagnosis cases`
  - status: now passing after aligning branch-specific fixture expectations with accepted 7-step and PR4 plan behavior

### Resolved during the localization cleanup slice

- `src/__tests__/bilingual-rendering.test.tsx`
  - `bilingual rendering uses the translated library bookmark login prompt in English mode`
  - `bilingual rendering renders the content-language filter in the English library flow`
  - status: now passing after aligning the test harness with the supported library ready-state and router mocks
- `src/__tests__/surface-localization.test.tsx`
  - `surface localization renders the current study-end confirmation flow in zh without leftover English labels`
  - `surface localization renders the current consumer header in zh without legacy beta or study-only labels`
  - status: now passing after updating supported-surface expectations to the accepted study-end confirmation flow and PR1/PR3 consumer header

## Practical implication

Do not treat the current red suite as one baseline bug to clean wholesale.

For the accepted PR1 + PR2 + PR3 + PR4 checkpoint:
- fix or replace only reds that directly block the active PR checkpoint
- keep using targeted checkpoint tests plus build as the active verification surface
- do not spend time on `deferred` failures unless a checkpoint code change directly worsens them
