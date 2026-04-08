import { describe, expect, it } from "vitest";
import { getPlanTemplate } from "@/lib/plans";
import type { EnrichedDiagnosisContext } from "@/types/enrichedDiagnosis";

const deepServeContext: EnrichedDiagnosisContext = {
  mode: "deep",
  sourceInput: "关键分时我的二发容易下网",
  sceneSummaryZh: "比赛里我的原地二发容易下网，而且会发紧。",
  sceneSummaryEn: "In matches my stationary second serve keeps going into the net and it feels tight.",
  skillCategory: "serve",
  skillCategoryConfidence: "high",
  problemTag: "second-serve-reliability",
  level: "3.5",
  strokeFamily: "serve",
  serveSubtype: "second_serve",
  sessionType: "match",
  pressureContext: "key_points",
  movement: "stationary",
  outcome: "net",
  incomingBallDepth: "unknown",
  subjectiveFeeling: "tight",
  unresolvedRequiredSlots: [],
  stoppedByCap: false,
  isDeepModeReady: true
};

describe("deep plan overlay", () => {
  it("rewrites all 7 days for a deep serve case instead of only summary or day 1", () => {
    const plan = getPlanTemplate("second-serve-reliability", "3.5", "zh", [], {
      primaryNextStep: "先建立安全二发节奏",
      deepContext: deepServeContext
    });

    expect(plan.summary).toContain("关键分");
    expect(plan.days[0]?.goal).toContain("基线");
    expect(plan.days[1]?.goal).toContain("稳定");
    expect(plan.days[2]?.goal).toContain("关键场景变量");
    expect(plan.days[3]?.goal).toContain("节奏");
    expect(plan.days[4]?.goal).toContain("压力");
    expect(plan.days[5]?.goal).toContain("得分片段");
    expect(plan.days[6]?.goal).toContain("带入下一周");
    expect(plan.days.every((day) => day.warmupBlock.items.length > 0)).toBe(true);
    expect(plan.days.every((day) => day.mainBlock.items.length > 0)).toBe(true);
    expect(plan.days.every((day) => day.pressureBlock.items.length > 0)).toBe(true);
    expect(plan.days.every((day) => day.successCriteria.length > 0)).toBe(true);
  });

  it("uses serve deepContext to keep the whole week scene-specific instead of decaying after day 3", () => {
    const plan = getPlanTemplate("second-serve-reliability", "3.5", "zh", [], {
      primaryNextStep: "先建立安全二发节奏",
      deepContext: deepServeContext
    });

    expect(plan.days[0]?.focus).toContain("二发");
    expect(plan.days[0]?.mainBlock.items.join(" ")).toContain("过网");
    expect(plan.days[0]?.successCriteria.join(" ")).toContain("下网");

    expect(plan.days[1]?.focus).toContain("稳定");
    expect(plan.days[1]?.mainBlock.items.join(" ")).toContain("二发");
    expect(plan.days[1]?.pressureBlock.items.join(" ")).toContain("连续");

    expect(plan.days[2]?.goal).toContain("关键场景变量");
    expect(plan.days[2]?.mainBlock.items.join(" ")).toContain("关键分");

    expect(plan.days[3]?.goal).toContain("节奏");
    expect(plan.days[3]?.mainBlock.items.join(" ")).toContain("发紧");

    expect(plan.days[4]?.goal).toContain("压力");
    expect(plan.days[4]?.pressureBlock.items.join(" ")).toContain("关键分");

    expect(plan.days[5]?.goal).toContain("得分片段");
    expect(plan.days[5]?.mainBlock.items.join(" ")).toContain("发球");
    expect(plan.days[5]?.pressureBlock.items.join(" ")).toContain("下一拍");

    expect(plan.days[6]?.goal).toContain("带入下一周");
    expect(plan.days[6]?.successCriteria.join(" ")).toContain("规则");
  });
});
