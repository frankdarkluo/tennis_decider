import { getDefaultAssessmentResult } from "@/lib/assessment";
import { ASSESSMENT_DRAFT_STORAGE_KEY, ASSESSMENT_STORAGE_KEY } from "@/lib/utils";
import { AssessmentDraft, AssessmentResult } from "@/types/assessment";

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

    // Migrate legacy 4.0+ level to 4.5
    if ((parsed.level as string) === "4.0+") {
      parsed.level = "4.5";
    }

    return parsed;
  } catch {
    return null;
  }
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
    if (typeof draft.stepIndex !== "number" || typeof draft.answers !== "object" || typeof draft.profile !== "object") {
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
