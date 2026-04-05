# Deep Diagnose Orchestrator PR Plan — Revised

> **For agentic workers:** Use subagent-driven execution or stepwise plan execution. Keep changes minimal, deterministic, and easy to review. Prefer root-cause fixes over UI-only patches.

**Goal:** Turn `deep` diagnosis into a real inline `/diagnose` subflow that captures structured scene context and carries it through the existing diagnosis and plan chain, so the resulting 7-day plan stays scenario-specific through Day 7.

**Architecture:** Keep `/diagnose` as the single orchestrator container. Scenario reconstruction becomes an inline deep-mode subflow, not a parallel primary journey. Preserve one diagnosis result surface. Introduce a deterministic `EnrichedDiagnosisContext` handoff that survives diagnosis → plan. Use a deterministic deep overlay to rewrite the full 7-day plan without replacing the current plan system.

**Tech Stack:** Next.js App Router, React client components, deterministic diagnosis/plans modules, local study draft persistence, targeted tests in `src/__tests__`.

---

## Scope Lock

This phase intentionally does **not**:

- add more scenario questions
- replace the diagnosis engine
- replace the plan system with a free-form generator
- split diagnosis into two separate result pages
- change study-event semantics
- modify auth, env, migrations, package dependencies, or hidden `/video-diagnose`

This phase does:

- make `/diagnose` the deep-mode orchestrator
- integrate scenario reconstruction as an inline deep subflow
- introduce `EnrichedDiagnosisContext`
- preserve and surface deep context in diagnosis and plan
- make deep-mode plans remain scenario-specific through Day 7
- eliminate late-week generic decay for deep-mode plans

---

## Key Improvements Over Prior Draft

1. **Define the contract before UI integration.** Create `EnrichedDiagnosisContext` first, then wire `/diagnose` and `/plan` around it.
2. **Ship one vertical slice early.** Do not wait for all families. First make one deep-mode family fully work end-to-end.
3. **Keep file churn low.** Avoid speculative new data files until the existing `plans.ts` overlay shape is proven.
4. **Separate “deep mode exists” from “deep plan is good.”** Treat integration and plan-depth progression as different milestones.
5. **Use deterministic fixtures, not runtime LLM generation.** Few-shot examples are for implementation guidance and regression fixtures only.

---

## Delivery Strategy

### Milestone A — Contract + one end-to-end deep slice

Make exactly one family work deeply from `/diagnose` → scenario reconstruction → enriched diagnosis → `/plan`.

**Recommended first family:**
- `serve + key points + tightness`
- or, if current scenario normalization is more stable, `backhand-into-net + deep incoming balls`

This milestone is complete only if:
- deep mode is inline on `/diagnose`
- scenario reconstruction feeds an `EnrichedDiagnosisContext`
- `/plan` consumes that context
- the 7-day plan for the chosen family is visibly progressive through Day 7

Only after this works should additional families be added.

### Milestone B — expand deep families

Add deterministic overlays for:
- generic serve / first serve / second serve
- backhand / forehand net-error with deep-ball variable
- movement-timing family
- pressure-execution family

---

## Canonical Contract First

### New canonical type

Create:
- `src/types/enrichedDiagnosis.ts`

```ts
export type EnrichedDiagnosisContext = {
  mode: "standard" | "deep";
  sourceRoute: "diagnosis" | "scenario_reconstruction";
  sourceInput: string;
  sceneSummaryZh: string;
  sceneSummaryEn: string;

  problemTag: string;
  level?: string;

  strokeFamily?: "forehand" | "backhand" | "serve" | "volley" | "overhead" | "general";
  serveSubtype?: "first_serve" | "second_serve";

  sessionType?: "practice" | "match";
  pressureContext?: "none" | "general_match_pressure" | "key_points";
  movement?: "stationary" | "moving";
  outcome?: "net" | "long" | "short" | "float" | "miss_in" | "double_fault";
  incomingBallDepth?: "shallow" | "medium" | "deep" | "unknown";
  subjectiveFeeling?: "tight" | "rushed" | "late" | "hesitant" | "low_confidence" | "awkward" | "unknown";

  isDeepModeReady: boolean;
};
```

### Rules

- Must be deterministic
- Must be JSON-safe and round-trippable
- Must be storable in local study draft / handoff
- `effortMode === "deep"` alone must **not** imply `isDeepModeReady === true`

---

## PR Breakdown

## PR0: Contract And Vertical-Slice Target

**Goal**

Create the canonical type, normalization helpers, and select the first fully supported deep family before wiring UI.

**Files**

