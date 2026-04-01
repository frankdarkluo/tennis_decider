# Diagnosis And Study-Mode Usability Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve diagnosis specificity for backhand, movement, and net-play complaints while making study-mode next actions clearer, without changing study schema or reopening `/video-diagnose`.

**Architecture:** Keep the existing rule-based diagnosis and template-driven plan pipeline. Improve outcomes by expanding diagnosis rule phrasing, adding dedicated plan templates for under-served tags, tightening guided input copy on the home and diagnose surfaces, and grouping secondary study-mode actions under a single-primary-CTA flow.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Vitest, React Testing Library, existing local event logger.

---

### Task 1: Tighten Diagnosis Rule Coverage And Plan Template Specificity

**Files:**
- Modify: `src/data/diagnosisRules.ts`
- Modify: `src/data/planTemplates.ts`
- Modify: `src/__tests__/content-display.test.ts`

- [ ] **Step 1: Write the failing logic tests**

```ts
it("matches more specific movement and net-play phrasing without falling back to generic wording", () => {
  expect(findBestDiagnosisRule("脚步总慢半拍，左右移动时最明显").rule?.problemTag).toBe("movement-slow");
  expect(findBestDiagnosisRule("双打时网前截击老冒高，一紧张就更明显").rule?.problemTag).toBe("net-confidence");
});

it("returns dedicated templates for the upgraded study tags instead of the generic fallback", () => {
  const movementPlan = getPlanTemplate("movement-slow", "3.0", "zh");
  const netPlan = getPlanTemplate("net-confidence", "3.0", "zh");
  const latePlan = getPlanTemplate("late-contact", "3.0", "zh");

  expect(movementPlan.source).toBe("template");
  expect(netPlan.source).toBe("template");
  expect(latePlan.source).toBe("template");
  expect(movementPlan.title).toContain("脚步");
  expect(netPlan.title).toContain("网前");
  expect(latePlan.title).toContain("准备");
});
```

- [ ] **Step 2: Run the focused test file and verify it fails**

Run: `npm test -- src/__tests__/content-display.test.ts`
Expected: FAIL with missing template assertions for `movement-slow` / `net-confidence` / `late-contact`, and at least one phrase-matching assertion failing before the rule list is expanded.

- [ ] **Step 3: Expand the diagnosis phrasing and add the missing dedicated plan templates**

