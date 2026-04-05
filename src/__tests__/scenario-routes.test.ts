import { beforeEach, describe, expect, it, vi } from "vitest";

const mockParseScenario = vi.fn();
const mockRankQuestions = vi.fn();

vi.mock("@/lib/scenarioReconstruction/llm/client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/scenarioReconstruction/llm/client")>(
    "@/lib/scenarioReconstruction/llm/client"
  );

  return {
    ...actual,
    createLocalQwenClient: () => ({
      parseScenario: mockParseScenario,
      rankQuestions: mockRankQuestions
    })
  };
});

describe("scenario reconstruction routes", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const { clearScenarioDecisionLogs } = await import("@/lib/scenarioReconstruction/logging");
    clearScenarioDecisionLogs();
  });

  it("POST /api/scenario-reconstruction/parse returns scenario state, candidates, and selected question", async () => {
    mockParseScenario.mockResolvedValueOnce({
      stroke: "backhand",
      context: { session_type: "match" },
      outcome: { primary_error: "net" }
    });
    mockRankQuestions.mockResolvedValueOnce(["q_movement_state"]);

    const { POST } = await import("../app/api/scenario-reconstruction/parse/route");
    const response = await POST(
      new Request("http://localhost/api/scenario-reconstruction/parse", {
        method: "POST",
        body: JSON.stringify({
          text: "比赛里我反手老下网",
          ui_language: "zh"
        })
      })
    );
    const body = await response.json();
    const { getScenarioDecisionLogs } = await import("@/lib/scenarioReconstruction/logging");

    expect(response.status).toBe(200);
    expect(body.scenario.stroke).toBe("backhand");
    expect(body.missing_slots).toEqual(["context.movement"]);
    expect(body.eligible_questions.map((question: { id: string }) => question.id)).toEqual(["q_movement_state"]);
    expect(body.selected_question.id).toBe("q_movement_state");
    expect(body.done).toBe(false);
    expect(getScenarioDecisionLogs()).toHaveLength(1);
    expect(getScenarioDecisionLogs()[0]).toContain("\"selected_question_id\":\"q_movement_state\"");
  });

  it("POST /api/scenario-reconstruction/parse handles missing text as bad request", async () => {
    const { POST } = await import("../app/api/scenario-reconstruction/parse/route");
    const response = await POST(
      new Request("http://localhost/api/scenario-reconstruction/parse", {
        method: "POST",
        body: JSON.stringify({ ui_language: "zh" })
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
  });

  it("POST /api/scenario-reconstruction/parse falls back cleanly for mixed input when model calls fail", async () => {
    mockParseScenario.mockRejectedValueOnce(new Error("offline"));
    mockRankQuestions.mockRejectedValueOnce(new Error("offline"));

    const { POST } = await import("../app/api/scenario-reconstruction/parse/route");
    const response = await POST(
      new Request("http://localhost/api/scenario-reconstruction/parse", {
        method: "POST",
        body: JSON.stringify({
          text: "比赛里 my backhand keeps going into the net",
          ui_language: "zh"
        })
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.scenario.language).toBe("mixed");
    expect(body.selected_question.id).toBe("q_movement_state");
  });

  it("POST /api/scenario-reconstruction/parse produces a direct handoff-ready serve case for second-serve net misses", async () => {
    mockParseScenario.mockRejectedValueOnce(new Error("offline"));
    mockRankQuestions.mockRejectedValueOnce(new Error("offline"));

    const { POST } = await import("../app/api/scenario-reconstruction/parse/route");
    const response = await POST(
      new Request("http://localhost/api/scenario-reconstruction/parse", {
        method: "POST",
        body: JSON.stringify({
          text: "关键分时我的二发容易下网",
          ui_language: "zh"
        })
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.scenario.stroke).toBe("serve");
    expect(body.scenario.context.movement).toBe("stationary");
    expect(body.scenario.outcome.primary_error).toBe("net");
    expect(body.done).toBe(true);
    expect(body.eligible_questions).toEqual([]);
    expect(body.selected_question).toBeNull();
  });

  it("POST /api/scenario-reconstruction/answer-followup updates the scenario and selects the next question", async () => {
    mockRankQuestions.mockResolvedValueOnce(["q_outcome_pattern"]);

    const { POST } = await import("../app/api/scenario-reconstruction/answer-followup/route");
    const response = await POST(
      new Request("http://localhost/api/scenario-reconstruction/answer-followup", {
        method: "POST",
        body: JSON.stringify({
          scenario: {
            raw_user_input: "比赛里我反手不稳",
            language: "zh",
            stroke: "backhand",
            context: {
              session_type: "match",
              pressure: "unknown",
              movement: "unknown",
              format: "unknown"
            },
            incoming_ball: {
              depth: "unknown",
              height: "unknown",
              pace: "unknown",
              spin: "unknown",
              direction: "unknown"
            },
            outcome: {
              primary_error: "unknown",
              frequency: "unknown"
            },
            subjective_feeling: {
              tight: false,
              rushed: false,
              awkward: false,
              hesitant: false,
              nervous: false,
              late_contact: false,
              no_timing: false,
              other: []
            },
            user_confidence: "unknown",
            missing_slots: ["context.movement", "outcome.primary_error"],
            next_question_candidates: ["q_movement_state"],
            selected_next_question_id: "q_movement_state"
          },
          question_id: "q_movement_state",
          answer: "moving",
          ui_language: "zh"
        })
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.scenario.context.movement).toBe("moving");
    expect(body.missing_slots).toEqual(["outcome.primary_error"]);
    expect(body.selected_question.id).toBe("q_outcome_pattern");
    expect(body.done).toBe(false);
  });

  it("POST /api/scenario-reconstruction/answer-followup clears active candidates once done is true", async () => {
    const { POST } = await import("../app/api/scenario-reconstruction/answer-followup/route");
    const response = await POST(
      new Request("http://localhost/api/scenario-reconstruction/answer-followup", {
        method: "POST",
        body: JSON.stringify({
          scenario: {
            raw_user_input: "比赛里我反手老下网，尤其对手球比较深的时候",
            language: "zh",
            stroke: "backhand",
            context: {
              session_type: "match",
              pressure: "unknown",
              movement: "unknown",
              format: "unknown"
            },
            incoming_ball: {
              depth: "deep",
              height: "unknown",
              pace: "unknown",
              spin: "unknown",
              direction: "unknown"
            },
            outcome: {
              primary_error: "net",
              frequency: "unknown"
            },
            subjective_feeling: {
              tight: false,
              rushed: false,
              awkward: false,
              hesitant: false,
              nervous: false,
              late_contact: false,
              no_timing: false,
              other: []
            },
            user_confidence: "unknown",
            missing_slots: ["context.movement"],
            next_question_candidates: ["q_movement_state"],
            selected_next_question_id: "q_movement_state"
          },
          question_id: "q_movement_state",
          answer: "moving",
          ui_language: "zh"
        })
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.done).toBe(true);
    expect(body.eligible_questions).toEqual([]);
    expect(body.selected_question).toBeNull();
    expect(body.scenario.next_question_candidates).toEqual([]);
    expect(body.scenario.selected_next_question_id).toBeNull();
  });

  it("POST /api/scenario-reconstruction/answer-followup rejects malformed payloads", async () => {
    const { POST } = await import("../app/api/scenario-reconstruction/answer-followup/route");
    const response = await POST(
      new Request("http://localhost/api/scenario-reconstruction/answer-followup", {
        method: "POST",
        body: JSON.stringify({
          question_id: "q_movement_state",
          answer: "moving"
        })
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
  });
});
