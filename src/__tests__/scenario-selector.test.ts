import { describe, expect, it } from "vitest";
import { applyScenarioAnswer, parseScenarioTextDeterministically } from "@/lib/scenarioReconstruction/runtime";
import { getEligibleQuestions, selectNextQuestion, selectNextQuestionWithLlm } from "@/lib/scenarioReconstruction/selector";
import { createLocalQwenClient } from "@/lib/scenarioReconstruction/llm/client";
import { getSkillCategoryPolicy } from "@/lib/scenarioReconstruction/skillPolicy";

describe("scenario reconstruction selector", () => {
  it("asks for practice vs match first when session type is still unknown", () => {
    const scenario = parseScenarioTextDeterministically("我反手不稳");
    const selected = selectNextQuestion(scenario);

    expect(selected?.id).toBe("q_match_or_practice");
  });

  it("moves to movement once session type is already grounded", () => {
    const scenario = parseScenarioTextDeterministically("比赛里我反手不稳");
    const selected = selectNextQuestion(scenario);

    expect(selected?.id).toBe("q_movement_state");
  });

  it("moves to outcome clarification once session and movement are known", () => {
    const scenario = parseScenarioTextDeterministically(
      "In matches my backhand breaks down when I am moving"
    );
    const selected = selectNextQuestion(scenario);

    expect(selected?.id).toBe("q_outcome_pattern");
  });

  it("asks for deep-ball detail before subjective feeling when the scene is mostly structured", () => {
    const scenario = parseScenarioTextDeterministically(
      "In matches my backhand keeps going into the net when I am moving"
    );
    const selected = selectNextQuestion(scenario);

    expect(selected?.id).toBe("q_incoming_ball_depth");
  });

  it("avoids already grounded or redundant questions in the eligible set", () => {
    const scenario = parseScenarioTextDeterministically(
      "比赛里我跑动中反手老下网，特别是对手压得比较深的时候"
    );
    const eligible = getEligibleQuestions(scenario);
    const eligibleIds = eligible.map((question) => question.id);

    expect(eligibleIds).not.toContain("q_match_or_practice");
    expect(eligibleIds).not.toContain("q_movement_state");
    expect(eligibleIds).not.toContain("q_outcome_pattern");
    expect(eligibleIds).not.toContain("q_incoming_ball_depth");
  });

  it("stays deterministic when multiple questions remain eligible", () => {
    const scenario = parseScenarioTextDeterministically(
      "My serve has no power in matches"
    );

    expect(selectNextQuestion(scenario)?.id).toBe("q_serve_variant");
    expect(selectNextQuestion(scenario)?.id).toBe("q_serve_variant");
  });

  it("keeps colloquial serve-control complaints inside serve-specific Deep Mode follow-ups", () => {
    const scenario = parseScenarioTextDeterministically("我的原地的发球发坏不太受控，而且会发紧");
    const eligibleIds = getEligibleQuestions(scenario).map((question) => question.id);

    expect(selectNextQuestion(scenario)?.id).toBe("q_match_or_practice");
    expect(eligibleIds).toEqual([
      "q_match_or_practice",
      "q_serve_variant",
      "q_serve_control_pattern",
      "q_serve_mechanism_family"
    ]);
    expect(eligibleIds).not.toContain("q_incoming_ball_depth");
    expect(eligibleIds).not.toContain("q_movement_state");
  });

  it("never offers movement follow-ups for serve-family complaints", () => {
    const scenario = parseScenarioTextDeterministically("关键分时我的二发容易下网");
    const eligibleIds = getEligibleQuestions(scenario).map((question) => question.id);

    expect(eligibleIds).not.toContain("q_movement_state");
  });

  it("never offers incoming-ball follow-ups for serve-family complaints", () => {
    const scenario = parseScenarioTextDeterministically("My serve has no power in matches");
    const eligibleIds = getEligibleQuestions(scenario).map((question) => question.id);

    expect(eligibleIds).not.toContain("q_incoming_ball_depth");
  });

  it("treats '一发总发不进' as a serve-family case and never asks about incoming-ball depth", () => {
    const scenario = parseScenarioTextDeterministically("一发总发不进");
    const eligibleIds = getEligibleQuestions(scenario).map((question) => question.id);

    expect(scenario.stroke).toBe("serve");
    expect(selectNextQuestion(scenario)?.id).toBe("q_match_or_practice");
    expect(eligibleIds).toEqual([
      "q_match_or_practice",
      "q_outcome_pattern",
      "q_serve_control_pattern",
      "q_serve_mechanism_family",
      "q_feeling_rushed_or_tight"
    ]);
    expect(eligibleIds).not.toContain("q_incoming_ball_depth");
  });

  it("still allows movement follow-ups for groundstroke complaints when the category supports them", () => {
    const scenario = parseScenarioTextDeterministically("比赛里我反手老下网");
    const eligibleIds = getEligibleQuestions(scenario).map((question) => question.id);

    expect(eligibleIds).toContain("q_movement_state");
  });

  it("uses only the safe fallback subset when technique inference is weak", () => {
    const scenario = parseScenarioTextDeterministically("就是打着不对劲");
    const eligibleFamilies = getEligibleQuestions(scenario).map((question) => question.family);

    expect(new Set(eligibleFamilies)).toEqual(
      new Set(["session_context", "pressure_context", "broad_shot_family_clarification"])
    );
  });

  it("never offers serve-only follow-ups for overhead complaints", () => {
    const scenario = parseScenarioTextDeterministically("My overhead keeps going into the net in matches");
    const eligibleIds = getEligibleQuestions(scenario).map((question) => question.id);

    expect(eligibleIds).not.toContain("q_serve_variant");
  });

  it("never offers serve-only follow-ups for volley complaints", () => {
    const scenario = parseScenarioTextDeterministically("比赛里我的截击总下网");
    const eligibleIds = getEligibleQuestions(scenario).map((question) => question.id);

    expect(eligibleIds).not.toContain("q_serve_variant");
  });

  it("exposes category-specific policy metadata instead of only broad slot gates", () => {
    expect(getSkillCategoryPolicy("return")).toMatchObject({
      allowedQuestionFamilies: expect.arrayContaining(["return_positioning", "return_first_ball_goal"]),
      forbiddenQuestionFamilies: expect.arrayContaining(["serve_variant", "serve_mechanism_family", "incoming_ball_depth"]),
      mechanismFamilies: expect.arrayContaining(["positioning", "first_ball_goal"])
    });
    expect(getSkillCategoryPolicy("volley")).toMatchObject({
      allowedQuestionFamilies: expect.arrayContaining(["volley_height", "volley_racket_face"]),
      forbiddenQuestionFamilies: expect.arrayContaining(["serve_variant", "incoming_ball_depth"]),
      mechanismFamilies: expect.arrayContaining(["contact_height", "racket_face"])
    });
    expect(getSkillCategoryPolicy("overhead")).toMatchObject({
      allowedQuestionFamilies: expect.arrayContaining(["overhead_contact"]),
      forbiddenQuestionFamilies: expect.arrayContaining(["serve_variant", "incoming_ball_depth"]),
      mechanismFamilies: expect.arrayContaining(["contact_timing"])
    });
    expect(getSkillCategoryPolicy("slice")).toMatchObject({
      allowedQuestionFamilies: expect.arrayContaining(["slice_response_pattern"]),
      forbiddenQuestionFamilies: expect.arrayContaining(["serve_variant", "incoming_ball_depth"]),
      mechanismFamilies: expect.arrayContaining(["response_pattern"])
    });
  });

  it("uses return-specific detail follow-ups once the core return scene is grounded", () => {
    const scenario = parseScenarioTextDeterministically("比赛里我的接发总是没力量，而且来不及");
    const eligibleIds = getEligibleQuestions(scenario).map((question) => question.id);

    expect(scenario.stroke).toBe("return");
    expect(selectNextQuestion(scenario)?.id).toBe("q_return_positioning");
    expect(eligibleIds).toContain("q_return_positioning");
    expect(eligibleIds).toContain("q_return_first_ball_goal");
    expect(eligibleIds).not.toContain("q_serve_mechanism_family");
    expect(eligibleIds).not.toContain("q_incoming_ball_depth");
  });

  it("continues the exact missing return detail slot instead of bouncing to generic fallback", () => {
    let scenario = parseScenarioTextDeterministically("比赛里我的接发总是没力量，而且来不及");

    expect(selectNextQuestion(scenario)?.id).toBe("q_return_positioning");

    scenario = applyScenarioAnswer(scenario, "q_return_positioning", "jammed");

    expect(selectNextQuestion(scenario)?.id).toBe("q_return_first_ball_goal");
    expect(getEligibleQuestions(scenario).map((question) => question.id)).toEqual(["q_return_first_ball_goal"]);

    scenario = applyScenarioAnswer(scenario, "q_return_first_ball_goal", "neutralize");

    expect(selectNextQuestion(scenario)).toBeNull();
    expect(scenario.deep_progress.deepReady).toBe(true);
  });

  it("uses volley-specific detail follow-ups instead of serve or groundstroke questions", () => {
    const scenario = parseScenarioTextDeterministically("比赛里我的截击总下网，而且来不及");
    const eligibleIds = getEligibleQuestions(scenario).map((question) => question.id);

    expect(scenario.stroke).toBe("volley");
    expect(selectNextQuestion(scenario)?.id).toBe("q_volley_height");
    expect(eligibleIds).toContain("q_volley_height");
    expect(eligibleIds).toContain("q_volley_racket_face");
    expect(eligibleIds).not.toContain("q_serve_variant");
    expect(eligibleIds).not.toContain("q_incoming_ball_depth");
  });

  it("uses overhead-specific contact follow-ups for grounded overhead complaints", () => {
    const scenario = parseScenarioTextDeterministically("My overhead keeps going long in matches and I feel rushed");
    const eligibleIds = getEligibleQuestions(scenario).map((question) => question.id);

    expect(scenario.stroke).toBe("overhead");
    expect(selectNextQuestion(scenario)?.id).toBe("q_overhead_contact");
    expect(eligibleIds).toEqual(["q_overhead_contact"]);
    expect(eligibleIds).not.toContain("q_serve_mechanism_family");
    expect(eligibleIds).not.toContain("q_incoming_ball_depth");
  });

  it("uses slice-specific response follow-ups for grounded slice complaints", () => {
    const scenario = parseScenarioTextDeterministically("比赛里我的切削总是没力量，而且来不及");
    const eligibleIds = getEligibleQuestions(scenario).map((question) => question.id);

    expect(scenario.stroke).toBe("slice");
    expect(selectNextQuestion(scenario)?.id).toBe("q_slice_response_pattern");
    expect(eligibleIds).toEqual(["q_slice_response_pattern"]);
    expect(eligibleIds).not.toContain("q_serve_variant");
    expect(eligibleIds).not.toContain("q_incoming_ball_depth");
  });

  it("accepts ranked candidate ids from the local model when they stay within the eligible set", async () => {
    const scenario = parseScenarioTextDeterministically(
      "In matches my backhand keeps going into the net when I am moving"
    );
    const client = createLocalQwenClient({
      fetch: async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    ranked_question_ids: ["q_feeling_rushed_or_tight", "q_incoming_ball_depth"]
                  })
                }
              }
            ]
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
    });

    const selected = await selectNextQuestionWithLlm(scenario, client);

    expect(selected?.id).toBe("q_feeling_rushed_or_tight");
  });

  it("falls back to the rule-first selector when the model ranks an ineligible question", async () => {
    const scenario = parseScenarioTextDeterministically(
      "In matches my backhand keeps going into the net when I am moving"
    );
    const client = createLocalQwenClient({
      fetch: async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    ranked_question_ids: ["q_match_or_practice"]
                  })
                }
              }
            ]
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
    });

    const selected = await selectNextQuestionWithLlm(scenario, client);

    expect(selected?.id).toBe("q_incoming_ball_depth");
  });

  it("falls back to the rule-first selector when the model response is malformed", async () => {
    const scenario = parseScenarioTextDeterministically(
      "In matches my backhand keeps going into the net when I am moving"
    );
    const client = createLocalQwenClient({
      fetch: async () =>
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "<think>draft</think>oops" } }]
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
    });

    const selected = await selectNextQuestionWithLlm(scenario, client);

    expect(selected?.id).toBe("q_incoming_ball_depth");
  });

  it("adds skip and cannot-answer options to active Deep Mode questions", () => {
    const scenario = parseScenarioTextDeterministically("比赛里我反手老下网");
    const selected = selectNextQuestion(scenario);
    const keys = selected?.options.map((option) => option.key) ?? [];

    expect(keys).toContain("skip");
    expect(keys).toContain("cannot_answer");
  });
});
