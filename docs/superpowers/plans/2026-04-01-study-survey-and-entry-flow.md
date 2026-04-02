# Study Survey And Entry Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the study questionnaire flow so baseline background questions live in `/study/start`, the final `/survey` starts at SUS, the product/open questions match the approved research design, and actionability wording measures relative clarity gain.

**Architecture:** Keep the existing study data model and page structure, but narrow this slice to content and submission-shape changes. Background capture stays in the study-start submission bundle, task-level actionability stays in `study_task_ratings`, and the final survey becomes a shorter in-product SUS + product-feedback + open-feedback flow without duplicated baseline questions.

**Tech Stack:** Next.js App Router, React, TypeScript, local i18n dictionaries, Vitest/JSDOM tests

## Outcome

This plan was executed with a small implementation adjustment:
- Task 1 landed as `f13aaa7` (`test: capture updated study survey contract`)
- Tasks 2 and 3 were combined into `d9c9139` (`feat: refine study survey flow`)
- Task 4 verification and spec sync landed in `93fecda` (`docs: sync participant identity slice progress`)

The checkbox steps below are preserved as the original execution plan for audit/history.

---

### Task 1: Lock the new questionnaire contract with failing tests

**Files:**
- Modify: `src/__tests__/actionability-prompt.test.tsx`
- Modify: `src/__tests__/survey-localization.test.tsx`
- Modify: `src/__tests__/app-smoke.test.tsx`

- [ ] **Step 1: Write the failing actionability-copy assertions**

```tsx
expect(screen.getByText("完成这一步后，我比之前更清楚下一步该练什么。")).toBeInTheDocument();
expect(screen.getByText("After this step, I am clearer than before about what I should practice next.")).toBeInTheDocument();
```

- [ ] **Step 2: Run the targeted actionability test to verify it fails**

Run: `npm test -- src/__tests__/actionability-prompt.test.tsx`
Expected: FAIL because the dictionaries still contain the old absolute wording.

- [ ] **Step 3: Write the failing survey-structure assertions**

```tsx
expect(screen.queryByText("Part 1: Background")).not.toBeInTheDocument();
expect(screen.getByText("Part 1: SUS")).toBeInTheDocument();
expect(screen.getByText("The coach's reasoning made me more confident these recommendations were suitable for me")).toBeInTheDocument();
expect(screen.getByText("What information or feature most influences your confidence in the recommendations?")).toBeInTheDocument();
expect(screen.queryByText("I would recommend this tool to my tennis friends")).not.toBeInTheDocument();
```

- [ ] **Step 4: Run the localized survey test to verify it fails**

Run: `npm test -- src/__tests__/survey-localization.test.tsx`
Expected: FAIL because `/survey` still renders the background section and old product/open questions.

- [ ] **Step 5: Add a smoke test for the moved coach-history question in study start**

```tsx
expect(screen.getByText("Have you ever taken lessons with a coach?")).toBeInTheDocument();
```

- [ ] **Step 6: Run the smoke test slice to verify it fails**

Run: `npm test -- src/__tests__/app-smoke.test.tsx`
Expected: FAIL because `/study/start` does not yet render the coach-history background field.

- [ ] **Step 7: Commit the red state tests**

```bash
git add src/__tests__/actionability-prompt.test.tsx src/__tests__/survey-localization.test.tsx src/__tests__/app-smoke.test.tsx
git commit -m "test: capture updated study survey contract"
```

### Task 2: Implement the approved copy and questionnaire data changes

**Files:**
- Modify: `src/data/surveyQuestions.ts`
- Modify: `src/lib/i18n/dictionaries/zh.ts`
- Modify: `src/lib/i18n/dictionaries/en.ts`

- [ ] **Step 1: Update the survey question inventory**

