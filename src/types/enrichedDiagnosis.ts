export type EnrichedDiagnosisMode = "standard" | "deep";
export type EnrichedStrokeFamily = "forehand" | "backhand" | "serve" | "volley" | "overhead" | "general";
export type EnrichedServeSubtype = "first_serve" | "second_serve";
export type EnrichedSessionType = "practice" | "match";
export type EnrichedPressureContext = "none" | "general_match_pressure" | "key_points";
export type EnrichedMovement = "stationary" | "moving";
export type EnrichedOutcome = "net" | "long" | "short" | "float" | "miss_in" | "double_fault";
export type EnrichedIncomingBallDepth = "shallow" | "medium" | "deep" | "unknown";
export type EnrichedSubjectiveFeeling = "tight" | "rushed" | "late" | "hesitant" | "low_confidence" | "awkward" | "unknown";

export type EnrichedDiagnosisContext = {
  mode: EnrichedDiagnosisMode;
  sourceInput: string;
  sceneSummaryZh: string;
  sceneSummaryEn: string;
  problemTag: string;
  level?: string;
  strokeFamily?: EnrichedStrokeFamily;
  serveSubtype?: EnrichedServeSubtype;
  sessionType?: EnrichedSessionType;
  pressureContext?: EnrichedPressureContext;
  movement?: EnrichedMovement;
  outcome?: EnrichedOutcome;
  incomingBallDepth?: EnrichedIncomingBallDepth;
  subjectiveFeeling?: EnrichedSubjectiveFeeling;
  isDeepModeReady: boolean;
};
