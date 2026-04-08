import { AssessmentResult } from "@/types/assessment";
import { DiagnosisResult } from "@/types/diagnosis";
import { GeneratedPlan } from "@/types/plan";
import { VideoDiagnosisResult, VideoSceneType, VideoStrokeType } from "@/types/videoDiagnosis";

function sanitizeFreeText(value?: string | null) {
  const normalized = value?.trim() ?? "";
  return {
    redacted: true,
    hasValue: normalized.length > 0,
    length: normalized.length
  };
}

export function sanitizeAssessmentArtifact(result: AssessmentResult) {
  return {
    level: result.level,
    totalScore: result.totalScore,
    maxScore: result.maxScore,
    normalizedScore: result.normalizedScore,
    answeredCount: result.answeredCount,
    uncertainCount: result.uncertainCount,
    totalQuestions: result.totalQuestions,
    confidence: result.confidence,
    strengths: result.strengths,
    weaknesses: result.weaknesses,
    observationNeeded: result.observationNeeded,
    profile: result.profile,
    branch: result.branch,
    coarseScore: result.coarseScore,
    fineScore: result.fineScore
  };
}

export function sanitizeDiagnosisArtifact(inputText: string, result: DiagnosisResult) {
  return {
    redactedInput: sanitizeFreeText(inputText),
    matchedRuleId: result.matchedRuleId,
    matchedKeywords: result.matchedKeywords,
    matchedSynonyms: result.matchedSynonyms,
    matchScore: result.matchScore,
    confidence: result.confidence,
    problemTag: result.problemTag,
    category: result.category,
    title: result.title,
    summary: result.summary,
    causes: result.causes,
    fixes: result.fixes,
    drills: result.drills,
    recommendedContentIds: result.recommendedContents.map((item) => item.id),
    fallbackUsed: result.fallbackUsed,
    fallbackMode: result.fallbackMode,
    level: result.level
  };
}

export function sanitizeVideoDiagnosisArtifact(input: {
  description: string;
  selectedStroke: VideoStrokeType;
  selectedScene: VideoSceneType;
  result: VideoDiagnosisResult;
}) {
  return {
    redactedDescription: sanitizeFreeText(input.description),
    selectedStroke: input.selectedStroke,
    selectedScene: input.selectedScene,
    observation: input.result.observation,
    diagnosis: {
      matchedRuleId: input.result.diagnosis.matchedRuleId,
      problemTag: input.result.diagnosis.problemTag,
      title: input.result.diagnosis.title,
      confidence: input.result.diagnosis.confidence,
      recommendedContentIds: input.result.diagnosis.recommendedContents.map((item) => item.id)
    },
    primaryProblem: input.result.primaryProblem,
    secondaryProblems: input.result.secondaryProblems,
    recommendedContentIds: input.result.recommendedContents.map((item) => item.id),
    recommendedCreatorIds: input.result.recommendedCreators.map((item) => item.id),
    trainingPlan: {
      problemTag: input.result.trainingPlan.problemTag,
      level: input.result.trainingPlan.level,
      title: input.result.trainingPlan.title
    },
    confidence: input.result.confidence,
    confidenceBand: input.result.confidenceBand,
    chargeable: input.result.chargeable,
    fallbackReason: input.result.fallbackReason ?? null
  };
}

export function sanitizePlanArtifact(plan: GeneratedPlan, extra?: Record<string, unknown>) {
  return {
    source: plan.source,
    level: plan.level,
    problemTag: plan.problemTag,
    title: plan.title,
    target: plan.target,
    summary: plan.summary,
    dayCount: plan.days.length,
    days: plan.days.map((day) => ({
      day: day.day,
      focus: day.focus,
      duration: day.duration,
      contentIds: day.contentIds,
      drillCount: day.drills.length
    })),
    ...extra
  };
}

