# TennisLevel Project Review

## 1. Diagnosis of Current Problems

### A. Project Structure — Moderate clutter, mostly at root level

| Issue | Location | Severity |
|-------|----------|----------|
| Orphaned planning docs at root | `codex_merge_readiness_checklist.md`, `tennislevel_scenario_reconstruction_codex_plan.md` | Low — archive to `docs/` |
| Cached script output committed | `scripts/thumbnail-results.json` (45KB) | Low — should be gitignored |
| Duplicate study snapshots | `src/data/studySnapshot/` has two creator versions (both 212KB, near-identical) | Low — keep latest only |
| `.DS_Store` in tree | Root and docs | Trivial |
| Stale `.env.example` snapshot version | References `2026-03-29-v1` when `2026-03-31-v1` exists | Low |
| Gender question collected, never used | `assessmentQuestions.ts` profile phase | Low — dead weight in UX |

Overall: the codebase is **well-organized**. Clutter is cosmetic, not structural. No major dead code paths.

---

### B. Assessment — Structurally sound, but too shallow for reliable evaluation

**Current flow:** 1 profile question → 3 coarse questions → 3 branch-specific fine questions = **6 scored questions total** determining NTRP level.

**Core problems:**

1. **Single-question dimensions.** Each skill dimension (rally, serve, awareness, etc.) rests on exactly one question. One misread or ambiguous answer skews an entire dimension. There's no redundancy or cross-validation.

2. **Branch thresholds create cliff effects.** Coarse score 5 vs 6 routes to completely different question sets (Branch A vs B). A player on the boundary gets asked fundamentally different questions, potentially landing at different levels for a 1-point difference in a single answer.

3. **Score 2 is invisible.** Strengths require score ≥3; weaknesses require score =1. Score 2 ("below average but not terrible") generates zero feedback — no strength, no weakness, no observation. This is the most common response for intermediate players.

4. **Branch C thresholds are skewed.** Fine score range is 3–12, but the 4.0 threshold is at 11 and 4.5 at >15 (impossible — max is 12). This means **4.5 is unreachable**. The level is dead code.

5. **No movement, forehand, or backhand questions.** The type system defines 21 dimensions; only 12 are populated. Key tennis-specific dimensions like `forehand`, `backhand`, and `movement` are never directly assessed.

6. **Summaries are generic.** The same one-liner is shown to all users at a given level, regardless of their specific dimension profile. A 3.0 player weak on serve gets the same text as a 3.0 player weak on consistency.

---

### C. Diagnosis → Plan Connection — Strong core, systematic gaps at the edges

**What works well:**
- 24 of ~30 problemTags have matching plan templates — the happy path is solid
- `primaryNextStep` from diagnosis overrides Day 1 focus — good personalization
- Content seeding propagates diagnosis video recommendations into plan days
- Context overlays (feeling, outcome, pressure) meaningfully customize drill blocks
- Deep mode (serve gold slice) demonstrates the target quality bar

**What breaks:**

1. **6 diagnosis rules have NO plan template.** These fall back to a generic 7-day plan, losing all specificity:
   - `rally-consistency`, `forehand-no-power`, `balls-too-short`
   - `return-under-pressure`, `cant-hit-lob`, `stamina-drop`
   
   These are common user complaints. A user who types "正手打不出力量" gets correctly diagnosed but then receives a generic plan — the connection feels broken.

2. **Plan context is shallow by default.** Without deep mode (currently only serve), the plan gets `problemTag + level + primaryNextStep` but no structured scene context. This means most plans are template-driven with minor keyword overlays, not truly personalized.

3. **Assessment → Plan link is indirect.** Assessment weaknesses map to `ASSESSMENT_DIMENSION_HINTS` → possible problemTags → plan templates. But this mapping is coarse: the `forehand` dimension hints at 4 different problem tags. The system guesses which one without further input.

4. **Content diversity is uncontrolled per-day.** The scoring and de-duplication logic is sophisticated, but the keyword-to-content matching for later days (Day 4–7) becomes increasingly generic as preferred seeds are exhausted.

---

