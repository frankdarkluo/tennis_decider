# Plan Quality Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the `/plan` experience so day-by-day training feels clearer and more targeted for the newly expanded diagnosis tags while staying deterministic and study-safe.

**Architecture:** Keep the existing `GeneratedPlan` and `DayPlan` contract unchanged, but improve three layers in order: hand-authored templates, deterministic day-level content assignment, and `DayPlanCard` information hierarchy. Problem-tag specificity leads the design, while `level` only lightly tunes duration, difficulty, and content difficulty.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Testing Library

---

## File Structure

- Modify: `src/data/planTemplates.ts`
  Purpose: Upgrade or add the highest-priority `problemTag` templates and rewrite daily `focus` / `drills` copy so each day has a clearer main job.
- Modify: `src/lib/plans.ts`
  Purpose: Reduce weak compatibility fallbacks, improve day-specific content assignment, and keep assessment/fallback routing deterministic.
- Modify: `src/data/contents.ts`
  Purpose: Add a very small number of honest curated teaching videos from existing creators only when existing curated and expanded pools cannot cover the upgraded templates well enough.
- Modify: `src/components/plan/DayPlanCard.tsx`
  Purpose: Make the card easier to scan in the order `focus -> drills -> duration -> watch` without adding new data fields.
- Modify: `src/__tests__/content-display.test.ts`
  Purpose: Lock template coverage, candidate ordering, fallback behavior, and day-level content specificity.
- Modify: `src/__tests__/bilingual-rendering.test.tsx`
  Purpose: Lock visible `DayPlanCard` hierarchy and bilingual rendering.
- Modify: `src/__tests__/surface-localization.test.tsx`
  Purpose: Lock localized plan-day labels after the card hierarchy adjustment.
- Modify: `src/__tests__/app-smoke.test.tsx`
  Purpose: Keep `/plan` rendering stable after the copy and layout adjustments.

## Task 1: Lock The Plan Upgrade With Failing Tests

**Files:**
- Modify: `src/__tests__/content-display.test.ts`
- Modify: `src/__tests__/bilingual-rendering.test.tsx`
- Modify: `src/__tests__/app-smoke.test.tsx`

- [ ] **Step 1: Add failing plan-specific assertions for upgraded tags and fallback clarity**

```ts
it("returns dedicated templates for upgraded plan-quality priority tags", () => {
  const overheadPlan = getPlanTemplate("overhead-timing", "3.0", "zh");
  const volleyFloatPlan = getPlanTemplate("volley-floating", "3.0", "zh");
  const runningForehandPlan = getPlanTemplate("running-forehand", "3.0", "zh");
  const fallbackPlan = getPlanTemplate("general-improvement", "3.0", "zh");

  expect(overheadPlan.source).toBe("template");
  expect(overheadPlan.title).toContain("高压");
  expect(volleyFloatPlan.source).toBe("template");
  expect(volleyFloatPlan.title).toContain("截击");
  expect(runningForehandPlan.source).toBe("template");
  expect(runningForehandPlan.title).toContain("跑动");
  expect(fallbackPlan.days[0]).toMatchObject({
    focus: expect.stringMatching(/稳定|节奏|移动/),
    drills: expect.arrayContaining([expect.any(String)]),
    duration: expect.any(String)
  });
});

it("keeps day-level watch content aligned with the drill theme before falling back", () => {
  const plan = getPlanTemplate("overhead-timing", "3.0", "zh");
  const watchIds = plan.days.map((day) => day.contentIds[0]).filter(Boolean);

  expect(watchIds.length).toBeGreaterThanOrEqual(5);
  expect(plan.days[0].focus).toMatch(/高压|准备/);
  expect(plan.days[0].contentIds[0]).toBeTruthy();
  expect(plan.days[0].contentIds[0]).not.toBe(plan.days[6].contentIds[0]);
});
```

- [ ] **Step 2: Add failing rendering assertions for clearer `DayPlanCard` hierarchy**

