import { AssessmentQuestion } from "@/types/assessment";

export function normalizeDraftStepIndex(
  rawStepIndex: number | undefined,
  draftAnswers: Record<string, string> | undefined,
  questions: AssessmentQuestion[]
) {
  const validQuestionIds = new Set(questions.map((question) => question.id));
  const validAnsweredCount = Object.keys(draftAnswers ?? {}).filter((id) => validQuestionIds.has(id)).length;

  if (validAnsweredCount === 0) {
    return 0;
  }

  return Math.max(0, Math.min(rawStepIndex ?? validAnsweredCount, validAnsweredCount));
}
