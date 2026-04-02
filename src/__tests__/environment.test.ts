import { describe, expect, it } from "vitest";
import {
  filterByEnvironment,
  getPostAssessmentHref,
  resolveAppEnvironment
} from "@/lib/environment";

describe("environment helpers", () => {
  it("defaults untagged records to both environments", () => {
    expect(filterByEnvironment([
      { id: "all" },
      { id: "testing_only", environment: "testing" as const },
      { id: "production_only", environment: ["production"] as const }
    ], "production")).toEqual([
      { id: "all" },
      { id: "production_only", environment: ["production"] }
    ]);
  });

  it("resolves testing when a study session is active", () => {
    expect(resolveAppEnvironment({ studyMode: true, hasSession: true })).toBe("testing");
    expect(resolveAppEnvironment({ studyMode: false, hasSession: false })).toBe("production");
  });

  it("routes post-assessment flow back to home in both environments", () => {
    expect(getPostAssessmentHref("testing")).toBe("/");
    expect(getPostAssessmentHref("production")).toBe("/");
  });
});
