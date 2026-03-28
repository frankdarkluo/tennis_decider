import { AssessmentResult } from "@/types/assessment";
import { DiagnosisResult } from "@/types/diagnosis";
import { GeneratedPlan } from "@/types/plan";
import { EventLog } from "@/types/research";
import { VideoDiagnosisResult } from "@/types/videoDiagnosis";

export type StudyLanguage = "zh" | "en";

export type StudySnapshot = {
  id: string;
  seed: string;
  buildVersion: string;
  contentSetVersion: string;
  creatorSetVersion: string;
  assessmentVersion: string;
  diagnosisRulesVersion: string;
  planTemplateVersion: string;
  localeBundleVersion: string;
  rankingStrategyVersion: string;
};

export type StudyCondition = `lang_${StudyLanguage}` | (string & {});

export type StudySession = {
  participantId: string;
  sessionId: string;
  studyMode: true;
  language: StudyLanguage;
  condition: StudyCondition;
  snapshotId: string;
  snapshotSeed: string;
  buildVersion: string;
  startedAt: string;
  endedAt?: string | null;
};

export type StudyArtifactType =
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
  lastPlanHref?: string;
  lastPlanTitle?: string;
  lastPlanProblemTag?: string;
  lastPlanLevel?: string;
};
