# Scenario Reconstruction Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first scenario reconstruction prototype on a dedicated feature branch, exposed as a test-only page at `/diagnose/scenario`, without destabilizing the current production diagnosis flow.

**Architecture:** Keep the existing Next.js app as the product shell and add a new isolated scenario-reconstruction namespace for data, rules, API, and UI. The source of truth stays in typed schema data and deterministic selectors; the local Qwen MLX endpoint is a thin ranking/parsing boundary with strict JSON contracts and deterministic fallback.

**Tech Stack:** Next.js 14 App Router, TypeScript, Vitest, existing repo i18n/study infrastructure, local MLX server via OpenAI-style HTTP endpoint.

---

## Scope decisions locked for this plan

- Keep the current `/diagnose` route unchanged in this effort.
- Add the prototype at `/diagnose/scenario` only.
- Show the new entry only in test mode or other explicit non-production gating.
- Do not add new npm dependencies unless a later approved slice proves they are necessary.
- Do not change study-event semantics, auth, `.env*`, package dependencies, `/library`, or `/rankings`.
- Keep scenario reconstruction logic outside `src/lib/diagnosis.ts` to avoid coupling the prototype to the current deterministic diagnosis engine too early.

## Proposed file structure

### New files

- `src/types/scenario.ts`
- `src/data/scenarioReconstruction/questionBank.ts`
- `src/data/scenarioReconstruction/examples.ts`
- `src/lib/scenarioReconstruction/schema.ts`
- `src/lib/scenarioReconstruction/runtime.ts`
- `src/lib/scenarioReconstruction/missingSlots.ts`
- `src/lib/scenarioReconstruction/questionBank.ts`
- `src/lib/scenarioReconstruction/selector.ts`
- `src/lib/scenarioReconstruction/answer.ts`
- `src/lib/scenarioReconstruction/logging.ts`
- `src/lib/scenarioReconstruction/llm/client.ts`
- `src/lib/scenarioReconstruction/llm/prompts.ts`
- `src/components/diagnose/scenario/ScenarioInputCard.tsx`
- `src/components/diagnose/scenario/ScenarioSummaryCard.tsx`
- `src/components/diagnose/scenario/ScenarioQuestionCard.tsx`
- `src/components/diagnose/scenario/ScenarioDebugPanel.tsx`
- `src/app/diagnose/scenario/page.tsx`
- `src/app/api/scenario-reconstruction/parse/route.ts`
- `src/app/api/scenario-reconstruction/answer-followup/route.ts`
- `src/__tests__/scenario-runtime.test.ts`
- `src/__tests__/scenario-selector.test.ts`
- `src/__tests__/scenario-routes.test.ts`
- `src/__tests__/scenario-page.test.tsx`
- `scripts/run-local-qwen-mlx.sh`
- `scripts/smoke-test-scenario-reconstruction.sh`

### Existing files likely to modify

- `src/app/page.tsx`
- `src/lib/i18n/dictionaries/zh.ts`
- `src/lib/i18n/dictionaries/en.ts`
- `README.md`

## Execution shape

Implement this as five small slices plus one final verification pass. Each slice must be independently reviewable and leave `main` untouched until the dedicated branch is ready.

### Slice 0: Branch and interface lock

**Goal:** Prepare the safe execution boundary before touching implementation.

**Files:**
- Create: none
- Modify: none

- [ ] Create a dedicated branch from `main`
- [ ] Name it `feature/scenario-reconstruction` unless a branch with that name already exists
- [ ] Confirm no production route replacement is included in this slice
- [ ] Confirm the new prototype will live at `/diagnose/scenario`
- [ ] Confirm the only public entry change, if any, is test-only gated

**Acceptance**
- Work is no longer happening on `main`
- Scope is locked to an isolated prototype route and supporting internals

**Verification**
- `git branch --show-current`

**Rollback point**
- If the branch setup or scope feels wrong, discard the branch before any code lands

### Slice 1: Data model and deterministic rule core

**Goal:** Create the schema, question bank, runtime guards, missing-slot detection, and deterministic selector without any model dependency.

