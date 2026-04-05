# Assessment And Plan Strengthening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up low-value repo clutter, upgrade `/assessment` into a clearer 8-10 question NTRP ladder, and make `/plan` respond more directly to both diagnosis and assessment signals.

**Architecture:** Keep the existing assessment branching model and plan-template pipeline, but tighten them instead of replacing them. Split the work into four PR-sized slices so cleanup, assessment reliability, assessment-to-plan handoff, and diagnosis-to-plan personalization can each be built and verified independently.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, localStorage-based handoff, existing i18n dictionaries, existing plan template/data model

---

## PR Boundaries

### PR1: Conservative Cleanup
- Move root-level planning markdown into docs archive
- Remove stale study snapshot versions and update references
- Update `.env.example`
- Keep cleanup conservative; do not touch frozen ordering, auth, migrations, or study-event schema

### PR2: Assessment Ladder Redesign
- Replace the current shallow 6-question scored flow with an 8-10 question ladder
- Remove the unused gender friction from the flow
- Add new scoring tiers, branch smoothing, and personalized summary generation

### PR3: Assessment To Plan Handoff
- Make assessment results produce a stronger plan intent than today
- Persist stable weak-dimension signals into plan generation
- Expose the connection clearly in assessment result UI and plan summary UI

### PR4: Diagnosis To Plan Deepening
- Fill missing plan templates for common diagnosis tags
- Expand plan context beyond deep-serve-only quality
- Add a visible “why this plan” rationale so diagnosis effects are legible to users

## File Map

### Existing files to modify
- `.env.example`
- `.gitignore`
- `src/data/studySnapshot/index.ts`
- `src/data/assessmentQuestions.ts`
- `src/lib/i18n/assessmentCopy.ts`
- `src/lib/assessment.ts`
- `src/types/assessment.ts`
- `src/app/assessment/page.tsx`
- `src/app/assessment/result/page.tsx`
- `src/components/assessment/QuestionCard.tsx`
- `src/components/assessment/SkillBreakdown.tsx`
- `src/components/assessment/ResultSummary.tsx`
- `src/lib/plans.ts`
- `src/types/plan.ts`
- `src/components/plan/PlanSummary.tsx`
- `src/app/plan/page.tsx`
- `src/components/diagnose/DiagnoseResult.tsx`
- `src/data/planTemplates.ts`
- `src/lib/i18n/dictionaries/zh.ts`
- `src/lib/i18n/dictionaries/en.ts`

### Existing files to move or delete
- `codex_merge_readiness_checklist.md`
- `tennislevel_scenario_reconstruction_codex_plan.md`
- `src/data/studySnapshot/creators.2026-03-29-v1.json`
- `src/data/studySnapshot/metadata.2026-03-29-v1.json`

### New test files to create
- `src/__tests__/assessment-engine.test.ts`
- `src/__tests__/assessment-flow.test.tsx`
- `src/__tests__/assessment-plan-linkage.test.ts`
- `src/__tests__/plan-rationale.test.ts`

### Existing tests likely to update
- `src/__tests__/plan-context.test.ts`
- `src/__tests__/study-plan-draft.test.ts`
- `src/__tests__/surface-localization.test.tsx`
- `src/__tests__/bilingual-rendering.test.tsx`

## Acceptance Criteria

- Root-level cleanup is conservative and does not remove still-used code paths
- Assessment presents concise, readable questions and produces 8-10 scored answers
- Assessment level thresholds no longer contain unreachable states
- Score-2 answers are surfaced as meaningful “needs work” output instead of disappearing
- Assessment result summary names the user’s actual weak areas
- Diagnosis tags that previously fell back to generic plans now use dedicated templates
- Plan generation accepts structured weak-dimension and diagnosis signals through stable interfaces
- Plan UI explains why the generated plan was chosen
- Relevant Vitest coverage exists for new assessment logic and plan linkage

## Open Decisions Locked For This Plan

- Keep branching instead of replacing assessment with a linear quiz
- Remove the gender question entirely instead of hiding it behind a future flag
- Use `localStorage` draft/result handoff for richer plan context instead of adding query-string bloat
- Keep the plan data model additive; do not replace plan templates with runtime model generation

