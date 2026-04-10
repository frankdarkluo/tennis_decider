import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLocalMediation = vi.hoisted(() => vi.fn());

vi.mock("@/lib/scenarioReconstruction/llm/client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/scenarioReconstruction/llm/client")>(
    "@/lib/scenarioReconstruction/llm/client"
  );

  return {
    ...actual,
    createLocalQwenClient: () => ({
      extractTennisScene: vi.fn(),
      mediateDiagnoseComplaint: mockLocalMediation,
      parseScenario: vi.fn(),
      rankQuestions: vi.fn()
    })
  };
});

import { mediateDiagnoseComplaint } from "@/lib/intake/diagnoseMediation/mediate";

describe("diagnose mediation module", () => {
  beforeEach(() => {
    mockLocalMediation.mockReset();
  });

  it("skips mediation without calling the model when the gate is clear enough", async () => {
    const runModel = vi.fn();

    const result = await mediateDiagnoseComplaint({
      complaint: "反手总下网",
      locale: "zh",
      gateDecision: {
        shouldMediate: false,
        reason: "clear_enough",
        lockedCategory: "groundstroke_set"
      },
      runModel
    });

    expect(result).toEqual({
      mode: "skip",
      reason: "clear_enough",
      displayText: null,
      normalizedComplaint: null,
      clarificationQuestion: null
    });
    expect(runModel).not.toHaveBeenCalled();
  });

  it("returns a validated paraphrase and keeps the locked category stable", async () => {
    const runModel = vi.fn(async () => ({
      mode: "paraphrase",
      reason: "ambiguous",
      displayText: "Did you mean your serve toss gets messy when the point gets tight? 发球一紧就乱",
      normalizedComplaint: "serve toss gets messy when the point gets tight",
      clarificationQuestion: null
    }));

    const result = await mediateDiagnoseComplaint({
      complaint: "发球一紧就乱",
      locale: "zh",
      gateDecision: {
        shouldMediate: true,
        reason: "transcript_noise",
        lockedCategory: "serve"
      },
      runModel
    });

    expect(result).toEqual({
      mode: "paraphrase",
      reason: "ambiguous",
      displayText: "Did you mean your serve toss gets messy when the point gets tight? 发球一紧就乱",
      normalizedComplaint: "serve toss gets messy when the point gets tight",
      clarificationQuestion: null
    });
    expect(runModel).toHaveBeenCalledTimes(1);
  });

  it("uses the local-model boundary by default when no custom runner is provided", async () => {
    mockLocalMediation.mockResolvedValueOnce({
      mode: "clarify",
      reason: "too_vague",
      displayText: null,
      normalizedComplaint: null,
      clarificationQuestion: "更像是哪一拍出了问题？"
    });

    const result = await mediateDiagnoseComplaint({
      complaint: "我打球感觉不太对",
      locale: "zh",
      gateDecision: {
        shouldMediate: true,
        reason: "too_vague",
        lockedCategory: null
      }
    });

    expect(result).toEqual({
      mode: "clarify",
      reason: "too_vague",
      displayText: null,
      normalizedComplaint: null,
      clarificationQuestion: "更像是哪一拍出了问题？"
    });
    expect(mockLocalMediation).toHaveBeenCalledWith("我打球感觉不太对", "zh", null);
  });

  it("falls back when the model drifts out of the locked category", async () => {
    const runModel = vi.fn(async () => ({
      mode: "paraphrase",
      reason: "ambiguous",
      displayText: "Did you mean your forehand is late?",
      normalizedComplaint: "forehand timing is late",
      clarificationQuestion: null
    }));

    const result = await mediateDiagnoseComplaint({
      complaint: "发球一紧就乱",
      locale: "zh",
      gateDecision: {
        shouldMediate: true,
        reason: "transcript_noise",
        lockedCategory: "serve"
      },
      runModel
    });

    expect(result).toEqual({
      mode: "fallback",
      reason: "low_confidence",
      displayText: null,
      normalizedComplaint: null,
      clarificationQuestion: null
    });
  });

  it("falls back cleanly when the model is unavailable or returns invalid output", async () => {
    mockLocalMediation.mockRejectedValueOnce(new Error("offline"));

    const unavailable = await mediateDiagnoseComplaint({
      complaint: "我打球感觉不太对",
      locale: "zh",
      gateDecision: {
        shouldMediate: true,
        reason: "too_vague",
        lockedCategory: null
      }
    });

    expect(unavailable).toEqual({
      mode: "fallback",
      reason: "model_unavailable",
      displayText: null,
      normalizedComplaint: null,
      clarificationQuestion: null
    });

    const invalid = await mediateDiagnoseComplaint({
      complaint: "我打球感觉不太对",
      locale: "zh",
      gateDecision: {
        shouldMediate: true,
        reason: "too_vague",
        lockedCategory: null
      },
      runModel: async () => ({
        mode: "clarify",
        reason: "too_vague",
        displayText: null,
        normalizedComplaint: null,
        clarificationQuestion: "你是说什么问题？你想问什么？"
      })
    });

    expect(invalid).toEqual({
      mode: "fallback",
      reason: "low_confidence",
      displayText: null,
      normalizedComplaint: null,
      clarificationQuestion: null
    });
  });

  it("reports validator rejection and fallback reasons through the observer", async () => {
    const observe = vi.fn();

    await mediateDiagnoseComplaint({
      complaint: "我打球感觉不太对",
      locale: "zh",
      gateDecision: {
        shouldMediate: true,
        reason: "too_vague",
        lockedCategory: null
      },
      observe,
      runModel: async () => ({
        mode: "clarify",
        reason: "too_vague",
        displayText: null,
        normalizedComplaint: null,
        clarificationQuestion: "你是说什么问题？你想问什么？"
      })
    });

    expect(observe).toHaveBeenNthCalledWith(1, {
      type: "validator_rejected",
      rejectionReason: "contains_multiple_questions"
    });
    expect(observe).toHaveBeenNthCalledWith(2, {
      type: "fallback",
      reason: "low_confidence"
    });
  });
});
