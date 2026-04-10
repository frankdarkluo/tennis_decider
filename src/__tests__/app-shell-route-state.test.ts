import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DiagnosisSnapshot } from "@/types/diagnosis";
import {
  clearLocalPlanDraft,
  readLocalDiagnosisSnapshot,
  readLocalPlanDraft,
  writeLocalDiagnosisSnapshot,
  writeLocalPlanDraft
} from "@/lib/appShell/localRouteState";

const diagnosisSnapshot: DiagnosisSnapshot = {
  inputSummary: "诊断快照：先修正反手稳定性",
  capturedAt: "2026-04-08T00:00:00.000Z",
  matchedRuleId: "rule_1",
  matchScore: 6,
  confidence: "中等",
  effortMode: "standard",
  evidenceLevel: "medium",
  needsNarrowing: false,
  narrowingPrompts: [],
  narrowingSuggestions: [],
  refusalReasonCodes: [],
  missingEvidenceSlots: [],
  primaryNextStep: "先把拍面稳定住",
  problemTag: "backhand-stability",
  category: ["groundstroke"],
  title: "先修正反手稳定性",
  summary: "先稳定反手结果。",
  detailedSummary: null,
  causes: ["拍面不稳。"],
  fixes: ["先把拍面稳定住"],
  drills: [],
  recommendedContentIds: [],
  fallbackUsed: false,
  fallbackMode: null,
  level: "3.0",
  enrichedContext: null,
  categoryConsistency: "ungated",
  categoryConflict: null
};

describe("app shell route state", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("stores and restores consumer diagnosis snapshots through the app-shell boundary", () => {
    expect(readLocalDiagnosisSnapshot()).toBeNull();

    writeLocalDiagnosisSnapshot(diagnosisSnapshot);

    expect(readLocalDiagnosisSnapshot()).toEqual(diagnosisSnapshot);
    expect(window.localStorage.getItem("tennislevel_diagnosis_snapshot")).not.toBeNull();
  });

  it("stores and clears consumer plan drafts through the app-shell boundary", () => {
    expect(readLocalPlanDraft()).toBeNull();

    const draft = writeLocalPlanDraft({
      problemTag: "backhand-stability",
      level: "3.0",
      preferredContentIds: ["content_1"],
      sourceType: "diagnosis",
      primaryNextStep: "先把拍面稳定住",
      updatedAt: "2026-04-08T00:00:00.000Z"
    });

    expect(draft).toMatchObject({
      problemTag: "backhand-stability",
      level: "3.0",
      preferredContentIds: ["content_1"],
      sourceType: "diagnosis",
      primaryNextStep: "先把拍面稳定住"
    });
    expect(readLocalPlanDraft()).toMatchObject({
      problemTag: "backhand-stability",
      level: "3.0"
    });

    clearLocalPlanDraft();
    expect(readLocalPlanDraft()).toBeNull();
    expect(window.localStorage.getItem("tennislevel_plan_draft")).toBeNull();
  });
});
