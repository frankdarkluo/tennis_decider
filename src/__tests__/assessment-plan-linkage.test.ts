import { describe, expect, it } from "vitest";
import {
  buildAssessmentPlanContext,
  buildPlanHref,
  getPlanTemplate,
  normalizePlanDraftSnapshot,
  parsePlanContext
} from "@/lib/plans";
import type { PlayerProfileVector } from "@/types/assessment";

function createPlayerProfileVector(): PlayerProfileVector {
  return {
    rawScore: 26,
    levelBand: "3.5",
    dimensionScores: {
      rally: 3,
      forehand: 3,
      backhand_slice: 3,
      serve: 1,
      return: 3,
      movement: 2,
      net: 3,
      overhead: 3,
      pressure: 3,
      tactics: 2
    },
    weakDimensions: ["serve", "movement", "tactics"],
    strongDimensions: ["rally", "forehand"],
    primaryWeakness: "serve",
    secondaryWeakness: "movement",
    playStyle: "baseline_attack",
    playContext: "singles_standard",
    summary: {
      headline: "当前最值得优先补强的是发球",
      oneLineLevelSummary: "你目前大致在 3.5 区间。",
      oneLinePlanHint: "后续训练计划应先围绕发球展开。"
    }
  };
}

describe("assessment to plan linkage", () => {
  it("passes profile-vector assessment inputs into plan generation", () => {
    const context = buildAssessmentPlanContext(createPlayerProfileVector());
    const plan = getPlanTemplate(context.problemTag, "3.5", "zh", context.candidateIds, {
      planContext: context.planContext
    });

    expect(context.planContext).toMatchObject({
      source: "assessment",
      primaryProblemTag: "second-serve-reliability",
      weakDimensions: ["serve", "movement"],
      observationDimensions: ["tactics"],
      playStyle: "baseline_attack",
      playContext: "singles_standard",
      levelBand: "3.5"
    });
    expect(context.planContext.rationale).toContain("serve");
    expect(plan.summary ?? "").toContain("发球");
    expect(plan.summary ?? "").toContain("跑动");
  });

  it("keeps the player profile vector intact through href and draft handoff", () => {
    const context = buildAssessmentPlanContext(createPlayerProfileVector());
    const href = buildPlanHref({
      problemTag: context.problemTag,
      level: "3.5",
      preferredContentIds: context.candidateIds,
      sourceType: "assessment",
      planContext: context.planContext
    });

    const params = new URL(href, "http://localhost").searchParams;
    const roundTripped = parsePlanContext(params.get("planContext"));
    const normalizedDraft = normalizePlanDraftSnapshot({
      problemTag: context.problemTag,
      level: "3.5",
      preferredContentIds: context.candidateIds,
      sourceType: "assessment",
      planContext: context.planContext
    });

    expect(roundTripped).toMatchObject({
      source: "assessment",
      weakDimensions: ["serve", "movement"],
      observationDimensions: ["tactics"],
      playStyle: "baseline_attack",
      playContext: "singles_standard"
    });
    expect(normalizedDraft?.planContext).toMatchObject({
      source: "assessment",
      weakDimensions: ["serve", "movement"],
      observationDimensions: ["tactics"],
      playStyle: "baseline_attack",
      playContext: "singles_standard"
    });
  });
});
