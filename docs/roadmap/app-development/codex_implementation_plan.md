# Codex Implementation Plan for `app-development`

## Overall direction

Do **not** build a separate app from scratch. The current repo already has the right substrate: a Next.js 14 + TypeScript + Tailwind app, a strong `/diagnose -> /plan` core, and a `scenarioReconstruction` stack with `llm`, `inferSkillCategory.ts`, `questionBank.ts`, `runtime.ts`, `selector.ts`, `skillPolicy.ts`, and `toDiagnosisInput.ts`. The app-development branch should therefore be a **consumer-oriented evolution of the current codebase**, not a rewrite.

The overall product direction remains:

**free-text amateur complaint -> structured understanding -> one prioritized focus -> credible 7-step plan -> a few tightly related references**

Two architecture principles should remain stable across PR1-PR5:

1. **Reuse the current diagnose/plan/scenarioReconstruction core aggressively.** Do not start a second system.
2. **LLM parses; deterministic code decides.** LLM should mainly handle colloquial language understanding and structured extraction, while downstream diagnosis and plan composition remain controlled, testable, and readable.

---

## Important decisions already confirmed

### 1. Do **not** delete study mode code in PR1

Do **not** physically delete study-mode code at the beginning.

For `app-development`, the correct order is:

- first remove study-mode entry points from the consumer journey
- then remove direct dependencies on study-mode logic
- then confirm consumer flows run cleanly without hidden coupling
- only after that, open a later cleanup PR to physically delete obsolete study code

Reason:

- the current repo still contains hidden coupling between study-oriented routes and core flows
- deleting study code too early increases regression risk
- PR1 should make study mode **inactive** for the consumer shell, not immediately erased

So for now:

- **disable / hide / bypass** study mode in the app branch
- **do not delete** it yet

### 2. Use bottom navigation in the consumer shell

For the phone-first consumer app, the main top-level navigation should move to a **bottom navigation bar**.

This should be treated as part of PR1.

Recommended bottom-nav destinations:

- `Diagnose`
- `Plan`
- `Library`
- `Profile` or `Me`

Important boundary:

- bottom nav is for **top-level sections only**
- page actions such as back, settings, language switch, share, search, and save should stay outside the bottom nav

---

# PR1 — Consumer app shell and mode boundary

## Goal

Turn the current repo into a **consumer-facing app shell** without deleting the study code. The point of PR1 is not new intelligence; it is to remove the research-first entry friction and establish a stable boundary: same repo, same stack, same core routes, but a different top-level user journey.

The immediate product objective is:

- make the app consumer-first
- make diagnosis the primary entry point
- remove study-first friction from the main path
- adopt a mobile-first navigation structure with **bottom navigation**

## Tasks

1. Create a new branch:
   - `app-development`

2. Keep the existing repo and architecture.
   - Do **not** create a new repo.
   - Do **not** rewrite the stack.
   - Do **not** convert to React Native / Flutter.
   - Treat the current Next.js app as the base for the first consumer app shell.

3. Introduce a clearer app boundary in the codebase.
   - Expand the current `appMode` idea into a real consumer-oriented boundary.
   - The repo should conceptually move from `study-ready shell` to `consumer shell`.
   - Study routes should stop being part of the default journey.

4. Redesign the top-level navigation for mobile.
   - Add a **bottom navigation bar** for phone-first usage.
   - Bottom nav should cover only top-level destinations.
   - Use a small, stable set of destinations such as:
     - `Diagnose`
     - `Plan`
     - `Library`
     - `Profile`

5. Make the home page consumer-first.
   - `/` should become a clean landing page for tennis amateurs.
   - The primary call to action should go to `/diagnose`.
   - Remove study-first framing from the homepage.
   - Keep information density low.
   - Make bilingual switching smooth.

6. Hide research-oriented routes from consumer navigation.
   - `/study`
   - `/survey`
   - `/admin/export`
   - researcher-only entry points or overlays

7. Remove consumer-path assessment gating.
   - A new consumer user should be able to start diagnosis directly.
   - `/diagnose` should no longer send the user to `/assessment` just because no assessment state exists.

8. Keep the code for study mode in the branch for now, but make it inactive for the consumer shell.
   - Do **not** delete study code in this PR.
   - Just remove it from the main path.