## 2. Improvement Plan

### A. Project Cleanup (Low risk, immediate)

1. Move `codex_merge_readiness_checklist.md` and `tennislevel_scenario_reconstruction_codex_plan.md` to `docs/roadmap/archive/`
2. Add `scripts/thumbnail-results.json` and `.DS_Store` to `.gitignore`
3. Delete `src/data/studySnapshot/creators.2026-03-29-v1.json` and `metadata.2026-03-29-v1.json` (keep `2026-03-31-v1` versions)
4. Update `.env.example` snapshot version to `2026-03-31-v1`
5. Remove or comment out the gender profile question (collected, never used, adds friction)

### B. Assessment Redesign (Medium risk, high impact)

**Target:** 3 coarse + 5–7 fine questions = **8–10 scored questions**, still branching, same flow feeling.

| Change | Rationale |
|--------|-----------|
| Add 2 new coarse questions: **movement** and **consistency under pressure** | Current coarse phase misses two of the most differentiating NTRP dimensions |
| Expand each branch from 3 to 4–5 fine questions | Enables 2-question coverage on critical dimensions (cross-validation) |
| Smooth branch boundaries | Use overlapping score ranges instead of hard cutoffs — e.g., score 5–6 asks 1–2 "bridge" questions from both A and B |
| Fix Branch C scoring | Max is 12 but 4.5 requires >15 — rebalance to achievable thresholds (e.g., ≤6 → 3.5, 7–10 → 4.0, ≥11 → 4.5) |
| Add score-2 feedback | "Needs attention" tier between weakness (1) and normal (2–4) |
| Personalize summaries | Template summary incorporates the user's top-2 weak dimensions instead of generic level text |

**Preserve:** Branching architecture, auto-advance UX, localStorage draft, bilingual support, existing test infrastructure.

### C. Diagnosis → Plan Strengthening (Medium risk, high impact)

| Change | Rationale |
|--------|-----------|
| Write plan templates for 6 missing problemTags | Closes the biggest gap — users who get diagnosed but receive generic plans |
| Pass structured diagnosis signals into plan context | Today, plan context is built from URL params. Instead, serialize the full signal bundle (stroke, outcome, feeling, pressure) so every plan can customize, not just deep-mode serve |
| Use assessment weak dimensions to weight plan emphasis | If assessment says movement is weak AND diagnosis says "forehand out", plan should include movement-specific warm-ups on forehand days |
| Add "plan rationale" section | Show user: "This plan targets X because your diagnosis found Y" — makes the connection visible, not just structural |

---

## 3. Key Tradeoffs and Risks

| Decision | Tradeoff |
|----------|----------|
| Expanding to 8–10 questions | More reliable evaluation, but higher abandonment risk. Mitigate: keep auto-advance, show progress clearly, aim for under 3 minutes total |
| Bridge questions at branch boundaries | Better accuracy for borderline players, but adds complexity to scoring logic and tests. Mitigate: keep bridge to 1–2 questions max |
| Writing 6 new plan templates | Each template is ~80 lines of bilingual content across 7 days. Total effort: ~500 lines. Risk: quality control on drill/content alignment |
| Passing full signal context to plans | More personalization, but URL param size increases. Mitigate: use localStorage for context transfer instead of URL encoding |
| Assessment → plan weighting | Tighter coupling between modules. Risk: changes to assessment scoring ripple into plan quality. Mitigate: keep the connection through a stable interface (`weakDimensions[]`) |

---

## 4. Recommended Execution Order

```
Phase 1 (Cleanup)       → Low risk, 1 session
Phase 2 (Assessment)    → Medium risk, 2–3 sessions
Phase 3 (Plan gap fill) → Medium risk, 1–2 sessions  
Phase 4 (Connection)    → Higher risk, 1–2 sessions
```

**Phase 1 first** because it's free wins and reduces noise.  
**Phase 2 before Phase 3** because assessment results feed into diagnosis hints, which feed into plan selection — fixing the input improves all downstream quality.  
**Phase 3 before Phase 4** because templates must exist before the connection logic can route to them.

---