```tsx
it("renders the today card in focus to drills to duration to watch order", () => {
  render(
    <DayPlanCard
      isToday
      day={{
        day: 1,
        focus: "固定高压准备点",
        drills: ["原地高压引拍 15 次", "高压落点控制 12 球"],
        duration: "20 分钟",
        contentIds: ["content_cn_b_03"]
      }}
    />
  );

  const focusHeading = screen.getByText("固定高压准备点");
  const whatLabel = screen.getByText("What to practice");
  const durationLabel = screen.getByText("How long");
  const watchLabel = screen.getByText("Watch this");

  expect(focusHeading).toBeInTheDocument();
  expect(whatLabel.compareDocumentPosition(durationLabel)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(durationLabel.compareDocumentPosition(watchLabel)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
});
```

- [ ] **Step 3: Add a smoke-level plan page assertion that the upgraded card still renders**

```ts
it("renders the plan page with a visible today card and watch block", async () => {
  const PlanPage = await loadPage(() => import("@/app/plan/page"));

  window.history.pushState({}, "", "/plan?problemTag=first-serve-in&level=3.0&source=diagnosis");
  render(<PlanPage />);

  expect(await screen.findByText(/今天|Today/)).toBeInTheDocument();
  expect(screen.getByText(/看这个|Watch this/i)).toBeInTheDocument();
});
```

- [ ] **Step 4: Run tests to confirm the new expectations fail first**

Run:

```bash
npm test -- --run src/__tests__/content-display.test.ts src/__tests__/bilingual-rendering.test.tsx src/__tests__/app-smoke.test.tsx
```

Expected:

```text
FAIL ... dedicated templates for upgraded plan-quality priority tags
FAIL ... renders the today card in focus to drills to duration to watch order
```

- [ ] **Step 5: Commit the failing-test checkpoint**

```bash
git add src/__tests__/content-display.test.ts src/__tests__/bilingual-rendering.test.tsx src/__tests__/app-smoke.test.tsx
git commit -m "test: lock plan quality upgrade behavior"
```

## Task 2: Upgrade Templates And Deterministic Day-Level Content Selection

**Files:**
- Modify: `src/data/planTemplates.ts`
- Modify: `src/lib/plans.ts`
- Modify: `src/data/contents.ts`
- Test: `src/__tests__/content-display.test.ts`

- [ ] **Step 1: Rewrite or add the highest-priority templates with clearer daily jobs**

Add or rewrite entries in `src/data/planTemplates.ts` for:

```ts
const priorityTags = [
  "first-serve-in",
  "second-serve-reliability",
  "serve-toss-consistency",
  "movement-slow",
  "mobility-limit",
  "overhead-timing",
  "volley-floating",
  "volley-into-net",
  "running-forehand",
  "running-backhand",
  "pressure-tightness",
  "moonball-trouble",
  "general-improvement"
];
```

For each upgraded plan, keep the existing schema and follow this authoring pattern:

```ts
{
  day: 1,
  focus: "固定高压准备点",
  focusEn: "Fix the overhead setup point",
  contentIds: ["content_overhead_teaching_01"],
  drills: ["原地高压引拍 15 次", "抛球后先停住再打 12 球"],
  drillsEn: ["15 shadow overhead take-backs", "12 toss-pause-hit overhead reps"],
  duration: "20 分钟",
  durationEn: "20 min"
}
```

- [ ] **Step 2: Shrink weak compatibility fallback dependence in `src/lib/plans.ts`**

Replace the most misleading fallback mappings with direct-template handling:

```ts
const PLAN_COMPATIBILITY_FALLBACKS: Record<string, string> = {
  "pressure-tightness": "match-anxiety",
  "stamina-drop": "movement-slow"
};
```

Keep aliases only for renamed-equivalent tags, not for tags that now deserve their own plan behavior:

```ts
const PLAN_TAG_ALIASES: Record<string, string> = {
  "second-serve-confidence": "second-serve-reliability",
  "serve-toss-inconsistent": "serve-toss-consistency",
  "slice-too-high": "backhand-slice-floating",
  "trouble-with-slice": "incoming-slice-trouble"
};
```

