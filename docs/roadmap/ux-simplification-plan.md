---
aliases:
  - UX Simplification Plan
  - Improvement Plan 2026-04
tags:
  - type/roadmap
  - area/product
  - area/ux
  - status/active
---

# UX Simplification & Flow Coherence Plan

## Related docs
- [[index]]
- [[roadmap/current]]
- [[roadmap/next-steps]]
- [[product/principles]]
- [[product/boundaries]]
- [[product/definition-of-done]]
- [[engineering/diagnosis-observability]]

---

## Part 1: Diagnosis of Current Problems

### 1.1 UI Complexity — accumulated layers without pruning

The diagnosis result page (`DiagnoseResult.tsx`, 562 lines) has three progressive-disclosure layers, each adding more content. The intention was good (don't overload), but the result is confusing:

- **Layer 1**: title + summary + "next step" box + evidence bar + fallback notice + narrowing mode. Already 5–6 visual blocks before the user clicks anything.
- **Layer 2**: detailed summary + causes + drills (deep only) + featured video + deep-mode scene box + 3 CTA buttons + "expand more" link. Another 4–7 blocks.
- **Layer 3**: additional video recommendations + continue/video-diagnose links.

A user who came in with "正手出界" sees a minimum of 5 blocks on first load, and must click twice to see the plan CTA. The "progressive disclosure" is actually progressive **hiding** of the action the user most likely wants.

**The plan page** (`plan/page.tsx`, 429 lines) has similar density: summary card + today step + later steps + save/regenerate buttons + follow-up CTAs + save status banner. For a 7-step plan, the later-steps section alone produces 6 collapsed cards.

**The home page** gates behind assessment completion, showing a blank card if the user hasn't taken the quiz. This makes the fastest path to value (describe a problem → get help) inaccessible without first doing an assessment the user may not want.

### 1.2 Assessment → Diagnosis → Plan connection — conceptually strong, structurally fragile

The three modules are **loosely coupled through URL parameters and localStorage**:

```
assessment/result → passes `level` + `planContext` via URL → /plan
diagnose          → passes `problemTag` + `level` + `primaryNextStep` + `planContext` + `deepContext` via URL → /plan
```

Problems:

1. **Assessment result doesn't inform diagnosis.** The assessment determines the user's level and weak dimensions, but the diagnosis page only reads the assessment to generate a fallback when no text input matches. If the user types "正手出界", the assessment weak-dimension data is ignored entirely. The two modules run independently rather than building on each other.

2. **Diagnosis → Plan handoff is string-encoded.** The `planContext` and `deepContext` are serialized into URL query params. This works but is fragile — long descriptions hit URL length limits, and the encoding/decoding logic adds 200+ lines of bookkeeping in `plans.ts`.

3. **6 diagnosed problemTags have no matching plan template.** Users who get diagnosed as `rally-consistency`, `forehand-no-power`, `balls-too-short`, `return-under-pressure`, `cant-hit-lob`, or `stamina-drop` receive a generic fallback plan. These are common complaints. The diagnostic precision is wasted.

4. **Assessment summary is level-generic.** Two players at 3.0 with completely different dimension profiles get the same summary text. The personalized `buildSummary()` function exists but only mentions the top-2 weak dimensions — it doesn't shape the downstream plan or diagnosis in any structural way.

### 1.3 Information density — oscillates between sparse and overwhelming

- **Assessment result page**: sparse. Shows a level badge, a one-sentence summary, a dimension bar chart, and 2–3 short-weakness labels. Users finish and wonder "so what?"
- **Diagnosis result page**: dense. The cause/fix/drill/recommendation/evidence/narrowing sections create a wall of text that makes the single actionable message hard to find.
- **Plan page**: medium but repetitive. Each of the 7 steps has the same structure (focus + what to practice + how long + watch this + goal + warmup + main + pressure + success criteria + intensity + tempo), and the later steps are often generic.

The core problem: **the system treats every signal as equally important**. A tennis user who said "二发没信心" needs one clear next action and one video. They don't need evidence-level labels, narrowing prompts, coach notes, subtitle availability badges, secondary titles, and outbound click tracking — all of which are currently rendered.

---

## Part 2: Design Principles for Improvement

### P1: One answer first, depth on request

Every output surface should lead with exactly one sentence answering "what should I do next?" — not a diagnosis label, not a category, not a confidence expression. The user's first visible result should be an action.

### P2: Assessment and diagnosis should compound, not run in parallel

If the user has already completed the assessment, their level and weak dimensions should visibly shape the diagnosis and plan. If they haven't, the system should still work — but note what's missing and why the recommendation would be better with assessment data.

### P3: Show less by default, make depth discoverable

The current 3-layer system is mechanically correct but visually wrong. Default should be: action + one supporting reason + plan CTA. Everything else (causes, evidence, drills, videos) moves to a single "Why this?" expandable section.

### P4: The plan should feel like a prescription, not a syllabus

A 7-step plan where every step has warmup/main/pressure/criteria/intensity/tempo reads like a course outline. Tennis users at 3.0–3.5 need: what to practice, how to know if it's working, and what to watch. Not a formatted training program.

### P5: Let diagnosis quality drive plan quality

Instead of having the plan template system guess what drills and videos to include, let the diagnosis result directly seed the plan's day-1 content. The plan generator should consume the diagnosis output as structured input, not reconstruct it from URL params.

---

## Part 3: Proposed Future Flow

### 3.1 Entry

```
User arrives at /
  ├─ Option A: Type or tap a problem → /diagnose?q=...
  └─ Option B: "不确定？先做评估" → /assessment
```

**Remove the assessment gate on the home page.** The home page should always show the hero section with the problem input box. The assessment is a secondary path for users who don't know what their problem is.

### 3.2 Assessment (when taken)

```
/assessment → answer 8–10 questions → /assessment/result
  Result shows:
    - Level estimate (e.g. "接近 3.5")
    - Top 2 weak dimensions with one-line explanation each
    - Primary CTA: "根据你的薄弱环节做诊断" → /diagnose?context=assessment
    - Secondary: "直接生成训练计划" → /plan?source=assessment
```

The assessment result page should **push the user toward diagnosis**, not present 3 equal CTAs. The assessment alone is not enough to generate a good plan — it needs to be combined with a specific problem.

### 3.3 Diagnosis (the core interaction)

```
/diagnose
  Input: free text (optionally pre-seeded with assessment weak area)
  Output (single view, no layers):
    ┌──────────────────────────────────┐
    │ 诊断结果: {title}                │
    │                                  │
    │ 下一步: {primaryNextStep}        │
    │ 原因: {cause, 1 sentence}        │
    │                                  │
    │ [生成训练计划]  [看推荐视频]      │
    │                                  │
    │ ▸ 为什么这么判断？(expandable)    │
    │   - detailed causes              │
    │   - evidence level               │
    │   - deep-mode scene recap        │
    │   - all recommended videos       │
    └──────────────────────────────────┘
```

Key changes:
- **Flatten to 1 level** with one expandable section. No layer 1/2/3.
- **Plan CTA is always visible** — never hidden behind an "expand" click.
- Evidence confidence label moves inside the expandable section. Users don't need to see "当前证据：较低" before they see the actual recommendation.
- Narrowing mode (when evidence is too thin) still works: show the action prompt asking the user to be more specific, but keep it as a callout within the same card, not a separate UI state.

### 3.4 Diagnosis → Plan handoff

```
/diagnose → click "生成训练计划" → /plan

Data passed via localStorage (not URL):
{
  problemTag,
  level,
  primaryNextStep,
  causes: [...],
  recommendedContentIds: [...],
  assessmentWeakDimensions: [...],   // if assessment was done
  deepContext: { ... }                // if deep mode was used
}
```

Move the context transfer to localStorage with a stable key like `tennislevel:plan-draft`. Keep only `problemTag` and `level` in the URL for shareability.

### 3.5 Plan (output)

```
/plan
  ┌──────────────────────────────────┐
  │ 你的 7 步训练计划                 │
  │ 针对: {primaryNextStep}           │
  │ 当前等级: {level}                 │
  │                                  │
  │ ■ 第 1 步 (今天)                  │
  │   练什么: {focus}                 │
  │   怎么判断练好了: {criteria}       │
  │   看这条: {video}                 │
  │                                  │
  │ ▸ 第 2 步                         │
  │ ▸ 第 3 步                         │
  │ ...                              │
  │                                  │
  │ [保存]  [重新生成]                │
  └──────────────────────────────────┘
```

Key changes:
- **Step 1 is expanded by default.** Later steps are collapsed.
- Each step shows only: focus + success criteria + one video. The warmup/main/pressure/intensity/tempo fields move into an expandable "详细安排" section per step.
- The summary card at the top is simpler: just the target problem and level. Remove the rationale badge, the supporting text, and the assessment focus line from the default view.

---

## Part 4: Concrete Recommendations

### 4.1 Simplify DiagnoseResult

| Current | Proposed |
|---------|----------|
| 3 progressive layers | 1 default view + 1 expandable section |
| Evidence bar always visible | Evidence bar inside expandable |
| Plan CTA hidden in layer 2 | Plan CTA always visible after primaryNextStep |
| Separate narrowing UI state | Inline callout within same card |
| Fallback notice as separate block | Inline note under summary |
| Deep-mode scene box as separate section | Merged into expandable "为什么这么判断" |

**Files to modify:**
- `src/components/diagnose/DiagnoseResult.tsx` — major restructure
- `src/lib/i18n/dictionaries/zh.ts` — remove layer-specific keys, add new expandable section keys
- `src/lib/i18n/dictionaries/en.ts` — same

### 4.2 Simplify Plan page

| Current | Proposed |
|---------|----------|
| Summary card with badge + rationale + supporting text + focus line | Simple header: target problem + level |
| All 7 steps with full detail blocks | Step 1 expanded, steps 2–7 collapsed |
| Each step: 10 fields visible | Each step: 3 fields visible (focus, criteria, video); rest in "详细安排" toggle |
| Save + regenerate + follow-up CTAs + save message all at bottom | Save + regenerate only. Follow-up as inline links |

**Files to modify:**
- `src/components/plan/PlanSummary.tsx` — simplify
- `src/components/plan/DayPlanCard.tsx` — collapse detail fields by default
- `src/app/plan/page.tsx` — simplify layout

### 4.3 Remove home page assessment gate

| Current | Proposed |
|---------|----------|
| No assessment → shows "请先完成评估" card | Always show hero + problem input |
| Must complete assessment to see home content | Assessment is suggested, not required |

**Files to modify:**
- `src/app/page.tsx` — remove `assessment_required` gate state
- `src/lib/assessmentStorage.ts` — keep storage logic, remove mandatory check at home level

### 4.4 Wire assessment into diagnosis

| Current | Proposed |
|---------|----------|
| Diagnosis reads assessment only for fallback | Diagnosis always reads assessment result if available |
| Assessment weak dimensions ignored in diagnosis | If assessment says "发球" is weak and user mentions "发球", boost confidence |
| Plan ignores assessment weak dimensions | Plan adds dimension-specific warmup blocks if assessment data exists |

**Files to modify:**
- `src/lib/diagnosis.ts` — accept `assessmentResult` in scoring; if weak dimension matches input stroke family, add confidence bonus
- `src/lib/plans.ts` — add `applyAssessmentWeights()` function; if weakest dimension is "movement", inject movement warmup

### 4.5 Fill 6 missing plan templates

Create dedicated templates for: `rally-consistency`, `forehand-no-power`, `balls-too-short`, `return-under-pressure`, `cant-hit-lob`, `stamina-drop`.

**Files to modify:**
- `src/data/planTemplates.ts` — add 6 new template entries (already partially written in [[roadmap/next-steps]])

### 4.6 Move plan context from URL to localStorage

| Current | Proposed |
|---------|----------|
| `planContext` + `deepContext` encoded as URL query params | Stored in `localStorage` under `tennislevel:plan-draft` |
| URL can exceed browser limits for long inputs | URL stays short: only `?problemTag=X&level=Y&source=diagnosis` |
| Reading/writing 200+ lines of encode/decode logic | Simple JSON read/write |

**Files to modify:**
- `src/lib/plans.ts` — remove `encodePlanContext()` / `decodePlanContext()` URL helpers
- `src/app/plan/page.tsx` — read context from localStorage first, URL second
- `src/components/diagnose/DiagnoseResult.tsx` — write plan context to localStorage instead of building long URLs

---

## Part 5: Balancing Clarity, Conciseness, and Instructional Value

### Principle: tennis users are here to practice, not to read

The target user is a 3.0–3.5 player who plays 2–3 times per week. They have maybe 30 seconds of attention when looking at a diagnosis result before they go hit balls.

### What to show by default

| Element | Show by default? | Reason |
|---------|-----------------|--------|
| Problem title | Yes | Confirms "we understood you" |
| Primary next step (1 sentence) | Yes | The actual answer |
| One cause (1 sentence) | Yes | Minimal credibility signal |
| Plan CTA button | Yes | The primary action |
| Recommended video (1) | Yes | Immediate value |
| Evidence confidence label | No | Cognitive overhead without actionable meaning for the user |
| Detailed causes (3) | No | Available on request |
| Drills list | No | Belongs in the plan, not the diagnosis |
| Narrowing suggestions | Only if needed | Special state, not default |
| Deep scene recap | No | Available on request |
| Coach notes on videos | No | Clutter for non-coach users |
| Subtitle availability badges | No | Noise; show only on the video detail if clicked |

### What to show in the plan

| Element | Show by default? | Reason |
|---------|-----------------|--------|
| Step focus (1 sentence) | Yes | What to practice |
| Success criteria (1 sentence) | Yes | How to know it's working |
| One video | Yes | Watch and try |
| Goal / warmup / main / pressure / tempo / intensity | No | Available in "详细安排" toggle |
| Duration | Yes | Quick reference |

### Language tone

- Default to short, imperative Chinese: "先把击球点稳住" not "建议你优先关注击球点的稳定性"
- English follows the same: "Stabilize your contact point first" not "We recommend prioritizing contact point stability"
- Never use confidence qualifiers in the primary next-step line — save those for the expandable section

---

## Part 6: Prioritized Implementation Roadmap

### Phase 0: Quick cleanup (1 session, low risk)

| Task | Effort | Description |
|------|--------|-------------|
| 0.1 | Low | Remove home page assessment gate — always show hero section |
| 0.2 | Low | Move root planning docs to `docs/roadmap/archive/` |
| 0.3 | Low | Add `.DS_Store` and `scripts/thumbnail-results.json` to `.gitignore` |

**Codex difficulty: medium**

### Phase 1: Flatten diagnosis result UI (1–2 sessions, medium risk)

| Task | Effort | Files | Description |
|------|--------|-------|-------------|
| 1.1 | High | `DiagnoseResult.tsx` | Remove 3-layer system. Single view: title + summary + primaryNextStep + 1 cause + plan CTA + 1 video. One expandable "为什么" section for everything else |
| 1.2 | Medium | `zh.ts`, `en.ts` | Remove `diagnose.result.expand1`, `expand2`, `expand3` keys; add `diagnose.result.whyExpand` key |
| 1.3 | Medium | `DiagnoseResult.tsx` | Move evidence bar, deep-mode scene box, additional videos, drills into the expandable section |
| 1.4 | Low | `DiagnoseResult.tsx` | Ensure plan CTA is always visible without expanding |
| 1.5 | Medium | `src/__tests__/app-smoke.test.tsx`, `deep-diagnose-result.test.tsx` | Update tests for new single-layer structure |

**Codex difficulty: high** — this is the most impactful single change. The file is 562 lines and has many conditional branches. Break into sub-tasks.

### Phase 2: Simplify plan page (1 session, medium risk)

| Task | Effort | Files | Description |
|------|--------|-------|-------------|
| 2.1 | Medium | `PlanSummary.tsx` | Reduce to: target problem + level. Remove badge, rationale, focus line from default view |
| 2.2 | Medium | `DayPlanCard.tsx` | Collapse detail fields (warmup/main/pressure/intensity/tempo) behind a "详细安排" toggle. Show only: focus + criteria + video + duration |
| 2.3 | Low | `plan/page.tsx` | Remove follow-up CTA section (diagnose link, profile link). Keep only save + regenerate |
| 2.4 | Low | `zh.ts`, `en.ts` | Add `plan.day.details` expand/collapse key |

**Codex difficulty: medium**

### Phase 3: Fill missing plan templates (1–2 sessions, medium risk)

| Task | Effort | Files | Description |
|------|--------|-------|-------------|
| 3.1–3.6 | Medium each | `planTemplates.ts` | Write 6 templates: `rally-consistency`, `forehand-no-power`, `balls-too-short`, `return-under-pressure`, `cant-hit-lob`, `stamina-drop` |
| 3.7 | Low | `src/__tests__/plan-rationale.test.ts` | Add test cases for new templates |

**Codex difficulty: medium** — mostly content authoring, not logic changes. See [[roadmap/next-steps]] Tasks 3.1–3.6 for full specs.

### Phase 4: Wire assessment into diagnosis + plan (1–2 sessions, higher risk)

| Task | Effort | Files | Description |
|------|--------|-------|-------------|
| 4.1 | Medium | `diagnosis.ts` | If `assessmentResult` is provided and user input matches a weak dimension, add score bonus to matching rules |
| 4.2 | Medium | `plans.ts` | Add `applyAssessmentWeights()`: read assessment result from storage, if weakest dimension matches plan's stroke family, add dimension-specific warmup |
| 4.3 | Medium | `diagnose/page.tsx` | Always pass `assessmentResult` to `diagnoseProblem()` if available in storage |
| 4.4 | Low | `assessment/result/page.tsx` | Change primary CTA from 3 equal buttons to: 1 primary "去诊断" + 2 secondary |

**Codex difficulty: high** — touches diagnosis scoring and plan generation logic. Must preserve existing test suite.

### Phase 5: Move plan context to localStorage (1 session, medium risk)

| Task | Effort | Files | Description |
|------|--------|-------|-------------|
| 5.1 | Medium | `DiagnoseResult.tsx`, `plan/page.tsx` | Write plan context to `localStorage` on CTA click; read from `localStorage` on plan page load; fall back to URL params |
| 5.2 | Medium | `plans.ts` | Remove or simplify `encodePlanContext()` / `decodePlanContext()` URL encoding. Keep `buildPlanHref()` but limit to `problemTag + level + source` |
| 5.3 | Low | `src/__tests__/app-smoke.test.tsx` | Update plan page tests for localStorage-first reading |

**Codex difficulty: medium**

### Phase 6: Assessment redesign (2–3 sessions, higher risk)

| Task | Effort | Files | Description |
|------|--------|-------|-------------|
| 6.1 | Low | `assessment.ts` | Fix Branch C scoring: ≤6 → 3.5, 7–10 → 4.0, ≥11 → 4.5 |
| 6.2 | Medium | `assessmentQuestions.ts`, `assessment.ts` | Expand each branch from 3–4 to 4–5 fine questions. Update branch score ranges |
| 6.3 | Medium | `assessment.ts` | Personalize summaries: incorporate top-2 weak dimensions instead of level-generic text (already implemented in `buildSummary()` — verify it's used everywhere) |
| 6.4 | Medium | `ResultSummary.tsx`, `SkillBreakdown.tsx` | Render score-2 "待提升" tier with distinct visual treatment |
| 6.5 | Medium | `src/__tests__/assessment-*.test.ts` | Update all assessment tests |

**Codex difficulty: xhigh** — branching logic, scoring thresholds, and test coverage must all stay consistent. See [[roadmap/next-steps]] Tasks 2.1–2.6 for full specs.

---

## Part 7: Key Files Reference

| Area | Primary files |
|------|--------------|
| Diagnosis result UI | `src/components/diagnose/DiagnoseResult.tsx` |
| Diagnosis logic | `src/lib/diagnosis.ts` |
| Diagnosis rules data | `src/data/diagnosisRules.ts` |
| Plan page | `src/app/plan/page.tsx` |
| Plan generation | `src/lib/plans.ts` |
| Plan templates | `src/data/planTemplates.ts` |
| Plan day card | `src/components/plan/DayPlanCard.tsx` |
| Plan summary | `src/components/plan/PlanSummary.tsx` |
| Assessment logic | `src/lib/assessment.ts` |
| Assessment questions | `src/data/assessmentQuestions.ts` |
| Assessment result page | `src/app/assessment/result/page.tsx` |
| Home page | `src/app/page.tsx` |
| i18n dictionaries | `src/lib/i18n/dictionaries/zh.ts`, `en.ts` |
| Deep diagnosis context | `src/lib/diagnose/enrichedContext.ts` |
| Enriched diagnosis types | `src/types/enrichedDiagnosis.ts` |

---

## Part 8: What Not to Change

- **Study mode infrastructure** — session lifecycle, event logging, artifacts, export. These are stable and research-dependent.
- **Frozen `/library` and `/rankings` ordering** — per [[product/boundaries]].
- **Content data** (`contents.ts`, `expandedContents.ts`, `creators.ts`) — the 1065-item content library is curated and should not be modified as part of UX changes.
- **Supabase schema, auth, deployment** — absolute no-go zones.
- **Study event semantics** — don't change what events mean or their shape.

---

## Part 9: Success Criteria

After all phases:

1. A user who types "正手出界" on the home page sees a clear next action, one video, and a plan CTA **without scrolling or expanding anything**.
2. A user who has completed the assessment sees their weak dimensions reflected in the diagnosis and plan — not just the level number.
3. Every diagnosed `problemTag` has a matching plan template. No user who gets a specific diagnosis falls back to a generic plan.
4. The plan page shows one expanded step with 3 fields (focus, criteria, video). Later steps are collapsed. A user can scan the whole plan in 10 seconds.
5. The assessment result page has one clear next action ("go diagnose your biggest problem"), not 3 equal buttons.
