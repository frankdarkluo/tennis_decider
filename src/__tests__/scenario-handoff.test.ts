import { describe, expect, it } from "vitest";
import { diagnoseProblem } from "@/lib/diagnosis";
import { toDiagnosisInput } from "@/lib/scenarioReconstruction/toDiagnosisInput";
import type { ScenarioState } from "@/types/scenario";

function buildScenario(overrides: Partial<ScenarioState> = {}): ScenarioState {
  return {
    raw_user_input: "比赛中我遇到关键分的情况下，在发球时容易紧张，然后一发发不进，二发容易失误",
    language: "zh",
    stroke: "serve",
    context: {
      session_type: "match",
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
      frequency: "unknown"
    },
    subjective_feeling: {
      tight: true,
      rushed: false,
      awkward: false,
      hesitant: false,
      nervous: true,
      late_contact: false,
      no_timing: false,
      other: []
    },
    user_confidence: "unknown",
    missing_slots: [],
    next_question_candidates: [],
    selected_next_question_id: null,
    ...overrides
  };
}

describe("scenario reconstruction handoff adapter", () => {
  it("builds a stable, diagnosis-friendly Chinese summary from structured state", () => {
    const scenario = buildScenario({
      stroke: "backhand",
      context: {
        session_type: "match",
        pressure: "unknown",
        movement: "moving",
        format: "unknown"
      },
      incoming_ball: {
        depth: "deep",
        height: "unknown",
        pace: "unknown",
        spin: "unknown",
        direction: "unknown"
      },
      outcome: {
        primary_error: "net",
        frequency: "unknown"
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
      }
    });

    expect(toDiagnosisInput({ scenario, locale: "zh" })).toBe("比赛里我跑动中的反手老下网，尤其对手球比较深的时候更明显，而且会发紧。");
    expect(toDiagnosisInput({ scenario, locale: "zh" })).toBe("比赛里我跑动中的反手老下网，尤其对手球比较深的时候更明显，而且会发紧。");
  });

  it("builds a stable, diagnosis-friendly English summary from structured state", () => {
    const scenario = buildScenario({
      raw_user_input: "My backhand keeps going into the net in matches",
      language: "en",
      stroke: "backhand",
      context: {
        session_type: "match",
        pressure: "unknown",
        movement: "moving",
        format: "unknown"
      },
      incoming_ball: {
        depth: "deep",
        height: "unknown",
        pace: "unknown",
        spin: "unknown",
        direction: "unknown"
      },
      outcome: {
        primary_error: "net",
        frequency: "unknown"
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
      }
    });

    expect(toDiagnosisInput({ scenario, locale: "en" })).toBe("In matches my moving backhand keeps going into the net, especially on deeper balls, and it feels tight.");
    expect(toDiagnosisInput({ scenario, locale: "en" })).toBe("In matches my moving backhand keeps going into the net, especially on deeper balls, and it feels tight.");
  });

  it("omits unknown fields instead of hallucinating extra detail", () => {
    const scenario = buildScenario({
      raw_user_input: "我反手不稳",
      stroke: "backhand",
      context: {
        session_type: "unknown",
        pressure: "unknown",
        movement: "unknown",
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
        frequency: "unknown"
      },
      subjective_feeling: {
        tight: false,
        rushed: false,
        awkward: false,
        hesitant: false,
        nervous: false,
        late_contact: false,
        no_timing: false,
        other: []
      }
    });

    expect(toDiagnosisInput({ scenario, locale: "zh" })).toBe("我的反手老下网。");
  });

  it("preserves second-serve semantics in the diagnosis handoff", () => {
    const scenario = buildScenario({
      raw_user_input: "关键分时我的二发容易下网",
      stroke: "serve",
      context: {
        session_type: "match",
        pressure: "high",
        movement: "stationary",
        format: "unknown"
      },
      outcome: {
        primary_error: "net",
        frequency: "unknown"
      },
      subjective_feeling: {
        tight: false,
        rushed: false,
        awkward: false,
        hesitant: false,
        nervous: false,
        late_contact: false,
        no_timing: false,
        other: []
      }
    });

    const handoff = toDiagnosisInput({ scenario, locale: "zh" });
    const diagnosis = diagnoseProblem(handoff, { locale: "zh", environment: "production" });

    expect(handoff).toContain("二发");
    expect(handoff).not.toContain("一发");
    expect(diagnosis.problemTag).toBe("second-serve-reliability");
  });
});