```ts
// src/data/diagnosisRules.ts
{
  id: "rule_movement_slow",
  keywords: ["脚步", "慢半拍", "footwork", "slow"],
  synonyms: [
    "脚步总慢半拍",
    "左右移动总慢半拍",
    "启动总慢半拍",
    "总是赶不上球",
    "split step is always late",
    "my footwork is always half a beat late",
    "I am always late moving to the ball"
  ],
  category: ["movement", "timing"],
  problemTag: "movement-slow",
  causes: ["启动晚，第一步不够主动", "分腿垫步和来球节奏没对上", "移动前还在等球，导致脚先慢了"],
  fixes: ["先把第一步启动提早", "每次来球前先做更稳定的分腿垫步", "先练移动到位，再考虑加快挥拍"],
  drills: ["分腿垫步 + 第一启动 20 组", "左右两点移动 15 组", "移动到位后再击球 20 球"],
  recommendedContentIds: ["content_cn_c_02", "content_fr_02", "content_cn_a_03"],
  searchQueries: searchQueriesByRule.rule_movement_slow,
  fallbackLevel: ["3.0", "3.5"]
},
{
  id: "rule_net_errors",
  keywords: ["网前", "截击", "volley", "net play"],
  synonyms: [
    "网前截击老冒高",
    "网前一紧张就乱",
    "双打时截击老失误",
    "volley keeps floating",
    "I panic at the net",
    "my volley gets shaky in doubles"
  ],
  category: ["net", "confidence"],
  problemTag: "net-confidence",
  causes: ["站位和准备不稳定", "拍头没有稳在身体前方", "截击动作偏大导致失误放大"],
  fixes: ["先缩小动作，先学会挡和送", "把拍头稳定在身体前方", "先练高成功率的近网截击"],
  drills: ["近网挡球 20 次", "正反手截击各 15 球", "双打网前反应练习 10 组"],
  recommendedContentIds: ["content_rb_01", "content_cn_b_01", "content_cn_b_03"],
  searchQueries: searchQueriesByRule.rule_net_errors,
  fallbackLevel: ["3.0", "3.5"]
}

// src/data/planTemplates.ts
{
  problemTag: "movement-slow",
  level: "3.0",
  title: "脚步启动与到位 7 天计划",
  titleEn: "7-Day Footwork Timing Plan",
  target: "先把分腿垫步、第一步启动和到位节奏理顺",
  targetEn: "Fix split-step timing, first-step initiation, and court arrival rhythm first.",
  days: [
    { day: 1, focus: "分腿垫步时机", focusEn: "Split-step timing", contentIds: ["content_cn_c_02"], drills: ["分腿垫步 20 组", "只练启动不击球 15 次"], drillsEn: ["20 split-step sets", "15 first-step reps without hitting"], duration: "15 分钟", durationEn: "15 min" },
    { day: 2, focus: "第一步启动", focusEn: "First-step initiation", contentIds: ["content_fr_02"], drills: ["左右第一步启动 20 组", "看球后再启动 15 组"], drillsEn: ["20 lateral first-step sets", "15 react-then-go sets"], duration: "20 分钟", durationEn: "20 min" },
    { day: 3, focus: "移动到位后击球", focusEn: "Arrive before hitting", contentIds: ["content_cn_a_03"], drills: ["两点移动后击球 20 球", "只记录是否先到位"], drillsEn: ["20 balls after two-point movement", "Track only whether you arrived first"], duration: "25 分钟", durationEn: "25 min" },
    { day: 4, focus: "节奏复盘", focusEn: "Review the movement rhythm", contentIds: ["content_cn_c_02"], drills: ["录像 10 次启动", "写下最慢的一个环节"], drillsEn: ["Record 10 movement starts", "Write down the slowest phase"], duration: "15 分钟", durationEn: "15 min" },
    { day: 5, focus: "前后移动", focusEn: "Forward and backward movement", contentIds: ["content_fr_02"], drills: ["前后移动 15 组", "到位后停住检查重心"], drillsEn: ["15 forward-backward sets", "Stop and check balance after arrival"], duration: "20 分钟", durationEn: "20 min" },
    { day: 6, focus: "带球节奏", focusEn: "Movement with live-ball rhythm", contentIds: ["content_cn_a_03"], drills: ["移动后慢节奏击球 20 球", "失误只记是否脚先慢"], drillsEn: ["20 slow balls after movement", "Track only whether the feet were late"], duration: "25 分钟", durationEn: "25 min" },
    { day: 7, focus: "半场应用", focusEn: "Apply it in live movement", contentIds: ["content_cn_c_02"], drills: ["半场跑动对打 10 分钟", "每球只提醒自己先到位"], drillsEn: ["10 minutes of live half-court movement", "Use one cue: arrive first"], duration: "25 分钟", durationEn: "25 min" }
  ]
},
{
  problemTag: "late-contact",
  level: "3.0",
  title: "提前准备与击球点 7 天计划",
  titleEn: "7-Day Early Preparation Plan",
  target: "先把提前准备和前点击球建立起来",
  targetEn: "Build earlier preparation and more forward contact first.",
  days: [
    { day: 1, focus: "更早转肩", focusEn: "Turn the shoulders earlier", contentIds: ["content_cn_a_02"], drills: ["转肩准备 20 次", "看球后立刻准备 15 次"], drillsEn: ["20 shoulder-turn reps", "15 react-and-prepare reps"], duration: "15 分钟", durationEn: "15 min" },
    { day: 2, focus: "缩小动作", focusEn: "Shorten the motion", contentIds: ["content_fr_02"], drills: ["小动作击球 20 球", "只求赶上击球点"], drillsEn: ["20 compact swings", "Focus only on catching the contact point"], duration: "20 分钟", durationEn: "20 min" },
    { day: 3, focus: "前点击球", focusEn: "Move contact forward", contentIds: ["content_cn_a_01"], drills: ["前点击球 20 球", "影子挥拍 20 次"], drillsEn: ["20 contact-out-front feeds", "20 shadow swings"], duration: "25 分钟", durationEn: "25 min" },
    { day: 4, focus: "准备节奏复盘", focusEn: "Review prep rhythm", contentIds: ["content_cn_a_02"], drills: ["录像 10 球", "记录是否晚点"], drillsEn: ["Record 10 shots", "Track whether contact stayed late"], duration: "15 分钟", durationEn: "15 min" },
    { day: 5, focus: "小碎步找位", focusEn: "Use adjustment steps", contentIds: ["content_cn_c_02"], drills: ["小碎步找位 20 组", "找位后击球 20 球"], drillsEn: ["20 adjustment-step sets", "20 shots after adjustment steps"], duration: "20 分钟", durationEn: "20 min" },
    { day: 6, focus: "来球加快时保持准备", focusEn: "Hold prep against faster balls", contentIds: ["content_fr_02"], drills: ["快节奏喂球 15 球", "每球先看准备是否够早"], drillsEn: ["15 faster feeds", "Check only whether prep started early"], duration: "20 分钟", durationEn: "20 min" },
    { day: 7, focus: "相持应用", focusEn: "Apply it in rallies", contentIds: ["content_cn_a_01"], drills: ["相持 5 组", "失误只记是否晚点"], drillsEn: ["5 rally sets", "Track only whether misses came from late contact"], duration: "25 分钟", durationEn: "25 min" }
  ]
},
{
  problemTag: "net-confidence",
  level: "3.0",
  title: "网前截击稳定性 7 天计划",
  titleEn: "7-Day Net-Play Confidence Plan",
  target: "先把网前站位、拍头稳定和小动作截击理顺",
  targetEn: "Stabilize net positioning, racquet-head control, and compact volleys first.",
  days: [
    { day: 1, focus: "拍头稳定在前方", focusEn: "Keep the racquet head in front", contentIds: ["content_cn_b_01"], drills: ["近网准备姿势 20 次", "固定拍头位置 15 次"], drillsEn: ["20 ready-position reps at the net", "15 hold-the-racquet-head reps"], duration: "15 分钟", durationEn: "15 min" },
    { day: 2, focus: "缩小截击动作", focusEn: "Keep the volley compact", contentIds: ["content_cn_b_03"], drills: ["正手挡球 15 次", "反手挡球 15 次"], drillsEn: ["15 forehand block volleys", "15 backhand block volleys"], duration: "20 分钟", durationEn: "20 min" },
    { day: 3, focus: "近网高成功率处理", focusEn: "Handle easy net balls cleanly", contentIds: ["content_rb_01"], drills: ["近网挡送 20 球", "只记是否冒高"], drillsEn: ["20 short block-and-push volleys", "Track only whether the volley floated"], duration: "20 分钟", durationEn: "20 min" },
    { day: 4, focus: "双打紧张场景复盘", focusEn: "Review doubles-pressure moments", contentIds: ["content_cn_b_01"], drills: ["写下最慌的网前场景", "录像 10 次截击"], drillsEn: ["Write down the most stressful net pattern", "Record 10 volleys"], duration: "15 分钟", durationEn: "15 min" },
    { day: 5, focus: "站位与第一步", focusEn: "Net positioning and first step", contentIds: ["content_rb_02"], drills: ["网前第一步移动 15 组", "截击前先稳定站位"], drillsEn: ["15 net first-step sets", "Stabilize the stance before the volley"], duration: "20 分钟", durationEn: "20 min" },
    { day: 6, focus: "双打网前反应", focusEn: "Doubles net reactions", contentIds: ["content_cn_b_03"], drills: ["双打网前反应 10 组", "只求动作小而稳"], drillsEn: ["10 doubles net-reaction sets", "Keep the motion small and stable"], duration: "20 分钟", durationEn: "20 min" },
    { day: 7, focus: "实战应用", focusEn: "Apply it in live points", contentIds: ["content_rb_01"], drills: ["双打练习赛 10 分钟", "只记录网前第一拍质量"], drillsEn: ["10 minutes of doubles points", "Track only the first volley quality"], duration: "25 分钟", durationEn: "25 min" }
  ]
}
```

