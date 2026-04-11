import { describe, expect, it } from "vitest";
import {
  buildAssessmentPlanContext,
  buildDiagnosisPlanContext,
  getAssessmentPlanFocusLine,
  getPlanTemplate
} from "@/lib/plans";
import { PlayerProfileVector } from "@/types/assessment";

type TemplateCoverageCase = {
  problemTag: string;
  level: "3.0" | "4.0";
  expectedSkillWord: string;
  expectedDaySixWord: string;
};

const templateCoverageCases: TemplateCoverageCase[] = [
  {
    problemTag: "rally-consistency",
    level: "3.0",
    expectedSkillWord: "基础动作",
    expectedDaySixWord: "真实"
  },
  {
    problemTag: "forehand-no-power",
    level: "3.0",
    expectedSkillWord: "正手",
    expectedDaySixWord: "真实"
  },
  {
    problemTag: "balls-too-short",
    level: "3.0",
    expectedSkillWord: "正手",
    expectedDaySixWord: "真实"
  },
  {
    problemTag: "return-under-pressure",
    level: "3.0",
    expectedSkillWord: "接发",
    expectedDaySixWord: "真实"
  },
  {
    problemTag: "cant-hit-lob",
    level: "3.0",
    expectedSkillWord: "高压",
    expectedDaySixWord: "真实"
  },
  {
    problemTag: "stamina-drop",
    level: "3.0",
    expectedSkillWord: "脚步",
    expectedDaySixWord: "真实"
  },
  {
    problemTag: "stamina-drop",
    level: "4.0",
    expectedSkillWord: "脚步",
    expectedDaySixWord: "真实"
  }
];

function createAssessmentResult(): PlayerProfileVector {
  return {
    rawScore: 20,
    levelBand: "3.0",
    dimensionScores: {
      rally: 3,
      forehand: 3,
      backhand_slice: 3,
      serve: 1,
      return: 3,
      movement: 3,
      net: 3,
      overhead: 3,
      pressure: 2,
      tactics: 3
    },
    weakDimensions: ["serve", "pressure"],
    strongDimensions: [],
    primaryWeakness: "serve",
    secondaryWeakness: undefined,
    playStyle: "baseline_attack",
    playContext: "singles_standard",
    summary: {
      headline: "发球最需要优先补强，关键分与压力处理还需要继续观察。",
      oneLineLevelSummary: "你目前大致在 3.0 区间。",
      oneLinePlanHint: "后续训练计划应先围绕发球展开。"
    }
  };
}

describe("diagnosis plan blueprint coverage", () => {
  it("routes common diagnosis tags into distinct blueprint families instead of one generic fallback", () => {
    for (const testCase of templateCoverageCases) {
      const plan = getPlanTemplate(testCase.problemTag, testCase.level, "zh");

      expect(plan.source).toBe("template");
      expect(plan.title).toContain(testCase.expectedSkillWord);
      expect(plan.title).not.toBe("通用 7 步基础提升计划");
      expect(plan.days).toHaveLength(7);
      expect(plan.days[0]?.drill).toBeTruthy();
      expect(plan.days[0]?.load).toBeTruthy();
      expect(plan.days[0]?.executionFocus).toBeTruthy();
      expect(plan.days[5]?.goal).toContain(testCase.expectedDaySixWord);
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

    expect(focusLine).toBe("优先补强：发球。继续观察：关键分与压力处理。");
    expect(plan.summary).toContain("发球");
    expect(plan.summary).toContain("关键分与压力处理");
    expect(plan.summary).not.toContain("主动作");
  });
});
