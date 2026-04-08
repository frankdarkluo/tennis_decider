import type { MissingSlotPath, SkillCategory, SkillCategoryInference } from "@/types/scenario";

export type EnrichedDiagnosisMode = "standard" | "deep";
export type EnrichedStrokeFamily = "forehand" | "backhand" | "serve" | "return" | "volley" | "overhead" | "slice" | "general";
export type EnrichedServeSubtype = "first_serve" | "second_serve";
export type EnrichedSessionType = "practice" | "match";
export type EnrichedPressureContext = "none" | "general_match_pressure" | "key_points";
export type EnrichedMovement = "stationary" | "moving";
export type EnrichedOutcome = "net" | "long" | "short" | "float" | "miss_in" | "double_fault";
export type EnrichedIncomingBallDepth = "shallow" | "medium" | "deep" | "unknown";
export type EnrichedSubjectiveFeeling = "tight" | "rushed" | "late" | "hesitant" | "low_confidence" | "awkward" | "unknown";
export type EnrichedServeControlPattern = "net" | "long" | "wide" | "no_rhythm" | "unknown";
export type EnrichedServeMechanismFamily = "toss" | "contact" | "rhythm" | "direction_control" | "unknown";

export type DeepDiagnosisHandoff = {
  mode: EnrichedDiagnosisMode;
  sourceInput: string;
  sceneSummaryZh: string;
  sceneSummaryEn: string;
  level?: string;
  skillCategory: SkillCategory;
  skillCategoryConfidence: SkillCategoryInference["confidence"];
  strokeFamily?: EnrichedStrokeFamily;
  serveSubtype?: EnrichedServeSubtype;
  serveControlPattern?: EnrichedServeControlPattern;
  serveMechanismFamily?: EnrichedServeMechanismFamily;
  sessionType?: EnrichedSessionType;
  pressureContext?: EnrichedPressureContext;
  movement?: EnrichedMovement;
  outcome?: EnrichedOutcome;
  incomingBallDepth?: EnrichedIncomingBallDepth;
  subjectiveFeeling?: EnrichedSubjectiveFeeling;
  unresolvedRequiredSlots: MissingSlotPath[];
  stoppedByCap: boolean;
  isDeepModeReady: boolean;
};

export type EnrichedDiagnosisContext = DeepDiagnosisHandoff & {
  problemTag: string;
};