9. Preserve existing core flows.
   - `/diagnose` remains the primary main flow.
   - `/plan` remains reachable from diagnosis-origin flows.
   - The current diagnose-result-plan logic should still work after entry simplification.

## Files

Most likely files to touch in PR1:

- `src/lib/appMode.ts`
- `src/app/page.tsx`
- `src/app/layout.tsx`
- global navigation components
- mobile navigation components
- `src/app/diagnose/page.tsx`
- possibly `src/app/plan/page.tsx`
- shared UI shell files
- i18n / language-switch related UI files if needed

Potential new files:

- bottom navigation component
- consumer-only app shell wrapper
- optional consumer landing components

## Acceptance

PR1 is successful if all of the following are true:

1. A new user can open `/`, enter the app, and start diagnosis without being redirected into a study/assessment flow.
2. The consumer app has a working **bottom navigation bar**.
3. Bottom navigation includes only top-level sections.
4. Study-mode routes still exist in code, but they are no longer part of the consumer-facing journey.
5. The repo still builds and runs normally.
6. Existing diagnose and plan core flows are not broken.
7. Mobile usage feels clearly improved compared with the current top-level shell.
8. Chinese and English switching remains smooth and coherent.

## Prohibitions

1. Do **not** delete study-mode code yet.
2. Do **not** start a new app framework.
3. Do **not** rewrite the entire UI shell from scratch.
4. Do **not** couple bottom navigation with page actions like back/share/settings/language.
5. Do **not** add account/auth/profile complexity in this PR.
6. Do **not** change database schema or study data semantics in this PR.
7. Do **not** let the homepage become a high-information-density landing page.
8. Do **not** change core diagnosis logic in PR1 beyond removing study-path friction.

---

# PR2 — LLM intake boundary for colloquial amateur tennis input

## Goal

Replace **pattern-matching-first intake** with **LLM-assisted structured extraction**, while keeping downstream diagnosis and planning deterministic.

This is the most important architecture change for the app branch.

The purpose of PR2 is to let the app understand vague, colloquial, amateur language and convert it into structured signals that the existing TennisLevel system can use cleanly.

## Tasks

1. Create a dedicated intake layer.

Suggested structure:

- `src/lib/intake/schema.ts`
- `src/lib/intake/extractTennisScene.ts`
- `src/lib/intake/normalizeToScenario.ts`
- `src/app/api/intake/extract/route.ts`

2. Define one strict structured extraction contract.

The LLM output should be narrow, typed, and machine-usable. It should **not** be an open-ended paragraph.

Suggested fields:

- `skillCategory`
- `strokeFamily`
- `problemCandidate`
- `outcome`
- `movement`
- `pressureContext`
- `sessionType`
- `serveSubtype`
- `subjectiveFeeling`
- `missingSlots`
- `confidence`

3. Add bilingual colloquial-language support.
   - The intake layer should accept Chinese and English naturally.
   - It should handle vague user phrasing from amateur tennis players.
   - It should preserve smooth switching between English and Chinese.

4. Normalize the extracted result into the existing core flow.
   - Convert intake output into the current scenario-reconstruction pipeline.
   - Use the intake layer as the front door.
   - Do **not** bypass the existing policy/selector/runtime architecture.

5. Reuse the existing core aggressively.

Codex should reuse, not replace, these current assets:

- `scenarioReconstruction/inferSkillCategory.ts`
- `scenarioReconstruction/skillPolicy.ts`
- `scenarioReconstruction/questionBank.ts`
- `scenarioReconstruction/toDiagnosisInput.ts`
- enriched-context related logic already used by `/diagnose` and `/plan`

6. Design safe fallback behavior.
   - If LLM extraction fails, the system should degrade gracefully.
   - If confidence is low, the system should request follow-up clarification later in PR3.
   - The system should not hallucinate a fully confident diagnosis from weak input.

7. Keep the old rule-based pattern-matching code out of the new app architecture center.
   - Old matcher logic may remain only as fallback or compatibility support.
   - It should not be copy-pasted into a new messy layer.

## Files

Most likely files to add or modify in PR2:

New files:

- `src/lib/intake/schema.ts`
- `src/lib/intake/extractTennisScene.ts`
- `src/lib/intake/normalizeToScenario.ts`
- `src/app/api/intake/extract/route.ts`
- provider adapter files if needed
- tests for extraction and normalization

