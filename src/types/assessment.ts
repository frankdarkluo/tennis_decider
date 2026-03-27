export type AssessmentLevel = "2.5" | "3.0" | "3.5" | "4.0" | "4.0+";

export type AssessmentBranch = "A" | "B" | "C";

export type AssessmentGender = "male" | "female";

export type AssessmentPhase = "profile" | "coarse" | "fine";

export type AssessmentDimension =
  | "basics"
  | "forehand"
  | "backhand"
  | "serve"
  | "net"
  | "movement"
  | "matchplay"
  | "rally"
  | "awareness"
  | "fundamentals"
  | "receiving"
  | "consistency"
  | "both_sides"
  | "direction"
  | "rhythm"
  | "net_play"
  | "depth_variety"
  | "forcing"
  | "tactics";

export type AssessmentProfile = {
  gender?: AssessmentGender;
  yearsPlaying?: number;
  yearsLabel?: string;
};

export type AssessmentOption = {
  label: string;
  value: number;
};

export type AssessmentSliderConfig = {
  min: number;
  max: number;
  step: number;
  default: number;
  displayLabels: { value: number; label: string }[];
};

type AssessmentQuestionBase = {
  id: string;
  phase: AssessmentPhase;
  branch?: AssessmentBranch;
  question: string;
  dimension?: AssessmentDimension;
};

export type AssessmentGenderQuestion = AssessmentQuestionBase & {
  type: "gender";
  options: AssessmentOption[];
};

export type AssessmentSliderQuestion = AssessmentQuestionBase & {
  type: "slider";
  sliderConfig: AssessmentSliderConfig;
};

export type AssessmentChoiceQuestion = AssessmentQuestionBase & {
  type: "choice";
  options: AssessmentOption[];
};

export type AssessmentQuestion =
  | AssessmentGenderQuestion
  | AssessmentSliderQuestion
  | AssessmentChoiceQuestion;

export type DimensionKey = AssessmentDimension;

export type AssessmentAnswers = Record<string, number>;

export type DimensionSummary = {
  key: DimensionKey;
  label: string;
  score: number;
  maxScore: number;
  average: number;
  levelHint: AssessmentLevel;
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
  level: AssessmentLevel;
  confidence: "较低" | "中等" | "较高";
  dimensions: DimensionSummary[];
  strengths: string[];
  weaknesses: string[];
  observationNeeded: string[];
  summary: string;
  profile?: AssessmentProfile;
  branch?: AssessmentBranch;
  coarseScore?: number;
  fineScore?: number;
};