## 5. Codex Task List

### Phase 1: Project Cleanup

```
Task 1.1: Move root planning docs to docs/roadmap/archive/
- Move codex_merge_readiness_checklist.md → docs/roadmap/archive/
- Move tennislevel_scenario_reconstruction_codex_plan.md → docs/roadmap/archive/
- Do NOT delete; these are historical records

Task 1.2: Gitignore additions
- Add scripts/thumbnail-results.json to .gitignore
- Add .DS_Store to .gitignore (if not already present)
- Remove tracked .DS_Store files from git index

Task 1.3: Prune stale study snapshots
- Delete src/data/studySnapshot/creators.2026-03-29-v1.json
- Delete src/data/studySnapshot/metadata.2026-03-29-v1.json
- Keep the 2026-03-31-v1 versions
- Update src/data/studySnapshot/index.ts if it references deleted files

Task 1.4: Update .env.example
- Change NEXT_PUBLIC_STUDY_SNAPSHOT_VERSION from 2026-03-29-v1 to 2026-03-31-v1

Task 1.5: Verify and run tests
- npm run build
- npm run test
```

### Phase 2: Assessment Redesign

```
Task 2.1: Fix Branch C scoring thresholds
- In src/lib/assessment.ts, change Branch C fine score thresholds:
  - ≤6 → Level 3.5
  - 7–10 → Level 4.0
  - ≥11 → Level 4.5
- Update tests in src/__tests__/assessment-*.test.ts

Task 2.2: Add 2 new coarse questions
- Add to src/data/assessmentQuestions.ts:
  - coarse_movement (dimension: "movement"):
    "你在场上的移动和跑位如何？"
    Options: 1=Often rooted / 2=Move but late / 3=Reach most balls / 4=Recover quickly, rarely wrong-footed
  - coarse_pressure (dimension: "pressure_performance"):
    "比赛或对打中比分紧张时你的表现？"
    Options: 1=Fall apart / 2=Tighten up, more errors / 3=Play about the same / 4=Often raise my level
- Update coarse score range and branch boundaries:
  - New max coarse score = 20 (5 questions × 4)
  - Branch A: ≤8, Branch B: 9–14, Branch C: ≥15
- Add bilingual translations in src/lib/i18n/assessmentCopy.ts
- Update src/lib/assessment.ts scoring logic
- Update assessment tests

Task 2.3: Add fine questions per branch (expand from 3 to 4)
- Branch A: add fine_a_movement (dimension: "movement")
  "你打球时跑位和还原做得怎么样？"
  Options: 1=Stay in one spot / 2=Move but don't recover / 3=Usually get back to position / 4=Natural recovery after each shot
- Branch B: add fine_b_serve_game (dimension: "serve")
  "你的发球局稳定吗？"
  Options: 1=Lose most serve games / 2=Hold sometimes / 3=Hold more than lose / 4=Serve is a reliable weapon
- Branch C: add fine_c_adaptability (dimension: "tactical_adaptability")
  "你能根据对手调整打法吗？"
  Options: 1=Play the same regardless / 2=Notice what to do but can't execute / 3=Can adjust mid-match / 4=Actively game-plan for opponent
- Add bilingual translations
- Update branch fine score calculations
- Update assessment tests

Task 2.4: Add score-2 feedback tier
- In src/lib/assessment.ts:
  - Change weakness threshold from score === 1 to score <= 2
  - Add new status: score === 1 → "薄弱" (weak), score === 2 → "待提升" (needs work), score >= 3 → "正常", score === 4 → "强项"
- Update src/components/assessment/SkillBreakdown.tsx to render the new tiers with distinct colors
- Update src/components/assessment/ResultSummary.tsx for new tier display

Task 2.5: Personalize result summaries
- In src/lib/assessment.ts, change summary generation:
  - Instead of hard-coded level template, generate:
    "你的能力区间接近 {level}。{weakest_dimension_1} 和 {weakest_dimension_2} 是目前最值得优先提升的方向。"
  - English: "Your skill level is around {level}. {dim1} and {dim2} are your highest-priority areas for improvement."
- Add bilingual dimension display names if not already present
- Update assessment tests for new summary format

Task 2.6: Verify assessment changes
- npm run test -- src/__tests__/assessment
- npm run build
- Manual check: complete assessment in all 3 branches, verify level assignment and summary
```

