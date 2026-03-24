export type AssessmentQuestion = {
  id: string;
  dimension: "forehand" | "backhand" | "serve" | "net" | "movement" | "matchplay";
  question: string;
  options: {
    label: string;
    score: number;
  }[];
};

export type AssessmentDimension = AssessmentQuestion["dimension"];

export type DimensionKey = AssessmentDimension;

export type AssessmentAnswers = Record<string, number>;

export type DimensionSummary = {
  key: DimensionKey;
  label: string;
  score: number;
  maxScore: number;
  average: number;
  levelHint: "3.0" | "3.5" | "4.0";
  answeredCount: number;
  uncertainCount: number;
  status: "正常" | "待观察";
};

export type AssessmentResult = {
  totalScore: number;
  maxScore: number;
  normalizedScore: number;
  answeredCount: number;
  uncertainCount: number;
  totalQuestions: number;
  level: "3.0" | "3.5" | "4.0";
  confidence: "较低" | "中等" | "较高";
  dimensions: DimensionSummary[];
  strengths: string[];
  weaknesses: string[];
  observationNeeded: string[];
  summary: string;
};