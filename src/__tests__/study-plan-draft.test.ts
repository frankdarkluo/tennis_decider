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
      sourceType: "diagnosis",
      primaryNextStep: "先把引拍提前半拍再出手"
    });

    expect(readLocalStudyPlanDraft()).toMatchObject({
      problemTag: "backhand-into-net",
      level: "3.0",
      preferredContentIds: ["content_cn_a_01"],
      sourceType: "diagnosis",
      primaryNextStep: "先把引拍提前半拍再出手"
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