- Create: `src/types/enrichedDiagnosis.ts`
- Create: `src/lib/diagnose/enrichedContext.ts`
- Test: `src/__tests__/enriched-diagnosis-context.test.ts`

**Implementation tasks**

- [ ] Define `EnrichedDiagnosisContext`
- [ ] Add deterministic normalization helpers
- [ ] Add round-trip serialization helpers
- [ ] Choose the first supported deep family and document it in tests
- [ ] Add one fixture that represents the target end-to-end deep slice

**Acceptance**

- The contract exists before UI orchestration begins
- One target deep family is locked as the initial vertical slice

---

## PR1: Inline Deep Orchestrator In `/diagnose`

**Goal**

Move scenario reconstruction into the `/diagnose` journey so `deep` mode becomes a real inline subflow instead of a parallel primary page.

**Files**

- Modify: `src/app/diagnose/page.tsx`
- Create: `src/components/diagnose/DeepScenarioModule.tsx`
- Modify: existing scenario cards only as needed
- Modify: `src/app/diagnose/scenario/page.tsx`
- Test: `src/__tests__/deep-diagnose-orchestrator.test.tsx`

**Implementation tasks**

- [ ] Add a local `/diagnose` state slice for deep-mode reconstruction:
  - source complaint text
  - current `ScenarioState`
  - selected question
  - `done`
  - current `EnrichedDiagnosisContext | null`
- [ ] Render the inline scenario module only when `effortMode === "deep"`
- [ ] Keep quick/standard behavior unchanged
- [ ] Reuse existing scenario cards instead of duplicating UI logic
- [ ] On reconstruction completion, update the current `/diagnose` state instead of routing away
- [ ] Keep `/diagnose/scenario` only as a thin prototype/debug wrapper or redirect decision deferred until after Milestone A

**Acceptance**

- Selecting `deep` reveals an inline scenario module on `/diagnose`
- Completing reconstruction no longer feels like switching to a separate primary page
- Standard diagnose flow remains intact

---

## PR2: One Diagnosis Result Surface, Enriched

**Goal**

Preserve one diagnosis result UI while making deep-mode results visibly narrower and more specific.

**Files**

- Modify: `src/components/diagnose/DiagnoseResult.tsx`
- Modify: `src/app/diagnose/page.tsx`
- Test: `src/__tests__/deep-diagnose-result.test.tsx`

**Implementation tasks**

- [ ] Add deep-mode badge when `EnrichedDiagnosisContext.mode === "deep"`
- [ ] Add a compact scene recap block
- [ ] Add a “why this diagnosis is more specific” block driven by structured evidence
- [ ] Keep the existing result container and existing plan CTA path
- [ ] Do **not** create a second result page or second result component tree

**Acceptance**

- There is still one main diagnosis result surface
- Deep mode visibly explains why the diagnosis is narrower
- Standard mode remains visually and behaviorally intact

---

## PR3: Persist Deep Context Into Plan Handoff

**Goal**

Make `/plan` able to recover `EnrichedDiagnosisContext` through the existing handoff and local draft path.

**Files**

- Modify: `src/lib/study/localData.ts`
- Modify: `src/app/diagnose/page.tsx`
- Modify: `src/app/plan/page.tsx`
- Modify: `src/lib/plans.ts`
- Test: `src/__tests__/deep-plan-handoff.test.ts`

**Implementation tasks**

- [ ] Extend plan draft/handoff shape to optionally carry `deepContext`
- [ ] Keep the handoff local-storage-first; do not stuff large serialized context into the URL unless strictly necessary
- [ ] Ensure `/plan` can restore the exact same `deepContext`
- [ ] Preserve existing standard-mode handoff when no deep context exists

**Acceptance**

- `/plan` can recover `EnrichedDiagnosisContext`
- Standard mode remains unchanged when no deep context exists

---

## PR4: Deterministic Deep Plan Overlay

**Goal**

Rewrite all 7 days in deep mode using a visible progression ladder so later days do not decay into generic filler.

**Files**

- Modify: `src/lib/plans.ts`
- Add tests first; add new data files only if the overlay logic becomes too large for `plans.ts`
- Test: `src/__tests__/deep-plan-overlay.test.ts`
- Test: `src/__tests__/plan-fixtures.test.ts`

**Do not create these files unless truly needed**

- `src/data/planBlueprints.ts`
- `src/data/planFewShotFixtures.ts`

Use them only if the overlay logic becomes unwieldy inside `plans.ts`.

**Required day ladder**

- Day 1: baseline / clean pattern
- Day 2: stabilize under clearer constraints
- Day 3: add key scene variable
- Day 4: add movement / timing / variability
- Day 5: add pressure
- Day 6: transfer into realistic point fragment / sequence
- Day 7: consolidate + evaluate + define carry-forward rule

