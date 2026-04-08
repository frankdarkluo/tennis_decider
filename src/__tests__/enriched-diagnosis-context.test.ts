import { describe, expect, it } from "vitest";
import type { ScenarioState } from "@/types/scenario";
import { buildEnrichedDiagnosisContext, normalizeEnrichedDiagnosisContext } from "@/lib/diagnose/enrichedContext";

function buildServeScenario(rawUserInput: string): ScenarioState {
  return {
    raw_user_input: rawUserInput,
    language: "zh",
    stroke: "serve",
    context: {
      session_type: "match",
      serve_variant: "second_serve",
      pressure: "high",
      movement: "stationary",
      format: "unknown"
    },
    incoming_ball: {
      depth: "unknown",
      height: "unknown",
      pace: "unknown",
      spin: "unknown",
      direction: "unknown"
    },
    outcome: {
      primary_error: "net",
      frequency: "often"
    },
    subjective_feeling: {
      tight: true,
      rushed: false,
      awkward: false,
      hesitant: false,
      nervous: false,
      late_contact: false,
      no_timing: false,
      other: []
    },
    user_confidence: "medium",
    missing_slots: ["incoming_ball.depth"],
    next_question_candidates: [],
    selected_next_question_id: null,
    asked_followup_ids: []
  };
}

describe("enriched diagnosis context", () => {
  it("builds a deterministic deep context from a serve-family scenario", () => {
    const context = buildEnrichedDiagnosisContext({
      mode: "deep",
      sourceInput: "关键分时我的二发容易下网",
      scenario: buildServeScenario("关键分时我的二发容易下网"),
      problemTag: "second-serve-reliability",
      level: "3.5"
    });

    expect(context).toMatchObject({
      mode: "deep",
      sourceInput: "关键分时我的二发容易下网",
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
      isDeepModeReady: true
    });
    expect(context.sceneSummaryZh).toContain("二发");
    expect(context.sceneSummaryEn.toLowerCase()).toContain("second serve");
  });

  it("normalizes sparse contexts without inventing missing details", () => {
    const context = normalizeEnrichedDiagnosisContext({
      mode: "deep",
      sourceInput: "我的发球有问题",
      sceneSummaryZh: "我的发球有问题。",
      sceneSummaryEn: "My serve has a problem.",
      problemTag: "first-serve-in",
      strokeFamily: "serve"
    });

    expect(context).toMatchObject({
      mode: "deep",
      sourceInput: "我的发球有问题",
      problemTag: "first-serve-in",
      strokeFamily: "serve",
      isDeepModeReady: false
    });
    expect(context?.serveSubtype).toBeUndefined();
    expect(context?.pressureContext).toBeUndefined();
  });
});
