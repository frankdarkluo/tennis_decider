import { getDefaultAssessmentResult, migrateLegacyAssessmentResult } from "@/lib/assessment";
import { ASSESSMENT_DRAFT_STORAGE_KEY, ASSESSMENT_STORAGE_KEY } from "@/lib/utils";
import { AssessmentDraft, AssessmentResult } from "@/types/assessment";

function isCompletedAssessmentResult(value: AssessmentResult | null | undefined): value is AssessmentResult {
  return Boolean(
    value &&
    value.version === "assessment_10_plus_2" &&
    value.profileVector &&
    value.answeredCount >= value.totalQuestions
  );
}

export function readAssessmentResultFromStorage(): AssessmentResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(ASSESSMENT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AssessmentResult;

    if (isCompletedAssessmentResult(parsed)) {
      return parsed;
    }

    const migrated = migrateLegacyAssessmentResult(parsed);
    return isCompletedAssessmentResult(migrated) ? migrated : null;
  } catch {
    return null;
  }
}

export function hasCompletedAssessmentResult(result: AssessmentResult | null | undefined): result is AssessmentResult {
  return isCompletedAssessmentResult(result);
}

export function hasStoredCompletedAssessmentResult() {
  return hasCompletedAssessmentResult(readAssessmentResultFromStorage());
}

export function getStoredAssessmentResultOrDefault(): AssessmentResult {
  return readAssessmentResultFromStorage() ?? getDefaultAssessmentResult();
}

export function writeAssessmentResultToStorage(result: AssessmentResult) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(result));
}

export function readAssessmentDraftFromStorage(): AssessmentDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(ASSESSMENT_DRAFT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const draft = JSON.parse(raw) as AssessmentDraft;

    if (typeof draft.stepIndex !== "number" || typeof draft.answers !== "object") {
      return null;
    }

    return draft;
  } catch {
    return null;
  }
}

export function writeAssessmentDraftToStorage(draft: AssessmentDraft) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ASSESSMENT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function clearAssessmentDraftFromStorage() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ASSESSMENT_DRAFT_STORAGE_KEY);
}
