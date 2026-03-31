import { describe, expect, it } from "vitest";
import { diagnosisRegressionCases } from "../data/diagnosisRegressionCases";
import { diagnoseProblem } from "../lib/diagnosis";

describe("diagnosis real-phrase regression", () => {
  it("keeps problemTag, evidence band, and primary next step stable for curated real phrases", () => {
    for (const testCase of diagnosisRegressionCases) {
      const result = diagnoseProblem(testCase.input, { effortMode: "standard" });

      expect(result.problemTag, testCase.id).toBe(testCase.expectedProblemTag);
      expect(testCase.allowedEvidenceLevels, testCase.id).toContain(result.evidenceLevel);
      expect(result.primaryNextStep.trim().length, testCase.id).toBeGreaterThan(0);
    }
  });

  it("covers all designated high-risk categories in the baseline set", () => {
    const riskTags = new Set(diagnosisRegressionCases.map((item) => item.riskTag));

    expect(riskTags.has("key_point")).toBe(true);
    expect(riskTags.has("moonball")).toBe(true);
    expect(riskTags.has("doubles_net")).toBe(true);
    expect(riskTags.has("mobility_age")).toBe(true);
  });
});
