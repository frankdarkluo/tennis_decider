import { AssessmentResult } from "@/types/assessment";
import { DiagnosisResult } from "@/types/diagnosis";
import { GeneratedPlan } from "@/types/plan";
import { EventLog, StudyDerivedMetric } from "@/types/research";
import { VideoDiagnosisResult } from "@/types/videoDiagnosis";

export type StudyLanguage = "zh" | "en";
export type StudySortingMode = "deterministic_study" | (string & {});
export type StudyTaskId =
  | "task_1_problem_entry"
  | "task_2_assessment_entry"
  | "task_3_action_or_revisit";
export type StudyMetricName = "actionability";

export type StudySnapshot = {
  id: string;
  seed: string;
  buildVersion: string;
  snapshotVersion: string;
  fixedSeed: string;
  sortingMode: StudySortingMode;
  createdAt?: string;
  contentCount?: number;
  creatorCount?: number;
  contentSetVersion: string;
  creatorSetVersion: string;
  assessmentVersion: string;
  diagnosisRulesVersion: string;
  planTemplateVersion: string;
  localeBundleVersion: string;
  rankingStrategyVersion: string;
  buildSha?: string | null;
  randomSurfacingDisabled?: boolean;
  viewCountBoostDisabled?: boolean;
};

export type StudyCondition = `lang_${StudyLanguage}` | (string & {});

export type StudyBackgroundProfile = {
  ageBand: string;
  yearsPlayingBand: string;
  playFrequency: string;
  selfReportedLevel: string;
  watchesTrainingVideos: boolean;
  hasUploadedPracticeVideoBefore: boolean;
};

export type StudySession = {
  studyId: string;
  participantId: string;
  sessionId: string;
  studyMode: true;
  language: StudyLanguage;
  condition: StudyCondition;
  snapshotId: string;
  snapshotSeed: string;
  buildVersion: string;
  consentedAt?: string;
  background?: StudyBackgroundProfile | null;
  startedAt: string;
  endedAt?: string | null;
};

export type StudyArtifactType =
  | "study_background"
  | "assessment"
  | "diagnosis"
  | "video_diagnosis"
  | "plan"
  | "survey"
  | "bookmark"
  | "study_resume";

export type StudyArtifactPayload =
  | Record<string, unknown>
  | AssessmentResult
  | DiagnosisResult
  | VideoDiagnosisResult
  | GeneratedPlan;

export type StudyArtifactRecord = {
  id: string;
  studyId: string;
  participantId: string;
  sessionId: string;
  studyMode: true;
  language: StudyLanguage;
  condition: StudyCondition;
  snapshotId: string;
  snapshotSeed: string;
  buildVersion: string;
  artifactType: StudyArtifactType;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type StudyExportBundle = {
  snapshot: StudySnapshot;
  sessions: StudySession[];
  artifacts: StudyArtifactRecord[];
  events: EventLog[];
  taskRatings?: StudyTaskRatingRecord[];
  derivedMetrics?: StudyDerivedMetric[];
  actionabilitySummary?: {
    overall: { count: number; mean: number | null };
    byTask: Partial<Record<StudyTaskId, { count: number; mean: number | null }>>;
    byLanguage: Partial<Record<StudyLanguage, { count: number; mean: number | null }>>;
  };
};

export type StudyTaskRatingRecord = {
  id: string;
  studyId: string;
  participantId: string;
  sessionId: string;
  taskId: StudyTaskId;
  metricName: StudyMetricName;
  score: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  language: StudyLanguage;
  submittedAt: string;
};

export type StudyBookmarkState = {
  contentIds: string[];
  updatedAt: string;
};

export type StudyProgressState = {
  updatedAt: string;
  lastVisitedPath?: string;
  lastAssessmentPath?: string;
  lastAssessmentLevel?: string;
  lastAssessmentCompletedAt?: string;
  assessmentDraftInProgress?: boolean;
  assessmentDraftStepIndex?: number;
  assessmentDraftUpdatedAt?: string;
  lastPlanHref?: string;
  lastPlanTitle?: string;
  lastPlanProblemTag?: string;
  lastPlanLevel?: string;
};
