import { AssessmentResult } from "@/types/assessment";
import { GeneratedPlan } from "@/types/plan";
import { VLMObservation, VideoDiagnosisResult } from "@/types/videoDiagnosis";

export type PersistedAssessmentScores = {
  version?: AssessmentResult["version"];
  rawScore?: number | null;
  answeredCount: number;
  coreAnsweredCount?: number;
  totalQuestions: number;
  dimensionSummaries?: AssessmentResult["dimensionSummaries"];
  profileVector?: AssessmentResult["profileVector"];
  completedAt?: AssessmentResult["completedAt"];
  totalScore?: number;
  dimensions?: Array<{
    key?: string;
    label?: string;
    score?: number;
    average?: number;
  }>;
  answers?: Record<string, string>;
};

export type AssessmentResultRow = {
  id: string;
  user_id: string;
  level: string | null;
  scores: PersistedAssessmentScores;
  strengths: string[];
  weaknesses: string[];
  uncertain: string[];
  summary: string | null;
  created_at: string;
};

export type DiagnosisHistoryRow = {
  id: string;
  user_id: string;
  input_text: string;
  matched_rule_id: string | null;
  problem_label: string | null;
  created_at: string;
};

export type BookmarkRow = {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
};

export type SavedPlanSource = "diagnosis" | "assessment" | "default";

export type SavedPlanRow = {
  id: string;
  user_id: string;
  plan_data: GeneratedPlan;
  source_type: SavedPlanSource;
  source_label: string | null;
  created_at: string;
};

export type VideoUsageRow = {
  id: string;
  user_id: string;
  success_count: number;
  failed_count: number;
  is_pro: boolean;
  updated_at: string;
};

export type VideoDiagnosisHistoryRow = {
  id: string;
  user_id: string;
  user_description: string | null;
  selected_stroke: string | null;
  selected_scene: string | null;
  observation: VLMObservation;
  result: VideoDiagnosisResult;
  confidence: number | null;
  created_at: string;
};