**Files:**
- Create: `src/types/scenario.ts`
- Create: `src/data/scenarioReconstruction/questionBank.ts`
- Create: `src/data/scenarioReconstruction/examples.ts`
- Create: `src/lib/scenarioReconstruction/schema.ts`
- Create: `src/lib/scenarioReconstruction/runtime.ts`
- Create: `src/lib/scenarioReconstruction/missingSlots.ts`
- Create: `src/lib/scenarioReconstruction/questionBank.ts`
- Create: `src/lib/scenarioReconstruction/selector.ts`
- Create: `src/lib/scenarioReconstruction/answer.ts`
- Create: `src/__tests__/scenario-runtime.test.ts`
- Create: `src/__tests__/scenario-selector.test.ts`

- [ ] Define the scenario schema with English-only internal keys and explicit `unknown` states
- [ ] Encode the fixed bilingual question bank as editable TypeScript data rather than inline JSX copy
- [ ] Implement minimal runtime validation helpers that fit current repo conventions and avoid new dependencies
- [ ] Implement missing-slot detection using the priority ladder from the scenario-reconstruction spec
- [ ] Implement deterministic question eligibility and ranking before any LLM assistance
- [ ] Implement answer application so follow-up responses update the scenario state predictably
- [ ] Add unit tests for zh, en, and mixed-input normalization, missing-slot detection, selector determinism, and bilingual question integrity

**Acceptance**
- The selector can return one valid question from fixed candidates without any LLM call
- Unsupported fields remain `unknown`
- The question bank is centralized and editable outside UI code

**Verification**
- `npm test -- src/__tests__/scenario-runtime.test.ts src/__tests__/scenario-selector.test.ts`

**Rollback point**
- If slice quality is poor, revert only the new `scenarioReconstruction` files and tests without touching current diagnosis logic

### Slice 2: Thin LLM boundary with deterministic fallback

**Goal:** Add local-Qwen parsing and candidate-ranking support without letting the model own workflow state.

**Files:**
- Create: `src/lib/scenarioReconstruction/llm/client.ts`
- Create: `src/lib/scenarioReconstruction/llm/prompts.ts`
- Modify: `src/lib/scenarioReconstruction/runtime.ts`
- Modify: `src/lib/scenarioReconstruction/selector.ts`
- Modify: `src/__tests__/scenario-runtime.test.ts`
- Modify: `src/__tests__/scenario-selector.test.ts`

- [ ] Create a local LLM client that reads `OPENAI_BASE_URL`, `OPENAI_API_KEY`, and `MODEL_NAME` from runtime env without changing `.env*`
- [ ] Add parser and selector prompt templates as dedicated code artifacts, not embedded route strings
- [ ] Enforce strict JSON parsing and strip unsupported thinking wrappers if present
- [ ] Keep LLM outputs constrained to candidate slot values and candidate question IDs only
- [ ] Add deterministic fallback when the model response is malformed, empty, inconsistent, or unavailable
- [ ] Add tests for invalid JSON, empty ranking output, and fallback selection stability

**Acceptance**
- Model failure does not break the flow
- Rule-first behavior still works with the LLM turned off
- The LLM cannot invent questions or deep unsupported diagnoses

**Verification**
- `npm test -- src/__tests__/scenario-runtime.test.ts src/__tests__/scenario-selector.test.ts`

**Rollback point**
- If MLX integration is unstable, keep Slice 1 intact and disable LLM-assisted ranking while retaining the deterministic prototype

### Slice 3: Route handlers and local logging

**Goal:** Expose the new scenario-reconstruction flow through isolated API routes and JSONL-friendly decision logging.

**Files:**
- Create: `src/lib/scenarioReconstruction/logging.ts`
- Create: `src/app/api/scenario-reconstruction/parse/route.ts`
- Create: `src/app/api/scenario-reconstruction/answer-followup/route.ts`
- Create: `src/__tests__/scenario-routes.test.ts`
- Modify: `src/lib/scenarioReconstruction/runtime.ts`

- [ ] Implement `POST /api/scenario-reconstruction/parse`
- [ ] Implement `POST /api/scenario-reconstruction/answer-followup`
- [ ] Keep route handlers thin and move orchestration into reusable lib code
- [ ] Record parse and selection decisions in a shape compatible with later JSONL export without changing existing study log semantics
- [ ] Add route tests for happy path, bad request, mixed-language input, and deterministic fallback behavior

**Acceptance**
- The app can run the full parse or answer-followup cycle via Next.js route handlers
- Route responses expose `scenario`, `missing_slots`, `eligible_questions`, `selected_question`, and `done` consistently
- No current production diagnosis endpoint is modified

**Verification**
- `npm test -- src/__tests__/scenario-routes.test.ts`

