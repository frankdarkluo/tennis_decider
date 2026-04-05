import { describe, expect, it } from "vitest";
import {
  buildAssessmentPlanContext,
  buildDiagnosisPlanContext,
  getAssessmentPlanFocusLine,
  getPlanTemplate
} from "@/lib/plans";
import { AssessmentResult } from "@/types/assessment";

type TemplateCoverageCase = {
  problemTag: string;
  level: "3.0" | "4.0";
  expectedTitle: string;
  day1Focus: string;
  day6Goal: string;
  targetIncludes?: string;
};

const templateCoverageCases: TemplateCoverageCase[] = [
  {
    problemTag: "rally-consistency",
    level: "3.0",
    expectedTitle: "多拍稳定性 7 天计划",
    day1Focus: "对拉节奏",
    day6Goal: "把稳定相持带进计分压力"
  },
  {
    problemTag: "forehand-no-power",
    level: "3.0",
    expectedTitle: "正手发力重建 7 天计划",
    day1Focus: "发力链条",
    day6Goal: "把发力带进移动中的正手"
  },
  {
    problemTag: "balls-too-short",
    level: "3.0",
    expectedTitle: "击球深度提升 7 天计划",
    day1Focus: "深度感",
    day6Goal: "在变线时仍把球送进深区"
  },
  {
    problemTag: "return-under-pressure",
    level: "3.0",
    expectedTitle: "接发抗压 7 天计划",
    day1Focus: "分腿垫步",
    day6Goal: "把接发放进比分压力"
  },
  {
    problemTag: "cant-hit-lob",
    level: "3.0",
    expectedTitle: "高吊球选择 7 天计划",
    day1Focus: "高吊球触球点",
    day6Goal: "把高吊球带进受压场景"
  },
  {
    problemTag: "stamina-drop",
    level: "3.0",
    expectedTitle: "体能掉线应对 7 天计划",
    day1Focus: "脚步省力",
    day6Goal: "把节奏管理带进疲劳回合"
  },
  {
    problemTag: "stamina-drop",
    level: "4.0",
    expectedTitle: "体能掉线应对 7 天计划",
    day1Focus: "脚步省力",
    day6Goal: "把节奏管理带进高负荷疲劳回合",
    targetIncludes: "更高负荷"
  }
];

function createAssessmentResult(): AssessmentResult {
  return {
    totalScore: 0,
    maxScore: 0,
    normalizedScore: 0,
    answeredCount: 8,
    uncertainCount: 0,
    totalQuestions: 8,
    level: "3.0",
    confidence: "中等",
    dimensions: [
      {
        key: "serve",
        label: "发球",
        score: 1,
        maxScore: 4,
        average: 1,
        levelHint: "3.0",
        answeredCount: 2,
        uncertainCount: 0,
        status: "薄弱"
      },
      {
        key: "matchplay",
        label: "比赛意识",
        score: 2,
        maxScore: 4,
        average: 2,
        levelHint: "3.0",
        answeredCount: 2,
        uncertainCount: 0,
        status: "待提升"
      }
    ],
    strengths: [],
    weaknesses: ["发球"],
    observationNeeded: ["比赛意识"],
    summary: "发球最需要优先补强，比赛意识还需要继续观察。"
  };
}

describe("diagnosis plan template coverage", () => {
  it("resolves the six common diagnosis tags to dedicated templates instead of the generic fallback", () => {
    for (const testCase of templateCoverageCases) {
      const plan = getPlanTemplate(testCase.problemTag, testCase.level, "zh");

      expect(plan.source).toBe("template");
      expect(plan.title).toBe(testCase.expectedTitle);
      expect(plan.title).not.toBe("通用 7 天基础提升计划");
      expect(plan.days).toHaveLength(7);
      if (testCase.targetIncludes) {
        expect(plan.target).toContain(testCase.targetIncludes);
      }
      expect(plan.days[0]?.focus).toContain(testCase.day1Focus);
      expect(plan.days[5]?.goal).toContain(testCase.day6Goal);
    }
  });

  it("writes diagnosis-driven rationale that keeps the primary next step tied to the return-pressure scene", () => {
    const primaryNextStep = "先稳住分腿垫步，再把第一拍封挡回中路。";
    const planContext = buildDiagnosisPlanContext({
      problemTag: "return-under-pressure",
      diagnosisInput: "比赛里关键分接发时我容易发紧，回球质量一下就掉下来。",
      primaryNextStep
    });

    const plan = getPlanTemplate("return-under-pressure", "4.0", "zh", [], {
      primaryNextStep,
      planContext
    });

    expect(plan.summary).toContain(primaryNextStep);
    expect(plan.summary).toContain("关键分");
    expect(plan.summary).not.toBe(`本周先围绕这一个主动作推进：${primaryNextStep}`);
  });

  it("keeps assessment-origin focus and rationale split after diagnosis summary changes", () => {
    const assessmentPlan = buildAssessmentPlanContext(createAssessmentResult());
    const plan = getPlanTemplate(assessmentPlan.problemTag, "3.0", "zh", assessmentPlan.candidateIds, {
      planContext: assessmentPlan.planContext
    });
    const focusLine = getAssessmentPlanFocusLine(assessmentPlan.planContext, "zh");

    expect(focusLine).toBe("优先补强：发球。继续观察：比赛意识。");
    expect(plan.summary).toContain("发球");
    expect(plan.summary).toContain("比赛意识");
    expect(plan.summary).not.toContain("主动作");
  });
});
