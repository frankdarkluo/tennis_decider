import { describe, expect, it } from "vitest";
import { buildDiagnosisPlanContext, getPlanTemplate } from "@/lib/plans";
import type { EnrichedDiagnosisContext } from "@/types/enrichedDiagnosis";

function createReturnDeepContext(): EnrichedDiagnosisContext {
  return {
    mode: "deep",
    sourceInput: "关键分接发时我总是发紧，第一拍只能挡回去而且很浅。",
    sceneSummaryZh: "关键分接发时我会发紧，第一拍只能浅挡回中路。",
    sceneSummaryEn: "On key points I get tight on the return and only block the first ball back short.",
    skillCategory: "return",
    skillCategoryConfidence: "high",
    problemTag: "return-under-pressure",
    level: "4.0",
    strokeFamily: "return",
    sessionType: "match",
    pressureContext: "key_points",
    movement: "stationary",
    outcome: "short",
    incomingBallDepth: "deep",
    subjectiveFeeling: "tight",
    unresolvedRequiredSlots: [],
    stoppedByCap: false,
    isDeepModeReady: true
  };
}

describe("PR4 plan core", () => {
  it("builds a deterministic 7-day return plan contract with explicit carry cues", () => {
    const primaryNextStep = "先稳住分腿垫步，再把第一拍封挡回中路。";
    const planContext = buildDiagnosisPlanContext({
      problemTag: "return-under-pressure",
      diagnosisInput: "关键分接发时我总是发紧，第一拍只能挡回去而且很浅。",
      primaryNextStep
    });
    const deepContext = createReturnDeepContext();

    const first = getPlanTemplate("return-under-pressure", "4.0", "zh", [], {
      primaryNextStep,
      planContext,
      deepContext
    });
    const second = getPlanTemplate("return-under-pressure", "4.0", "zh", [], {
      primaryNextStep,
      planContext,
      deepContext
    });

    expect(first).toEqual(second);
    expect(first.days).toHaveLength(7);
    for (const day of first.days) {
      expect(day.goal.trim().length).toBeGreaterThan(0);
      expect(day.duration.trim().length).toBeGreaterThan(0);
      expect(day.mainBlock.items.length).toBeGreaterThan(0);
      expect(day.successCriteria.length).toBeGreaterThan(0);
      expect(day).toHaveProperty("failureCue");
      expect(day).toHaveProperty("progressionNote");
      expect(day).toHaveProperty("transferCue");
    }
  });

  it("keeps later return days tied to the original key-point return scene instead of drifting generic", () => {
    const plan = getPlanTemplate("return-under-pressure", "4.0", "zh", [], {
      primaryNextStep: "先稳住分腿垫步，再把第一拍封挡回中路。",
      planContext: buildDiagnosisPlanContext({
        problemTag: "return-under-pressure",
        diagnosisInput: "关键分接发时我总是发紧，第一拍只能挡回去而且很浅。",
        primaryNextStep: "先稳住分腿垫步，再把第一拍封挡回中路。"
      }),
      deepContext: createReturnDeepContext()
    });

    expect(plan.days[4]?.goal).toContain("关键分");
    expect(plan.days[5]?.mainBlock.items.join(" ")).toContain("接发");
    expect(plan.days[5]?.pressureBlock.items.join(" ")).toContain("第一拍");
    expect(plan.days[6]).toHaveProperty("transferCue");
    expect(String((plan.days[6] as unknown as Record<string, string>).transferCue)).toContain("接发");
  });
});
