import { describe, expect, it } from "vitest";
import { normalizeToScenario, shouldUseStructuredDiagnosisInput } from "@/lib/intake/normalizeToScenario";
import { toDiagnosisInput } from "@/lib/scenarioReconstruction/toDiagnosisInput";

describe("intake normalization", () => {
  it("maps extracted scene slots into scenario reconstruction state", () => {
    const scenario = normalizeToScenario({
      rawInput: "At break point my second serve double faults and I get tight",
      extraction: {
        skillCategory: "serve",
        strokeFamily: "serve",
        problemCandidate: "no_control",
        outcome: "no_control",
        movement: "unknown",
        pressureContext: "high",
        sessionType: "match",
        serveSubtype: "second_serve",
        subjectiveFeeling: ["tight"],
        incomingBallDepth: "unknown",
        missingSlots: ["serve.mechanism_family"],
        confidence: "high",
        sourceLanguage: "en",
        rawSummary: "second serve double faults under pressure"
      }
    });

    expect(scenario.language).toBe("en");
    expect(scenario.stroke).toBe("serve");
    expect(scenario.context.session_type).toBe("match");
    expect(scenario.context.pressure).toBe("high");
    expect(scenario.context.serve_variant).toBe("second_serve");
    expect(scenario.outcome.primary_error).toBe("no_control");
    expect(scenario.subjective_feeling.tight).toBe(true);
    expect(toDiagnosisInput({ scenario, locale: "en" })).toContain("second serve double-faults");
  });

  it("marks weak extractions as not safe for structured diagnosis text", () => {
    const scenario = normalizeToScenario({
      rawInput: "Something feels off",
      extraction: {
        skillCategory: "unknown",
        strokeFamily: "unknown",
        problemCandidate: "unknown",
        outcome: "unknown",
        movement: "unknown",
        pressureContext: "unknown",
        sessionType: "unknown",
        serveSubtype: "unknown",
        subjectiveFeeling: [],
        incomingBallDepth: "unknown",
        missingSlots: ["stroke", "context.session_type", "outcome.primary_error"],
        confidence: "low",
        sourceLanguage: "en",
        rawSummary: null
      }
    });

    expect(shouldUseStructuredDiagnosisInput({
      scenario,
      extractionConfidence: "low"
    })).toBe(false);
  });
});
