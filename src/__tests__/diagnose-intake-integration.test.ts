import { describe, expect, it, vi } from "vitest";
import { prepareDiagnoseSubmission } from "@/lib/intake/prepareDiagnoseSubmission";

describe("diagnose intake integration", () => {
  it("uses the intake route result when structured intake succeeds", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      source: "structured_intake",
      diagnosis_input: "比赛里我反手老下网。",
      extraction: {
        skillCategory: "groundstroke",
        strokeFamily: "backhand",
        problemCandidate: "net",
        outcome: "net",
        movement: "unknown",
        pressureContext: "unknown",
        sessionType: "match",
        serveSubtype: "unknown",
        subjectiveFeeling: [],
        incomingBallDepth: "unknown",
        missingSlots: ["context.movement"],
        confidence: "high",
        sourceLanguage: "zh",
        rawSummary: null
      },
      scenario: {
        raw_user_input: "比赛里我反手老下网",
        language: "zh",
        stroke: "backhand"
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }));

    const prepared = await prepareDiagnoseSubmission({
      text: "比赛里我反手老下网",
      locale: "zh",
      fetchImpl
    });

    expect(prepared.source).toBe("structured_intake");
    expect(prepared.diagnosisInput).toBe("比赛里我反手老下网。");
  });

  it("falls back to raw text when the intake route fails", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("offline");
    });

    const prepared = await prepareDiagnoseSubmission({
      text: "At break point my forehand flies long",
      locale: "en",
      fetchImpl
    });

    expect(prepared.source).toBe("request_failed");
    expect(prepared.diagnosisInput).toBe("At break point my forehand flies long");
    expect(prepared.scenario).toBeNull();
  });
});
