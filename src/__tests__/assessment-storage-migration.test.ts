import { describe, expect, it, beforeEach } from "vitest";
import { readAssessmentResultFromStorage } from "@/lib/assessmentStorage";
import { hydrateAssessmentResult } from "@/lib/userData";
import { ASSESSMENT_STORAGE_KEY } from "@/lib/utils";
import { AssessmentResultRow } from "@/types/userData";

describe("assessment storage migration", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("migrates a legacy local assessment result into the 10+2 profile contract", () => {
    window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify({
      totalScore: 30,
      answeredCount: 8,
      totalQuestions: 8,
      level: "4.5",
      dimensions: [
        { key: "serve", score: 1, average: 1 },
        { key: "matchplay", score: 2, average: 2 },
        { key: "forehand", score: 3, average: 3 }
      ],
      strengths: ["正手"],
      weaknesses: ["发球"],
      summary: "旧版评估摘要"
    }));

    const result = readAssessmentResultFromStorage();

    expect(result?.version).toBe("assessment_10_plus_2");
    expect(result?.profileVector?.levelBand).toBe("4.0+");
    expect(result?.profileVector?.primaryWeakness).toBe("serve");
    expect(result?.profileVector?.summary.headline).toBe("旧版评估摘要");
  });

  it("hydrates a legacy remote assessment row into the 10+2 profile contract", () => {
    const row: AssessmentResultRow = {
      id: "assessment_1",
      user_id: "user_1",
      level: "3.5",
      scores: {
        answeredCount: 8,
        totalQuestions: 8,
        totalScore: 26,
        dimensions: [
          { key: "serve", score: 1, average: 1 },
          { key: "matchplay", score: 2, average: 2 },
          { key: "forehand", score: 3, average: 3 }
        ]
      },
      strengths: ["正手"],
      weaknesses: ["发球"],
      uncertain: [],
      summary: "远端旧版评估摘要",
      created_at: "2026-04-10T00:00:00.000Z"
    };

    const result = hydrateAssessmentResult(row);

    expect(result.version).toBe("assessment_10_plus_2");
    expect(result.profileVector?.levelBand).toBe("3.5");
    expect(result.profileVector?.primaryWeakness).toBe("serve");
    expect(result.profileVector?.summary.headline).toBe("远端旧版评估摘要");
  });
});
