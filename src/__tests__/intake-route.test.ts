import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExtractTennisScene = vi.fn();

vi.mock("@/lib/scenarioReconstruction/llm/client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/scenarioReconstruction/llm/client")>(
    "@/lib/scenarioReconstruction/llm/client"
  );

  return {
    ...actual,
    createLocalQwenClient: () => ({
      extractTennisScene: mockExtractTennisScene,
      parseScenario: vi.fn(),
      rankQuestions: vi.fn()
    })
  };
});

describe("intake extract route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns validated extraction, normalized scenario, and structured diagnosis input", async () => {
    mockExtractTennisScene.mockResolvedValueOnce({
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
      rawSummary: "比赛里反手下网"
    });

    const { POST } = await import("../app/api/intake/extract/route");
    const response = await POST(new Request("http://localhost/api/intake/extract", {
      method: "POST",
      body: JSON.stringify({
        text: "比赛里我反手老下网",
        ui_language: "zh"
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("structured_intake");
    expect(body.extraction.strokeFamily).toBe("backhand");
    expect(body.scenario.stroke).toBe("backhand");
    expect(body.diagnosis_input).toBe("比赛里我反手老下网。");
  });

  it("falls back cleanly when extraction is invalid or too weak", async () => {
    mockExtractTennisScene.mockResolvedValueOnce({
      strokeFamily: "spaceship",
      confidence: "low"
    });

    const { POST } = await import("../app/api/intake/extract/route");
    const response = await POST(new Request("http://localhost/api/intake/extract", {
      method: "POST",
      body: JSON.stringify({
        text: "就是打着不对劲",
        ui_language: "zh"
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("deterministic_fallback");
    expect(body.extraction).toBeNull();
    expect(body.diagnosis_input).toBe("就是打着不对劲");
  });
});
