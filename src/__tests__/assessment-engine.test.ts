import { describe, expect, it } from "vitest";
import { scoreAssessment } from "@/lib/assessment/scoring";
import { buildPlayerProfileVector } from "@/lib/assessment/profile";
import type { AssessmentAnswerMap } from "@/types/assessment";

function createAnswers(overrides: Partial<AssessmentAnswerMap> = {}): AssessmentAnswerMap {
  return {
    rally_stability: "rally_3",
    forehand_weapon: "forehand_3",
    backhand_slice_reliability: "backhand_slice_3",
    serve_quality: "serve_3",
    return_quality: "return_3",
    movement_recovery: "movement_3",
    net_transition_volley: "net_3",
    overhead_highball: "overhead_3",
    pressure_matchplay: "pressure_3",
    point_construction: "tactics_3",
    play_style_profile: "baseline_attack",
    play_context_modifier: "singles_standard",
    ...overrides
  };
}

describe("assessment scoring and profile vector", () => {
  it("maps raw score boundaries into the PR8 level bands", () => {
    expect(scoreAssessment(createAnswers({
      rally_stability: "rally_1",
      forehand_weapon: "forehand_1",
      backhand_slice_reliability: "backhand_slice_1",
      serve_quality: "serve_1",
      return_quality: "return_1",
      movement_recovery: "movement_1",
      net_transition_volley: "net_1",
      overhead_highball: "overhead_1",
      pressure_matchplay: "pressure_1",
      point_construction: "tactics_1"
    }))).toMatchObject({ rawScore: 10, levelBand: "2.5" });

    expect(scoreAssessment(createAnswers({
      rally_stability: "rally_4",
      forehand_weapon: "forehand_4",
      backhand_slice_reliability: "backhand_slice_4",
      serve_quality: "serve_4",
      return_quality: "return_4",
      movement_recovery: "movement_4",
      net_transition_volley: "net_4",
      overhead_highball: "overhead_4",
      pressure_matchplay: "pressure_4",
      point_construction: "tactics_4"
    }))).toMatchObject({ rawScore: 40, levelBand: "4.0+" });

    expect(scoreAssessment(createAnswers({
      rally_stability: "rally_2",
      forehand_weapon: "forehand_2",
      backhand_slice_reliability: "backhand_slice_2",
      serve_quality: "serve_2",
      return_quality: "return_2",
      movement_recovery: "movement_1",
      net_transition_volley: "net_1",
      overhead_highball: "overhead_1",
      pressure_matchplay: "pressure_1",
      point_construction: "tactics_1"
    }))).toMatchObject({ rawScore: 15, levelBand: "2.5" });

    expect(scoreAssessment(createAnswers({
      rally_stability: "rally_2",
      forehand_weapon: "forehand_2",
      backhand_slice_reliability: "backhand_slice_2",
      serve_quality: "serve_2",
      return_quality: "return_2",
      movement_recovery: "movement_2",
      net_transition_volley: "net_1",
      overhead_highball: "overhead_1",
      pressure_matchplay: "pressure_1",
      point_construction: "tactics_1"
    }))).toMatchObject({ rawScore: 16, levelBand: "3.0" });

    expect(scoreAssessment(createAnswers({
      rally_stability: "rally_3",
      forehand_weapon: "forehand_3",
      backhand_slice_reliability: "backhand_slice_3",
      serve_quality: "serve_2",
      return_quality: "return_2",
      movement_recovery: "movement_2",
      net_transition_volley: "net_2",
      overhead_highball: "overhead_2",
      pressure_matchplay: "pressure_2",
      point_construction: "tactics_2"
    }))).toMatchObject({ rawScore: 23, levelBand: "3.5" });

    expect(scoreAssessment(createAnswers({
      rally_stability: "rally_3",
      forehand_weapon: "forehand_3",
      backhand_slice_reliability: "backhand_slice_3",
      serve_quality: "serve_3",
      return_quality: "return_3",
      movement_recovery: "movement_3",
      net_transition_volley: "net_3",
      overhead_highball: "overhead_3",
      pressure_matchplay: "pressure_3",
      point_construction: "tactics_3"
    }))).toMatchObject({ rawScore: 30, levelBand: "4.0" });

    expect(scoreAssessment(createAnswers({
      rally_stability: "rally_4",
      forehand_weapon: "forehand_4",
      backhand_slice_reliability: "backhand_slice_4",
      serve_quality: "serve_4",
      return_quality: "return_4",
      movement_recovery: "movement_4",
      net_transition_volley: "net_3",
      overhead_highball: "overhead_3",
      pressure_matchplay: "pressure_3",
      point_construction: "tactics_3"
    }))).toMatchObject({ rawScore: 36, levelBand: "4.0+" });
  });

  it("caps the level band at 3.5 when rally stability is the lowest tier", () => {
    const result = scoreAssessment(createAnswers({
      rally_stability: "rally_1",
      forehand_weapon: "forehand_4",
      backhand_slice_reliability: "backhand_slice_4",
      serve_quality: "serve_4",
      return_quality: "return_4",
      movement_recovery: "movement_4",
      net_transition_volley: "net_4",
      overhead_highball: "overhead_4",
      pressure_matchplay: "pressure_4",
      point_construction: "tactics_3"
    }));

    expect(result.rawScore).toBe(36);
    expect(result.levelBand).toBe("3.5");
    expect(result.dimensionScores.rally).toBe(1);
  });

  it("keeps low-level primary weakness in a foundational lane instead of overhead", () => {
    const profile = buildPlayerProfileVector(createAnswers({
      rally_stability: "rally_2",
      forehand_weapon: "forehand_4",
      backhand_slice_reliability: "backhand_slice_4",
      serve_quality: "serve_2",
      return_quality: "return_2",
      movement_recovery: "movement_4",
      net_transition_volley: "net_4",
      overhead_highball: "overhead_1",
      pressure_matchplay: "pressure_4",
      point_construction: "tactics_4"
    }));

    expect(profile.levelBand).toBe("4.0");
    expect(profile.primaryWeakness).toMatch(/^(serve|return|rally)$/);
    expect(profile.primaryWeakness).not.toBe("overhead");
    expect(profile.weakDimensions).toContain("overhead");
  });

  it("raises net and overhead priority for doubles-oriented net-pressure players", () => {
    const profile = buildPlayerProfileVector(createAnswers({
      rally_stability: "rally_4",
      forehand_weapon: "forehand_4",
      backhand_slice_reliability: "backhand_slice_4",
      serve_quality: "serve_3",
      return_quality: "return_3",
      movement_recovery: "movement_3",
      net_transition_volley: "net_2",
      overhead_highball: "overhead_2",
      pressure_matchplay: "pressure_4",
      point_construction: "tactics_4",
      play_style_profile: "net_pressure",
      play_context_modifier: "doubles_primary"
    }));

    expect(profile.primaryWeakness).toBe("net");
    expect(profile.secondaryWeakness).toBe("overhead");
    expect(profile.playStyle).toBe("net_pressure");
    expect(profile.playContext).toBe("doubles_primary");
  });

  it("allows tactics or pressure to rise for stronger players", () => {
    const profile = buildPlayerProfileVector(createAnswers({
      rally_stability: "rally_3",
      forehand_weapon: "forehand_3",
      backhand_slice_reliability: "backhand_slice_3",
      serve_quality: "serve_3",
      return_quality: "return_3",
      movement_recovery: "movement_3",
      net_transition_volley: "net_4",
      overhead_highball: "overhead_4",
      pressure_matchplay: "pressure_2",
      point_construction: "tactics_2",
      play_style_profile: "all_court",
      play_context_modifier: "singles_standard"
    }));

    expect(profile.levelBand).toBe("4.0");
    expect(profile.weakDimensions.slice(0, 2)).toEqual(["tactics", "pressure"]);
    expect(profile.primaryWeakness).toBe("tactics");
  });
});
