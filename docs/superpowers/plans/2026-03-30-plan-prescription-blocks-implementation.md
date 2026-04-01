# Plan Prescription Blocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade 7-day training plans so every day reads like a coachable practice prescription with intensity, tempo, and success criteria.

**Architecture:** Extend the existing `DayPlan` shape instead of replacing it, then teach the renderer and plan templates to use a new prescription-block structure. Keep current fallback/template generation alive during migration by preserving `focus`, `drills`, `duration`, and `contentIds` while layering in richer fields that make each day more executable.

**Tech Stack:** Next.js 14, React, TypeScript, Vitest, repo-local i18n dictionaries

---

## File Structure

### Existing Files To Modify

- `src/types/plan.ts`
  - Extend `DayPlan` / `PlanTemplateDay` with prescription-block fields and narrow helper union types.
- `src/data/planTemplates.ts`
  - Rewrite the first high-value template set so each day carries `goal`, `warmupBlock`, `mainBlock`, `pressureBlock`, `successCriteria`, `intensity`, and `tempo`.
- `src/lib/plans.ts`
  - Preserve template/fallback generation while filling new fields for locale-specific output and fallback plans.
- `src/components/plan/DayPlanCard.tsx`
  - Render the new coach-style daily structure for both today and later-day cards.
- `src/lib/i18n/dictionaries/zh.ts`
  - Add labels for the new plan sections in Chinese.
- `src/lib/i18n/dictionaries/en.ts`
  - Add labels for the new plan sections in English.
- `src/__tests__/bilingual-rendering.test.tsx`
  - Add rendering coverage for prescription-block cards and new labels.
- `src/__tests__/content-display.test.ts`
  - Add plan-generation assertions that prove new fields survive generation and fallback logic.
- `src/__tests__/surface-localization.test.tsx`
  - Add today-card coverage that ensures localized prescription labels render correctly.

### Optional Existing Files To Inspect During Implementation

- `src/app/plan/page.tsx`
  - Confirm the surrounding page does not need structural changes once `DayPlanCard` grows.
- `src/components/plan/PlanSummary.tsx`
  - Keep summary copy aligned if the new daily structure changes hierarchy feel.

### New Fields Introduced

Use these exact field names:

```ts
export type PlanIntensity = "low" | "medium" | "medium_high";
export type PlanTempo = "slow" | "controlled" | "match_70";

export type DayPlanBlock = {
  title: string;
  items: string[];
};

export type DayPlan = {
  day: number;
  focus: string;
  contentIds: string[];
  drills: string[];
  duration: string;
  goal: string;
  warmupBlock: DayPlanBlock;
  mainBlock: DayPlanBlock;
  pressureBlock: DayPlanBlock;
  successCriteria: string[];
  intensity: PlanIntensity;
  tempo: PlanTempo;
};
```

For templates:

```ts
export type LocalizedDayPlanBlock = DayPlanBlock & {
  titleEn: string;
  itemsEn: string[];
};
```

Keep `focus` and `drills` as compatibility fields. They still support current tests, privacy sanitization, and any older UI assumptions while the new structure becomes primary.

---

### Task 1: Add The Prescription-Block Data Model

**Files:**
- Modify: `src/types/plan.ts`
- Test: `src/__tests__/content-display.test.ts`

- [ ] **Step 1: Write the failing generation test**

Add a focused assertion block near the existing plan-generation coverage:

```ts
it("includes prescription metadata on generated plan days", () => {
  const plan = getPlanFromDiagnosis({
    problemTag: "second-serve-reliability",
    level: "3.5",
    locale: "zh"
  });

  expect(plan.days[0]).toMatchObject({
    goal: expect.any(String),
    warmupBlock: {
      title: expect.any(String),
      items: expect.any(Array)
    },
    mainBlock: {
      title: expect.any(String),
      items: expect.any(Array)
    },
    pressureBlock: {
      title: expect.any(String),
      items: expect.any(Array)
    },
    successCriteria: expect.any(Array),
    intensity: expect.stringMatching(/low|medium|medium_high/),
    tempo: expect.stringMatching(/slow|controlled|match_70/)
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/content-display.test.ts`
Expected: FAIL because `DayPlan` objects do not yet include `goal`, blocks, `successCriteria`, `intensity`, or `tempo`.

