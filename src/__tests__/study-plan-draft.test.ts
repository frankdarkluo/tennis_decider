import { beforeEach, describe, expect, it } from "vitest";
import { STUDY_PLAN_DRAFT_KEY } from "../lib/study/config";
import {
  clearLocalStudyPlanDraft,
  readLocalStudyPlanDraft,
  writeLocalStudyPlanDraft
} from "../lib/study/localData";

describe("study plan draft local persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("writes and reads the latest plan draft snapshot", () => {
    writeLocalStudyPlanDraft({
      problemTag: "backhand-into-net",
      level: "3.0",
      preferredContentIds: ["content_cn_a_01"],
      sourceType: "assessment",
      primaryNextStep: "先把引拍提前半拍再出手",
      planContext: {
        source: "assessment",
        primaryProblemTag: "second-serve-reliability",
        sessionType: "unknown",
        pressureContext: "unknown",
        movementContext: "unknown",
        incomingBallDepth: "unknown",
        outcomePattern: "unknown",
        feelingModifiers: [],
        weakDimensions: ["serve"],
        observationDimensions: ["matchplay"],
        rationale: "focus:serve;observe:matchplay"
      },
      deepContext: {
        mode: "deep",
        sourceInput: "关键分时我的二发容易下网，而且会发紧。",
        sceneSummaryZh: "二发在关键分原地发球时容易下网，而且会发紧。",
        sceneSummaryEn: "On key points my stationary second serve keeps going into the net and it feels tight.",
        problemTag: "second-serve-reliability",
        level: "3.5",
        strokeFamily: "serve",
        serveSubtype: "second_serve",
        sessionType: "match",
        pressureContext: "key_points",
        movement: "stationary",
        outcome: "net",
        incomingBallDepth: "unknown",
        subjectiveFeeling: "tight",
        isDeepModeReady: true
      }
    });

    expect(readLocalStudyPlanDraft()).toMatchObject({
      problemTag: "backhand-into-net",
      level: "3.0",
      preferredContentIds: ["content_cn_a_01"],
      sourceType: "assessment",
      primaryNextStep: "先把引拍提前半拍再出手",
      planContext: {
        source: "assessment",
        primaryProblemTag: "second-serve-reliability",
        weakDimensions: ["serve"],
        observationDimensions: ["matchplay"],
        rationale: "focus:serve;observe:matchplay"
      },
      deepContext: {
        strokeFamily: "serve",
        serveSubtype: "second_serve",
        pressureContext: "key_points",
        isDeepModeReady: true
      }
    });
  });

  it("rejects invalid empty problem tags", () => {
    const writeResult = writeLocalStudyPlanDraft({
      problemTag: "   ",
      level: "3.0"
    });

    expect(writeResult).toBeNull();
    expect(readLocalStudyPlanDraft()).toBeNull();
  });

  it("clears only the plan draft key", () => {
    window.localStorage.setItem(STUDY_PLAN_DRAFT_KEY, JSON.stringify({
      problemTag: "serve-basics",
      level: "3.0"
    }));

    clearLocalStudyPlanDraft();

    expect(window.localStorage.getItem(STUDY_PLAN_DRAFT_KEY)).toBeNull();
  });
});