Likely reused existing files:

- `src/lib/scenarioReconstruction/inferSkillCategory.ts`
- `src/lib/scenarioReconstruction/skillPolicy.ts`
- `src/lib/scenarioReconstruction/questionBank.ts`
- `src/lib/scenarioReconstruction/toDiagnosisInput.ts`
- enriched-context related files
- `src/app/diagnose/page.tsx`

## Acceptance

PR2 is successful if all of the following are true:

1. One bilingual free-text user complaint can be converted into structured scene slots.
2. The extraction format is strict, typed, and reusable.
3. The result can be passed into the existing diagnosis core cleanly.
4. The system can handle colloquial amateur phrasing better than the current pattern-matching-first entry.
5. Low-confidence or partial extraction does not force a fake confident answer.
6. LLM output is constrained enough to keep downstream logic stable and readable.
7. The code remains structured, concise, and human-readable.

## Prohibitions

1. Do **not** let the LLM directly produce the final diagnosis result.
2. Do **not** let the LLM directly write the 7-step plan.
3. Do **not** replace the deterministic downstream system with end-to-end generation.
4. Do **not** copy-paste large blocks of old pattern-matching code into the new intake layer.
5. Do **not** build a giant prompt-only architecture with weak typing.
6. Do **not** tightly couple provider-specific LLM code to the UI layer.
7. Do **not** make the extraction contract overly broad or prose-heavy.

---

# PR3 — Unified smart diagnose flow for consumer app usage

## Goal

Remove the user-facing `quick / standard / deep` framing and replace it with one **smart diagnose flow** that automatically decides whether follow-up questions are needed.

For a consumer app, the user should not need to understand internal effort modes. The app should feel like one fluid diagnosis experience.

## Tasks

1. Refactor the diagnose journey into a single flow:

- user enters free text
- intake layer extracts structured scene
- system evaluates completeness and confidence
- if enough signal exists, show diagnosis result directly
- if important slots are missing, ask a small number of follow-up questions
- once enough signal exists, produce one diagnosis result surface
- hand off structured enriched context into `/plan`

2. Remove visible mode terminology from the consumer UI.
   - No more user-facing `quick`, `standard`, or `deep` terminology.
   - These concepts may remain internally if needed, but they should not define the user experience.

3. Reuse the current follow-up engine rather than rebuilding from scratch.
   - Reuse the current deep-flow internals.
   - Reuse `selector.ts` for follow-up question selection.
   - Reuse `skillPolicy.ts` for category-valid question families.
   - Reuse the current deep-scenario logic as the backbone for clarification.

4. Rename the consumer-facing concept.
   - Internally it may still be powered by deep-flow logic.
   - Externally it should appear as natural inline follow-up questions.

5. Keep one diagnosis result surface.
   - Reuse `DiagnoseResult.tsx` or the equivalent existing result page.
   - Do **not** create a second separate AI-only result screen.

6. Make the follow-up system automatic and controlled.
   - Trigger follow-ups only when necessary.
   - Keep the number of follow-ups small.
   - Preserve traceability of what was clarified.
   - Maintain compatibility with downstream handoff into planning.

7. Maintain low information density.
   - The diagnose UI should stay focused and mobile-friendly.
   - One question at a time is preferred.
   - Avoid exposing too much structured complexity to the user.

## Files

Most likely files to modify in PR3:

- `src/app/diagnose/page.tsx`
- `src/components/diagnose/DeepScenarioModule.tsx` or equivalent
- `src/components/diagnose/DiagnoseResult.tsx`
- `src/lib/scenarioReconstruction/selector.ts`
- `src/lib/scenarioReconstruction/runtime.ts`
- `src/lib/scenarioReconstruction/skillPolicy.ts`
- handoff / enriched-context related files
- diagnose state and flow control files

Possible new files:

- consumer follow-up UI component(s)
- diagnose flow orchestrator helpers
- updated state models for unified flow

## Acceptance

PR3 is successful if all of the following are true:

1. Users no longer manually choose between `quick`, `standard`, and `deep`.
2. The diagnose experience feels like one coherent consumer flow.
3. The app either answers directly or asks a few targeted follow-up questions.
4. Follow-up questions remain policy-valid and category-aware.
5. Diagnosis output remains structured and stable.
6. The result surface remains singular and consistent in both Chinese and English.
7. Diagnosis can hand off cleanly into `/plan` with enriched structured context.
8. Mobile UX remains light, readable, and low-density.

