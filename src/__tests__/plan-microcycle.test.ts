import { describe, expect, it } from "vitest";
import { buildDiagnosisPlanContext, getPlanTemplate } from "@/lib/plans";

describe("plan microcycle progression", () => {
  it("keeps later days role-driven instead of drifting into generic filler", () => {
    const planContext = buildDiagnosisPlanContext({
      problemTag: "second-serve-reliability",
      diagnosisInput: "比赛里关键分时我原地的二发容易下网，而且会发紧。",
      primaryNextStep: "先建立安全二发节奏"
    });

    const plan = getPlanTemplate("second-serve-reliability", "3.5", "zh", [], {
      primaryNextStep: "先建立安全二发节奏",
      planContext
    });

    expect(plan.days[3]?.goal).toContain("复盘");
    expect(plan.days[4]?.goal).toContain("压力");
    expect(plan.days[5]?.goal).toContain("转移");
    expect(plan.days[6]?.goal).toContain("巩固");
  });

  it("uses deep context to keep later-day pressure work scene-specific", () => {
    const pressureContext = buildDiagnosisPlanContext({
      problemTag: "second-serve-reliability",
      diagnosisInput: "比赛里关键分时我原地的二发容易下网，而且会发紧。",
      primaryNextStep: "先建立安全二发节奏"
    });
    const plainContext = buildDiagnosisPlanContext({
      problemTag: "second-serve-reliability",
      diagnosisInput: "我的二发不太稳。",
      primaryNextStep: "先建立安全二发节奏"
    });

    const pressurePlan = getPlanTemplate("second-serve-reliability", "3.5", "zh", [], {
      primaryNextStep: "先建立安全二发节奏",
      planContext: pressureContext
    });
    const plainPlan = getPlanTemplate("second-serve-reliability", "3.5", "zh", [], {
      primaryNextStep: "先建立安全二发节奏",
      planContext: plainContext
    });

    expect(pressurePlan.days[4]?.pressureBlock.items.join(" ")).toContain("关键分");
    expect(pressurePlan.days[5]?.goal).toContain("比赛");
    expect(pressurePlan.days[6]?.successCriteria.join(" ")).toContain("关键分");
    expect(plainPlan.days[4]?.pressureBlock.items.join(" ")).not.toContain("关键分");
  });
});
