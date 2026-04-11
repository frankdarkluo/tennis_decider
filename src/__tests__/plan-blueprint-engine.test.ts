import { describe, expect, it } from "vitest";
import { assemblePlanFromIntent } from "@/lib/plan-core/assemble";
import { buildPlanIntent } from "@/lib/plan-core/intent";
import { buildAssessmentPlanContext, getPlanFromAssessment, getPlanTemplate } from "@/lib/plans";
import type { PlayerProfileVector } from "@/types/assessment";
import type { PlanIntent } from "@/types/plan";

function createProfileVector(overrides: Partial<PlayerProfileVector> = {}): PlayerProfileVector {
  return {
    rawScore: 26,
    levelBand: "3.5",
    dimensionScores: {
      rally: 3,
      forehand: 3,
      backhand_slice: 3,
      serve: 1,
      return: 2,
      movement: 2,
      net: 3,
      overhead: 3,
      pressure: 3,
      tactics: 2
    },
    weakDimensions: ["serve", "movement", "return"],
    strongDimensions: ["rally", "forehand"],
    primaryWeakness: "serve",
    secondaryWeakness: "movement",
    playStyle: "baseline_attack",
    playContext: "singles_standard",
    summary: {
      headline: "当前最值得优先补强的是发球",
      oneLineLevelSummary: "你目前大致在 3.5 区间。",
      oneLinePlanHint: "后续训练计划应先围绕发球展开。"
    },
    ...overrides
  };
}

describe("plan blueprint engine", () => {
  it("builds a structured PlanIntent from assessment profile and diagnosis context", () => {
    const assessmentContext = buildAssessmentPlanContext(createProfileVector());

    const intent = buildPlanIntent({
      source: "assessment",
      problemTag: assessmentContext.problemTag,
      level: "3.5",
      locale: "zh",
      candidateContentIds: assessmentContext.candidateIds,
      planContext: assessmentContext.planContext
    });

    expect(intent).toMatchObject<Partial<PlanIntent>>({
      source: "assessment",
      levelBand: "3.5",
      primaryProblemTag: "second-serve-reliability",
      primaryWeakness: "serve",
      secondaryWeakness: "movement",
      playStyle: "baseline_attack",
      playContext: "singles_standard"
    });
    expect(intent.skillFamily).toBe("serve");
    expect(intent.mechanismFamily).toBeTruthy();
    expect(intent.microcycle.length).toBe(7);
  });

  it("assembles explicit daily execution contracts instead of same-template renamed plans", () => {
    const baselineAttackIntent = buildPlanIntent({
      source: "assessment",
      problemTag: "second-serve-reliability",
      level: "3.5",
      locale: "en",
      candidateContentIds: ["content_gaiao_02"],
      planContext: buildAssessmentPlanContext(createProfileVector()).planContext
    });
    const doublesIntent = buildPlanIntent({
      source: "assessment",
      problemTag: "second-serve-reliability",
      level: "4.0+",
      locale: "en",
      candidateContentIds: ["content_gaiao_02"],
      planContext: buildAssessmentPlanContext(createProfileVector({
        levelBand: "4.0+",
        playStyle: "net_pressure",
        playContext: "doubles_primary",
        secondaryWeakness: "return"
      })).planContext
    });

    const singlesPlan = assemblePlanFromIntent(baselineAttackIntent);
    const doublesPlan = assemblePlanFromIntent(doublesIntent);

    expect(singlesPlan.days[0]).toMatchObject({
      goal: expect.any(String),
      drill: expect.any(String),
      load: expect.any(String),
      executionFocus: expect.any(String),
      successCriteria: expect.any(Array)
    });
    expect(singlesPlan.days[0]?.load).not.toBe(doublesPlan.days[0]?.load);
    expect(singlesPlan.days[5]?.goal).not.toBe(doublesPlan.days[5]?.goal);
    expect(doublesPlan.days[5]?.goal ?? "").toMatch(/doubles|双打/i);
    expect(doublesPlan.days[0]?.linkedContentReason).toBeTruthy();
  });

  it("keeps compatibility facades working through the blueprint engine", () => {
    const assessmentPlan = getPlanFromAssessment({
      level: "3.5",
      weakDimensions: ["serve", "movement"],
      observationDimensions: ["return"],
      locale: "zh"
    });
    const diagnosisPlan = getPlanTemplate("return-under-pressure", "4.0", "en", [], {
      primaryNextStep: "Split early and block the first ball back through the middle."
    });

    expect(assessmentPlan.days[0]).toMatchObject({
      drill: expect.any(String),
      load: expect.any(String),
      executionFocus: expect.any(String)
    });
    expect(diagnosisPlan.days[0]).toMatchObject({
      drill: expect.any(String),
      load: expect.any(String),
      executionFocus: expect.any(String)
    });
    expect(diagnosisPlan.days).toHaveLength(7);
  });
});
