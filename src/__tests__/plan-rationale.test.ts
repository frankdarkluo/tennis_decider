import { describe, expect, it } from "vitest";
import { buildDiagnosisPlanContext, getPlanTemplate } from "@/lib/plans";

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
});