```ts
export type SurveySingleChoiceQuestion = {
  id: string;
  part: "sus" | "product" | "open";
  prompt: string;
  prompt_en?: string;
  type: "single" | "likert" | "text";
  options?: string[];
  options_en?: string[];
};

export const surveyQuestions: SurveySingleChoiceQuestion[] = [
  { id: "q6", part: "sus", prompt: "我觉得我会愿意经常使用这个系统", prompt_en: "I think that I would like to use this system frequently", type: "likert" },
  { id: "q7", part: "sus", prompt: "我觉得这个系统不必要地复杂", prompt_en: "I found the system unnecessarily complex", type: "likert" },
  { id: "q8", part: "sus", prompt: "我觉得这个系统很容易使用", prompt_en: "I thought the system was easy to use", type: "likert" },
  { id: "q9", part: "sus", prompt: "我觉得我需要技术人员的帮助才能使用这个系统", prompt_en: "I think that I would need the support of a technical person to be able to use this system", type: "likert" },
  { id: "q10", part: "sus", prompt: "我觉得这个系统的各项功能整合得很好", prompt_en: "I found the various functions in this system were well integrated", type: "likert" },
  { id: "q11", part: "sus", prompt: "我觉得这个系统有太多不一致的地方", prompt_en: "I thought there was too much inconsistency in this system", type: "likert" },
  { id: "q12", part: "sus", prompt: "我觉得大多数人能很快学会使用这个系统", prompt_en: "I would imagine that most people would learn to use this system very quickly", type: "likert" },
  { id: "q13", part: "sus", prompt: "我觉得这个系统使用起来很不方便", prompt_en: "I found the system very cumbersome to use", type: "likert" },
  { id: "q14", part: "sus", prompt: "我觉得使用这个系统时我很有信心", prompt_en: "I felt very confident using the system", type: "likert" },
  { id: "q15", part: "sus", prompt: "我需要先学很多东西才能开始使用这个系统", prompt_en: "I needed to learn a lot of things before I could get going with this system", type: "likert" },
  { id: "q16", part: "product", prompt: "水平评估的结果基本符合我对自己的判断", prompt_en: "The level assessment result matched my own judgment", type: "likert" },
  { id: "q17", part: "product", prompt: "问题诊断能理解我想表达的意思", prompt_en: "The problem diagnosis understood what I was trying to say", type: "likert" },
  { id: "q18", part: "product", prompt: "推荐的内容确实跟我的问题有关", prompt_en: "The recommended content was relevant to my problem", type: "likert" },
  { id: "q19", part: "product", prompt: "推荐理由让我更相信这些推荐是适合我的", prompt_en: "The coach's reasoning made me more confident these recommendations were suitable for me", type: "likert" },
  { id: "q23", part: "open", prompt: "在使用过程中，哪个环节让你觉得最有帮助？为什么？", prompt_en: "Which part of the experience felt most helpful to you? Why?", type: "text" },
  { id: "q24", part: "open", prompt: "有没有哪个环节让你觉得不准、困惑、或者不可信？", prompt_en: "Was there any part that felt inaccurate, confusing, or untrustworthy?", type: "text" },
  { id: "q25", part: "open", prompt: "什么信息或功能最影响你对推荐结果的相信程度？", prompt_en: "What information or feature most influences your confidence in the recommendations?", type: "text" }
];
```

- [ ] **Step 2: Update actionability prompt copy in both locales**

```ts
"study.actionability.prompt": "完成这一步后，我比之前更清楚下一步该练什么了。"
```

```ts
"study.actionability.prompt": "After this step, I am clearer than before about what I should practice next."
```

- [ ] **Step 3: Update survey section labels and answer-count copy**

```ts
"survey.part.sus.title": "Part 1：SUS 系统可用性量表",
"survey.part.product.title": "Part 2：产品专项评价",
"survey.part.open.title": "Part 3：开放式问题",
"survey.answerAll": "请先完成全部 17 题。"
```

```ts
"survey.part.sus.title": "Part 1: SUS usability scale",
"survey.part.product.title": "Part 2: Product-specific feedback",
"survey.part.open.title": "Part 3: Open feedback",
"survey.answerAll": "Please answer all 17 questions first."
```

- [ ] **Step 4: Run the tests from Task 1 to verify they now pass**

