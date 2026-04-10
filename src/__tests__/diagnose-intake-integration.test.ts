import { describe, expect, it, vi } from "vitest";
import { prepareDiagnoseSubmission } from "@/lib/intake/prepareDiagnoseSubmission";

describe("diagnose intake integration", () => {
  it("skips mediation for clear complaints and keeps the intake route contract stable", async () => {
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
    const mediateImpl = vi.fn();

    const prepared = await prepareDiagnoseSubmission({
      text: "比赛里我反手老下网",
      locale: "zh",
      fetchImpl,
      mediateImpl: mediateImpl as never
    });

    expect(prepared.source).toBe("structured_intake");
    expect(prepared.diagnosisInput).toBe("比赛里我反手老下网。");
    expect(prepared.mediationMode).toBe("skip");
    expect(prepared.mediationDisplayText).toBeNull();
    expect(prepared.mediationQuestion).toBeNull();
    expect(mediateImpl).not.toHaveBeenCalled();
  });

  it("returns one inline clarification question without triggering diagnosis", async () => {
    const fetchImpl = vi.fn();
    const observeMediation = vi.fn();
    const mediateImpl = vi.fn(async () => ({
      mode: "clarify",
      reason: "too_vague",
      displayText: null,
      normalizedComplaint: null,
      clarificationQuestion: "更像是哪一拍出了问题？"
    }));

    const prepared = await prepareDiagnoseSubmission({
      text: "我打球感觉不太对",
      locale: "zh",
      fetchImpl,
      mediateImpl: mediateImpl as never,
      observeMediation
    });

    expect(prepared.source).toBe("deterministic_fallback");
    expect(prepared.decision).toBe("raw_text_fallback");
    expect(prepared.diagnosisInput).toBe("我打球感觉不太对");
    expect(prepared.mediationMode).toBe("clarify");
    expect(prepared.mediationQuestion).toBe("更像是哪一拍出了问题？");
    expect(prepared.clarificationUsed).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(mediateImpl).toHaveBeenCalledTimes(1);
    expect(observeMediation).toHaveBeenNthCalledWith(1, {
      type: "gate",
      shouldMediate: true,
      reason: "too_vague",
      lockedCategory: null,
      clarificationUsed: false
    });
    expect(observeMediation).toHaveBeenNthCalledWith(2, {
      type: "mode",
      mode: "clarify",
      reason: "too_vague",
      clarificationUsed: false
    });
  });

  it("skips mediation by contract on a clarification rerun", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      source: "structured_intake",
      decision: "direct_result",
      diagnosis_input: "比赛里我反手老下网 手腕有点紧",
      extraction: null,
      scenario: {
        raw_user_input: "比赛里我反手老下网 手腕有点紧",
        language: "zh",
        stroke: "backhand"
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }));
    const mediateImpl = vi.fn();

    const prepared = await prepareDiagnoseSubmission({
      text: "比赛里我反手老下网 手腕有点紧",
      locale: "zh",
      clarificationUsed: true,
      fetchImpl,
      mediateImpl: mediateImpl as never
    });

    expect(prepared.source).toBe("structured_intake");
    expect(prepared.mediationMode).toBe("skip");
    expect(prepared.clarificationUsed).toBe(true);
    expect(prepared.diagnosisInput).toBe("比赛里我反手老下网 手腕有点紧");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(mediateImpl).not.toHaveBeenCalled();
  });

  it("uses normalized complaint text for paraphrase mediation and falls back cleanly when mediation does not help", async () => {
    const fetchCalls: string[] = [];
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      const requestBody = JSON.parse(String(init?.body)) as { text?: string; ui_language?: string };
      fetchCalls.push(String(init?.body));
      return new Response(JSON.stringify({
        source: "structured_intake",
        diagnosis_input: requestBody.text ?? "",
        extraction: {
          skillCategory: "serve",
          strokeFamily: "serve",
          problemCandidate: "unknown",
          outcome: "unknown",
          movement: "unknown",
          pressureContext: "unknown",
          sessionType: "practice",
          serveSubtype: "unknown",
          subjectiveFeeling: [],
          incomingBallDepth: "unknown",
          missingSlots: [],
          confidence: "medium",
          sourceLanguage: "zh",
          rawSummary: null
        },
        scenario: {
          raw_user_input: "发球一紧就不太受控",
          language: "zh",
          stroke: "serve"
        }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    });
    const mediateImpl = vi.fn(async () => ({
      mode: "paraphrase",
      reason: "transcript_noise",
      displayText: "Did you mean your serve gets unreliable when you tighten up?",
      normalizedComplaint: "发球一紧就有点卡",
      clarificationQuestion: null
    }));

    const paraphrasePrepared = await prepareDiagnoseSubmission({
      text: "就是那个发球吧然后我一紧就有点卡",
      locale: "zh",
      fetchImpl,
      mediateImpl: mediateImpl as never
    });

    expect(JSON.parse(fetchCalls[0])).toMatchObject({
      text: "发球一紧就有点卡",
      ui_language: "zh"
    });
    expect(paraphrasePrepared.mediationMode).toBe("paraphrase");
    expect(paraphrasePrepared.mediationDisplayText).toBe("Did you mean your serve gets unreliable when you tighten up?");
    expect(paraphrasePrepared.diagnosisInput).toBe("发球一紧就有点卡");

    fetchCalls.length = 0;
    const fallbackPrepared = await prepareDiagnoseSubmission({
      text: "总赢不了",
      locale: "zh",
      fetchImpl,
      mediateImpl: vi.fn(async () => ({
        mode: "fallback",
        reason: "low_confidence",
        displayText: null,
        normalizedComplaint: null,
        clarificationQuestion: null
      })) as never
    });

    expect(fallbackPrepared.mediationMode).toBe("fallback");
    expect(fallbackPrepared.source).toBe("structured_intake");
    expect(fallbackPrepared.diagnosisInput).toBe("总赢不了");
    expect(JSON.parse(fetchCalls[0])).toMatchObject({
      text: "总赢不了",
      ui_language: "zh"
    });
  });

  it("reports validator rejection and fallback telemetry without changing the intake fallback path", async () => {
    const observeMediation = vi.fn();
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      const requestBody = JSON.parse(String(init?.body)) as { text?: string };
      return new Response(JSON.stringify({
        source: "deterministic_fallback",
        decision: "raw_text_fallback",
        diagnosis_input: requestBody.text ?? ""
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    });

    const prepared = await prepareDiagnoseSubmission({
      text: "总赢不了",
      locale: "zh",
      fetchImpl,
      observeMediation,
      mediateImpl: vi.fn(async ({ observe }) => {
        observe?.({
          type: "validator_rejected",
          rejectionReason: "invalid_shape"
        });
        observe?.({
          type: "fallback",
          reason: "low_confidence"
        });

        return {
          mode: "fallback",
          reason: "low_confidence",
          displayText: null,
          normalizedComplaint: null,
          clarificationQuestion: null
        };
      }) as never
    });

    expect(prepared.mediationMode).toBe("fallback");
    expect(prepared.diagnosisInput).toBe("总赢不了");
    expect(observeMediation).toHaveBeenNthCalledWith(1, {
      type: "gate",
      shouldMediate: true,
      reason: "too_vague",
      lockedCategory: null,
      clarificationUsed: false
    });
    expect(observeMediation).toHaveBeenNthCalledWith(2, {
      type: "validator_rejected",
      rejectionReason: "invalid_shape"
    });
    expect(observeMediation).toHaveBeenNthCalledWith(3, {
      type: "fallback",
      reason: "low_confidence"
    });
    expect(observeMediation).toHaveBeenNthCalledWith(4, {
      type: "mode",
      mode: "fallback",
      reason: "low_confidence",
      clarificationUsed: false
    });
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
    expect(prepared.mediationMode).toBe("skip");
  });
});
