import { describe, expect, it } from "vitest";
import { shouldMediateDiagnoseComplaint } from "@/lib/intake/diagnoseMediation/gate";

describe("diagnose mediation gate", () => {
  it("skips mediation for clear complaints and preserves stable category when available", () => {
    expect(shouldMediateDiagnoseComplaint("反手总下网", "zh")).toEqual({
      shouldMediate: false,
      reason: "clear_enough",
      lockedCategory: "groundstroke_set"
    });

    expect(shouldMediateDiagnoseComplaint("发球没信心", "zh")).toEqual({
      shouldMediate: false,
      reason: "clear_enough",
      lockedCategory: "serve"
    });

    expect(shouldMediateDiagnoseComplaint("比赛里我截击老下网", "zh")).toEqual({
      shouldMediate: false,
      reason: "clear_enough",
      lockedCategory: "volley"
    });

    expect(shouldMediateDiagnoseComplaint("My overhead keeps going long", "en")).toEqual({
      shouldMediate: false,
      reason: "clear_enough",
      lockedCategory: "overhead"
    });
  });

  it("routes vague and transcript-like complaints into mediation", () => {
    expect(shouldMediateDiagnoseComplaint("我打球感觉不太对", "zh")).toEqual({
      shouldMediate: true,
      reason: "too_vague",
      lockedCategory: null
    });

    expect(shouldMediateDiagnoseComplaint("总赢不了", "zh")).toEqual({
      shouldMediate: true,
      reason: "too_vague",
      lockedCategory: null
    });

    expect(shouldMediateDiagnoseComplaint("就是那个发球吧然后我一紧就不太受控一直发坏", "zh")).toEqual({
      shouldMediate: true,
      reason: "transcript_noise",
      lockedCategory: "serve"
    });
  });
});
