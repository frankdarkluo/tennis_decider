import { describe, expect, it } from "vitest";
import { validateDiagnoseMediationResult } from "@/lib/intake/diagnoseMediation/validate";

describe("diagnose mediation validator", () => {
  it("accepts bounded skip, paraphrase, clarify, and fallback shapes", () => {
    expect(
      validateDiagnoseMediationResult({
        mode: "skip",
        reason: "clear_enough",
        displayText: null,
        normalizedComplaint: null,
        clarificationQuestion: null
      })
    ).toEqual({
      ok: true,
      value: {
        mode: "skip",
        reason: "clear_enough",
        displayText: null,
        normalizedComplaint: null,
        clarificationQuestion: null
      }
    });

    expect(
      validateDiagnoseMediationResult({
        mode: "paraphrase",
        reason: "ambiguous",
        displayText: "Did you mean your serve toss is too low?",
        normalizedComplaint: "serve toss is too low",
        clarificationQuestion: null
      })
    ).toEqual({
      ok: true,
      value: {
        mode: "paraphrase",
        reason: "ambiguous",
        displayText: "Did you mean your serve toss is too low?",
        normalizedComplaint: "serve toss is too low",
        clarificationQuestion: null
      }
    });

    expect(
      validateDiagnoseMediationResult({
        mode: "clarify",
        reason: "too_vague",
        displayText: null,
        normalizedComplaint: null,
        clarificationQuestion: "Do you mean this happens more in practice or in matches?"
      })
    ).toEqual({
      ok: true,
      value: {
        mode: "clarify",
        reason: "too_vague",
        displayText: null,
        normalizedComplaint: null,
        clarificationQuestion: "Do you mean this happens more in practice or in matches?"
      }
    });

    expect(
      validateDiagnoseMediationResult({
        mode: "fallback",
        reason: "model_unavailable",
        displayText: null,
        normalizedComplaint: null,
        clarificationQuestion: null
      })
    ).toEqual({
      ok: true,
      value: {
        mode: "fallback",
        reason: "model_unavailable",
        displayText: null,
        normalizedComplaint: null,
        clarificationQuestion: null
      }
    });
  });

  it("rejects diagnosis conclusions, advice, and plan-like text", () => {
    expect(
      validateDiagnoseMediationResult({
        mode: "paraphrase",
        reason: "ambiguous",
        displayText: "The problem is your forehand timing is late.",
        normalizedComplaint: "forehand timing is late",
        clarificationQuestion: null
      })
    ).toEqual({
      ok: false,
      rejectionReason: "contains_diagnosis_or_plan"
    });

    expect(
      validateDiagnoseMediationResult({
        mode: "paraphrase",
        reason: "ambiguous",
        displayText: "Did you mean your serve needs a drill plan?",
        normalizedComplaint: "serve needs a drill plan",
        clarificationQuestion: null
      })
    ).toEqual({
      ok: false,
      rejectionReason: "contains_advice_or_chatty_text"
    });
  });

  it("rejects markdown, multiple questions, and overlong output", () => {
    expect(
      validateDiagnoseMediationResult({
        mode: "paraphrase",
        reason: "transcript_noise",
        displayText: "Did you mean your serve toss is off?\n- then work on it",
        normalizedComplaint: "serve toss is off",
        clarificationQuestion: null
      })
    ).toEqual({
      ok: false,
      rejectionReason: "contains_advice_or_chatty_text"
    });

    expect(
      validateDiagnoseMediationResult({
        mode: "clarify",
        reason: "too_vague",
        displayText: null,
        normalizedComplaint: null,
        clarificationQuestion: "Is this on serve? Is it on forehand?"
      })
    ).toEqual({
      ok: false,
      rejectionReason: "contains_multiple_questions"
    });

    expect(
      validateDiagnoseMediationResult({
        mode: "paraphrase",
        reason: "ambiguous",
        displayText: "x".repeat(181),
        normalizedComplaint: "x".repeat(181),
        clarificationQuestion: null
      })
    ).toEqual({
      ok: false,
      rejectionReason: "empty_or_overlong"
    });
  });
});
