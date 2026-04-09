import { describe, expect, it } from "vitest";
import { sanitizeTennisSceneExtraction } from "@/lib/intake/schema";

describe("intake schema", () => {
  it("normalizes partial extraction payloads into the strict contract", () => {
    const extraction = sanitizeTennisSceneExtraction({
      strokeFamily: "backhand",
      outcome: "net",
      subjectiveFeeling: ["tight", "bad_flag"],
      missingSlots: ["context.movement", "not_a_slot"],
      confidence: "medium"
    });

    expect(extraction).toEqual({
      skillCategory: "unknown",
      strokeFamily: "backhand",
      problemCandidate: "unknown",
      outcome: "net",
      movement: "unknown",
      pressureContext: "unknown",
      sessionType: "unknown",
      serveSubtype: "unknown",
      subjectiveFeeling: ["tight"],
      incomingBallDepth: "unknown",
      missingSlots: ["context.movement"],
      confidence: "medium",
      sourceLanguage: "mixed",
      rawSummary: null
    });
  });

  it("returns null for non-object payloads", () => {
    expect(sanitizeTennisSceneExtraction(null)).toBeNull();
    expect(sanitizeTennisSceneExtraction("bad")).toBeNull();
  });
});