**Implementation tasks**

- [ ] Keep the existing base plan as input
- [ ] Add a deterministic deep overlay that rewrites **every** day:
  - focus
  - goal
  - warmupBlock
  - mainBlock
  - pressureBlock
  - successCriteria
  - intensity
  - tempo
- [ ] Ensure scene-specific variables continue to affect Day 4–7
- [ ] Ensure later days answer: “why does this day exist in the progression?”
- [ ] Ensure deep-mode summaries do not hide generic late-week content under better wording

**Acceptance**

- Deep-mode plans remain scenario-specific through Day 7
- Later days visibly progress rather than decay
- Standard-mode plans still work

---

## PR5: Expand Family Coverage

**Goal**

After one vertical slice works, extend deterministic overlays to the next supported families.

**Recommended order**

1. Serve family
   - generic serve
   - first serve long/out
   - second serve net / double-fault
2. Groundstroke depth / net-error family
3. Movement-timing family
4. Pressure-execution family

**Acceptance**

- Each new family has at least one golden fixture
- Each family shows visible Day 1 → Day 7 progression
- No family is added without a regression test

---

## Deep Plan Quality Rules

Every deep-mode plan must satisfy all of the following:

1. **Scene specificity**
   - The reconstructed scene variables must appear in the plan body, not only in the summary.

2. **Full-week coupling**
   - The same scenario must still shape Day 7.

3. **Visible progression**
   - The user should be able to tell why Day 5 is harder or more realistic than Day 2.

4. **Scenario-specific pressure**
   - Pressure blocks must match the scene, not generic “add pressure” wording.

5. **No late-week template collapse**
   - Day 4–7 cannot drift into generic review/template filler.

---

## Few-Shot Fixtures (Implementation Guidance Only)

These are **not** runtime prompts. They are design targets and regression fixtures.

### Fixture 1 — Deep ball backhand into net

**Scene**
- match
- backhand
- net
- deep incoming balls

**Expected progression**
- Day 1–2: establish clearance and contact
- Day 3: deep-ball handling becomes explicit
- Day 4: recovery / spacing added
- Day 5: streak / score pressure added
- Day 6: point fragment with deep-ball pattern
- Day 7: evaluate and carry forward one rule

### Fixture 2 — First serve flies long on key points

**Scene**
- serve
- first serve
- long
- key points
- tightness

**Expected progression**
- start with safer arc and target
- then stabilize toss/rhythm
- then add key-point routine and pressure
- then add serve + next-ball sequence
- finish with reusable key-point routine

### Fixture 3 — Second serve into net on key points

**Scene**
- serve
- second serve
- net
- key points
- rushed/tight

**Expected progression**
- start with clearance and spin safety
- then stabilize tempo
- then add key-point pressure
- then add “second serve starts the point” sequence
- finish with one carry-forward rule

### Fixture 4 — Running forehand gets late on deep, wide balls

**Scene**
- forehand
- moving
- late / net
- deep and wide

**Expected progression**
- split-step + first move
- running contact management
- deep+wide variable
- recovery step
- two-ball sequence
- realistic recovery fragment

---

## Verification Strategy

For each PR:

1. run the smallest relevant tests first
2. run touched UI tests
3. run `npm run build`

Do not rely on interactive lint setup as a merge gate for this phase.

### Minimum golden checks before declaring Milestone A done

- [ ] deep selection reveals inline reconstruction on `/diagnose`
- [ ] scenario completion updates current diagnose session
- [ ] diagnosis result shows deep-mode enrichments on the same surface
- [ ] `/plan` restores deep context
- [ ] one deep family produces a non-generic Day 1–7 plan

---

## Final Acceptance Criteria For The Phase

This phase is complete only if all are true:

1. `deep` mode is a real inline subflow inside `/diagnose`
2. scenario reconstruction no longer feels like a parallel primary journey
3. one `EnrichedDiagnosisContext` survives diagnosis → plan
4. diagnosis uses one result surface with deep-specific additions
5. `/plan` consumes deep context instead of shallow tags alone
6. at least one deep family fully works end-to-end before family expansion
7. deep-mode plans remain scenario-specific through Day 7
8. standard mode remains intact

---

## Open Ambiguities To Resolve Late, Not Early

Defer these until after Milestone A:

- whether `/diagnose/scenario` remains a debug route or redirects into `/diagnose?mode=deep`
- whether the inline deep module sits above the input card or beside it
- whether original text remains editable after deep reconstruction completes, or becomes read-only until reset

These should not block the contract, handoff, or deep-plan progression work.
