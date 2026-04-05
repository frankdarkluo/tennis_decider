import { AssessmentQuestion } from "@/types/assessment";

export function normalizeDraftStepIndex(
  rawStepIndex: number | undefined,
  draftAnswers: Record<string, number> | undefined,
  profileQuestions: AssessmentQuestion[]
) {
  const answeredCount = Object.keys(draftAnswers ?? {}).length;
  const activeProfileStepCount = profileQuestions.length;
  const inferredLegacyProfileSteps = Math.max((rawStepIndex ?? 0) - answeredCount - activeProfileStepCount, 0);

  return Math.max(0, (rawStepIndex ?? 0) - inferredLegacyProfileSteps);
}
