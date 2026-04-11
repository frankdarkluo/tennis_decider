export type LevelBand = "2.5" | "3.0" | "3.5" | "4.0" | "4.0+";

export type PlayStyle =
  | "defensive"
  | "baseline_attack"
  | "all_court"
  | "net_pressure";

export type PlayContext =
  | "singles_standard"
  | "singles_limited_mobility"
  | "mixed_with_doubles"
  | "doubles_primary";

export type AssessmentQuestionType = "scored" | "profile";
export type AssessmentUiVariant = "list" | "card-grid";

export type ScoredDimension =
  | "rally"
  | "forehand"
  | "backhand_slice"
  | "serve"
  | "return"
  | "movement"
  | "net"
  | "overhead"
  | "pressure"
  | "tactics";

export type ProfileDimension = "play_style" | "context";

export type AssessmentDimension = ScoredDimension | ProfileDimension;

export type AssessmentOption = {
  id: string;
  value: string;
  label: string;
  description?: string;
  score?: 1 | 2 | 3 | 4;
  icon?: string;
};

export type AssessmentQuestion = {
  id: string;
  type: AssessmentQuestionType;
  dimension: AssessmentDimension;
  prompt: string;
  uiVariant: AssessmentUiVariant;
  options: AssessmentOption[];
};

export type AssessmentAnswerMap = Record<string, string>;

export type DimensionScores = Record<ScoredDimension, 1 | 2 | 3 | 4>;

export type ScoredAssessmentResult = {
  rawScore: number;
  levelBand: LevelBand;
  dimensionScores: DimensionScores;
};

export type WeaknessRankingItem = {
  dimension: ScoredDimension;
  score: 1 | 2 | 3 | 4;
  priorityScore: number;
  baseImpactWeight: number;
  severityWeight: number;
  levelMultiplier: number;
  styleMultiplier: number;
  contextMultiplier: number;
  suppressedAsPrimary?: boolean;
};

export type PlayerProfileVector = {
  rawScore: number;
  levelBand: LevelBand;
  dimensionScores: DimensionScores;
  weakDimensions: ScoredDimension[];
  strongDimensions: ScoredDimension[];
  primaryWeakness?: ScoredDimension;
  secondaryWeakness?: ScoredDimension;
  playStyle: PlayStyle;
  playContext: PlayContext;
  summary: {
    headline: string;
    oneLineLevelSummary: string;
    oneLinePlanHint: string;
  };
};

export type AssessmentDimensionStatus = "weak" | "needs_work" | "normal" | "strength";

export type DimensionSummary = {
  key: ScoredDimension;
  score: 1 | 2 | 3 | 4;
  maxScore: 4;
  status: AssessmentDimensionStatus;
};

export type AssessmentDraft = {
  stepIndex: number;
  answers: AssessmentAnswerMap;
  updatedAt: string;
};

export type AssessmentResult = {
  version: "assessment_10_plus_2";
  answeredCount: number;
  coreAnsweredCount: number;
  totalQuestions: number;
  profileVector: PlayerProfileVector | null;
  dimensionSummaries: DimensionSummary[];
  completedAt?: string;
};

export type PlanInputFromAssessment = {
  levelBand: PlayerProfileVector["levelBand"];
  primaryWeakness?: PlayerProfileVector["primaryWeakness"];
  secondaryWeakness?: PlayerProfileVector["secondaryWeakness"];
  playStyle: PlayerProfileVector["playStyle"];
  playContext: PlayerProfileVector["playContext"];
  dimensionScores: PlayerProfileVector["dimensionScores"];
};