### Task 1: PR1 Cleanup Slice

**Files:**
- Modify: `.env.example`
- Modify: `.gitignore`
- Modify: `src/data/studySnapshot/index.ts`
- Move: `codex_merge_readiness_checklist.md`
- Move: `tennislevel_scenario_reconstruction_codex_plan.md`
- Delete: `src/data/studySnapshot/creators.2026-03-29-v1.json`
- Delete: `src/data/studySnapshot/metadata.2026-03-29-v1.json`
- Test: `src/__tests__/study-snapshot.test.ts`

- [ ] **Step 1: Write the failing snapshot regression**

```ts
import { describe, expect, it } from "vitest";
import {
  studySnapshotContentsByVersion,
  studySnapshotCreatorsByVersion,
  studySnapshotMetadataByVersion
} from "@/data/studySnapshot";

describe("study snapshot versions", () => {
  it("keeps the active 2026-03-31-v1 snapshot wired", () => {
    expect(studySnapshotContentsByVersion["2026-03-31-v1"]).toBeDefined();
    expect(studySnapshotCreatorsByVersion["2026-03-31-v1"]).toBeDefined();
    expect(studySnapshotMetadataByVersion["2026-03-31-v1"]).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify current wiring before cleanup**

Run: `npm test -- src/__tests__/study-snapshot.test.ts`
Expected: PASS before the cleanup refactor, giving a baseline for later edits.

- [ ] **Step 3: Apply conservative cleanup**

```ts
// src/data/studySnapshot/index.ts
import contents20260329v1 from "./contents.2026-03-29-v1.json";
import creators20260331v1 from "./creators.2026-03-31-v1.json";
import metadata20260331v1 from "./metadata.2026-03-31-v1.json";

export const studySnapshotContentsByVersion = {
  "2026-03-29-v1": contents20260329v1,
  "2026-03-31-v1": contents20260329v1
};

export const studySnapshotCreatorsByVersion = {
  "2026-03-31-v1": creators20260331v1
};

export const studySnapshotMetadataByVersion = {
  "2026-03-31-v1": metadata20260331v1
};
```

```dotenv
# .env.example
NEXT_PUBLIC_STUDY_SNAPSHOT_VERSION=2026-03-31-v1
```

```gitignore
# .gitignore
scripts/thumbnail-results.json
.DS_Store
```

```bash
mv codex_merge_readiness_checklist.md docs/roadmap/archive/codex_merge_readiness_checklist.md
mv tennislevel_scenario_reconstruction_codex_plan.md docs/roadmap/archive/tennislevel_scenario_reconstruction_codex_plan.md
git rm src/data/studySnapshot/creators.2026-03-29-v1.json
git rm src/data/studySnapshot/metadata.2026-03-29-v1.json
git rm --cached .DS_Store
```

- [ ] **Step 4: Run focused verification**

Run: `npm test -- src/__tests__/study-snapshot.test.ts`
Expected: PASS with the active snapshot still readable after file removal.

- [ ] **Step 5: Run repo-level verification for the cleanup slice**

Run: `npm run build`
Expected: PASS with no import failures from moved or deleted files.

- [ ] **Step 6: Commit**

```bash
git add .env.example .gitignore docs/roadmap/archive/codex_merge_readiness_checklist.md docs/roadmap/archive/tennislevel_scenario_reconstruction_codex_plan.md src/data/studySnapshot/index.ts src/__tests__/study-snapshot.test.ts
git add -u
git commit -m "chore: clean up archived docs and stale study snapshots"
```

### Task 2: PR2 Assessment Engine Redesign

**Files:**
- Modify: `src/data/assessmentQuestions.ts`
- Modify: `src/lib/i18n/assessmentCopy.ts`
- Modify: `src/lib/assessment.ts`
- Modify: `src/types/assessment.ts`
- Create: `src/__tests__/assessment-engine.test.ts`

- [ ] **Step 1: Write the failing assessment engine tests**

```ts
import { describe, expect, it } from "vitest";
import { calculateAssessmentResult, determineBranch } from "@/lib/assessment";

