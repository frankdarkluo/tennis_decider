import { describe, expect, it } from "vitest";
import { parseScenarioTextDeterministically } from "@/lib/scenarioReconstruction/runtime";
import { getEligibleQuestions, selectNextQuestion, selectNextQuestionWithLlm } from "@/lib/scenarioReconstruction/selector";
import { createLocalQwenClient } from "@/lib/scenarioReconstruction/llm/client";

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

    expect(selectNextQuestion(scenario)?.id).toBe("q_movement_state");
    expect(selectNextQuestion(scenario)?.id).toBe("q_movement_state");
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
});
