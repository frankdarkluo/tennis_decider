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

export type AssessmentResult = {
  totalScore: number;
  level: "3.0" | "3.5" | "4.0";
  dimensionScores: Record<AssessmentDimension, number>;
  weakDimensions: AssessmentDimension[];
  weakSummary: string[];
  updatedAt: string;
};