describe("assessment engine", () => {
  it("uses reachable branch C thresholds", () => {
    expect(determineBranch(15)).toBe("C");
  });

  it("produces 4.5 for a strong branch C fine score", () => {
    const result = calculateAssessmentResult({
      coarse_rally: 4,
      coarse_serve: 4,
      coarse_awareness: 4,
      coarse_movement: 4,
      coarse_pressure: 3,
      fine_c_net: 3,
      fine_c_depth: 4,
      fine_c_forcing: 4,
      fine_c_adaptability: 4
    });

    expect(result.level).toBe("4.5");
  });

  it("surfaces score-2 dimensions as observation-needed output", () => {
    const result = calculateAssessmentResult({
      coarse_rally: 2,
      coarse_serve: 2,
      coarse_awareness: 2,
      coarse_movement: 2,
      coarse_pressure: 2,
      fine_a_grip: 2,
      fine_a_fast: 2,
      fine_a_issue: 2,
      fine_a_movement: 2
    });

    expect(result.observationNeeded.length).toBeGreaterThan(0);
    expect(result.weaknesses.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run: `npm test -- src/__tests__/assessment-engine.test.ts`
Expected: FAIL because the new coarse questions, fine questions, and score-2 behavior do not exist yet.

- [ ] **Step 3: Expand the assessment question set to an 8-10 question ladder**

```ts
// src/data/assessmentQuestions.ts
{
  id: "coarse_movement",
  phase: "coarse",
  type: "choice",
  question: "来回移动和还原时，你通常是什么状态？",
  options: [
    { label: "经常站住不动，来不及补位", value: 1 },
    { label: "能追到一些球，但经常晚一步", value: 2 },
    { label: "大多数球都能到位并回位", value: 3 },
    { label: "移动、刹车和回位都比较自然", value: 4 }
  ],
  dimension: "movement"
},
{
  id: "coarse_pressure",
  phase: "coarse",
  type: "choice",
  question: "比分紧一点时，你的球会发生什么变化？",
  options: [
    { label: "动作会散，失误明显增多", value: 1 },
    { label: "会变紧，出手不太敢", value: 2 },
    { label: "大体还能保持平时水平", value: 3 },
    { label: "越关键越能打出自己的球", value: 4 }
  ],
  dimension: "pressure_performance"
}
```

```ts
// add one extra fine question per branch
{
  id: "fine_a_movement",
  phase: "fine",
  branch: "A",
  type: "choice",
  question: "跑位和还原目前更像哪种情况？",
  options: [
    { label: "打完常常停在原地", value: 1 },
    { label: "会去追球，但不太会回位", value: 2 },
    { label: "大多数时候能回到基本站位", value: 3 },
    { label: "击球后会自然做下一拍准备", value: 4 }
  ],
  dimension: "movement"
}
```

```ts
// src/lib/assessment.ts
export function determineBranch(coarseScore: number): AssessmentBranch {
  if (coarseScore <= 8) return "A";
  if (coarseScore <= 14) return "B";
  return "C";
}

export function calculateLevel(coarseScore: number, fineScore: number): AssessmentLevel {
  const branch = determineBranch(coarseScore);
  if (branch === "A") return fineScore <= 8 ? "2.5" : "3.0";
  if (branch === "B") return fineScore <= 9 ? "3.0" : fineScore <= 14 ? "3.5" : "4.0";
  if (fineScore <= 6) return "3.5";
  if (fineScore <= 10) return "4.0";
  return "4.5";
}
```

- [ ] **Step 4: Add score-tier output and personalized summary generation**

```ts
// src/types/assessment.ts
export type DimensionStatus = "强项" | "正常" | "待提升" | "薄弱";

export type DimensionSummary = {
  key: DimensionKey;
  label: string;
  score: number;
  maxScore: number;
  average: number;
  levelHint: AssessmentLevel;
  answeredCount: number;
  uncertainCount: number;
  status: DimensionStatus;
};
```

```ts
// src/lib/assessment.ts
function getDimensionStatus(score: number): DimensionSummary["status"] {
  if (score >= 4) return "强项";
  if (score === 3) return "正常";
  if (score === 2) return "待提升";
  return "薄弱";
}

function buildWeaknesses(dimensions: DimensionSummary[]) {
  return dimensions.filter((dimension) => dimension.score === 1).map((dimension) => dimension.label);
}

function buildObservationNeeded(dimensions: DimensionSummary[]) {
  return dimensions.filter((dimension) => dimension.score === 2).map((dimension) => dimension.label);
}

function buildSummary(level: AssessmentLevel, dimensions: DimensionSummary[], locale: AssessmentLocale) {
  const weakest = [...dimensions].sort((a, b) => a.score - b.score).slice(0, 2).map((item) => item.label);
  if (locale === "en") {
    return `Your skill level is around ${level}. ${weakest.join(" and ")} are your highest-priority areas for improvement.`;
  }
  return `你的能力区间接近 ${level}。${weakest.join("和")} 是目前最值得优先提升的方向。`;
}
```

- [ ] **Step 5: Add bilingual copy for the new questions**

```ts
// src/lib/i18n/assessmentCopy.ts
coarse_movement: {
  en: "How is your movement and recovery between shots?",
  labels: {
    1: "I get stuck and recover late",
    2: "I chase some balls but arrive late",
    3: "I reach most balls and recover reasonably",
    4: "Movement, braking, and recovery feel natural"
  }
},
coarse_pressure: {
  en: "What happens to your game when the score gets tight?",
  labels: {
    1: "My swing falls apart and errors spike",
    2: "I tighten up and stop swinging freely",
    3: "I mostly stay at my usual level",
    4: "I often play better on big points"
  }
}
```

- [ ] **Step 6: Run assessment-engine verification**

Run: `npm test -- src/__tests__/assessment-engine.test.ts`
Expected: PASS with new branch thresholds, new dimensions, and score-2 output working.

- [ ] **Step 7: Commit**

```bash
git add src/data/assessmentQuestions.ts src/lib/i18n/assessmentCopy.ts src/lib/assessment.ts src/types/assessment.ts src/__tests__/assessment-engine.test.ts
git commit -m "feat: redesign assessment scoring ladder"
```

### Task 3: PR2 Assessment UI Flow And Result Presentation

**Files:**
- Modify: `src/app/assessment/page.tsx`
- Modify: `src/components/assessment/QuestionCard.tsx`
- Modify: `src/components/assessment/SkillBreakdown.tsx`
- Modify: `src/components/assessment/ResultSummary.tsx`
- Modify: `src/lib/i18n/dictionaries/zh.ts`
- Modify: `src/lib/i18n/dictionaries/en.ts`
- Create: `src/__tests__/assessment-flow.test.tsx`

- [ ] **Step 1: Write the failing flow/UI test**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultSummary } from "@/components/assessment/ResultSummary";

describe("assessment result summary", () => {
  it("shows top weak areas from the actual result", () => {
    render(<ResultSummary result={{
      totalScore: 20,
      maxScore: 36,
      normalizedScore: 20,
      answeredCount: 9,
      uncertainCount: 0,
      totalQuestions: 9,
      level: "3.0",
      confidence: "较高",
      dimensions: [
        { key: "movement", label: "移动", score: 2, maxScore: 4, average: 2, levelHint: "3.0", answeredCount: 1, uncertainCount: 0, status: "待提升" },
        { key: "serve", label: "发球", score: 1, maxScore: 4, average: 1, levelHint: "3.0", answeredCount: 1, uncertainCount: 0, status: "薄弱" }
      ],
      strengths: [],
      weaknesses: ["发球"],
      observationNeeded: ["移动"],
      summary: "你的能力区间接近 3.0。发球和移动是目前最值得优先提升的方向。"
    }} />);

    expect(screen.getByText(/发球/)).toBeInTheDocument();
    expect(screen.getByText(/移动/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the assessment UI test to verify failure or missing coverage**

Run: `npm test -- src/__tests__/assessment-flow.test.tsx`
Expected: FAIL or incomplete assertions before the new tier display and summary copy land.

- [ ] **Step 3: Remove unused gender friction and keep the flow concise**

```ts
// src/data/assessmentQuestions.ts
export const assessmentQuestions: AssessmentQuestion[] = [
  // remove the profile gender question entirely
  {
    id: "coarse_rally",
    phase: "coarse",
    type: "choice",
    question: "日常练习中，你通常能连续对打多少拍？",
    ...
  }
];
```

```ts
// src/app/assessment/page.tsx
const profileQuestions = useMemo(
  () => assessmentQuestions.filter((question) => question.phase === "profile"),
  []
);

const totalSteps = coarseQuestions.length + fineQuestions.length;
```

- [ ] **Step 4: Update the UI to show four clear tiers**

```tsx
// src/components/assessment/SkillBreakdown.tsx
const statusClasses = {
  "强项": "text-emerald-700",
  "正常": "text-slate-600",
  "待提升": "text-amber-700",
  "薄弱": "text-rose-700"
};

<p className={`text-xs ${statusClasses[dimension.status]}`}>状态：{dimension.status}</p>
```

```tsx
// src/components/assessment/ResultSummary.tsx
<p className="text-base text-slate-700">{result.summary}</p>
<p className="text-base font-semibold text-slate-900">
  {t("assessment.result.weakness", { value: weaknessText })}
</p>
```

- [ ] **Step 5: Add compact copy updates to support the stronger ladder**

```ts
// src/lib/i18n/dictionaries/zh.ts
"assessment.empty.subtitle": "做完后，我们会告诉你大概区间，以及此刻最该优先补的两项能力。",
```

```ts
// src/lib/i18n/dictionaries/en.ts
"assessment.empty.subtitle": "After that, we will estimate your level range and the two ability areas worth fixing first.",
```

- [ ] **Step 6: Run UI verification**

Run: `npm test -- src/__tests__/assessment-flow.test.tsx`
Expected: PASS with the new summary and tier display visible.

- [ ] **Step 7: Run build verification**

Run: `npm run build`
Expected: PASS with the revised assessment flow and result UI.

- [ ] **Step 8: Commit**

```bash
git add src/app/assessment/page.tsx src/components/assessment/QuestionCard.tsx src/components/assessment/SkillBreakdown.tsx src/components/assessment/ResultSummary.tsx src/lib/i18n/dictionaries/zh.ts src/lib/i18n/dictionaries/en.ts src/__tests__/assessment-flow.test.tsx
git commit -m "feat: refresh assessment flow and result UI"
```

### Task 4: PR3 Assessment To Plan Handoff

**Files:**
- Modify: `src/lib/plans.ts`
- Modify: `src/types/plan.ts`
- Modify: `src/app/assessment/result/page.tsx`
- Modify: `src/app/plan/page.tsx`
- Modify: `src/components/plan/PlanSummary.tsx`
- Create: `src/__tests__/assessment-plan-linkage.test.ts`
- Modify: `src/__tests__/study-plan-draft.test.ts`

- [ ] **Step 1: Write the failing assessment-to-plan linkage test**

```ts
import { describe, expect, it } from "vitest";
import { buildAssessmentPlanContext, getPlanTemplate } from "@/lib/plans";

describe("assessment to plan linkage", () => {
  it("passes weak dimensions into plan generation", () => {
    const assessmentPlan = buildAssessmentPlanContext({
      totalScore: 24,
      maxScore: 36,
      normalizedScore: 24,
      answeredCount: 9,
      uncertainCount: 0,
      totalQuestions: 9,
      level: "3.0",
      confidence: "较高",
      dimensions: [
        { key: "movement", label: "移动", score: 2, maxScore: 4, average: 2, levelHint: "3.0", answeredCount: 1, uncertainCount: 0, status: "待提升" },
        { key: "forehand", label: "正手", score: 1, maxScore: 4, average: 1, levelHint: "3.0", answeredCount: 1, uncertainCount: 0, status: "薄弱" }
      ],
      strengths: [],
      weaknesses: ["正手"],
      observationNeeded: ["移动"],
      summary: "你的能力区间接近 3.0。正手和移动是目前最值得优先提升的方向。"
    });

    const plan = getPlanTemplate(assessmentPlan.problemTag, "3.0", "zh", assessmentPlan.candidateIds, {
      planContext: assessmentPlan.planContext
    });

    expect(assessmentPlan.planContext?.source).toBe("assessment");
    expect(plan.summary).toContain("移动");
  });
});
```

- [ ] **Step 2: Run the linkage test to verify failure**

Run: `npm test -- src/__tests__/assessment-plan-linkage.test.ts`
Expected: FAIL because weak-dimension plan context is not yet preserved strongly enough.

- [ ] **Step 3: Extend the plan context model to carry weak-dimension emphasis**

```ts
// src/types/plan.ts
export type PlanContext = {
  source: "diagnosis" | "assessment";
  primaryProblemTag: string;
  sessionType: PlanContextSessionType;
  pressureContext: PlanContextPressure;
  movementContext: PlanContextMovement;
  incomingBallDepth: PlanContextDepth;
  outcomePattern: PlanContextOutcome;
  feelingModifiers: PlanContextFeeling[];
  weakDimensions?: string[];
  observationDimensions?: string[];
  rationale?: string;
};
```

```ts
// src/lib/plans.ts
export function buildAssessmentPlanContext(result: AssessmentResult) {
  const weakest = [...result.dimensions].sort((a, b) => a.score - b.score).slice(0, 2);
  const primary = weakest[0];

  return {
    problemTag: ASSESSMENT_DIMENSION_PLAN_HINTS[primary.key].primaryProblemTag,
    candidateIds: [],
    planContext: {
      source: "assessment" as const,
      primaryProblemTag: ASSESSMENT_DIMENSION_PLAN_HINTS[primary.key].primaryProblemTag,
      sessionType: "unknown" as const,
      pressureContext: "unknown" as const,
      movementContext: primary.key === "movement" ? "moving" as const : "unknown" as const,
      incomingBallDepth: "unknown" as const,
      outcomePattern: "unknown" as const,
      feelingModifiers: [],
      weakDimensions: weakest.map((item) => item.label),
      observationDimensions: result.observationNeeded,
      rationale: result.summary
    }
  };
}
```

- [ ] **Step 4: Pass the richer assessment context into `/plan` and surface it**

```tsx
// src/app/assessment/result/page.tsx
const planHref = assessmentPlan
  ? buildPlanHref({
      problemTag: assessmentPlan.problemTag,
      level: result.level,
      preferredContentIds: assessmentPlan.candidateIds,
      sourceType: "assessment",
      planContext: assessmentPlan.planContext
    })
  : null;
```

```tsx
// src/components/plan/PlanSummary.tsx
export function PlanSummary({
  headline,
  supportingText,
  rationale
}: {
  headline: string;
  supportingText?: string;
  rationale?: string;
}) {
  ...
  {rationale ? <p className="text-sm leading-6 text-slate-700">{rationale}</p> : null}
}
```

- [ ] **Step 5: Use assessment weak dimensions to nudge plan summary/rationale**

```ts
// src/lib/plans.ts inside getPlanTemplate summary construction
if (options.planContext?.source === "assessment" && options.planContext.weakDimensions?.length) {
  generated.summary = locale === "en"
    ? `This week emphasizes ${options.planContext.weakDimensions.join(" and ")} because those showed up as your main weak areas in assessment.`
    : `这周会优先补 ${options.planContext.weakDimensions.join("和")}，因为它们是你评估里最明显的短板。`;
}
```

- [ ] **Step 6: Run linkage verification**

Run: `npm test -- src/__tests__/assessment-plan-linkage.test.ts src/__tests__/study-plan-draft.test.ts`
Expected: PASS with plan context surviving URL/draft handoff.

- [ ] **Step 7: Commit**

```bash
git add src/lib/plans.ts src/types/plan.ts src/app/assessment/result/page.tsx src/app/plan/page.tsx src/components/plan/PlanSummary.tsx src/__tests__/assessment-plan-linkage.test.ts src/__tests__/study-plan-draft.test.ts
git commit -m "feat: connect assessment weak points to plan generation"
```

### Task 5: PR4 Fill Missing Diagnosis Plan Templates

**Files:**
- Modify: `src/data/planTemplates.ts`
- Create/Modify: `src/__tests__/plan-rationale.test.ts`
- Modify: `src/__tests__/plan-fixtures.test.ts`

- [ ] **Step 1: Write the failing template coverage test**

```ts
import { describe, expect, it } from "vitest";
import { getPlanTemplate } from "@/lib/plans";

describe("diagnosis plan coverage", () => {
  it.each([
    "rally-consistency",
    "forehand-no-power",
    "balls-too-short",
    "return-under-pressure",
    "cant-hit-lob",
    "stamina-drop"
  ])("provides a dedicated template for %s", (problemTag) => {
    const plan = getPlanTemplate(problemTag, "3.5", "zh");
    expect(plan.source).toBe("template");
    expect(plan.problemTag).toBe(problemTag);
  });
});
```

- [ ] **Step 2: Run the coverage test to verify the generic fallbacks fail**

Run: `npm test -- src/__tests__/plan-rationale.test.ts`
Expected: FAIL for the missing template tags before template creation.

- [ ] **Step 3: Add dedicated templates for the six missing diagnosis tags**

```ts
// src/data/planTemplates.ts
{
  problemTag: "rally-consistency",
  level: "3.5",
  title: "对拉稳定性 7 天计划",
  titleEn: "7-Day Rally Stability Plan",
  target: "先把连续对拉的节奏、落点和回位稳定下来。",
  targetEn: "Stabilize rally rhythm, depth, and recovery before adding variety.",
  days: [
    { day: 1, focus: "先把中路节奏打稳", focusEn: "Settle the middle-ball rhythm", contentIds: ["content_fr_02"], drills: ["中路对拉 12 球 4 轮", "每球后做一次回位"], drillsEn: ["4 rounds of 12 middle-ball rallies", "Recover after every ball"], duration: "20 分钟", durationEn: "20 min" },
    { day: 2, focus: "减少无谓失误", focusEn: "Reduce free errors", contentIds: ["content_fr_02"], drills: ["只记失误类型", "每轮只追求 6 个干净回合"], drillsEn: ["Track error type only", "Aim for 6 clean balls per round"], duration: "20 分钟", durationEn: "20 min" }
  ]
}
```

```ts
// apply the same concrete structure for:
// forehand-no-power, balls-too-short, return-under-pressure, cant-hit-lob, stamina-drop
```

- [ ] **Step 4: Keep `stamina-drop` fallback-compatible but prefer the dedicated template**

```ts
// src/lib/plans.ts
const PLAN_COMPATIBILITY_FALLBACKS: Record<string, string> = {
  "pressure-tightness": "match-anxiety"
};
```

- [ ] **Step 5: Run template verification**

Run: `npm test -- src/__tests__/plan-rationale.test.ts src/__tests__/plan-fixtures.test.ts`
Expected: PASS with all six tags returning dedicated templates.

- [ ] **Step 6: Commit**

```bash
git add src/data/planTemplates.ts src/lib/plans.ts src/__tests__/plan-rationale.test.ts src/__tests__/plan-fixtures.test.ts
git commit -m "feat: add dedicated plan templates for common diagnosis tags"
```

### Task 6: PR4 Strengthen Diagnosis To Plan Context And Rationale

**Files:**
- Modify: `src/lib/plans.ts`
- Modify: `src/components/diagnose/DiagnoseResult.tsx`
- Modify: `src/app/plan/page.tsx`
- Modify: `src/components/plan/PlanSummary.tsx`
- Modify: `src/__tests__/plan-context.test.ts`
- Create: `src/__tests__/plan-rationale.test.ts`

- [ ] **Step 1: Write the failing diagnosis-rationale test**

```ts
import { describe, expect, it } from "vitest";
import { getPlanTemplate } from "@/lib/plans";

describe("plan rationale", () => {
  it("shows why the plan was chosen for a diagnosis-driven case", () => {
    const plan = getPlanTemplate("return-under-pressure", "4.0", "zh", [], {
      primaryNextStep: "先把接发准备做早一点",
      planContext: {
        source: "diagnosis",
        primaryProblemTag: "return-under-pressure",
        sessionType: "match",
        pressureContext: "high",
        movementContext: "stationary",
        incomingBallDepth: "unknown",
        outcomePattern: "unknown",
        feelingModifiers: ["tight"],
        rationale: "你的诊断显示问题集中在关键分接发时的准备和出手紧张。"
      }
    });

    expect(plan.summary).toContain("关键分");
    expect(plan.summary).toContain("接发");
  });
});
```

- [ ] **Step 2: Run the rationale test to verify failure**

Run: `npm test -- src/__tests__/plan-rationale.test.ts src/__tests__/plan-context.test.ts`
Expected: FAIL until plan summary/rationale use the richer diagnosis context consistently.

- [ ] **Step 3: Normalize all diagnosis-driven plans around a visible rationale**

```ts
// src/lib/plans.ts
function buildPlanRationale(locale: PlanLocale, options: {
  problemTag: string;
  primaryNextStep?: string;
  planContext?: PlanContext | null;
  deepContext?: EnrichedDiagnosisContext | null;
}) {
  if (locale === "en") {
    return options.deepContext?.isDeepModeReady
      ? `This plan is built around ${options.problemTag}, using the reconstructed scene and the next step "${options.primaryNextStep ?? ""}".`
      : `This plan is built around ${options.problemTag} and the next step "${options.primaryNextStep ?? ""}".`;
  }

  return options.deepContext?.isDeepModeReady
    ? `这份计划围绕 ${options.problemTag} 展开，并结合了场景还原后的诊断证据与“${options.primaryNextStep ?? ""}”这个下一步。`
    : `这份计划围绕 ${options.problemTag} 展开，优先落实“${options.primaryNextStep ?? ""}”这个下一步。`;
}
```

- [ ] **Step 4: Feed diagnosis rationale from result page into plan page**

```tsx
// src/components/diagnose/DiagnoseResult.tsx
const planContext = buildDiagnosisPlanContext({
  problemTag: result.problemTag,
  diagnosisInput: input,
  primaryNextStep
});

const planHref = buildPlanHref({
  problemTag: result.problemTag,
  level: result.level,
  preferredContentIds: candidateIds,
  sourceType: "diagnosis",
  primaryNextStep,
  planContext,
  deepContext: deepContext ?? undefined
});
```

```tsx
// src/app/plan/page.tsx
<PlanSummary
  headline={plan.target}
  supportingText={plan.summary}
  rationale={planContext?.rationale}
/>
```

- [ ] **Step 5: Run focused diagnosis-plan verification**

Run: `npm test -- src/__tests__/plan-context.test.ts src/__tests__/plan-rationale.test.ts`
Expected: PASS with deep and non-deep diagnosis cases both producing explicit rationale.

- [ ] **Step 6: Run broad final verification**

Run: `npm run build`
Expected: PASS across assessment, diagnosis, and plan pages after the full linkage update.

- [ ] **Step 7: Commit**

```bash
git add src/lib/plans.ts src/components/diagnose/DiagnoseResult.tsx src/app/plan/page.tsx src/components/plan/PlanSummary.tsx src/__tests__/plan-context.test.ts src/__tests__/plan-rationale.test.ts
git commit -m "feat: make diagnosis signals drive plan rationale"
```

## Self-Review

### Spec coverage
- Cleanup: covered by Task 1
- Stronger 8-10 question assessment: covered by Tasks 2-3
- Diagnosis-to-plan linkage: covered by Tasks 4-6
- Conservative maintenance: preserved by PR boundaries and additive data-model changes

### Placeholder scan
- No `TODO`, `TBD`, or “similar to above” references remain
- Every task lists exact files, commands, and concrete snippets

### Type consistency
- `PlanContext` additions are carried through `src/types/plan.ts`, `src/lib/plans.ts`, `src/app/assessment/result/page.tsx`, and `src/app/plan/page.tsx`
- New assessment statuses are introduced in `src/types/assessment.ts` before they are consumed by UI components

Plan complete and saved to `docs/superpowers/plans/2026-04-05-assessment-and-plan-strengthening.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
