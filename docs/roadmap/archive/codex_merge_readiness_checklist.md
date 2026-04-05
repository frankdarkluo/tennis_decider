# Codex Merge-Readiness Checklist

## Task

Do a **merge-readiness closure pass** for the current feature branch.

The goal is **not** to add more features.
The goal is to turn the branch from **runnable/demoable** into **clean, reviewable, and safe to merge**.

---

## Scope

Treat the intended merge scope as only this product slice:

- inline deep orchestrator in `/diagnose`
- scenario reconstruction as deep subflow
- `EnrichedDiagnosisContext`
- single `DiagnoseResult` surface with deep enrichments
- `/plan` consuming deep context
- serve gold slice deterministic deep 7-day overlay
- targeted tests required to support the above

Do **not** expand beyond this slice.

---

## What NOT to do

Do **not**:

- add more feature work
- expand more technique families in this pass
- redesign diagnosis again
- redesign plan generation again
- do unrelated cleanup just because it is nearby
- bring temporary/local/debug assets into `main` unless truly necessary
- claim merge-ready based only on “the page runs on localhost”

---

## Deliverables

Produce a merge-readiness summary with these sections:

1. **Files recommended to merge into `main`**
2. **Files recommended to exclude for now**
3. **Verification performed**
4. **Remaining risks**
5. **Merge recommendation**
   - `ready to merge`
   - or `hold, fix X first`

Be concrete. Name exact files.

---

## Checklist

### A. Lock the merge boundary

- [ ] Confirm the branch’s merge goal is only the deep-diagnose mainline slice listed above.
- [ ] Confirm no extra unfinished family expansions are included.
- [ ] Confirm no unrelated prototype leftovers are being treated as part of the merge by default.

### B. Inspect the file set

- [ ] Review `git status`
- [ ] Review `git diff --name-only main...HEAD`
- [ ] Classify every changed file into one of:
  - `required for merge`
  - `optional but acceptable`
  - `should not merge yet`
- [ ] Flag any temporary/debug/local-only assets
- [ ] Flag any process-only docs or experimental artifacts that should stay out

### C. Verify the core technical slice

Run the smallest sufficient set of validations for this branch:

- [ ] deep diagnose orchestrator tests
- [ ] deep scenario module tests
- [ ] enriched diagnosis context tests
- [ ] deep diagnose result tests
- [ ] deep plan overlay tests
- [ ] plan context tests
- [ ] plan fixtures / plan microcycle regressions
- [ ] study plan draft persistence tests
- [ ] `npm run build`

Do not broaden into unrelated global cleanup.

### D. Verify the core manual path

Manually verify the main user path only:

- [ ] open `/diagnose`
- [ ] choose `deep`
- [ ] complete inline scenario reconstruction for the serve gold slice
- [ ] confirm the flow stays inside `/diagnose`
- [ ] confirm the enriched `DiagnoseResult` appears
- [ ] confirm deep-specific plan CTA appears
- [ ] enter `/plan`
- [ ] confirm `/plan` is using deep context
- [ ] confirm Day 1–7 stay scene-specific
- [ ] confirm Day 4–7 do not decay into generic filler

### E. Check standard-mode safety

- [ ] confirm quick / standard mode still work
- [ ] confirm standard mode does not accidentally show deep-only UI
- [ ] confirm `/plan` still works without deep context

### F. Check state cleanliness

- [ ] confirm entering deep mode initializes state cleanly
- [ ] confirm finishing reconstruction writes state back into `/diagnose`
- [ ] confirm resetting/changing input does not leak stale enriched context
- [ ] confirm `/diagnose/scenario` is truly only a bridge/debug route if still present

### G. Decide what should NOT merge

Be strict here.

Examples that often should **not** merge unless necessary:

- debug/prototype-only route wrappers
- local smoke scripts that are only for one machine
- temporary screenshots / logs / scratch docs
- half-finished family-specific overlays
- helper files that exist only because of experimentation

If a file can be removed without breaking the intended merged slice, strongly consider excluding it.

---

## Output format

At the end, respond using exactly this structure:

### 1. Recommended to merge into `main`
- `path/to/file`
- `path/to/file`

### 2. Recommended to keep out of `main` for now
- `path/to/file` — short reason
- `path/to/file` — short reason

### 3. Verification performed
- command / check
- result

### 4. Remaining risks
- concise bullet
- concise bullet

### 5. Merge recommendation
- `ready to merge`
- or `hold`

If `hold`, name the exact blocker(s).

---

## Decision rule

Only recommend **ready to merge** if all of the following are true:

- the merged slice is clearly bounded
- the changed file set is explainable
- the targeted tests pass
- build passes
- the manual deep path works
- standard mode is not regressed
- there are no obvious temporary/debug artifacts being accidentally pulled into `main`

Otherwise recommend **hold** and explain exactly what still needs cleanup.
