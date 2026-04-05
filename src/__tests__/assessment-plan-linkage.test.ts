import { describe, expect, it } from "vitest";
import {
  buildAssessmentPlanContext,
  buildPlanHref,
  getPlanTemplate,
  normalizePlanDraftSnapshot,
  parsePlanContext
} from "@/lib/plans";
import { AssessmentResult } from "@/types/assessment";

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
      },
      {
        key: "movement",
        label: "移动",
        score: 3,
        maxScore: 4,
        average: 3,
        levelHint: "3.0",
        answeredCount: 2,
        uncertainCount: 0,
        status: "正常"
      }
    ],
    strengths: ["移动"],
    weaknesses: ["发球"],
    observationNeeded: ["比赛意识"],
    summary: "发球最需要优先补强，比赛意识还需要继续观察。"
  };
}

describe("assessment to plan linkage", () => {
  it("passes weak assessment dimensions into plan generation", () => {
    const context = buildAssessmentPlanContext(createAssessmentResult());
    const plan = getPlanTemplate(context.problemTag, "3.0", "zh", context.candidateIds, {
      planContext: context.planContext
    });

    expect(context.planContext).toMatchObject({
      source: "assessment",
      primaryProblemTag: "second-serve-reliability",
      weakDimensions: ["serve"],
      observationDimensions: ["matchplay"]
    });
    expect(context.planContext.rationale).toContain("serve");
    expect(plan.summary ?? "").toContain("发球");
    expect(plan.summary ?? "").toContain("比赛意识");
  });

  it("keeps assessment plan context intact through href and draft handoff", () => {
    const context = buildAssessmentPlanContext(createAssessmentResult());
    const href = buildPlanHref({
      problemTag: context.problemTag,
      level: "3.0",
      preferredContentIds: context.candidateIds,
      sourceType: "assessment",
      planContext: context.planContext
    });

    const params = new URL(href, "http://localhost").searchParams;
    const roundTripped = parsePlanContext(params.get("planContext"));
    const normalizedDraft = normalizePlanDraftSnapshot({
      problemTag: context.problemTag,
      level: "3.0",
      preferredContentIds: context.candidateIds,
      sourceType: "assessment",
      planContext: context.planContext
    });
    const plan = getPlanTemplate(context.problemTag, "3.0", "zh", context.candidateIds, {
      planContext: normalizedDraft?.planContext
    });

    expect(roundTripped).toMatchObject({
      source: "assessment",
      weakDimensions: ["serve"],
      observationDimensions: ["matchplay"]
    });
    expect(normalizedDraft?.planContext).toMatchObject({
      source: "assessment",
      weakDimensions: ["serve"],
      observationDimensions: ["matchplay"]
    });
    expect(normalizedDraft?.planContext?.rationale).toContain("serve");
    expect(plan.summary ?? "").toContain("发球");
  });
});