- [ ] **Step 4: Re-run the focused logic tests**

Run: `npm test -- src/__tests__/content-display.test.ts`
Expected: PASS for the new phrase-matching assertions and PASS for the three dedicated-template assertions.

- [ ] **Step 5: Commit the logic and template coverage changes**

```bash
git add src/data/diagnosisRules.ts src/data/planTemplates.ts src/__tests__/content-display.test.ts
git commit -m "feat: expand diagnosis rules and plan template coverage"
```

### Task 2: Add Guided Input Copy And Structured Example Chips

**Files:**
- Modify: `src/lib/diagnosis.ts`
- Modify: `src/components/home/HeroSection.tsx`
- Modify: `src/components/diagnose/DiagnoseInput.tsx`
- Modify: `src/app/diagnose/page.tsx`
- Modify: `src/lib/i18n/dictionaries/zh.ts`
- Modify: `src/lib/i18n/dictionaries/en.ts`
- Modify: `src/__tests__/app-smoke.test.tsx`

- [ ] **Step 1: Add failing smoke tests for the new guided-input copy**

```ts
it("renders the guided-input helper text on the diagnose page", async () => {
  const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));
  render(React.createElement(DiagnosePage));

  expect(await screen.findByText("写得更具体会更准：动作 + 怎么错 + 什么情况下更明显")).toBeInTheDocument();
});

it("renders a net-play quick example on the diagnose page", async () => {
  const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));
  render(React.createElement(DiagnosePage));

  expect(await screen.findByRole("button", { name: "网前截击老冒高" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the smoke test file and verify it fails**

Run: `npm test -- src/__tests__/app-smoke.test.tsx`
Expected: FAIL because the helper copy key does not exist yet and the quick-example button list does not yet include the new study-relevant phrasing.

- [ ] **Step 3: Add guided helper text, richer quick examples, and additive input payload fields**

```tsx
// src/components/diagnose/DiagnoseInput.tsx
type DiagnoseInputProps = {
  value: string;
  helperText?: string;
  quickTags: string[];
  quickTagsLabel?: string;
  variant?: "default" | "compact";
  showClearButton?: boolean;
  onChange: (value: string) => void;
  onDiagnose: () => void;
  onClear: () => void;
  onQuickTagClick?: (tag: string) => void;
};

