import { describe, expect, it } from "vitest";
import {
  applyScenarioAnswer,
  createEmptyScenario,
  finalizeScenarioProgress,
  getDeepModeProgress,
  getMissingSlots,
  isScenarioMinimallyAnalyzable,
  parseScenarioText,
  parseScenarioTextDeterministically
} from "@/lib/scenarioReconstruction/runtime";
import { getQuestionBank } from "@/lib/scenarioReconstruction/questionBank";
import {
  createLocalQwenClient,
  readLocalQwenConfig,
  stripThinkingBlocks
} from "@/lib/scenarioReconstruction/llm/client";
import { inferSkillCategory } from "@/lib/scenarioReconstruction/inferSkillCategory";
import { getSkillCategoryPolicy } from "@/lib/scenarioReconstruction/skillPolicy";

describe("scenario reconstruction runtime", () => {
  it("infers serve with high confidence for explicit serve-family phrasing", () => {
    const scenario = parseScenarioTextDeterministically("关键分时我的二发容易下网");
    const inferred = inferSkillCategory(scenario);

    expect(inferred.category).toBe("serve");
    expect(inferred.confidence).toBe("high");
  });

  it("falls back conservatively when the complaint is too vague for a technique-specific category", () => {
    const scenario = parseScenarioTextDeterministically("就是打着不对劲");
    const inferred = inferSkillCategory(scenario);

    expect(inferred.category).toBe("generic_safe_fallback");
    expect(inferred.confidence).toBe("low");
  });

  it("keeps the safe fallback policy intentionally tiny", () => {
    const policy = getSkillCategoryPolicy("generic_safe_fallback");

    expect(policy.allowedQuestionFamilies).toEqual([
      "session_context",
      "pressure_context",
      "outcome_pattern",
      "broad_shot_family_clarification"
    ]);
  });

  it("parses supported Chinese cues without hallucinating unknown fields", () => {
    const scenario = parseScenarioTextDeterministically(
      "比赛里我反手老下网，特别是对手压得比较深的时候"
    );

    expect(scenario.raw_user_input).toBe("比赛里我反手老下网，特别是对手压得比较深的时候");
    expect(scenario.language).toBe("zh");
    expect(scenario.stroke).toBe("backhand");
    expect(scenario.context.session_type).toBe("match");
    expect(scenario.incoming_ball.depth).toBe("deep");
    expect(scenario.outcome.primary_error).toBe("net");
    expect(scenario.context.movement).toBe("unknown");
    expect(scenario.outcome.frequency).toBe("unknown");
  });

  it("parses supported English cues and subjective feeling flags", () => {
    const scenario = parseScenarioTextDeterministically(
      "My serve has no power in matches and I get tight on big points"
    );

    expect(scenario.language).toBe("en");
    expect(scenario.stroke).toBe("serve");
    expect(scenario.context.session_type).toBe("match");
    expect(scenario.outcome.primary_error).toBe("no_power");
    expect(scenario.subjective_feeling.tight).toBe(true);
    expect(scenario.context.movement).toBe("stationary");
  });

  it("normalizes second-serve phrasing into a serve-family scenario", () => {
    const scenario = parseScenarioTextDeterministically(
      "关键分时我的二发容易下网"
    );

    expect(scenario.stroke).toBe("serve");
    expect(scenario.context.session_type).toBe("match");
    expect(scenario.context.pressure).toBe("high");
    expect(scenario.context.movement).toBe("stationary");
    expect(scenario.outcome.primary_error).toBe("net");
  });

  it("marks mixed-language input as mixed while still extracting supported slots", () => {
    const scenario = parseScenarioTextDeterministically(
      "比赛里 my backhand keeps going into the net"
    );

    expect(scenario.language).toBe("mixed");
    expect(scenario.stroke).toBe("backhand");
    expect(scenario.context.session_type).toBe("match");
    expect(scenario.outcome.primary_error).toBe("net");
  });

  it("returns critical missing slots in priority order", () => {
    const scenario = parseScenarioTextDeterministically("我反手不稳");

    expect(getMissingSlots(scenario)).toEqual([
      "context.session_type",
      "context.movement",
      "outcome.primary_error",
      "subjective_feeling.rushed"
    ]);
  });

  it("keeps the bilingual question bank aligned and editable outside UI code", () => {
    const bank = getQuestionBank();
    const ids = bank.map((question) => question.id);

    expect(ids).toContain("q_match_or_practice");
    expect(ids).toContain("q_broad_shot_family");
    expect(new Set(ids).size).toBe(bank.length);
    expect(bank.every((question) => question.zh.trim().length > 0)).toBe(true);
    expect(bank.every((question) => question.en.trim().length > 0)).toBe(true);
    expect(bank.every((question) => question.options.length > 0)).toBe(true);
  });

  it("keeps every active scenario question tagged with a stable family and deterministic fillsSlots", () => {
    const bank = getQuestionBank();

    expect(bank.every((question) => question.family.trim().length > 0)).toBe(true);
    expect(bank.every((question) => question.fillsSlots.length > 0)).toBe(true);
  });

  it("supports broad shot-family clarification as a safe fallback question", () => {
    const question = getQuestionBank().find((item) => item.id === "q_broad_shot_family");

    expect(question?.family).toBe("broad_shot_family_clarification");
  });

  it("applies a follow-up answer by updating the targeted slot and preserving prior evidence", () => {
    const scenario = parseScenarioTextDeterministically("比赛里我反手老下网");
    const nextScenario = applyScenarioAnswer(scenario, "q_movement_state", "moving");

    expect(nextScenario.stroke).toBe("backhand");
    expect(nextScenario.context.session_type).toBe("match");
    expect(nextScenario.context.movement).toBe("moving");
    expect(nextScenario.outcome.primary_error).toBe("net");
    expect(nextScenario.slot_resolution["context.movement"]).toBe("answered");
    expect(nextScenario.asked_followup_ids).toEqual(["q_movement_state"]);
  });

  it("tracks skipped and cannot-answer follow-ups separately in slot resolution", () => {
    const base = createEmptyScenario("一发总发不进");

    expect(base.slot_resolution["context.session_type"]).toBe("unasked");
    expect(applyScenarioAnswer(base, "q_match_or_practice", "match").slot_resolution["context.session_type"]).toBe("answered");
    expect(applyScenarioAnswer(base, "q_match_or_practice", "skip").slot_resolution["context.session_type"]).toBe("skipped");
    expect(applyScenarioAnswer(base, "q_match_or_practice", "cannot_answer").slot_resolution["context.session_type"]).toBe("cannot_answer");
  });

  it("starts from an empty scenario with all supported fields present", () => {
    const scenario = createEmptyScenario("");

    expect(scenario.stroke).toBe("unknown");
    expect(scenario.context.session_type).toBe("unknown");
    expect(scenario.incoming_ball.depth).toBe("unknown");
    expect(scenario.outcome.primary_error).toBe("unknown");
    expect(scenario.subjective_feeling.other).toEqual([]);
    expect(scenario.slot_resolution.stroke).toBe("unasked");
    expect(scenario.deep_progress.deepReady).toBe(false);
    expect(scenario.selected_next_question_id).toBeNull();
    expect(scenario.asked_followup_ids).toEqual([]);
  });

  it("uses localhost MLX defaults for the local Qwen client config", () => {
    expect(readLocalQwenConfig({})).toEqual({
      baseUrl: "http://127.0.0.1:8080/v1",
      apiKey: "EMPTY",
      modelName: "mlx-community/Qwen3-8B-4bit"
    });
  });

  it("strips think blocks before parsing model JSON", () => {
    expect(stripThinkingBlocks("<think>hidden</think>{\"ok\":true}")).toBe("{\"ok\":true}");
  });

  it("falls back to deterministic parsing when the model response is invalid", async () => {
    const client = createLocalQwenClient({
      fetch: async () =>
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "<think>draft</think>not-json" } }]
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
    });

    const scenario = await parseScenarioText("我反手不稳", { client });

    expect(scenario.stroke).toBe("backhand");
    expect(scenario.context.session_type).toBe("unknown");
    expect(scenario.missing_slots).toEqual([
      "context.session_type",
      "context.movement",
      "outcome.primary_error",
      "subjective_feeling.rushed"
    ]);
  });

  it("accepts a valid local model parse when it returns supported schema values", async () => {
    const client = createLocalQwenClient({
      fetch: async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    stroke: "backhand",
                    context: { session_type: "match", movement: "moving" },
                    outcome: { primary_error: "net" }
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

    const scenario = await parseScenarioText("我反手不稳", { client });

    expect(scenario.stroke).toBe("backhand");
    expect(scenario.context.session_type).toBe("match");
    expect(scenario.context.movement).toBe("moving");
    expect(scenario.outcome.primary_error).toBe("net");
  });

  it("does not mark the scenario as done when blocking missing slots remain", () => {
    const scenario = parseScenarioTextDeterministically("比赛里我反手老下网");

    expect(scenario.missing_slots).toContain("context.movement");
    expect(isScenarioMinimallyAnalyzable(scenario)).toBe(false);
  });

  it("keeps Deep Mode open while required grounding fields are still unresolved", () => {
    const scenario = parseScenarioTextDeterministically("比赛里我跑动中反手老下网，尤其对手球比较深的时候");
    const progress = getDeepModeProgress(scenario);

    expect(progress.deepReady).toBe(false);
    expect(progress.requiredRemaining).toEqual(["subjective_feeling.rushed"]);
  });

  it("clears active candidates when finalized progress is deep-ready", () => {
    let scenario = parseScenarioTextDeterministically("比赛里我跑动中反手老下网，尤其对手球比较深的时候");
    scenario = applyScenarioAnswer(scenario, "q_feeling_rushed_or_tight", "rushed");
    const question = getQuestionBank().find((item) => item.id === "q_feeling_rushed_or_tight");

    expect(question).toBeDefined();

    const progress = finalizeScenarioProgress(scenario, question ? [question] : [], question ?? null);

    expect(progress.done).toBe(true);
    expect(progress.eligibleQuestions).toEqual([]);
    expect(progress.selectedQuestion).toBeNull();
    expect(progress.scenario.next_question_candidates).toEqual([]);
    expect(progress.scenario.selected_next_question_id).toBeNull();
  });

  it("does not treat a narrow second-serve complaint as deep-ready before the remaining required feeling signal is resolved", () => {
    const scenario = parseScenarioTextDeterministically("关键分时我的二发容易下网");
    const progress = finalizeScenarioProgress(scenario, getQuestionBank(), getQuestionBank()[0] ?? null);

    expect(progress.scenario.stroke).toBe("serve");
    expect(progress.done).toBe(false);
    expect(progress.scenario.deep_progress.requiredRemaining).toEqual(["subjective_feeling.rushed"]);
  });

  it("marks capped scenarios as honest stops instead of fake completion", () => {
    const scenario = parseScenarioTextDeterministically("我反手不稳");
    scenario.asked_followup_ids = ["q_match_or_practice", "q_movement_state", "q_outcome_pattern", "q_feeling_rushed_or_tight", "q_incoming_ball_depth"];
    scenario.missing_slots = getMissingSlots(scenario);
    scenario.deep_progress = getDeepModeProgress(scenario);

    expect(scenario.deep_progress.stoppedByCap).toBe(true);
    expect(scenario.deep_progress.deepReady).toBe(false);
  });
});
