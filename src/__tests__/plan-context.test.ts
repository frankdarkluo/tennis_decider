import { describe, expect, it } from "vitest";
import {
  buildDiagnosisPlanContext,
  buildPlanHref,
  getPlanTemplate,
  normalizePlanDraftSnapshot,
  parsePlanContext
} from "@/lib/plans";

describe("plan context handoff", () => {
  it("extracts structured deep context from diagnosis input", () => {
    const context = buildDiagnosisPlanContext({
      problemTag: "second-serve-reliability",
      diagnosisInput: "比赛里关键分时我原地的二发容易下网，而且会发紧。",
      primaryNextStep: "先建立安全二发节奏"
    });

    expect(context).toMatchObject({
      source: "diagnosis",
      primaryProblemTag: "second-serve-reliability",
      sessionType: "match",
      pressureContext: "high",
      movementContext: "stationary",
      outcomePattern: "net",
      feelingModifiers: ["tight"]
    });
  });

  it("round-trips plan context through the plan href and draft snapshot", () => {
    const planContext = buildDiagnosisPlanContext({
      problemTag: "running-backhand",
      diagnosisInput: "比赛里我跑动中的反手老下网，尤其对手球比较深的时候更明显。",
      primaryNextStep: "先把跑动中的击球点放到身体前面"
    });

    const href = buildPlanHref({
      problemTag: "running-backhand",
      level: "3.5",
      sourceType: "diagnosis",
      primaryNextStep: "先把跑动中的击球点放到身体前面",
      planContext
    });

    const params = new URL(href, "http://localhost").searchParams;
    const roundTripped = parsePlanContext(params.get("planContext"));
    const draft = normalizePlanDraftSnapshot({
      problemTag: "running-backhand",
      level: "3.5",
      sourceType: "diagnosis",
      primaryNextStep: "先把跑动中的击球点放到身体前面",
      planContext
    });

    expect(roundTripped).toEqual(planContext);
    expect(draft?.planContext).toEqual(planContext);
  });

  it("lets plans differentiate same-tag cases by deep context", () => {
    const matchPressureContext = buildDiagnosisPlanContext({
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
      planContext: matchPressureContext
    });
    const plainPlan = getPlanTemplate("second-serve-reliability", "3.5", "zh", [], {
      primaryNextStep: "先建立安全二发节奏",
      planContext: plainContext
    });

    expect(pressurePlan.summary).toContain("关键分");
    expect(pressurePlan.days[0]?.pressureBlock.items.join(" ")).toContain("关键分");
    expect(plainPlan.summary).not.toContain("关键分");
  });

  it("lets structured deepContext override shallower planContext during plan generation", () => {
    const shallowPlanContext = buildDiagnosisPlanContext({
      problemTag: "second-serve-reliability",
      diagnosisInput: "我的二发不太稳。",
      primaryNextStep: "先建立安全二发节奏"
    });
    const deepContext = {
      mode: "deep" as const,
      sourceInput: "关键分时我的二发容易下网，而且会发紧。",
      sceneSummaryZh: "二发在关键分原地发球时容易下网，而且会发紧。",
      sceneSummaryEn: "On key points my stationary second serve keeps going into the net and it feels tight.",
      skillCategory: "serve" as const,
      skillCategoryConfidence: "high" as const,
      problemTag: "second-serve-reliability",
      level: "3.5",
      strokeFamily: "serve" as const,
      serveSubtype: "second_serve" as const,
      sessionType: "match" as const,
      pressureContext: "key_points" as const,
      movement: "stationary" as const,
      outcome: "net" as const,
      incomingBallDepth: "unknown" as const,
      subjectiveFeeling: "tight" as const,
      unresolvedRequiredSlots: [],
      stoppedByCap: false,
      isDeepModeReady: true
    };
    const href = buildPlanHref({
      problemTag: "second-serve-reliability",
      level: "3.5",
      sourceType: "diagnosis",
      primaryNextStep: "先建立安全二发节奏",
      planContext: shallowPlanContext,
      deepContext
    });
    const parsedFromHref = parsePlanContext(new URL(href, "http://localhost").searchParams.get("planContext"));
    const normalizedDraft = normalizePlanDraftSnapshot({
      problemTag: "second-serve-reliability",
      level: "3.5",
      sourceType: "diagnosis",
      primaryNextStep: "先建立安全二发节奏",
      planContext: shallowPlanContext,
      deepContext
    });

    const plan = getPlanTemplate("second-serve-reliability", "3.5", "zh", [], {
      primaryNextStep: "先建立安全二发节奏",
      planContext: shallowPlanContext,
      deepContext
    });

    expect(plan.summary).toContain("关键分场景");
    expect(plan.summary).toContain("先建立安全二发节奏");
    expect(plan.summary).toContain("发紧");
    expect(parsedFromHref).toMatchObject({
      pressureContext: "high",
      movementContext: "stationary",
      outcomePattern: "net",
      feelingModifiers: ["tight"]
    });
    expect(normalizedDraft?.planContext).toMatchObject({
      pressureContext: "high",
      movementContext: "stationary",
      outcomePattern: "net",
      feelingModifiers: ["tight"]
    });
  });
});