- [ ] **Step 3: Extend the shared plan types**

Update `src/types/plan.ts` with the new unions and block types:

```ts
export type PlanIntensity = "low" | "medium" | "medium_high";
export type PlanTempo = "slow" | "controlled" | "match_70";

export type DayPlanBlock = {
  title: string;
  items: string[];
};

export type PlanTemplateDay = DayPlan & {
  focusEn: string;
  drillsEn: string[];
  durationEn: string;
  goalEn: string;
  warmupBlockEn: DayPlanBlock;
  mainBlockEn: DayPlanBlock;
  pressureBlockEn: DayPlanBlock;
  successCriteriaEn: string[];
};
```

Use exact field names above so later tasks stay consistent.

- [ ] **Step 4: Fill the new fields during plan generation**

Update the template-to-generated mapping in `src/lib/plans.ts`:

```ts
days: template.days.map<DayPlan>((day) => ({
  day: day.day,
  focus: isEn ? day.focusEn : day.focus,
  contentIds: day.contentIds,
  drills: isEn ? day.drillsEn : day.drills,
  duration: isEn ? day.durationEn : day.duration,
  goal: isEn ? day.goalEn : day.goal,
  warmupBlock: isEn ? day.warmupBlockEn : day.warmupBlock,
  mainBlock: isEn ? day.mainBlockEn : day.mainBlock,
  pressureBlock: isEn ? day.pressureBlockEn : day.pressureBlock,
  successCriteria: isEn ? day.successCriteriaEn : day.successCriteria,
  intensity: day.intensity,
  tempo: day.tempo
}))
```

- [ ] **Step 5: Run the targeted test to verify it passes**

Run: `npm test -- --run src/__tests__/content-display.test.ts`
Expected: PASS for the new metadata assertion, though later tasks may still add failures for missing template values.

- [ ] **Step 6: Commit**

```bash
git add src/types/plan.ts src/lib/plans.ts src/__tests__/content-display.test.ts
git commit -m "feat: extend day plans with prescription blocks"
```

---

### Task 2: Render The New Daily Prescription Structure

**Files:**
- Modify: `src/components/plan/DayPlanCard.tsx`
- Modify: `src/lib/i18n/dictionaries/zh.ts`
- Modify: `src/lib/i18n/dictionaries/en.ts`
- Test: `src/__tests__/bilingual-rendering.test.tsx`
- Test: `src/__tests__/surface-localization.test.tsx`

- [ ] **Step 1: Write the failing rendering tests**

Add bilingual card coverage:

```tsx
it("renders prescription blocks and completion criteria on today cards", () => {
  renderWithI18n(
    <DayPlanCard
      isToday
      day={{
        day: 1,
        focus: "二发稳定性",
        contentIds: ["content_gaiao_02"],
        drills: ["抛球 30 次"],
        duration: "25 分钟",
        goal: "先建立安全二发节奏",
        warmupBlock: { title: "热身", items: ["抛球 15 次"] },
        mainBlock: { title: "主练", items: ["二区二发 3 组，每组 8 球"] },
        pressureBlock: { title: "带压力重复", items: ["连续进区 6 球才过关"] },
        successCriteria: ["总进区率至少 70%"],
        intensity: "medium",
        tempo: "controlled"
      }}
    />
  );

  expect(screen.getByText("今日目标")).toBeInTheDocument();
  expect(screen.getByText("热身")).toBeInTheDocument();
  expect(screen.getByText("带压力重复")).toBeInTheDocument();
  expect(screen.getByText("完成标准")).toBeInTheDocument();
});
```

Add a localization flip test:

```tsx
expect(screen.getByText("Goal")).toBeInTheDocument();
expect(screen.getByText("Success criteria")).toBeInTheDocument();
```

- [ ] **Step 2: Run the rendering tests to verify they fail**

Run: `npm test -- --run src/__tests__/bilingual-rendering.test.tsx src/__tests__/surface-localization.test.tsx`
Expected: FAIL because the labels and sections do not exist yet.

- [ ] **Step 3: Add the new translation keys**

Add dictionary keys:

```ts
"plan.day.goal": "今日目标",
"plan.day.warmup": "热身",
"plan.day.main": "主练",
"plan.day.pressure": "带压力重复",
"plan.day.success": "完成标准",
"plan.day.intensity": "强度",
"plan.day.tempo": "节奏",
"plan.day.intensity.low": "低",
"plan.day.intensity.medium": "中",
"plan.day.intensity.medium_high": "中高",
"plan.day.tempo.slow": "慢节奏",
"plan.day.tempo.controlled": "可控节奏",
"plan.day.tempo.match_70": "比赛节奏 70%"
```

And English:

```ts
"plan.day.goal": "Goal",
"plan.day.warmup": "Warm-up",
"plan.day.main": "Main block",
"plan.day.pressure": "Pressure block",
"plan.day.success": "Success criteria",
"plan.day.intensity": "Intensity",
"plan.day.tempo": "Tempo",
"plan.day.intensity.low": "Low",
"plan.day.intensity.medium": "Medium",
"plan.day.intensity.medium_high": "Medium-high",
"plan.day.tempo.slow": "Slow pace",
"plan.day.tempo.controlled": "Controlled pace",
"plan.day.tempo.match_70": "70% match pace"
```

- [ ] **Step 4: Render the prescription layout in `DayPlanCard`**

Introduce a small local helper inside the component:

```tsx
function getPillLabel(
  t: ReturnType<typeof useI18n>["t"],
  key: "intensity" | "tempo",
  value: string
) {
  return t(`plan.day.${key}.${value}`);
}
```

Render three visible layers:

```tsx
<div className="space-y-2">
  <p className="text-sm font-semibold text-slate-900">{t("plan.day.goal")}</p>
  <p className="text-sm text-slate-700">{day.goal}</p>
</div>

<div className="flex flex-wrap gap-2">
  <Badge>{t("plan.day.duration")} · {day.duration}</Badge>
  <Badge>{t("plan.day.intensity")} · {getPillLabel(t, "intensity", day.intensity)}</Badge>
  <Badge>{t("plan.day.tempo")} · {getPillLabel(t, "tempo", day.tempo)}</Badge>
</div>
```

Then render blocks in order:

```tsx
[
  day.warmupBlock,
  day.mainBlock,
  day.pressureBlock
].map((block) => (
  <div key={block.title} className="space-y-2">
    <p className="text-sm font-semibold text-slate-900">{block.title}</p>
    <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
      {block.items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  </div>
))
```

And finish with:

```tsx
<div className="space-y-2">
  <p className="text-sm font-semibold text-slate-900">{t("plan.day.success")}</p>
  <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
    {day.successCriteria.map((item) => <li key={item}>{item}</li>)}
  </ul>
</div>
```

Keep the video card, but leave it below the practice prescription so content stays secondary.

- [ ] **Step 5: Run the rendering tests to verify they pass**

Run: `npm test -- --run src/__tests__/bilingual-rendering.test.tsx src/__tests__/surface-localization.test.tsx`
Expected: PASS and confirm the new labels render in both locales.

- [ ] **Step 6: Commit**

```bash
git add src/components/plan/DayPlanCard.tsx src/lib/i18n/dictionaries/zh.ts src/lib/i18n/dictionaries/en.ts src/__tests__/bilingual-rendering.test.tsx src/__tests__/surface-localization.test.tsx
git commit -m "feat: render coach-style prescription blocks in plan cards"
```

---

### Task 3: Make Fallback Plans Coach-Like Too

**Files:**
- Modify: `src/lib/plans.ts`
- Test: `src/__tests__/content-display.test.ts`

- [ ] **Step 1: Write the failing fallback test**

Add an assertion for thin-context output:

```ts
it("gives fallback plans a prescription structure", () => {
  const plan = buildFallbackPlan("zh");

  expect(plan.days[0]).toMatchObject({
    goal: expect.any(String),
    warmupBlock: { title: expect.any(String), items: expect.any(Array) },
    mainBlock: { title: expect.any(String), items: expect.any(Array) },
    pressureBlock: { title: expect.any(String), items: expect.any(Array) },
    successCriteria: expect.any(Array),
    intensity: "low",
    tempo: "slow"
  });
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `npm test -- --run src/__tests__/content-display.test.ts`
Expected: FAIL because fallback day objects only contain `focus`, `drills`, and `duration`.

- [ ] **Step 3: Update the fallback day builders**

Replace the fallback arrays with richer day objects:

```ts
const defaultDaysZh = [1, 2, 3, 4, 5, 6, 7].map((day) => ({
  day,
  focus: `第 ${day} 天稳定性训练`,
  contentIds: [],
  drills: ["基础挥拍 20 次", "稳定过网练习 20 球"],
  duration: "20 分钟",
  goal: "先建立一组可以重复执行的基础训练节奏",
  warmupBlock: {
    title: "热身",
    items: ["空挥 15 次", "原地小碎步 20 秒 2 组"]
  },
  mainBlock: {
    title: "主练",
    items: ["基础挥拍 20 次", "稳定过网练习 20 球"]
  },
  pressureBlock: {
    title: "带压力重复",
    items: ["连续完成 6 次稳定过网才结束"]
  },
  successCriteria: ["今天至少完成 1 轮完整训练结构"],
  intensity: "low",
  tempo: "slow"
}));
```

Mirror the same shape in `defaultDaysEn`.

- [ ] **Step 4: Keep compatibility fields aligned**

Make sure `focus` and `drills` still summarize the richer day:

```ts
drills: [...warmupBlock.items.slice(0, 1), ...mainBlock.items.slice(0, 2)]
```

Do not delete these fields yet. Existing tests and storage still use them.

- [ ] **Step 5: Run the targeted test to verify it passes**

Run: `npm test -- --run src/__tests__/content-display.test.ts`
Expected: PASS for both normal and fallback generation assertions.

- [ ] **Step 6: Commit**

```bash
git add src/lib/plans.ts src/__tests__/content-display.test.ts
git commit -m "feat: give fallback plans prescription metadata"
```

---

### Task 4: Rewrite The First High-Value Plan Templates

**Files:**
- Modify: `src/data/planTemplates.ts`
- Test: `src/__tests__/content-display.test.ts`

- [ ] **Step 1: Write the failing template-specific tests**

Add assertions for the priority tags:

```ts
it.each([
  "second-serve-reliability",
  "first-serve-in",
  "backhand-into-net",
  "forehand-out",
  "movement-slow",
  "net-confidence",
  "doubles-positioning",
  "mobility-limit"
])("uses prescription blocks for %s", (problemTag) => {
  const plan = getPlanFromDiagnosis({
    problemTag,
    level: "3.0",
    locale: "zh"
  });

  for (const day of plan.days) {
    expect(day.goal.length).toBeGreaterThan(0);
    expect(day.mainBlock.items.length).toBeGreaterThan(0);
    expect(day.successCriteria.length).toBeGreaterThan(0);
  }
});
```

- [ ] **Step 2: Run the template test to verify it fails**

Run: `npm test -- --run src/__tests__/content-display.test.ts`
Expected: FAIL because the chosen templates do not yet include the new fields.

- [ ] **Step 3: Rewrite the first template batch with coach-like blocks**

For each day in the priority templates, use this shape:

```ts
{
  day: 1,
  focus: "稳定抛球",
  focusEn: "Stabilize the toss",
  contentIds: ["content_gaiao_02"],
  drills: ["抛球 30 次", "空挥发球 20 次"],
  drillsEn: ["30 toss reps", "20 shadow serve reps"],
  duration: "20 分钟",
  durationEn: "20 min",
  goal: "先建立一组安全、可重复的二发启动节奏",
  goalEn: "Build a safe, repeatable second-serve start first.",
  warmupBlock: {
    title: "热身",
    items: ["抛球 15 次", "空挥发球 10 次"]
  },
  warmupBlockEn: {
    title: "Warm-up",
    items: ["15 toss reps", "10 shadow serves"]
  },
  mainBlock: {
    title: "主练",
    items: ["二区二发 3 组，每组 8 球", "每组之间只调整抛球，不加力"]
  },
  mainBlockEn: {
    title: "Main block",
    items: ["3 sets of 8 second serves to the deuce court", "Only adjust the toss between sets — do not add force"]
  },
  pressureBlock: {
    title: "带压力重复",
    items: ["连续进区 6 球才过关"]
  },
  pressureBlockEn: {
    title: "Pressure block",
    items: ["Clear the day only after 6 serves in a row land in"]
  },
  successCriteria: ["今天总进区率至少 70%"],
  successCriteriaEn: ["Reach at least a 70% make rate today"],
  intensity: "medium",
  tempo: "controlled"
}
```

Apply the same structure to the rest of the first-batch tags with problem-specific goals:
- `first-serve-in`: repeatable make-rate and calmer first-serve rhythm
- `backhand-into-net`: earlier setup and net clearance
- `forehand-out`: arc and margin before pace
- `movement-slow`: split-step timing and arrival rhythm
- `net-confidence`: compact volley contact and reaction trust
- `doubles-positioning`: rotation and first-move positioning
- `mobility-limit`: manageable movement load, shorter work blocks, and completion standards tied to form rather than speed

- [ ] **Step 4: Run template coverage to verify it passes**

Run: `npm test -- --run src/__tests__/content-display.test.ts`
Expected: PASS and confirm the selected high-value tags now emit coach-like plans.

- [ ] **Step 5: Review for rhythm progression across the seven days**

Check each rewritten template follows a light weekly progression:

```txt
Day 1 = establish feel
Day 2 = stabilize form
Day 3 = accumulate repetition
Day 4 = review / lighter day
Day 5 = variation or movement
Day 6 = controlled pressure
Day 7 = mini-test or transfer
```

Do not add a new engine for this. Keep it template-authored and explicit.

- [ ] **Step 6: Commit**

```bash
git add src/data/planTemplates.ts src/__tests__/content-display.test.ts
git commit -m "feat: rewrite core plan templates as training prescriptions"
```

---

### Task 5: Run Full Plan-Focused Verification

**Files:**
- Modify: none unless failures are found
- Test: `src/__tests__/content-display.test.ts`
- Test: `src/__tests__/bilingual-rendering.test.tsx`
- Test: `src/__tests__/surface-localization.test.tsx`
- Test: `src/__tests__/app-smoke.test.tsx`

- [ ] **Step 1: Run the plan-focused test suite**

Run: `npm test -- --run src/__tests__/content-display.test.ts src/__tests__/bilingual-rendering.test.tsx src/__tests__/surface-localization.test.tsx src/__tests__/app-smoke.test.tsx`
Expected: PASS across plan generation, bilingual labels, rendered day cards, and smoke coverage.

- [ ] **Step 2: Run a production build**

Run: `npm run build`
Expected: PASS with no TypeScript errors from the expanded `DayPlan` shape.

- [ ] **Step 3: Inspect the final diff for accidental scope creep**

Run:

```bash
git diff --stat HEAD~4..HEAD
```

Expected: Changes limited to plan types, plan templates, plan generation, i18n keys, and tests.

- [ ] **Step 4: Commit any final verification fixes**

```bash
git add src/types/plan.ts src/lib/plans.ts src/data/planTemplates.ts src/components/plan/DayPlanCard.tsx src/lib/i18n/dictionaries/zh.ts src/lib/i18n/dictionaries/en.ts src/__tests__/content-display.test.ts src/__tests__/bilingual-rendering.test.tsx src/__tests__/surface-localization.test.tsx src/__tests__/app-smoke.test.tsx
git commit -m "test: verify prescription-style plan upgrade"
```

---

## Acceptance Criteria

- Every generated day plan includes `goal`, three structured practice blocks, `successCriteria`, `intensity`, and `tempo`.
- Every day card shows those fields in both Chinese and English.
- Video remains available, but clearly secondary to the actual practice prescription.
- Fallback plans also feel coach-like instead of collapsing back to a generic drill list.
- The first high-value tag batch emits seven-day plans with visible progression and explicit completion standards.
- `npm run build` passes after the type expansion.

## Risks And Guardrails

- Do not remove `focus`, `drills`, `duration`, or `contentIds` in this phase. Keep the migration additive.
- Do not rewrite all templates at once. The first batch should prove the pattern.
- Do not invent a generic scheduling engine yet. Weekly rhythm should stay template-authored.
- Keep `mobility-limit` expectations form-based and manageable; avoid prescribing unrealistic load.
- Resist putting diagnosis-context copy into plan fields during this phase. This plan is about execution quality, not diagnosis wording.

## Self-Review

- Spec coverage: data model, renderer, i18n, fallback behavior, first-batch templates, weekly rhythm, and verification are all mapped to concrete tasks.
- Placeholder scan: no `TODO` / `TBD` markers remain; every task names exact files, commands, and field names.
- Type consistency: `goal`, `warmupBlock`, `mainBlock`, `pressureBlock`, `successCriteria`, `intensity`, and `tempo` are used consistently across tasks.