## Prohibitions

1. Do **not** expose internal diagnosis modes in the consumer UI.
2. Do **not** rebuild a second separate diagnosis engine.
3. Do **not** let follow-up questioning become long, chatty, or open-ended.
4. Do **not** break the deterministic handoff path into planning.
5. Do **not** create multiple competing result pages.
6. Do **not** increase information density just because more structure exists internally.
7. Do **not** make follow-ups feel like a survey.

---

# PR4 — Clean 7-step plan engine for the app branch

## Goal

Keep the 7-step plan **deterministic and scene-aware**, but refactor it into a cleaner app-oriented plan engine with stronger structure, clearer contracts, and less study coupling.

The app branch should continue to emphasize:

- one prioritized focus
- a credible 7-step progression
- strong relation between diagnosis and plan
- readable and revisable code

## Tasks

1. Refactor the current plan system into clearer layers.

Suggested structure:

- `src/lib/plan-core/baseSkeleton.ts`
- `src/lib/plan-core/sceneOverlay.ts`
- `src/lib/plan-core/rationale.ts`

2. Define a clearer step-level plan contract.

Each step should explicitly specify structured fields such as:

- step goal
- drill / exercise
- reps or time
- success criterion
- common failure cue
- progression note
- transfer-to-play cue

3. Keep the current deterministic philosophy.
   - Use the structured diagnosis context to drive plan composition.
   - Preserve the current credible step-by-step progression.
   - Maintain specificity through later steps of the plan.

4. Continue using diagnosis-origin context.
   - The plan should remain downstream of structured diagnosis and enriched context.
   - Diagnosis and plan must stay tightly linked.

5. Turn the current serve slice into a reusable template for additional categories.

Recommended expansion order:

- `return`
- `volley`
- `overhead`
- then more general forehand/backhand movement-driven cases

6. Improve readability and maintainability.
   - The app-development plan logic should be structured, concise, and human-readable.
   - Avoid patch-style accumulation if a cleaner structure can be introduced.

7. Remove study-specific coupling where possible.
   - The plan system should not depend on study-mode assumptions for normal consumer usage.
   - Keep plan generation diagnosis-driven rather than assessment-driven.

## Files

Most likely files to modify in PR4:

- `src/app/plan/page.tsx`
- `src/lib/plans/*`
- `src/lib/plan-core/*` (new)
- handoff / deep-context related files
- plan template files
- rationale / explanation related UI or helpers

Possible new files:

- `src/lib/plan-core/baseSkeleton.ts`
- `src/lib/plan-core/sceneOverlay.ts`
- `src/lib/plan-core/rationale.ts`
- category-specific plan modules
- tests for plan generation

## Acceptance

PR4 is successful if all of the following are true:

1. Diagnosis-origin plan generation works cleanly with no assessment dependency.
2. The 7-step plan remains deterministic, structured, and credible.
3. Supported categories keep meaningful specificity across all seven steps.
4. The relationship between diagnosis and plan is clearer than before.
5. The plan code becomes easier to read, revise, and extend.
6. The plan remains suitable for bilingual presentation.
7. New category expansion becomes easier after the refactor.

## Prohibitions

1. Do **not** switch to “LLM writes the full step sequence.”
2. Do **not** turn the plan into vague motivational text.
3. Do **not** break the tight link between diagnosis and plan.
4. Do **not** mix content-ingestion refactors into this PR.
5. Do **not** keep unnecessary study-only dependencies in the consumer path.
6. Do **not** add unnecessary code duplication across skill categories.
7. Do **not** let later-day plan items collapse back into generic filler.

---

# PR5 — Content catalog normalization and connector-ready architecture

## Goal

Prepare the app to support more platforms and more videos **without** turning TennisLevel into a content warehouse.

This PR should establish a normalized content layer and a connector-ready architecture so that future content expansion stays disciplined and compatible with the routing-first product identity.

## Tasks

1. Create a normalized content-catalog layer.

Suggested structure:

- `src/lib/content-catalog/schema.ts`
- `src/lib/content-catalog/retrieve.ts`
- `src/lib/content-catalog/rank.ts`
- `src/lib/platform-connectors/`