{helperText ? <p className="text-sm font-medium text-slate-600">{helperText}</p> : null}

<div className="flex flex-wrap gap-2">
  {quickTags.map((tag) => (
    <button key={tag} type="button" className="min-h-11 rounded-full border border-[var(--line)] px-4 py-2 text-sm text-slate-700 transition hover:border-brand-300 hover:text-brand-700">
      {tag}
    </button>
  ))}
</div>

{showClearButton ? <Button variant="secondary" onClick={onClear}>{t("diagnose.button.clear")}</Button> : null}

// src/lib/diagnosis.ts
const PROBLEM_PREVIEW_OPTIONS: ProblemPreviewOption[] = [
  { label: "反手总是下网", label_en: "Backhand keeps going into the net", problemTag: "backhand-into-net" },
  { label: "脚步总慢半拍", label_en: "Footwork is always half a beat late", problemTag: "movement-slow" },
  { label: "网前截击老冒高", label_en: "My volleys keep floating", problemTag: "net-confidence" },
  { label: "双打不知道站哪", label_en: "Not sure where to stand in doubles", problemTag: "doubles-positioning" },
  { label: "二发没信心", label_en: "No confidence on second serve", problemTag: "second-serve-confidence" },
  { label: "正手一发力就出界", label_en: "Forehand flies out when I swing harder", problemTag: "forehand-out" }
];

// src/app/diagnose/page.tsx
<DiagnoseInput
  value={text}
  helperText={t("diagnose.helper")}
  quickTags={quickTags}
  quickTagsLabel={t("diagnose.quickTags")}
  showClearButton={!studyMode}
  onChange={setText}
  onDiagnose={onDiagnose}
  onClear={onClear}
  onQuickTagClick={(tag) => void runDiagnosis(tag, "tag_click")}
/>

logEvent("diagnose.submitted", {
  inputMethod: inputSource === "tag_click" ? "quick_tag" : "typing",
  queryLength: trimmedText.length,
  inheritedLevelBand: currentLevel ?? null,
  usedAssessmentContext: Boolean(assessmentResult),
  queryHasSpecificContext: /尤其|总是|更容易|when|especially|always/.test(trimmedText)
}, { page: "/diagnose" });

