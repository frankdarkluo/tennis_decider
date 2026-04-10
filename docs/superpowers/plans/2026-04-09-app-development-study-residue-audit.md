# App-Development Study Residue Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove study-only residue from `app-development` so the kept consumer surface (`/`, `/assessment`, `/diagnose`, `/plan`, `/library`, `/profile`, hidden `/video-diagnose`) no longer depends on study semantics, study storage, or study transport.

**Architecture:** Collapse shared app shell state to consumer-safe language and environment only, then delete study-owned branches from consumer routes instead of preserving compatibility paths. Keep `/video-diagnose` as an isolated hidden route and deprecate `/rankings` by removing its legacy behavior and visibility.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Testing Library

---

### Task 1: Neutral Shared Shell And Locale Types

**Files:**
- Modify: `src/components/app/AppShellProvider.tsx`
- Modify: `src/lib/i18n/config.tsx`
- Modify: `src/lib/i18n/provider.tsx`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/lib/environment.ts`
- Test: `src/__tests__/language-switcher.test.tsx`
- Test: `src/__tests__/study-provider-cleanup.test.tsx`

- [ ] Write failing tests that assert the app shell no longer reads study sessions or locks language behind active study state.
- [ ] Run `npm test -- src/__tests__/language-switcher.test.tsx src/__tests__/study-provider-cleanup.test.tsx` and confirm failure.
- [ ] Reduce `AppShellProvider` to consumer app state only: language, environment, loading, and `setLanguage`.
- [ ] Remove `StudyLanguage`, `studyMode`, `activeSession`, and `syncStudySession` from shared i18n/app-shell contracts.
- [ ] Re-run `npm test -- src/__tests__/language-switcher.test.tsx src/__tests__/study-provider-cleanup.test.tsx`.

### Task 2: Neutral Consumer Storage And Event Logging

**Files:**
- Modify: `src/lib/appShell/localRouteState.ts`
- Modify: `src/lib/eventLogger.ts`
- Modify: `src/types/research.ts`
- Modify: `src/components/research/EventLoggerProvider.tsx`
- Test: `src/__tests__/event-logger-provider-cleanup.test.tsx`
- Test: `src/__tests__/app-smoke.test.tsx`

- [ ] Write failing tests for neutral local restore keys/types and consumer-only event payloads.
- [ ] Run `npm test -- src/__tests__/event-logger-provider-cleanup.test.tsx src/__tests__/app-smoke.test.tsx`.
- [ ] Rename local route restore constants/types away from study naming while preserving current consumer restore behavior.
- [ ] Remove study/session fields and study flush fallback plumbing from base event logger contracts.
- [ ] Inline or move any still-needed dwell helpers out of `lib/study/*` into neutral logging code.
- [ ] Re-run the targeted event/storage tests.

### Task 3: Remove Study Branches From Kept Consumer Routes

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/assessment/page.tsx`
- Modify: `src/app/diagnose/page.tsx`
- Modify: `src/app/plan/page.tsx`
- Modify: `src/app/library/page.tsx`
- Modify: `src/app/profile/page.tsx`
- Modify: `src/components/diagnose/DiagnoseResult.tsx`
- Modify: `src/lib/i18n/dictionaries/zh.ts`
- Modify: `src/lib/i18n/dictionaries/en.ts`
- Test: `src/__tests__/consumer-shell-pr1.test.tsx`
- Test: `src/__tests__/assessment-boundary-cleanup.test.tsx`
- Test: `src/__tests__/consumer-diagnose-pr3.test.tsx`
- Test: `src/__tests__/plan-boundary-pr6.test.tsx`
- Test: `src/__tests__/profile-boundary-cleanup.test.tsx`

- [ ] Write or update failing tests so kept consumer routes no longer mention legacy study sessions, study quick-continue panels, or study-only persistence paths.
- [ ] Run the route-level targeted suite and confirm red.
- [ ] Delete study-specific copy, branches, and persistence calls from the kept consumer routes.
- [ ] Keep the remaining UI concise and consumer-first; no compatibility banners or “legacy study state” branches.
- [ ] Re-run the targeted route suite.

### Task 4: Deprecate `/rankings` And Remove Legacy Ordering Hooks

**Files:**
- Modify: `src/app/rankings/page.tsx`
- Modify: `src/lib/appMode.ts`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/BottomNav.tsx`
- Modify: `src/lib/rankings/studyOrder.ts`
- Modify: `src/lib/i18n/dictionaries/zh.ts`
- Modify: `src/lib/i18n/dictionaries/en.ts`
- Test: `src/__tests__/discovery-route-boundary-cleanup.test.tsx`
- Test: `src/__tests__/app-smoke.test.tsx`
- Delete: `src/__tests__/study-rankings-order.test.ts`

- [ ] Write failing tests for rankings deprecation or hidden-route behavior with no study ordering semantics.
- [ ] Run the rankings-focused tests and confirm red.
- [ ] Remove rankings from visible consumer navigation and strip `studyOrder` special behavior.
- [ ] Either render a deprecation/redirect path or a minimal hidden-route shell with no study-specific hooks.
- [ ] Delete rankings-specific study-order tests.
- [ ] Re-run rankings-focused verification.

### Task 5: Isolate Hidden `/video-diagnose`

**Files:**
- Modify: `src/app/video-diagnose/page.tsx`
- Modify: `src/components/diagnose/DiagnoseResult.tsx`
- Modify: `src/app/profile/page.tsx`
- Modify: `src/lib/videoDiagnose.ts`
- Test: `src/__tests__/video-diagnose-boundary-cleanup.test.ts`
- Test: `src/__tests__/deep-diagnose-result.test.tsx`

- [ ] Write failing tests showing `/video-diagnose` no longer branches on study mode and consumer routes do not expose study-aware video affordances.
- [ ] Run `npm test -- src/__tests__/video-diagnose-boundary-cleanup.test.ts src/__tests__/deep-diagnose-result.test.tsx`.
- [ ] Replace study-mode branching in `/video-diagnose` with direct guest/authenticated consumer behavior only.
- [ ] Keep the route hidden by visibility config rather than study-aware conditions.
- [ ] Re-run targeted video-diagnose verification.

### Task 6: Delete Dead Study Modules, Research Utilities, And Stale Tests

**Files:**
- Delete: `src/lib/study/session.ts`
- Delete: `src/lib/study/snapshot.ts`
- Delete: `src/lib/study/config.ts` if nothing kept still imports it
- Delete: `src/lib/study/localData.ts` after neutral restore equivalents are in place
- Delete: `src/lib/researchData.ts` if no kept route imports it
- Delete: `src/lib/appShell/consumerBoundary.ts`
- Delete: remaining `src/__tests__/study-*`
- Delete or rewrite: stale study/research cleanup tests that only protect removed semantics

- [ ] Use `rg` to confirm no kept-route production files import deleted study/research modules.
- [ ] Delete dead modules and stale tests instead of wrapping them in compatibility code.
- [ ] Run the smallest targeted suites after each deletion cluster.

### Task 7: Final Verification On `app-development`

**Files:**
- Verify only

- [ ] Run `npm test -- src/__tests__/consumer-shell-pr1.test.tsx src/__tests__/assessment-boundary-cleanup.test.tsx src/__tests__/consumer-diagnose-pr3.test.tsx src/__tests__/deep-diagnose-orchestrator.test.tsx src/__tests__/deep-diagnose-result.test.tsx src/__tests__/plan-boundary-pr6.test.tsx src/__tests__/profile-boundary-cleanup.test.tsx src/__tests__/video-diagnose-boundary-cleanup.test.ts src/__tests__/language-switcher.test.tsx`
- [ ] Run `npm run build`
- [ ] Run `npm run lint` and record if the repo still blocks on first-run ESLint setup instead of actual lint failures
- [ ] Review `git diff --stat` for leftover study-only files or compatibility glue