### Phase 3: Fill Missing Plan Templates

```
Task 3.1: Create plan template for rally-consistency
- Add to src/data/planTemplates.ts
- 7-day structure: Day 1–2 rally rhythm drills, Day 3–4 target placement, Day 5 rally under movement, Day 6 rally under pressure, Day 7 consolidation
- Include levels 3.0 and 3.5
- Bilingual (zh/en focus, drills, goals, success criteria)

Task 3.2: Create plan template for forehand-no-power
- 7-day structure: Day 1–2 kinetic chain and rotation isolation, Day 3–4 contact point and timing, Day 5 power with targets, Day 6 power under movement, Day 7 consolidation
- Include levels 3.0 and 3.5

Task 3.3: Create plan template for balls-too-short
- 7-day structure: Day 1–2 depth awareness and follow-through, Day 3–4 topspin clearance over net, Day 5 depth under pressure, Day 6 depth with direction, Day 7 consolidation
- Include levels 3.0 and 3.5

Task 3.4: Create plan template for return-under-pressure
- 7-day structure: Day 1–2 split step and ready position, Day 3–4 return placement targets, Day 5 return against fast serves, Day 6 return under scoreboard pressure, Day 7 consolidation
- Include levels 3.0, 3.5, and 4.0

Task 3.5: Create plan template for cant-hit-lob
- 7-day structure: Day 1–2 contact point and swing path, Day 3–4 defensive lob depth, Day 5 offensive lob timing, Day 6 lob under pressure, Day 7 consolidation
- Include levels 3.0 and 3.5

Task 3.6: Create plan template for stamina-drop
- 7-day structure: Day 1–2 footwork efficiency, Day 3–4 recovery positioning, Day 5 point construction to shorten rallies, Day 6 match simulation with fatigue, Day 7 consolidation
- Include levels 3.0, 3.5, and 4.0
- Note: PLAN_COMPATIBILITY_FALLBACKS maps stamina-drop → movement-slow; keep fallback but prefer dedicated template

Task 3.7: Verify plan templates
- npm run test -- src/__tests__/plan
- npm run validate:data
- npm run build
```

### Phase 4: Strengthen Diagnosis → Plan Connection

```
Task 4.1: Pass structured diagnosis context to plan via localStorage
- In src/app/diagnose/page.tsx: after diagnosis, save to localStorage:
  {
    problemTag, level, primaryNextStep, preferredContentIds,
    signals: { strokeFamily, outcome, feeling, pressure, movement }
  }
- In src/app/plan/page.tsx: read from localStorage as primary context source, fall back to URL params
- Remove over-long URL encoding of planContext/deepContext; keep only problemTag, level, source in URL

Task 4.2: Wire assessment weak dimensions into plan customization
- In src/lib/plans.ts, add applyAssessmentWeights():
  - Read assessment result from storage
  - If weakest dimension is "movement" → boost movement drills in warmup blocks
  - If weakest dimension is "serve" → add serve warm-up routine on non-serve focus days
  - If weakest dimension is "consistency" → add rally stability drill to Day 1 warmup
- Call after applyPlanContext() in plan generation chain

Task 4.3: Add plan rationale section
- In src/types/plan.ts, add to GeneratedPlan:
  rationale: { problemTag: string, primaryNextStep: string, assessmentWeaknesses: string[], source: "diagnosis" | "assessment" | "fallback" }
- In src/components/plan/PlanSummary.tsx:
  - Show: "这份计划针对：{problemTag description}。你的诊断建议：{primaryNextStep}"
  - If assessment weaknesses present: "同时兼顾你评估中的薄弱项：{dimensions}"
- Bilingual support

Task 4.4: Final integration verification
- npm run test
- npm run build
- Manual flow: complete assessment → diagnose problem → generate plan → verify plan references diagnosis and assessment
```
