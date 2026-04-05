import { describe, expect, it } from "vitest";
import { calculateAssessmentResult, determineBranch } from "@/lib/assessment";

describe("assessment engine", () => {
  it("uses reachable branch C thresholds in the expanded coarse ladder", () => {
    expect(determineBranch(8)).toBe("A");
    expect(determineBranch(9)).toBe("B");
    expect(determineBranch(14)).toBe("B");
    expect(determineBranch(15)).toBe("C");
  });

  it("produces 4.5 for a strong branch C fine score", () => {
    const result = calculateAssessmentResult({
      coarse_rally: 4,
      coarse_serve: 4,
      coarse_awareness: 4,
      coarse_movement: 4,
      coarse_pressure: 3,
      fine_c_net: 3,
      fine_c_depth: 4,
      fine_c_forcing: 4,
      fine_c_adaptability: 4
    });

    expect(result.branch).toBe("C");
    expect(result.level).toBe("4.5");
  });

  it("surfaces score-2 dimensions as observation-needed output", () => {
    const result = calculateAssessmentResult({
      coarse_rally: 2,
      coarse_serve: 2,
      coarse_awareness: 2,
      coarse_movement: 2,
      coarse_pressure: 2,
      fine_a_grip: 2,
      fine_a_fast: 2,
      fine_a_issue: 2,
      fine_a_movement: 2
    });

    expect(result.observationNeeded.length).toBeGreaterThan(0);
    expect(result.observationNeeded).toContain("对拉稳定性");
    expect(result.weaknesses.length).toBe(0);
  });
});
