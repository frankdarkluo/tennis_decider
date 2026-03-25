import { getDefaultAssessmentResult } from "@/lib/assessment";
import { ASSESSMENT_STORAGE_KEY } from "@/lib/utils";
import { AssessmentResult } from "@/types/assessment";

export function readAssessmentResultFromStorage(): AssessmentResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(ASSESSMENT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AssessmentResult;
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