- [ ] **Step 3: Make day-level content scoring follow the day theme before broad plan reuse**

Adjust the plan-content scoring logic in `src/lib/plans.ts` so day assignment weights:

```ts
const daySignalScore =
  overlapCount(candidate.skills, daySignal.skills) * 3 +
  overlapCount(candidate.problemTags, daySignal.problemTags) * 4 +
  (candidate.id === seededContentId ? 2 : 0) +
  (isCuratedContent(candidate) ? 1 : 0);
```

The intended behavior is:

```ts
// Strong day-specific match beats broad whole-plan relevance.
// Reuse an early high-quality explainer only after stronger unused same-day matches are exhausted.
// Curated items win ties over expanded items.
```

- [ ] **Step 4: Add only the minimum curated teaching videos needed for uncovered upgraded tags**

In `src/data/contents.ts`, only add items that satisfy all of the following:

```ts
{
  creatorId: "existing_creator_only",
  type: "video",
  platform: "YouTube" || "Bilibili",
  skills: ["serve"] || ["net"] || ["movement"],
  problemTags: ["overhead-timing"] || ["volley-floating"] || ["running-forehand"],
  title: "real teaching/explanation title",
  url: "real teaching/explanation url"
}
```

Do not add:

```ts
// vlog
// lifestyle recap
// entertainment-first short clip
// match highlight with no teaching value
```

- [ ] **Step 5: Run the focused plan logic tests until they pass**

Run:

```bash
npm test -- --run src/__tests__/content-display.test.ts
```

Expected:

```text
PASS src/__tests__/content-display.test.ts
```

- [ ] **Step 6: Commit the deterministic plan-content upgrade**

```bash
git add src/data/planTemplates.ts src/lib/plans.ts src/data/contents.ts src/__tests__/content-display.test.ts
git commit -m "feat: upgrade plan templates and content mapping"
```

## Task 3: Clarify `DayPlanCard` Information Hierarchy Without Adding New Fields

**Files:**
- Modify: `src/components/plan/DayPlanCard.tsx`
- Test: `src/__tests__/bilingual-rendering.test.tsx`
- Test: `src/__tests__/surface-localization.test.tsx`
- Test: `src/__tests__/app-smoke.test.tsx`

- [ ] **Step 1: Refactor the today card so the structure reads `focus -> drills -> duration -> watch`**

Use explicit section labels already supported by i18n keys:

```tsx
<div>
  <p className="text-sm font-semibold text-brand-700">
    {t("plan.day.label", { day: day.day })} · {t("plan.day.today")}
  </p>
  <h3 className="mt-1 text-xl font-bold text-slate-900">{day.focus}</h3>
</div>

<div className="space-y-2">
  <p className="text-sm font-semibold text-slate-900">{t("plan.day.what")}</p>
  <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
    {day.drills.map((drill) => <li key={drill}>{drill}</li>)}
  </ul>
</div>

<div>
  <p className="text-sm font-semibold text-slate-900">{t("plan.day.duration")}</p>
  <p className="mt-1 text-sm text-slate-700">{day.duration}</p>
</div>

<div>
  <p className="mb-2 text-sm font-semibold text-slate-900">{t("plan.day.watch")}</p>
  {featuredContentCard ?? <p className="text-sm text-slate-600">{t("plan.day.fallback")}</p>}
</div>
```

- [ ] **Step 2: Make collapsed non-today cards preview the focus more clearly**

Keep the compact view simple:

```tsx
<div>
  <p className="text-sm font-semibold text-slate-900">{t("plan.day.label", { day: day.day })}</p>
  <p className="mt-1 text-sm text-slate-600">{compactFocus(day.focus, 24)}</p>
</div>
```

And keep the expanded state aligned with the same section ordering:

```tsx
{displayExpanded ? (
  <div className="mt-4 space-y-3 border-t border-[var(--line)] pt-4">
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">{t("plan.day.what")}</p>
      <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">...</ul>
    </div>
    <p className="text-sm text-slate-600">
      <span className="font-medium text-slate-700">{t("plan.day.duration")}</span> {day.duration}
    </p>
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">{t("plan.day.watch")}</p>
      {featuredContentCard ?? <p className="text-sm text-slate-600">{t("plan.day.fallback")}</p>}
    </div>
  </div>
) : null}
```

- [ ] **Step 3: Run the rendering and localization tests**

Run:

```bash
npm test -- --run src/__tests__/bilingual-rendering.test.tsx src/__tests__/surface-localization.test.tsx src/__tests__/app-smoke.test.tsx
```

Expected:

```text
PASS src/__tests__/bilingual-rendering.test.tsx
PASS src/__tests__/surface-localization.test.tsx
PASS src/__tests__/app-smoke.test.tsx
```

- [ ] **Step 4: Commit the plan-card clarity pass**

```bash
git add src/components/plan/DayPlanCard.tsx src/__tests__/bilingual-rendering.test.tsx src/__tests__/surface-localization.test.tsx src/__tests__/app-smoke.test.tsx
git commit -m "feat: clarify day plan card hierarchy"
```

## Task 4: Final Verification And Diff Review

**Files:**
- Modify: none
- Review: `src/data/planTemplates.ts`
- Review: `src/lib/plans.ts`
- Review: `src/data/contents.ts`
- Review: `src/components/plan/DayPlanCard.tsx`

- [ ] **Step 1: Run the smallest meaningful full verification set**

Run:

```bash
npm test -- --run src/__tests__/content-display.test.ts src/__tests__/bilingual-rendering.test.tsx src/__tests__/surface-localization.test.tsx src/__tests__/app-smoke.test.tsx
```

Expected:

```text
PASS src/__tests__/content-display.test.ts
PASS src/__tests__/bilingual-rendering.test.tsx
PASS src/__tests__/surface-localization.test.tsx
PASS src/__tests__/app-smoke.test.tsx
```

- [ ] **Step 2: Run the data validation command if `src/data/contents.ts` changed**

Run:

```bash
npm run validate:data
```

Expected:

```text
validate:data
... completed without errors
```

- [ ] **Step 3: Review the diff for scope creep**

Run:

```bash
git diff -- src/data/planTemplates.ts src/lib/plans.ts src/data/contents.ts src/components/plan/DayPlanCard.tsx src/__tests__/content-display.test.ts src/__tests__/bilingual-rendering.test.tsx src/__tests__/surface-localization.test.tsx src/__tests__/app-smoke.test.tsx
```

Confirm all of the following are true:

```text
- no GIF or motion-slot code was introduced
- no new public plan data fields were introduced
- no unrelated library/rankings/study-flow behavior changed
- content additions are limited to existing creators and teaching/explainer videos
```

- [ ] **Step 4: Commit the final verified batch if needed**

```bash
git add src/data/planTemplates.ts src/lib/plans.ts src/data/contents.ts src/components/plan/DayPlanCard.tsx src/__tests__/content-display.test.ts src/__tests__/bilingual-rendering.test.tsx src/__tests__/surface-localization.test.tsx src/__tests__/app-smoke.test.tsx
git commit -m "chore: verify plan quality upgrade"
```

## Self-Review

- Spec coverage: this plan covers the approved first-phase scope only: problemTag-first template quality, light level tuning, day-level content mapping, fallback/general-improvement handling, and `DayPlanCard` hierarchy. GIF, “why this matters,” and new plan schema fields remain out of scope.
- Placeholder scan: the plan contains no `TODO`, `TBD`, “implement later,” or generic “write tests” steps without explicit assertions.
- Type consistency: every task preserves the existing `DayPlan`, `PlanTemplateDay`, and `GeneratedPlan` contracts from `src/types/plan.ts`.

Plan complete and saved to `docs/superpowers/plans/2026-03-30-plan-quality-upgrade.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