Run: `npm test -- src/__tests__/actionability-prompt.test.tsx src/__tests__/survey-localization.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit the copy and survey-data update**

```bash
git add src/data/surveyQuestions.ts src/lib/i18n/dictionaries/zh.ts src/lib/i18n/dictionaries/en.ts
git commit -m "feat: update study survey copy and question set"
```

### Task 3: Move the coach-history question into study start and remove survey background duplication

**Files:**
- Modify: `src/types/study.ts`
- Modify: `src/app/study/start/page.tsx`
- Modify: `src/app/survey/page.tsx`
- Test: `src/__tests__/app-smoke.test.tsx`
- Test: `src/__tests__/survey-localization.test.tsx`

- [ ] **Step 1: Extend the background profile type with coach-history**

```ts
export type StudyBackgroundProfile = {
  ageBand: string;
  yearsPlayingBand: string;
  playFrequency: string;
  coachHistory: string;
  selfReportedLevel: string;
  watchesTrainingVideos: boolean;
  hasUploadedPracticeVideoBefore: boolean;
};
```

- [ ] **Step 2: Add the coach-history select to the study start page**

```tsx
const coachHistoryOptions: Record<StudyLanguage, Option[]> = {
  zh: [
    { value: "none", label: "没有" },
    { value: "occasional", label: "偶尔请" },
    { value: "regular", label: "固定在上课" }
  ],
  en: [
    { value: "none", label: "No" },
    { value: "occasional", label: "Occasionally" },
    { value: "regular", label: "Taking regular lessons" }
  ]
};
```

```tsx
<SelectField
  label={language === "en" ? "Have you ever taken lessons with a coach?" : "你有没有请过教练？"}
  value={background.coachHistory}
  options={coachHistoryOptions[language]}
  onChange={(nextValue) => setBackground((prev) => ({ ...prev, coachHistory: nextValue }))}
/>
```

- [ ] **Step 3: Require the new background field in study-start submission**

```tsx
const canSubmitBackground = Boolean(
  background.ageBand &&
  background.yearsPlayingBand &&
  background.playFrequency &&
  background.coachHistory &&
  background.selfReportedLevel &&
  backgroundBooleanReady.watchesTrainingVideos &&
  backgroundBooleanReady.hasUploadedPracticeVideoBefore
);
```

- [ ] **Step 4: Remove the background part from the final survey page**

```tsx
const groupedQuestions = useMemo(() => {
  return {
    sus: surveyQuestions.filter((question) => question.part === "sus"),
    product: surveyQuestions.filter((question) => question.part === "product"),
    open: surveyQuestions.filter((question) => question.part === "open")
  };
}, []);
```

```tsx
{(["sus", "product", "open"] as const).map((partKey) => (
  <Card key={partKey} className="space-y-5">
    ...
  </Card>
))}
```

- [ ] **Step 5: Keep SUS scoring and submission behavior unchanged while trimming the UI**

```tsx
const susAnswers = Array.from({ length: 10 }, (_, index) => Number(responses[`q${index + 6}`]));
const susScore = calculateSUS(susAnswers);
```

- [ ] **Step 6: Run the focused smoke and survey tests**

Run: `npm test -- src/__tests__/app-smoke.test.tsx src/__tests__/survey-localization.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit the start-flow and survey-page changes**

```bash
git add src/types/study.ts src/app/study/start/page.tsx src/app/survey/page.tsx src/__tests__/app-smoke.test.tsx src/__tests__/survey-localization.test.tsx
git commit -m "feat: move study background out of final survey"
```

### Task 4: Verify the slice end-to-end and document the remaining broader cleanup

**Files:**
- Modify: `docs/superpowers/specs/2026-04-01-participant-identity-cleanup-design.md`

- [ ] **Step 1: Run the narrow research-data verification set**

Run: `npm test -- src/__tests__/actionability-prompt.test.tsx src/__tests__/survey-localization.test.tsx src/__tests__/app-smoke.test.tsx src/__tests__/research-data.test.ts`
Expected: PASS

- [ ] **Step 2: Run the build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Update the spec with any implementation-accurate notes if needed**

```md
- implemented first slice: study-start background + final survey redesign + actionability wording update
- broader participant-only export cleanup remains in later slices
```

- [ ] **Step 4: Commit the verification / spec-sync touch-up**

```bash
git add docs/superpowers/specs/2026-04-01-participant-identity-cleanup-design.md
git commit -m "docs: sync participant identity slice progress"
```