// src/lib/i18n/dictionaries/zh.ts
"home.hero.subtitle": "具体说出动作、错误和场景，我们会更容易判断先改什么。",
"diagnose.subtitle": "具体说出动作、错误和场景，我来帮你判断先改什么。",
"diagnose.helper": "写得更具体会更准：动作 + 怎么错 + 什么情况下更明显",

// src/lib/i18n/dictionaries/en.ts
"home.hero.subtitle": "Tell us the stroke, what goes wrong, and when it gets worse for a more precise answer.",
"diagnose.subtitle": "Tell us the stroke, the miss, and when it gets worse, and we will decide what to fix first.",
"diagnose.helper": "More specific works better: stroke + miss + when it gets worse",
```

- [ ] **Step 4: Re-run the smoke tests**

Run: `npm test -- src/__tests__/app-smoke.test.tsx`
Expected: PASS for the new helper-copy assertion and PASS for the richer quick-example assertion, while existing diagnose-page smoke coverage still passes.

- [ ] **Step 5: Commit the guided-input changes**

```bash
git add src/lib/diagnosis.ts src/components/home/HeroSection.tsx src/components/diagnose/DiagnoseInput.tsx src/app/diagnose/page.tsx src/lib/i18n/dictionaries/zh.ts src/lib/i18n/dictionaries/en.ts src/__tests__/app-smoke.test.tsx
git commit -m "feat: guide users toward more specific diagnosis input"
```

### Task 3: Simplify Study-Mode Diagnose Results Into A Single-Primary-CTA Flow

**Files:**
- Modify: `src/components/diagnose/DiagnoseResult.tsx`
- Modify: `src/app/diagnose/page.tsx`
- Modify: `src/lib/i18n/dictionaries/zh.ts`
- Modify: `src/lib/i18n/dictionaries/en.ts`
- Modify: `src/__tests__/app-smoke.test.tsx`

- [ ] **Step 1: Add failing smoke tests for the study-mode CTA grouping**

```ts
it("keeps the plan CTA primary in study mode and hides library/rankings behind more options", async () => {
  const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));
  mockStudyContext.session = baseStudySession;
  mockStudyContext.studyMode = true;

  render(React.createElement(DiagnosePage));

  fireEvent.change(await screen.findByPlaceholderText(/我反手总下网/), {
    target: { value: "我反手总下网，一快就更容易失误" }
  });
  fireEvent.click(screen.getByRole("button", { name: "diagnose.button.start" }));
  fireEvent.click(await screen.findByRole("button", { name: "diagnose.result.expand1" }));

  expect(await screen.findByRole("link", { name: "根据这个问题生成 7 天训练计划" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "去内容库找更多练习" })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "diagnose.result.moreOptions" }));
  expect(await screen.findByRole("link", { name: "去内容库找更多练习" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "去博主榜找适合的人" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the smoke test file and verify it fails**

Run: `npm test -- src/__tests__/app-smoke.test.tsx`
Expected: FAIL because library and rankings are still rendered immediately in study mode and there is no `diagnose.result.moreOptions` control yet.

- [ ] **Step 3: Group secondary study-mode actions under a “more options” control**

```tsx
// src/components/diagnose/DiagnoseResult.tsx
export function DiagnoseResult({ result }: { result: DiagnosisResultType }) {
  const { language, t } = useI18n();
  const { studyMode } = useStudy();
  const [layer, setLayer] = useState<1 | 2 | 3>(1);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  useEffect(() => {
    setLayer(1);
    setShowMoreOptions(false);
  }, [result.input, result.problemTag]);

  <div className="mt-4 flex flex-wrap gap-2">
    <Link href={planHref} onClick={() => logEvent("diagnose.plan_cta_clicked", {
      problemTag: result.problemTag,
      levelBand: normalizedPlanLevel,
      studyModePrimary: studyMode
    }, { page: "/diagnose" })}>
      <Button>{t("diagnose.result.plan")}</Button>
    </Link>
  </div>

  {studyMode ? (
    <div className="space-y-3">
      <button
        type="button"
        className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
        onClick={() => {
          logEvent("diagnose.layer_opened", { layer: 4, target: "more_options" }, { page: "/diagnose" });
          setShowMoreOptions((current) => !current);
        }}
      >
        {t("diagnose.result.moreOptions")}
      </button>
      {showMoreOptions ? (
        <div className="flex flex-wrap gap-2">
          <Link href="/library"><Button variant="secondary">{t("diagnose.result.library")}</Button></Link>
          <Link href="/rankings"><Button variant="ghost">{t("diagnose.result.rankings")}</Button></Link>
        </div>
      ) : null}
    </div>
  ) : (
    <div className="mt-4 flex flex-wrap gap-2">
      <Link href="/library"><Button variant="secondary">{t("diagnose.result.library")}</Button></Link>
      <Link href="/rankings"><Button variant="ghost">{t("diagnose.result.rankings")}</Button></Link>
    </div>
  )}

// src/lib/i18n/dictionaries/zh.ts
"diagnose.result.moreOptions": "查看更多选项 ↓",

// src/lib/i18n/dictionaries/en.ts
"diagnose.result.moreOptions": "See more options ↓",
```

- [ ] **Step 4: Re-run the smoke tests and verify the study-mode flow**

Run: `npm test -- src/__tests__/app-smoke.test.tsx`
Expected: PASS for the new study-mode CTA-grouping test and PASS for existing plan/actionability smoke coverage on diagnose and plan routes.

- [ ] **Step 5: Commit the study-mode CTA simplification**

```bash
git add src/components/diagnose/DiagnoseResult.tsx src/app/diagnose/page.tsx src/lib/i18n/dictionaries/zh.ts src/lib/i18n/dictionaries/en.ts src/__tests__/app-smoke.test.tsx
git commit -m "feat: simplify study mode diagnose CTA flow"
```

### Task 4: Final Verification And Plan Diff Review

**Files:**
- Review only: `src/data/diagnosisRules.ts`
- Review only: `src/data/planTemplates.ts`
- Review only: `src/components/home/HeroSection.tsx`
- Review only: `src/components/diagnose/DiagnoseInput.tsx`
- Review only: `src/components/diagnose/DiagnoseResult.tsx`
- Review only: `src/app/diagnose/page.tsx`
- Review only: `src/lib/i18n/dictionaries/zh.ts`
- Review only: `src/lib/i18n/dictionaries/en.ts`
- Review only: `src/__tests__/content-display.test.ts`
- Review only: `src/__tests__/app-smoke.test.tsx`

- [ ] **Step 1: Run the smallest relevant test commands together**

Run: `npm test -- src/__tests__/content-display.test.ts src/__tests__/app-smoke.test.tsx`
Expected: PASS with the new diagnosis, plan-template, helper-copy, and study-mode CTA assertions all green.

- [ ] **Step 2: Review the changed paths for scope creep**

```bash
git diff -- src/data/diagnosisRules.ts src/data/planTemplates.ts src/components/home/HeroSection.tsx src/components/diagnose/DiagnoseInput.tsx src/components/diagnose/DiagnoseResult.tsx src/app/diagnose/page.tsx src/lib/i18n/dictionaries/zh.ts src/lib/i18n/dictionaries/en.ts src/__tests__/content-display.test.ts src/__tests__/app-smoke.test.tsx
```

Expected: Only diagnosis specificity, guided-input copy, and study-mode CTA simplification changes are present. No snapshot logic, ranking logic, Supabase schema, or `/video-diagnose` scope changes appear in the diff.

- [ ] **Step 3: Manual QA in study mode**

Run: `npm run dev`
Expected:

- the home hero and `/diagnose` both teach users to be more specific
- study-mode diagnosis still works with short broad text and still shows fallback honestly
- study-mode diagnose results show one clear primary CTA first
- library and rankings stay reachable, but only after the user opens the secondary options block

- [ ] **Step 4: Commit the final verification checkpoint**

```bash
git add src/data/diagnosisRules.ts src/data/planTemplates.ts src/components/home/HeroSection.tsx src/components/diagnose/DiagnoseInput.tsx src/components/diagnose/DiagnoseResult.tsx src/app/diagnose/page.tsx src/lib/i18n/dictionaries/zh.ts src/lib/i18n/dictionaries/en.ts src/__tests__/content-display.test.ts src/__tests__/app-smoke.test.tsx
git commit -m "test: verify diagnosis usability upgrade"
```
