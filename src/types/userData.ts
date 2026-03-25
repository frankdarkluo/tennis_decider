import { AssessmentResult } from "@/types/assessment";
import { GeneratedPlan } from "@/types/plan";

export type PersistedAssessmentScores = {
  totalScore: number;
  maxScore: number;
  normalizedScore: number;
  answeredCount: number;
  uncertainCount: number;
  totalQuestions: number;
  confidence: AssessmentResult["confidence"];
  dimensions: AssessmentResult["dimensions"];
};

export type AssessmentResultRow = {
  id: string;
  user_id: string;
  level: AssessmentResult["level"];
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