**Rollback point**
- If the route shape needs revision, remove only the isolated `scenario-reconstruction` routes and keep the core library intact

### Slice 4: Test-only `/diagnose/scenario` UI

**Goal:** Build a clean bilingual guided-flow UI that exercises the new chain end to end without replacing the current diagnosis page.

**Files:**
- Create: `src/components/diagnose/scenario/ScenarioInputCard.tsx`
- Create: `src/components/diagnose/scenario/ScenarioSummaryCard.tsx`
- Create: `src/components/diagnose/scenario/ScenarioQuestionCard.tsx`
- Create: `src/components/diagnose/scenario/ScenarioDebugPanel.tsx`
- Create: `src/app/diagnose/scenario/page.tsx`
- Create: `src/__tests__/scenario-page.test.tsx`
- Modify: `src/lib/i18n/dictionaries/zh.ts`
- Modify: `src/lib/i18n/dictionaries/en.ts`
- Modify: `src/app/page.tsx`

- [ ] Build the page as a guided flow rather than a chatbot
- [ ] Show one primary follow-up question at a time
- [ ] Render the current reconstructed scenario, missing info badges, and selected next question
- [ ] Add a collapsible debug panel for parser JSON and selected question metadata
- [ ] Reuse existing repo i18n rather than introducing a second localization path
- [ ] Gate the entry point so the new page appears only in test mode or other explicit non-production conditions
- [ ] Add UI tests covering initial render, language switching, answer progression, and restart/reset behavior

**Acceptance**
- `/diagnose/scenario` works as a standalone prototype flow
- The new entry is absent from non-test production-facing surfaces
- The page remains readable at desktop width and around 375px mobile width

**Verification**
- `npm test -- src/__tests__/scenario-page.test.tsx`
- `npm run build`

**Rollback point**
- If the UI is not ready, keep the API and core logic but remove the gated entry and page route from the branch

### Slice 5: Local scripts, smoke tests, and docs

**Goal:** Make the prototype runnable, demonstrable, and easy to validate locally.

**Files:**
- Create: `scripts/run-local-qwen-mlx.sh`
- Create: `scripts/smoke-test-scenario-reconstruction.sh`
- Modify: `README.md`

- [ ] Add a script to start the local MLX server on localhost
- [ ] Add a smoke-test script that checks MLX, Next API, parser JSON validity, selector validity, and page availability
- [ ] Document local setup, branch intent, runtime assumptions, example inputs, and known limitations
- [ ] Document that the prototype is branch-first and route-isolated until explicitly promoted

**Acceptance**
- A reviewer can run the prototype locally from documented commands
- Known limitations are written down instead of hidden in the code

**Verification**
- `bash scripts/run-local-qwen-mlx.sh`
- `npm run dev`
- `bash scripts/smoke-test-scenario-reconstruction.sh`

**Rollback point**
- If MLX setup remains brittle, keep the scripts/docs on the branch only and do not merge

### Slice 6: Final branch validation and merge decision

**Goal:** Verify the branch is stable enough for demo/testing and decide whether it is worth keeping.

**Files:**
- Modify only if fixes are needed after validation

- [ ] Re-run targeted tests for all scenario slices
- [ ] Run `npm run build`
- [ ] Review the diff for scope creep
- [ ] Confirm the branch still does not replace the current production diagnosis flow
- [ ] Decide whether to keep iterating on the branch or merge after human review

**Verification**
- `npm test -- src/__tests__/scenario-runtime.test.ts src/__tests__/scenario-selector.test.ts src/__tests__/scenario-routes.test.ts src/__tests__/scenario-page.test.tsx`
- `npm run build`

## Risks to watch

1. `src/lib/diagnosis.ts` is already large; do not mix prototype logic into it unless a later slice proves the abstraction is stable.
2. The repo currently has no extra schema-validation dependency; keep runtime validation lightweight unless approved otherwise.
3. Test-only gating must be explicit and easy to remove, not a silent behavior branch spread across pages.
4. Local MLX availability is the likeliest external instability; the product logic must still be demoable with deterministic fallback.

## Recommended execution order

1. Slice 0
2. Slice 1
3. Slice 2
4. Slice 3
5. Slice 4
6. Slice 5
7. Slice 6

## Recommendation

Proceed with this plan as a branch-isolated prototype. The highest-leverage first implementation slice is Slice 1 because it creates the stable source-of-truth layer that every later API, model, and UI step depends on.