2. Define one canonical content-item schema.

Suggested fields:

- `sourcePlatform`
- `canonicalUrl`
- `creatorHandle`
- `language`
- `skillCategory`
- `problemTags`
- `levelRange`
- `mediaType`
- `rightsStatus`
- `qualityScore`
- `ingestionMethod`

3. Migrate the current corpus into the normalized schema.
   - Preserve the current useful content base.
   - Clean up inconsistencies where needed.
   - Prepare for future platform-specific adapters.

4. Build retrieval as a recommendation layer, not a browsing feed.
   - Diagnosis and plan should retrieve a **small set of high-signal items**.
   - Content retrieval should reinforce one prioritized training focus.
   - The app should reduce direction entropy rather than encourage content wandering.

5. Build ranking that stays tied to diagnosis and plan context.
   - Rank by relevance to the user’s problem, skill category, and plan focus.
   - Keep recommendation count small and intentional.

6. Create connector-ready architecture for future expansion.
   - Add clean interfaces for platform-specific connectors.
   - Keep platform ingestion logic isolated from diagnosis/plan logic.

7. Use a disciplined source expansion order.

Recommended order:

- first strengthen `YouTube`
- then prepare `TikTok`
- then `Instagram`
- keep `RedNote / Xiaohongshu` connector-ready but not over-promised unless the official integration path is confirmed clearly

8. Keep frozen research-oriented content surfaces separated.
   - Do not directly disturb research-frozen behavior in `/library` or `/rankings` if those are intended to remain stable in the research branch logic.
   - If needed, create a consumer-facing content experience separately.

## Files

Most likely files to add or modify in PR5:

New files:

- `src/lib/content-catalog/schema.ts`
- `src/lib/content-catalog/retrieve.ts`
- `src/lib/content-catalog/rank.ts`
- `src/lib/platform-connectors/*`
- migration / normalization helpers
- tests for retrieval and ranking

Likely modified existing files:

- current content library data files
- diagnosis recommendation hooks
- plan recommendation hooks
- library-facing UI components if consumer-specific views are added
- ranking or retrieval-related helpers

## Acceptance

PR5 is successful if all of the following are true:

1. Existing content can be represented in one normalized schema.
2. Diagnosis and plan can retrieve recommendations through the new catalog layer.
3. Recommendation results are small, relevant, and tied to the user’s structured focus.
4. The content system is ready for future platform connectors.
5. The architecture can expand sources later without polluting diagnosis and plan logic.
6. TennisLevel still behaves like a routing-first product rather than a content-abundance platform.
7. The code remains structured and readable.

## Prohibitions

1. Do **not** optimize PR5 around “get to 2k videos as fast as possible.”
2. Do **not** turn TennisLevel into a generic content feed or browsing app.
3. Do **not** let content ranking drift away from diagnosis and plan relevance.
4. Do **not** tightly couple platform-ingestion code to UI or diagnosis code.
5. Do **not** rely on scraping-first messy logic as the architecture center.
6. Do **not** modify frozen research `/library` and `/rankings` behavior carelessly.
7. Do **not** treat connector support as equivalent across all platforms before the official integration path is clear.

---

# Additional reminders for Codex

## Architectural reminders

1. Reuse current core modules aggressively.
2. LLM should mainly parse and structure amateur user language.
3. Deterministic code should remain responsible for diagnosis decisions, follow-up control, and 7-step plan composition.
4. Keep code structured, clean, concise, and readable.
5. Avoid patch-style growth unless truly necessary.
6. Maintain smooth Chinese-English switching throughout the consumer experience.
7. Keep information density low, especially on mobile.

## Product reminders

1. The main target is the overseas market, especially Canada and the US.
2. The app should feel phone-first.
3. The product should remain centered on structured diagnosis and credible 7-step plans.
4. Recommended content should support the plan, not replace the product core.
5. The product should not drift into a “more videos is better” model.

## Cleanup reminder after PR1-PR5

After PR1-PR5 are stable, it will be reasonable to consider a later cleanup PR that:

- physically deletes obsolete study-mode code
- removes dead routes and components
- simplifies remaining app boundary logic further

But that cleanup should happen **after** the consumer shell, intake layer, diagnose flow, plan engine, and content layer are already stable.
